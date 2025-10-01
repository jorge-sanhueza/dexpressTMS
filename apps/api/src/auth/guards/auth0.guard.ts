import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class Auth0Guard extends AuthGuard('auth0') {
  canActivate(context: ExecutionContext) {
    console.log('🔐 Auth0Guard - Starting authentication...');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log('🔐 Auth0Guard - handleRequest called:', {
      err: err?.message,
      user: !!user,
      info: info?.message,
    });

    if (err) {
      console.log('❌ Auth0Guard - Error during authentication:', err);
      throw new UnauthorizedException(err.message);
    }

    if (!user) {
      console.log('❌ Auth0Guard - No user found after authentication');
      console.log('🔐 Auth0Guard - Info:', info);
      throw new UnauthorizedException('Authentication failed');
    }

    console.log(
      '✅ Auth0Guard - Authentication successful for user:',
      user.email,
    );
    return user;
  }
}
