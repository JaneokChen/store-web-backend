import { Module, forwardRef } from '@nestjs/common';
import { RedisModules } from '@/common/redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entities';
import { UserRoleEntity } from './entities/user-role.entities';
import { PermissionEntity } from '@/permission/entities/permission.entity';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { MailService } from '@/common/mail/mail.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    RedisModules,
    TypeOrmModule.forFeature([UserEntity, UserRoleEntity, PermissionEntity]),
    forwardRef(() => AuthModule),

    // 新增 jwt 模块
    JwtModule.registrerAsync({
      useFactory: async (ConfigService) => ({
        // 读取配置中的 secret
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expireIn: ConfigService.get<string>('JWT_EXPIRE_TIME'),
        },
      }),
      // 将 ConfigService 注入到工厂函数中
      inject: [configService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, MailService],
  exports: [UserService],
})
export class UserModule {}
