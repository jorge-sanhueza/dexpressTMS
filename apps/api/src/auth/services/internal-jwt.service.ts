import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface InternalJwtPayload {
  sub: string;
  email: string;
  tenant_id: string;
  permissions: string[];
  profile_id: string;
}

@Injectable()
export class InternalJwtService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateInternalToken(payload: InternalJwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '24h', // Short-lived access token
    });
  }

  async generateRefreshToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '7d',
      },
    );
  }

  verifyInternalToken(token: string): InternalJwtPayload {
    try {
      return this.jwtService.verify<InternalJwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Optional: Decode token without verification (for debugging)
  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}
