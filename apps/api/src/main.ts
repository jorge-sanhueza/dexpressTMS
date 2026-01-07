import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Use compression (fixed import)
  app.use(compression());

  // Critical: Render's URL will be different than Railway
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? [
          'https://dexpressweb-production.up.railway.app', // Keep Railway
          'https://dexpresstms.onrender.com/', // Add Render URL
          /\.onrender\.com$/, // Allow all Render subdomains (wildcard)
        ]
      : [
          /http:\/\/localhost:\d+/,
          /http:\/\/127\.0\.0\.1:\d+/,
          'https://dexpressweb-production.up.railway.app',
          'https://dexpresstms.onrender.com/', // For testing
        ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    }),
  );

  // Register global error filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // CRITICAL FIX: Use Render's PORT environment variable
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Port: ${port}`);
}

bootstrap();