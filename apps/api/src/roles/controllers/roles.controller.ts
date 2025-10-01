import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { RoleResponseDto } from '../dto/role-response.dto';

@Controller('api/roles')
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(private readonly rolesService: RolesService) {}

/*   @UseGuards(Auth0Guard) */
  @Post('by-ids')
  async getRolesByIds(
    @Body() body: { roleIds: string[] },
  ): Promise<RoleResponseDto[]> {
    this.logger.log(`Fetching roles by IDs: ${body.roleIds.length} roles`);
    return this.rolesService.getRolesByIds(body.roleIds);
  }

/*   @UseGuards(Auth0Guard) */
  @Get('by-tenant/:tenantId')
  async getRolesByTenant(
    @Param('tenantId') tenantId: string,
  ): Promise<RoleResponseDto[]> {
    this.logger.log(`Fetching roles for tenant: ${tenantId}`);
    return this.rolesService.getRolesByTenant(tenantId);
  }

/*   @UseGuards(Auth0Guard) */
  @Get('by-code/:codigo')
  async getRoleByCode(
    @Param('codigo') codigo: string,
  ): Promise<RoleResponseDto | null> {
    this.logger.log(`Fetching role by code: ${codigo}`);
    return this.rolesService.getRoleByCode(codigo);
  }

/*   @UseGuards(Auth0Guard) */
  @Get('health')
  healthCheck() {
    return { status: 'OK', message: 'Roles endpoint is working' };
  }
}
