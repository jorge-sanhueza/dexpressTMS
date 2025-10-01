import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { Auth0Guard } from 'src/auth/guards/auth0.guard';

@Controller('api/tenants')
/* @UseGuards(Auth0Guard) */
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get(':id')
  async getTenantById(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Get('current')
  async getCurrentTenant() {
    return this.tenantsService.findCurrent();
  }

  @Get('test/protected')
  async testProtected() {
    return {
      message: 'Protected endpoint is working!',
      timestamp: new Date().toISOString(),
    };
  }
}
