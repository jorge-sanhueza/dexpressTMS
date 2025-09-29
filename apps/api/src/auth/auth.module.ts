import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Auth0Strategy } from './strategies/auth0.strategy';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthController } from './auth.controller';
import { InternalJwtService } from './services/internal-jwt.service';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, Auth0Strategy, InternalJwtService],
  exports: [AuthService, InternalJwtService],
})
export class AuthModule {}
