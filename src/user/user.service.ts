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
      .where('su.username = :username OR su.email = :email', { username, email })
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
}
