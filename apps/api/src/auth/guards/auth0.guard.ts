import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class Auth0Guard extends AuthGuard('auth0') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
