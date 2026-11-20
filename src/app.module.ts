import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
    UserModule,
    SysModule,

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          host: config.get<string>('MYSQL_HOST'),
          port: config.get<number>('MYSQL_PORT'),
          username: config.get<string>('MYSQL_USER'),
          password: config.get<string>('MYSQL_PASSWORD'),
          database: config.get<string>('MYSQL_DATABASE'),
          charset: 'utf8mb4',
          autoLoadEntities: true,
          // 生产环境中禁止开启，应该使用数据迁移
          synchronize: true,
        };
      },
    }),
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'docker'
          ? '.env.docker'
          : process.env.NODE_ENV === 'production'
            ? '.env.production'
            : '.env',
      isGlobal: true,
    }),

    PermissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
