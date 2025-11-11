import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  Logger,
  NotFoundException,
  Request,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { RoleResponseDto } from '../dto/role-response.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RolesByIdsDto } from '../dto/roles-by-ids.dto';
import { RolesFilterDto } from '../dto/role-filter.dto';

@Controller('api/roles')
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(JwtGuard)
  @Get()
  async getAllRoles(
    @Query() filter: RolesFilterDto,
    @Request() req,
  ): Promise<{
    roles: RoleResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.log('Fetching roles with filters');
    const tenantId = this.getCurrentTenantId(req);

    const result = await this.rolesService.getRolesByTenantWithFilters(
      tenantId,
      filter,
    );

    return {
      roles: result.roles,
      total: result.total,
      page: filter.page || 1,
      limit: filter.limit || 10,
    };
  }

  @UseGuards(JwtGuard)
  @Post()
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
    @Request() req,
  ): Promise<RoleResponseDto> {
    this.logger.log('Creating new role', { codigo: createRoleDto.codigo });
    const tenantId = this.getCurrentTenantId(req);
    return this.rolesService.createRole({
      ...createRoleDto,
      tenantId,
    });
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    this.logger.log(`Updating role: ${id}`);
    return this.rolesService.updateRole(id, updateRoleDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteRole(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Deleting role: ${id}`);
    await this.rolesService.deleteRole(id);
    return { message: 'Role deleted successfully' };
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async getRoleById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RoleResponseDto> {
    this.logger.log(`Fetching role by ID: ${id}`);
    const roles = await this.rolesService.getRolesByIds([id]);
    if (roles.length === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return roles[0];
  }

  @UseGuards(JwtGuard)
  @Post('by-ids')
  async getRolesByIds(
    @Body() rolesByIdsDto: RolesByIdsDto,
  ): Promise<RoleResponseDto[]> {
    this.logger.log(
      `Fetching roles by IDs: ${rolesByIdsDto.roleIds.length} roles`,
    );
    return this.rolesService.getRolesByIds(rolesByIdsDto.roleIds);
  }

  @UseGuards(JwtGuard)
  @Get('by-tenant/:tenantId')
  async getRolesByTenant(
    @Param('tenantId') tenantId: string,
  ): Promise<RoleResponseDto[]> {
    this.logger.log(`Fetching roles for tenant: ${tenantId}`);
    return this.rolesService.getRolesByTenant(tenantId);
  }

  @UseGuards(JwtGuard)
  @Get('by-code/:codigo')
  async getRoleByCode(
    @Param('codigo') codigo: string,
  ): Promise<RoleResponseDto | null> {
    this.logger.log(`Fetching role by code: ${codigo}`);
    return this.rolesService.getRoleByCode(codigo);
  }

  @UseGuards(JwtGuard)
  @Get('health')
  healthCheck() {
    return { status: 'OK', message: 'Roles endpoint is working' };
  }

  private getCurrentTenantId(req: any): string {
    if (req.user?.tenant_id) {
      return req.user.tenant_id;
    }

    // Fallback for development or if user info is not available
    this.logger.warn('Tenant ID not found in request, using default');
    return 'default-tenant';
  }

  @UseGuards(JwtGuard)
  @Get('filters/modules')
  async getAvailableModules(@Request() req): Promise<string[]> {
    this.logger.log('Fetching available modules for filtering');
    const tenantId = this.getCurrentTenantId(req);
    return this.rolesService.getAvailableModules(tenantId);
  }

  @UseGuards(JwtGuard) // Changed to JwtGuard
  @Get('filters/tipo-acciones')
  async getAvailableTipoAcciones(@Request() req): Promise<string[]> {
    this.logger.log('Fetching available tipo acciones for filtering');
    const tenantId = this.getCurrentTenantId(req);
    return this.rolesService.getAvailableTipoAcciones(tenantId);
  }
}
