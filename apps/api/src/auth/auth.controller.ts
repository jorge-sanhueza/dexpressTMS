import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Auth0Guard } from './guards/auth0.guard';
import { JwtGuard } from './guards/jwt.guard';
import { AuthService } from './services/auth.service';
import { Auth0User } from './interfaces/auth0-user.interface';

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {
    this.logger.log('AuthController initialized');
  }

  // Use Auth0Guard for external Auth0 tokens
  @UseGuards(Auth0Guard)
  @Post('login')
  async login(@Request() req) {
    this.logger.log('Auth0 login endpoint called');
    this.logger.debug('User from request:', req.user);
    return this.authService.handleAuth0Login(req.user);
  }

  @Post('test-login')
  async testLogin(@Body() body: { email: string }) {
    try {
      this.logger.log('Test login started with body:', body);

      const testUser: Auth0User = {
        sub: 'test-' + Date.now(),
        email: body.email || 'test@example.com',
        email_verified: true,
        name: 'Test User',
        tenant_id: 'test-tenant-id',
      };

      this.logger.log('Created test user:', testUser);

      const result = await this.authService.handleAuth0Login(testUser);
      this.logger.log('Test login successful');
      return result;
    } catch (error) {
      this.logger.error('Test login failed with error:', error);
      throw new HttpException(
        {
          error: error.message,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refresh_token: string }) {
    try {
      this.logger.log('Refresh token endpoint called');
      const result = await this.authService.refreshTokens(body.refresh_token);
      return result;
    } catch (error) {
      this.logger.error('Refresh token failed:', error);
      throw new HttpException(
        {
          error: error.message,
          statusCode: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // Use JwtGuard for internal tokens after login
  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return {
      id: req.user.sub,
      email: req.user.email,
      name: req.user.name,
      tenant_id: req.user.tenant_id,
      profile_id: req.user.profile_id,
      permissions: req.user.permissions,
    };
  }

  @Get('health')
  healthCheck() {
    return { status: 'OK', message: 'Auth endpoint is working' };
  }

  // Use JwtGuard for internal token debugging
  @UseGuards(JwtGuard)
  @Get('debug-payload')
  async debugPayload(@Request() req) {
    return {
      message: 'Internal JWT Payload Debug',
      user: req.user,
    };
  }

  // Add endpoint to debug Auth0 tokens
  @UseGuards(Auth0Guard)
  @Get('debug-auth0-payload')
  async debugAuth0Payload(@Request() req) {
    return {
      message: 'Auth0 JWT Payload Debug',
      user: req.user,
    };
  }
}
