import {
  Injectable,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class Auth0Guard extends AuthGuard('jwt') {
  private readonly logger = new Logger(Auth0Guard.name);

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    this.logger.debug(`Auth0Guard handleRequest called:`, {
      err: err?.message,
      user: !!user,
      info: info?.message,
    });

    // Handle token expiration
    if (info?.name === 'TokenExpiredError') {
      this.logger.warn('JWT token expired');
      throw new UnauthorizedException('Token expired');
    }

    // Handle other JWT errors
    if (info?.name === 'JsonWebTokenError') {
      this.logger.warn('Invalid JWT token');
      throw new UnauthorizedException('Invalid token');
    }

    // Handle general errors
    if (err || !user) {
      this.logger.error(
        'Authentication failed:',
        err?.message || info?.message,
      );
      throw new UnauthorizedException('Authentication failed');
    }

    return user;
  }
}
