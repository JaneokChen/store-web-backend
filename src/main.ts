import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // 设置允许跨域
    cors: true,
    logger: ['error', 'warn'],
    // instrument: ObserveInstrument,
  });

  const config = app.get(ConfigService);

  // 设置 api 访问前缀
  const prefix = config.get<string>('API_PREFIX') ?? '';
  app.setGlobalPrefix(prefix);
  app.useGlobalPipes(new ValidationPipe());
  console.log('APP_PORT', config.get<number>('APP_PORT'));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
