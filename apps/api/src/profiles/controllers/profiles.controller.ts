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
  Query,
} from '@nestjs/common';
import { ProfilesService } from '../services/profiles.service';
import { Auth0Guard } from '../../auth/guards/auth0.guard';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { AssignRolesDto } from '../dto/assign-roles.dto';
import { RoleResponseDto } from 'src/roles/dto/role-response.dto';
import { ProfilesFilterDto } from '../dto/profile-filter.dto';

@Controller('api/profiles')
@UseGuards(Auth0Guard)
export class ProfilesController {
  private readonly logger = new Logger(ProfilesController.name);

  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  async findAll(
    @Query() filter: ProfilesFilterDto,
    @Request() req,
  ): Promise<{
    profiles: ProfileResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.log(`Fetching profiles for tenant: ${req.user.tenant_id}`);

    const result = await this.profilesService.findAll(
      req.user.tenant_id,
      filter,
    );

    return {
      profiles: result.profiles.map(
        (profile) => new ProfileResponseDto(profile),
      ),
      total: result.total,
      page: filter.page || 1,
      limit: filter.limit || 10,
    };
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

  @Post(':id/roles')
  async assignRolesToProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignRolesDto: AssignRolesDto,
    @Request() req,
  ): Promise<{ message: string }> {
    this.logger.log(`Assigning roles to profile: ${id}`);
    return this.profilesService.assignRolesToProfile(
      id,
      assignRolesDto.roleIds,
      req.user.tenant_id,
    );
  }

  @Get(':id/available-roles')
  async getAvailableRolesForProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<RoleResponseDto[]> {
    this.logger.log(`Fetching available roles for profile: ${id}`);
    return this.profilesService.getAvailableRolesForProfile(
      id,
      req.user.tenant_id,
    );
  }
}
