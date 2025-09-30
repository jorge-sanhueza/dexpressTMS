import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Auth0Guard } from '../auth/guards/auth0.guard';
import { TenantsService } from './tenants.service';

@Controller('api/tenants')
@UseGuards(Auth0Guard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get(':id')
  async getTenantById(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Get('current')
  async getCurrentTenant() {
    // This would get the tenant from the current user's context
    // For now, we'll implement a basic version
    return this.tenantsService.findCurrent();
  }
}
