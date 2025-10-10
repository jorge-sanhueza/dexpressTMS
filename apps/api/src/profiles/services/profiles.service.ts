import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    try {
      const profiles = await this.prisma.perfil.findMany({
        where: {
          tenantId,
          activo: true,
        },
        include: {
          tipo: true,
        },
        orderBy: {
          nombre: 'asc',
        },
      });

      this.logger.log(`Found ${profiles.length} profiles`);

      return profiles.map((profile) => ({
        id: profile.id,
        nombre: profile.nombre,
        tipo: profile.tipo?.tipoPerfil,
        descripcion: profile.descripcion,
        activo: profile.activo,
      }));
    } catch (error) {
      this.logger.error('Error fetching profiles:', error);
      throw error;
    }
  }

  async create(createProfileDto: CreateProfileDto, tenantId: string) {
    try {
      this.logger.log(
        `Creating profile: ${createProfileDto.nombre} for tenant: ${tenantId}`,
      );

      // Check if profile name already exists for this tenant
      const existingProfile = await this.prisma.perfil.findFirst({
        where: {
          nombre: createProfileDto.nombre,
          tenantId,
        },
      });

      if (existingProfile) {
        throw new BadRequestException(
          'Ya existe un perfil con este nombre en la organización',
        );
      }

      // Get active status
      const activeStatus = await this.prisma.estadoRegistro.findFirst({
        where: { estado: 'activo' },
      });

      if (!activeStatus) {
        throw new NotFoundException('Estado activo no encontrado');
      }

      // Get profile type
      const profileType = await this.prisma.tipoPerfil.findFirst({
        where: { tipoPerfil: createProfileDto.tipo || 'básico' },
      });

      if (!profileType) {
        throw new NotFoundException('Tipo de perfil no encontrado');
      }

      const profile = await this.prisma.perfil.create({
        data: {
          nombre: createProfileDto.nombre,
          descripcion: createProfileDto.descripcion,
          contacto: createProfileDto.contacto || null,
          rut: createProfileDto.rut || null,
          tenantId: tenantId,
          tipoId: profileType.id,
          estadoId: activeStatus.id,
          activo: true,
        },
        include: {
          tipo: true,
        },
      });

      this.logger.log(`Profile created successfully: ${profile.id}`);
      return profile;
    } catch (error) {
      this.logger.error('Error creating profile:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateProfileDto: UpdateProfileDto,
    tenantId: string,
  ) {
    try {
      this.logger.log(`Updating profile: ${id} for tenant: ${tenantId}`);

      // Verify profile exists and belongs to tenant
      const existingProfile = await this.prisma.perfil.findFirst({
        where: {
          id,
          tenantId,
        },
      });

      if (!existingProfile) {
        throw new NotFoundException('Perfil no encontrado');
      }

      // Check if new name conflicts with other profiles in the same tenant
      if (
        updateProfileDto.nombre &&
        updateProfileDto.nombre !== existingProfile.nombre
      ) {
        const nameConflict = await this.prisma.perfil.findFirst({
          where: {
            nombre: updateProfileDto.nombre,
            tenantId,
            id: { not: id },
          },
        });

        if (nameConflict) {
          throw new BadRequestException(
            'Ya existe un perfil con este nombre en la organización',
          );
        }
      }

      // Get profile type if provided
      let tipoId = existingProfile.tipoId;
      if (updateProfileDto.tipo) {
        const profileType = await this.prisma.tipoPerfil.findFirst({
          where: { tipoPerfil: updateProfileDto.tipo },
        });

        if (!profileType) {
          throw new NotFoundException('Tipo de perfil no encontrado');
        }
        tipoId = profileType.id;
      }

      const profile = await this.prisma.perfil.update({
        where: { id },
        data: {
          nombre: updateProfileDto.nombre,
          descripcion: updateProfileDto.descripcion,
          contacto: updateProfileDto.contacto,
          rut: updateProfileDto.rut,
          tipoId: tipoId,
          activo:
            updateProfileDto.activo !== undefined
              ? updateProfileDto.activo
              : existingProfile.activo,
        },
        include: {
          tipo: true,
        },
      });

      this.logger.log(`Profile updated successfully: ${profile.id}`);
      return profile;
    } catch (error) {
      this.logger.error('Error updating profile:', error);
      throw error;
    }
  }

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    try {
      this.logger.log(`Deactivating profile: ${id} for tenant: ${tenantId}`);

      // Verify profile exists and belongs to tenant
      const existingProfile = await this.prisma.perfil.findFirst({
        where: {
          id,
          tenantId,
        },
      });

      if (!existingProfile) {
        throw new NotFoundException('Perfil no encontrado');
      }

      // Soft delete by setting activo to false
      await this.prisma.perfil.update({
        where: { id },
        data: { activo: false },
      });

      this.logger.log(`Profile deactivated successfully: ${id}`);
      return { message: 'Perfil desactivado correctamente' };
    } catch (error) {
      this.logger.error('Error deactivating profile:', error);
      throw error;
    }
  }

  async findOne(id: string, tenantId: string) {
    try {
      const profile = await this.prisma.perfil.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          tipo: true,
          perfilesRoles: {
            include: {
              rol: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  modulo: true,
                  tipoAccion: {
                    select: {
                      tipoAccion: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!profile) {
        throw new NotFoundException('Perfil no encontrado');
      }

      this.logger.log(
        `Profile ${profile.nombre} has ${profile.perfilesRoles.length} roles`,
      );

      const roleCodes = profile.perfilesRoles.map((pr) => pr.rol.codigo);
      this.logger.debug(`Role codes: ${JSON.stringify(roleCodes)}`);

      const response = {
        id: profile.id,
        nombre: profile.nombre,
        tipo: profile.tipo?.tipoPerfil,
        descripcion: profile.descripcion,
        contacto: profile.contacto,
        rut: profile.rut,
        activo: profile.activo,
        roles: roleCodes,
      };

      this.logger.debug(`Sending response: ${JSON.stringify(response)}`);

      return response;
    } catch (error) {
      this.logger.error(`Error fetching profile ${id}:`, error);
      throw error;
    }
  }

  async getProfileTypes(
    tenantId: string,
  ): Promise<{ id: string; tipoPerfil: string }[]> {
    try {
      this.logger.log(`Fetching profile types for tenant: ${tenantId}`);
      const profileTypes = await this.prisma.tipoPerfil.findMany({
        select: {
          id: true,
          tipoPerfil: true,
        },
        orderBy: {
          tipoPerfil: 'asc',
        },
      });

      this.logger.log(`Found ${profileTypes.length} profile types`);
      return profileTypes;
    } catch (error) {
      this.logger.error('Error fetching profile types:', error);
      throw error;
    }
  }
}
