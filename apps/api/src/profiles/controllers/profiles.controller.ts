import {
  Controller,
  Get,
  UseGuards,
  Request,
  Logger,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
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

  @Post()
  async create(@Body() createProfileDto: any, @Request() req) {
    this.logger.log(`Creating profile for tenant: ${req.user.tenant_id}`);
    return this.profilesService.create(createProfileDto, req.user.tenant_id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProfileDto: any,
    @Request() req,
  ) {
    this.logger.log(`Updating profile ${id} for tenant: ${req.user.tenant_id}`);
    return this.profilesService.update(
      id,
      updateProfileDto,
      req.user.tenant_id,
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    this.logger.log(
      `Deactivating profile ${id} for tenant: ${req.user.tenant_id}`,
    );
    return this.profilesService.remove(id, req.user.tenant_id);
  }
}
