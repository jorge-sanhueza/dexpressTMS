import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InternalJwtPayload } from '../services/internal-jwt.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, // Now this is guaranteed to be a string
    });
  }

  async validate(payload: InternalJwtPayload) {
    console.log('JWT Strategy - Validated payload:', payload);

    // Return the user object that will be attached to req.user
    return {
      sub: payload.sub,
      email: payload.email,
      tenant_id: payload.tenant_id,
      profile_id: payload.profile_id,
      permissions: payload.permissions,
    };
  }
}
