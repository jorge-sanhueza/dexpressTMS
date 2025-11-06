import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import { Auth0User } from '../interfaces/auth0-user.interface';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0-jwt') {
  constructor(private configService: ConfigService) {
    const auth0Domain = configService.get('AUTH0_DOMAIN');
    const auth0Audience = configService.get('AUTH0_AUDIENCE');

    console.log('🔐 Auth0Strategy - Configuration:', {
      domain: auth0Domain,
      audience: auth0Audience,
      jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
    });

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      audience: auth0Audience,
      issuer: `https://${auth0Domain}/`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any): Promise<Auth0User> {
    console.log('✅ Auth0Strategy - Token validated successfully!');
    console.log('🔐 Auth0Strategy - Payload:', {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      tenant_id: payload['https://tms.com/tenant_id'] || payload.tenant_id,
    });

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified || false,
      name: payload.name || payload.email,
      tenant_id:
        payload['https://tms.com/tenant_id'] ||
        payload.app_metadata?.tenant_id ||
        payload.tenant_id,
    };
  }
}

// Add this import at the top
import { ExtractJwt } from 'passport-jwt';
