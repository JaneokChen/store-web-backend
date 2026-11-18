import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../user/entities/user.entities';
import { MailService } from '../common/mail/mail.service';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class SysService {
  @Inject(MailService)
  private mailService: MailService;

  @Inject(RedisService)
  private redisService: RedisService;

  @InjectRepository(UserEntity)
  private userRepository: Repository<UserEntity>;
}
