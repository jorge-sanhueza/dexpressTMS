import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InternalJwtPayload } from '../services/internal-jwt.service';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'internal-jwt') {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: InternalJwtPayload) {
    console.log('JWT Strategy - Validated internal token payload:', payload);

    return {
      sub: payload.sub,
      email: payload.email,
      tenant_id: payload.tenant_id,
      profile_id: payload.profile_id,
      permissions: payload.permissions,
    };
  }
}
