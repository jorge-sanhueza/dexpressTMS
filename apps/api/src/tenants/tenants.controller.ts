import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TenantsService } from './services/tenants.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('api/tenants')
@UseGuards(JwtGuard)
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
