import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import { Auth0User } from '../interfaces/auth0-user.interface';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
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

      jwtFromRequest: (req) => {
        // Extract JWT from Authorization header
        const authHeader = req.headers.authorization;
        console.log('🔐 Auth0Strategy - Authorization header:', authHeader);

        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
          const token = authHeader.split(' ')[1];
          console.log(
            '🔐 Auth0Strategy - Token extracted, length:',
            token?.length,
          );
          return token;
        }
        console.log('❌ Auth0Strategy - No Bearer token found');
        return null;
      },

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
      fullPayload: payload,
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
