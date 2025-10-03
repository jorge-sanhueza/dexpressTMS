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
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { Auth0Guard } from '../../auth/guards/auth0.guard';
import type {
  CreateUserDto,
  UpdateUserDto,
  User,
  UsersFilterDto,
} from '../interfaces/user.interface';

@Controller('api/users')
@UseGuards(Auth0Guard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  private getTenantId(req: any): string {
    // Try different possible locations for tenant_id
    const tenantId =
      req.user?.tenant_id || req.user?.tenantId || req.user?.tenant?.id;

    this.logger.debug(`Extracted tenantId: ${tenantId}`);
    this.logger.debug(`Full user object: ${JSON.stringify(req.user)}`);

    if (!tenantId) {
      throw new Error('Tenant ID not found in user object');
    }

    return tenantId;
  }

  @Get()
  async findAll(
    @Query() filter: UsersFilterDto,
    @Request() req,
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
  async getCurrentUser(@Request() req): Promise<User> {
    this.logger.log(`Fetching current user: ${req.user?.sub}`);
    return this.usersService.getCurrentUser(req.user?.sub);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<User> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching user ${id} for tenant: ${tenantId}`);
    return this.usersService.findOne(id, tenantId);
  }

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() req,
  ): Promise<User> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Creating user for tenant: ${tenantId}`);

    // Ensure the created user belongs to the same tenant
    const userData = {
      ...createUserDto,
      tenantId: tenantId,
    };

    return this.usersService.create(userData);
  }

  @Put('me')
  async updateCurrentUser(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ): Promise<User> {
    this.logger.log(`Updating current user: ${req.user?.sub}`);
    return this.usersService.updateCurrentUser(req.user?.sub, updateUserDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ): Promise<User> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Updating user ${id} for tenant: ${tenantId}`);
    return this.usersService.update(id, updateUserDto, tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Deactivating user ${id} for tenant: ${tenantId}`);
    await this.usersService.remove(id, tenantId);
    return { message: 'User deactivated successfully' };
  }
}
