import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  if (!corsOrigin) {
    throw new Error('CORS_ORIGIN environment variable is required');
  }

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  const port = Number.parseInt(configService.get<string>('PORT', '10000'), 10);
  await app.listen(port);
}

void bootstrap();
