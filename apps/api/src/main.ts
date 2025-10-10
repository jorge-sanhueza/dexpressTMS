import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(require('compression')());

  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? ['https://dexpressweb-production.up.railway.app']
      : [
          'http://localhost:5174',
          'http://127.0.0.1:5173',
          'http://localhost:5173',
          'https://dexpressweb-production.up.railway.app',
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

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
