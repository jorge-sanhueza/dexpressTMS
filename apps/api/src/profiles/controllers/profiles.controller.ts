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
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Controller('api/profiles')
@UseGuards(Auth0Guard)
export class ProfilesController {
  private readonly logger = new Logger(ProfilesController.name);

  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  async findAll(@Request() req): Promise<ProfileResponseDto[]> {
    this.logger.log(`Fetching profiles for tenant: ${req.user.tenant_id}`);
    const profiles = await this.profilesService.findAll(req.user.tenant_id);
    return profiles.map((profile) => new ProfileResponseDto(profile));
  }

  @Get('types')
  async getProfileTypes(
    @Request() req,
  ): Promise<{ id: string; tipoPerfil: string }[]> {
    this.logger.log(`Fetching profile types for tenant: ${req.user.tenant_id}`);
    return this.profilesService.getProfileTypes(req.user.tenant_id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<ProfileResponseDto> {
    this.logger.log(`Fetching profile ${id} for tenant: ${req.user.tenant_id}`);
    const profile = await this.profilesService.findOne(id, req.user.tenant_id);
    return new ProfileResponseDto(profile);
  }

  @Post()
  async create(
    @Body() createProfileDto: CreateProfileDto,
    @Request() req,
  ): Promise<ProfileResponseDto> {
    this.logger.log(`Creating profile for tenant: ${req.user.tenant_id}`);
    const profile = await this.profilesService.create(
      createProfileDto,
      req.user.tenant_id,
    );
    return new ProfileResponseDto(profile);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() req,
  ): Promise<ProfileResponseDto> {
    this.logger.log(`Updating profile ${id} for tenant: ${req.user.tenant_id}`);
    const profile = await this.profilesService.update(
      id,
      updateProfileDto,
      req.user.tenant_id,
    );
    return new ProfileResponseDto(profile);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    this.logger.log(
      `Deactivating profile ${id} for tenant: ${req.user.tenant_id}`,
    );
    return this.profilesService.remove(id, req.user.tenant_id);
  }
}
