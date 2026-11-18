import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, genSalt, hash } from 'bcryptjs';
import { classToPlain, plainToClass } from 'class-transformer';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entities';
import { UserRoleEntity } from './entities/user-role.entities';
import { RedisKeyPrefix } from '../common/enum/redis-key.enum';
import { RedisService } from '../common/redis/redis.service';
import { MailService } from '../common/mail/mail.service';

import { getRedisKey } from '../common/utils/index';
import { LoginUserDto } from '../sys/dto/login-user.dto';
import { UserListDto } from './dto/user-list.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserType } from '@/common/enum/common.enum';

@Injectable()
export class UserService {
  @InjectRepository(UserEntity)
  private userRepository: Repository<UserEntity>;

  @InjectRepository(UserRoleEntity)
  private userRoleRepository: Repository<UserRoleEntity>;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(MailService)
  private mailService: MailService;

  @Inject(DataSource)
  private dataSrouce: DataSource;

  // 注册
  async registry(createUserDto: CreateUserDto) {
    const { username, email } = createUserDto;

    // 判断用户是否存在
    const user = await this.userRepository
      .createQueryBuilder('su')
      .where('su.username = :username OR su.email = :email', {
        username,
        email,
      })
      .getOne();

    // 存在则返回错误信息
    if (user) {
      throw new HttpException(
        '用户名或注册邮箱已存在，请重新输入',
        HttpStatus.CONFLICT,
      );
    }

    if (createUserDto.confirmPassword !== createUserDto.password) {
      throw new HttpException(
        '两次输入的密码不一致，请重新输入',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    // 校验注册验证码
    const codeRedisKey = getRedisKey(
      RedisKeyPrefix.REGISTRY_CODE,
      createUserDto.email,
    );
    const code = await this.redisService.get(codeRedisKey);
    if (!code) {
      throw new HttpException(
        '验证码有误或已过期',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    // 哈希加密
    const salt = await genSalt();
    createUserDto.password = await hash(createUserDto.password, salt);

    // 不存在在则创建用户
    const newUser = plainToClass(
      UserEntity,
      { salt, ...createUserDto },
      { ignoreDecorators: true },
    );

    const {
      password,
      salt: salter,
      ...rest
    } = await this.userRepository.save(newUser);

    // 缓存用户信息
    const redisKey = getRedisKey(RedisKeyPrefix.USER_INFO, rest.id);
    await this.redisService.hSet(redisKey, rest);

    return rest;
  }

  // 登录
  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUserDto.username,
      },
    });

    // 判断用户是否存在
    if (!user) {
      throw new HttpException('账号密码错误', HttpStatus.EXPECTATION_FAILED);
    }

    // 判断密码是否正确
    const checkPassword = await compare(loginUserDto.password, user.password);
    if (!checkPassword) {
      throw new HttpException('账号或密码错误', HttpStatus.EXPECTATION_FAILED);
    }

    // 判断用户是否冻结
    if (user.freezed) {
      throw new HttpException(
        '账号已被冻结，请联系管理员',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    // 生成 token
    const { password, salt, ...rest } = user;
    console.log('user', user);
    const access_token = this.generateAccessToken(rest);
    return {
      access_token,
    };
  }

  generateAccessToken(payload: Record<string, any>): string {
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string): string {
    if (!token) return null;
    const id = this.jwtService.verify(token.replace('Bearer', ''));
    return id;
  }

  async getUserList(dto: UserListDto) {
    const { username, page, pageSize } = dto;
    const skipCount = pageSize * (page - 1);
    let queryBuilder = this.dataSrouce
      .createQueryBuilder('store_user', 'u')
      .leftJoin('store_user_role', 'ur', 'ur.userId = u.id')
      .leftJoin('store_role', 'r', 'r.id = ur.roleId')
      .select([
        'u.*',
        "JSON_ARRAYAGG(JSON_OBJECT('id', r.id, 'name', r.name)) as roles",
      ])
      .groupBy('u.id');

    // 如果有模糊检索条件
    if (username) {
      queryBuilder = queryBuilder
        .where('u.username Like :username')
        .setParameter('username', `%${username}%`);
    }
    const list = await queryBuilder.skip(skipCount).take(pageSize).getRawMany();
    return {
      list: list.map((user) => {
        Reflect.deleteProperty(user, 'password');
        Reflect.deleteProperty(user, 'salt');
        return user;
      }),
      total: list.length,
      page,
    };
  }

  // 根据 ID 查找用户信息
  async findOneById(id: number): Promise<UserEntity> {
    // 先从 Redis 中查询用户缓存
    const redisKey = getRedisKey(RedisKeyPrefix.USER_INFO, id);
    const result = (await this.redisService.hGetAll(redisKey)) || {};
    let user = plainToClass(UserEntity, result, {
      enableImplicitConversion: true,
    });

    // 缓存中没有再查库
    if (!user.id) {
      user = await this.userRepository.findOneBy({ id });

      if (!user) return null;

      // 设置缓存
      await this.redisService.hSet(redisKey, classToPlain(user));
    }
    delete user.password;
    return user;
  }

  // 获取当前用户信息
  async getCurrentUser(currentUser: UserEntity) {
    // 同时查询用户角色和权限
    const queryBuilder = this.dataSrouce
      .createQueryBuilder()
      .select([
        'user.id AS userId',
        'user.username AS userName',
        'role.id AS roleId',
        'role.name AS roleName',
        'p.id AS permissionId',
        'p.title AS permissionTitle',
        'p.type AS permissionType',
        'p.code AS permissionCode',
      ])
      .from('store_user', 'user')
      .leftJoin('store_user_role', 'userRole', 'user.id = userRole.userId')
      .leftJoin('store_role', 'role', 'userRole.roleId = role.id')
      .leftJoin(
        'store_role_permission',
        'rolePerm',
        'role.id = rolePerm.roleId',
      )
      .leftJoin('stroe_permission', 'p', 'rolePerm.permissionid = p.id')
      .where('user.id = :userid', { userId: currentUser.id })
      .orderBy('p.id', 'ASC');

    const enrichedData = await queryBuilder.getRawMany();
    const roles = enrichedData.reduce((acc, row) => {
      if (!acc.includes(row.rolwId)) {
        acc.push(row.roleId);
      }

      return acc;
    }, [] as number[]);

    const permissions = enrichedData.map((row) => ({
      id: row.permissionId,
      title: row.permissionTitle,
      type: row.permissionType,
      code: row.permissionCode,
    }));

    return {
      ...currentUser,
      menus: permissions,
      roles: roles.map((roleId: number) => ({
        id: roleId,
      })),
    };
  }

  async update(updateUserDto: UpdateUserDto, currentUser: UserEntity) {
    // 判断用户是否存在
    const user = await this.userRepository.findOne({
      where: { id: updateUserDto.id },
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.EXPECTATION_FAILED);
    }

    // 普通用户不能修改管理员信息
    if (
      user.userType === UserType.ADMIN_USER &&
      currentUser.userType === UserType.NORMAL_USER
    ) {
      throw new HttpException(
        '抱歉，您暂无权限修改管理员信息',
        HttpStatus.FORBIDDEN,
      );
    }

    // 更新数据
    const { password, ...rest } = await this.userRepository.save(
      plainToClass(
        UserEntity,
        {
          ...user,
          ...updateUserDto,
        },
        { ignoreDecorators: true },
      ),
    );

    // 更新用户角色表
    if (updateUserDto.roleIds) {
      // 先删除用户角色表
      await this.userRoleRepository.delete({ userId: user.id });
      const roles = updateUserDto.roleIds.map((item) => ({
        userId: user.id,
        roleId: item,
      }));
      const result = await this.userRoleRepository.save(roles);
      if (!result) {
        throw new HttpException(
          '更新失败，请稍后重试',
          HttpStatus.EXPECTATION_FAILED,
        );
      }
    }

    // 更新 redis 缓存
    const redisKey = getRedisKey(RedisKeyPrefix.USER_INFO, updateUserDto.id);
    await this.redisService.hSet(redisKey, classToPlain(rest));

    return '更新成功';
  }
}
