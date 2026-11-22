import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Like } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { UserEntity } from '@/user/entities/user.entities';
import { ActivityStatus, UserType } from '@/common/enum/common.enum';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ActivityEntity } from './entities/activity.entity';
import { ActivityListDto } from './dto/activity-list.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivityService {
  @InjectRepository(ActivityEntity)
  private activityRepository: Repository<ActivityEntity>;

  @Inject(DataSource)
  private dataSource: DataSource;

  /**
   * 创建活动
   * @param CreateActivityDto
   * @param currentUser
   */
  async create(createActivityDto: CreateActivityDto, currentUser: UserEntity) {
    if (currentUser.userType !== UserType.ADMIN_USER) {
      throw new HttpException('', HttpStatus.FORBIDDEN);
    }
    const { startTime, endTime } = createActivityDto;
    let status = ActivityStatus.NOT_START;

    if (new Date(endTime).getTime() < Date.now()) {
      throw new HttpException(
        '结束时间不能小于当前时间',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    if (startTime > endTime) {
      throw new HttpException(
        '开始时间不能大于结束时间',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    if (new Date(startTime).getTime() < Date.now()) {
      status = ActivityStatus.IN_PROGRESS;
    }

    const activity = await this.activityRepository.save({
      ...createActivityDto,
      status,
    });

    if (!activity) {
      throw new HttpException('创建失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return '创建成功';
  }

  async getActivityList(dto: ActivityListDto) {
    const { page, pageSize, name, type, status } = dto;

    // TODO
    const where = {
      ...(name ? { name: Like(`%${name}%`) } : null),
      ...(type ? { type } : null),
      ...(status ? { status } : null),
    };

    const queryBuilder = this.dataSource
      .createQueryBuilder('store_activity', 'act')
      .leftJoinAndSelect('store_product', 'p', 'p.id = act.productId')
      .select([
        'act.*',
        "JSON_OBJECT('name', p.name, 'price', p.price) as product",
      ]);

    const total = await queryBuilder.getCount();

    // TODO
    const list = await queryBuilder
      .where(where)
      .skip(pageSize * (page - 1))
      .take(pageSize)
      .orderBy('act.id', 'DESC')
      .getRawMany();

    return {
      list,
      total,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} activity`;
  }

  async update(updateActivityDto: UpdateActivityDto) {
    const { id } = updateActivityDto;
    const exists = await this.activityRepository.findOneBy({ id });

    if (!exists) {
      throw new HttpException(
        '活动不存在或已删除',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    if (exists.status === ActivityStatus.END) {
      throw new HttpException(
        '活动已结束，不能修改',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    const startTime = updateActivityDto.startTime ?? exists.startTime;
    const endTime = updateActivityDto.endTime ?? exists.endTime;

    if (new Date(endTime).getTime() < Date.now()) {
      throw new HttpException(
        '结束时间不能小于当前时间',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    let newStatus = updateActivityDto.status || exists.status;
    if (new Date(startTime).getTime() < Date.now()) {
      newStatus = ActivityStatus.IN_PROGRESS;
    }

    const activity = await this.activityRepository.save(
      plainToClass(ActivityEntity, {
        ...exists,
        ...updateActivityDto,
        newStatus,
      }),
    );

    if (!activity) {
      throw new HttpException('更新失败', HttpStatus.EXPECTATION_FAILED);
    }

    return '更新成功';
  }

  async delete(id: number) {
    const exists = await this.activityRepository.findOneBy({ id });
    if (!exists) {
      throw new HttpException('活动不存在或已删除', HttpStatus.NOT_FOUND);
    }
    const { affected } = await this.activityRepository.delete({ id });
    if (!affected) {
      throw new HttpException(
        '删除失败，请稍后重试',
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    return '删除成功';
  }
}
