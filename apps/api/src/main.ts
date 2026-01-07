import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(compression());

  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? [
          'https://dexpressweb-production.up.railway.app', // Railway
          'https://dexpresstms.onrender.com', // Render
          'https://tmsdexpressweb.netlify.app', // Netlify
          /\.onrender\.com$/, // All Render subdomains
          /\.netlify\.app$/, // All Netlify sites
        ]
      : [
          /http:\/\/localhost:\d+/,
          /http:\/\/127\.0\.0\.1:\d+/,
          'https://dexpressweb-production.up.railway.app',
          'https://dexpresstms.onrender.com',
          'https://tmsdexpressweb.netlify.app',
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

  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Port: ${port}`);

  // Log allowed origins for debugging
  console.log('Allowed CORS origins:', allowedOrigins);
}

bootstrap();
