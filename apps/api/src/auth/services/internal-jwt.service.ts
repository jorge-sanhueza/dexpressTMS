import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface InternalJwtPayload {
  sub: string; // user id from your database
  email: string;
  tenant_id: string;
  permissions: string[]; // role codes from your RBAC system
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
      expiresIn: '15m', // Short-lived access token
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
    return this.jwtService.verify<InternalJwtPayload>(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }
}
