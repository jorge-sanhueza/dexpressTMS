import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  Logger,
} from '@nestjs/common';
import { Auth0Guard } from './guards/auth0.guard';
import { AuthService } from './services/auth.service';
import { Auth0User } from './interfaces/auth0-user.interface';

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {
    this.logger.log('AuthController initialized');
  }

  /*  @UseGuards(Auth0Guard) */
  @Post('login')
  async login(@Request() req) {
    this.logger.log('Auth0 login endpoint called');
    return this.authService.handleAuth0Login(req.user);
  }

  @Post('test-login')
  async testLogin(@Body() body: { email: string }) {
    const testUser: Auth0User = {
      sub: 'test-' + Date.now(),
      email: body.email || 'test@example.com',
      email_verified: true,
      name: 'Test User',
      tenant_id: 'test-tenant-id',
    };

    this.logger.log('Created test user:', testUser.email);

    try {
      const result = await this.authService.handleAuth0Login(testUser);
      this.logger.debug('Login response permissions:');
      this.logger.debug(
        `Number of permissions: ${result.user.permissions.length}`,
      );
      this.logger.debug(`First permission: ${result.user.permissions[0]}`);
      this.logger.debug(
        `All permissions: ${JSON.stringify(result.user.permissions)}`,
      );
      this.logger.log('Test login successful for:', testUser.email);
      return result;
    } catch (error) {
      this.logger.error('Test login failed:', error);
      throw error;
    }
  }

  @Post('refresh')
  async refreshToken(@Request() req) {
    return { message: 'Refresh token endpoint' };
  }

  /*  @UseGuards(Auth0Guard) */
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('health')
  healthCheck() {
    return { status: 'OK', message: 'Auth endpoint is working' };
  }
}
