import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { Auth0Guard } from '../../auth/guards/auth0.guard';
import type {
  CreateUserDto,
  UpdateUserDto,
  User,
  UsersFilterDto,
} from '../interfaces/user.interface';
import { Auth0User } from '../../auth/interfaces/auth0-user.interface';

interface AuthenticatedRequest extends Request {
  user: Auth0User & {
    tenant_id?: string;
    tenantId?: string;
    tenant?: { id: string };
  };
}

@Controller('api/users')
@UseGuards(Auth0Guard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  private getTenantId(req: AuthenticatedRequest): string {
    // Try different possible locations for tenant_id
    const tenantId =
      req.user?.tenant_id || req.user?.tenantId || req.user?.tenant?.id;

    this.logger.debug(`Extracted tenantId: ${tenantId}`);
    this.logger.debug(`Full user object: ${JSON.stringify(req.user)}`);

    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID not found in user object');
    }

    return tenantId;
  }

  @Get()
  async findAll(
    @Query() filter: UsersFilterDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const tenantId = this.getTenantId(req);

    this.logger.log(`Fetching users for tenant: ${tenantId}`);

    const result = await this.usersService.findAll(filter, tenantId);

    return {
      ...result,
      page: filter.page || 1,
      limit: filter.limit || 10,
    };
  }

  @Get('me')
  async getCurrentUser(@Request() req: AuthenticatedRequest): Promise<User> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in request');
    }

    this.logger.log(`Fetching current user: ${userId}`);
    return this.usersService.getCurrentUser(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<User> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching user ${id} for tenant: ${tenantId}`);
    return this.usersService.findOne(id, tenantId);
  }

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<User> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Creating user for tenant: ${tenantId}`);

    // Ensure the created user belongs to the same tenant
    const userData: CreateUserDto = {
      ...createUserDto,
      tenantId: tenantId,
    };

    return this.usersService.create(userData);
  }

  @Put('me')
  async updateCurrentUser(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<User> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in request');
    }

    this.logger.log(`Updating current user: ${userId}`);
    return this.usersService.updateCurrentUser(userId, updateUserDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<User> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Updating user ${id} for tenant: ${tenantId}`);
    return this.usersService.update(id, updateUserDto, tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Deactivating user ${id} for tenant: ${tenantId}`);
    await this.usersService.remove(id, tenantId);
    return { message: 'User deactivated successfully' };
  }
}
