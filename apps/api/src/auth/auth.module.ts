import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Auth0Strategy } from './strategies/auth0.strategy';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthController } from './auth.controller';
import { InternalJwtService } from './services/internal-jwt.service';
import { AuthService } from './services/auth.service';
import { RolesModule } from 'src/roles/roles.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'internal-jwt' }),
    PrismaModule,
    RolesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }
        return {
          secret: jwtSecret,
          signOptions: { expiresIn: '24h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, Auth0Strategy, InternalJwtService, JwtStrategy],
  exports: [AuthService, InternalJwtService],
})
export class AuthModule {}