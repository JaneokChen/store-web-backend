import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { SysModule } from './sys/sys.module';
import { PermissionModule } from './permission/permission.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'docker'
          ? '.env.docker'
          : process.env.NODE_ENV === 'production'
            ? '.env.production'
            : '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          host: config.get<string>('MYSQL_HOST', 'localhost'),
          port: Number(config.get<string>('MYSQL_PORT', '3306')),
          username: config.get<string>('MYSQL_USER', 'root'),
          password: config.get<string>('MYSQL_PASSWORD', 'root'),
          database: config.get<string>('MYSQL_DATABASE', 'store_web'),
          charset: 'utf8mb4',
          // 自动加载各模块 forFeature() 注册的实体，不需要手写 entities 路径
          autoLoadEntities: true,
          // 生产环境中禁止开启，应该使用数据迁移
          synchronize: config.get<string>('MYSQL_SYNCHRONIZE') === 'true',
        };
      },
    }),
    UserModule,
    SysModule,
    PermissionModule,
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'store-web-backend',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
