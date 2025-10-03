import { Controller, Get, UseGuards, Request, Logger } from '@nestjs/common';
import { ProfilesService } from '../services/profiles.service';
import { Auth0Guard } from '../../auth/guards/auth0.guard';

@Controller('api/profiles')
@UseGuards(Auth0Guard)
export class ProfilesController {
  private readonly logger = new Logger(ProfilesController.name);

  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  async findAll(@Request() req) {
    this.logger.log(`Fetching profiles for tenant: ${req.user.tenant_id}`);
    return this.profilesService.findAll(req.user.tenant_id);
  }
}
