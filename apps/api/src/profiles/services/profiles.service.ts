import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ProfilesFilterDto } from '../dto/profile-filter.dto';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    filter: ProfilesFilterDto = {},
  ): Promise<{ profiles: any[]; total: number }> {
    try {
      const { search, activo, page = 1, limit = 10 } = filter;

      const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
      const limitNumber =
        typeof limit === 'string' ? parseInt(limit, 10) : limit;
      const skip = (pageNumber - 1) * limitNumber;

      const where: any = {
        tenantId,
      };

      // Search filter
      if (search) {
        where.OR = [
          { nombre: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Active filter
      if (activo !== undefined) {
        where.activo = typeof activo === 'string' ? activo === 'true' : activo;
      }

      const [profiles, total] = await this.prisma.$transaction([
        this.prisma.perfil.findMany({
          where,
          include: {
            perfilesRoles: {
              include: {
                rol: true,
              },
            },
          },
          skip,
          take: limitNumber,
          orderBy: {
            nombre: 'asc',
          },
        }),
        this.prisma.perfil.count({ where }),
      ]);

      const formattedProfiles = profiles.map((profile) => ({
        id: profile.id,
        nombre: profile.nombre,
        descripcion: profile.descripcion,
        activo: profile.activo,
        rolesCount: profile.perfilesRoles.length,
      }));

      this.logger.log(
        `Found ${profiles.length} profiles out of ${total} total`,
      );

      return {
        profiles: formattedProfiles,
        total,
      };
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

      const profile = await this.prisma.perfil.create({
        data: {
          nombre: createProfileDto.nombre,
          descripcion: createProfileDto.descripcion,
          // Note: 'contacto' and 'rut' fields were removed in simplified schema
          tenantId: tenantId,
          activo: true,
        },
        include: {
          perfilesRoles: {
            include: {
              rol: true,
            },
          },
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

      const profile = await this.prisma.perfil.update({
        where: { id },
        data: {
          nombre: updateProfileDto.nombre,
          descripcion: updateProfileDto.descripcion,
          // Note: 'contacto' and 'rut' fields were removed in simplified schema
          activo:
            updateProfileDto.activo !== undefined
              ? updateProfileDto.activo
              : existingProfile.activo,
        },
        include: {
          perfilesRoles: {
            include: {
              rol: true,
            },
          },
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

      // Check if profile is being used by any users
      const usersWithProfile = await this.prisma.usuario.count({
        where: {
          perfilId: id,
          tenantId,
          activo: true,
        },
      });

      if (usersWithProfile > 0) {
        throw new BadRequestException(
          'No se puede desactivar el perfil porque está siendo utilizado por usuarios activos',
        );
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
          perfilesRoles: {
            include: {
              rol: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  modulo: true,
                  tipoAccion: true, // Now directly on rol, not a relation
                },
              },
            },
          },
          usuarios: {
            where: {
              activo: true,
            },
            select: {
              id: true,
              nombre: true,
              correo: true,
            },
          },
        },
      });

      if (!profile) {
        throw new NotFoundException('Perfil no encontrado');
      }

      this.logger.log(
        `Profile ${profile.nombre} has ${profile.perfilesRoles.length} roles and ${profile.usuarios.length} users`,
      );

      const response = {
        id: profile.id,
        nombre: profile.nombre,
        descripcion: profile.descripcion,
        activo: profile.activo,
        roles: profile.perfilesRoles.map(pr => ({
          id: pr.rol.id,
          codigo: pr.rol.codigo,
          nombre: pr.rol.nombre,
          modulo: pr.rol.modulo,
          tipoAccion: pr.rol.tipoAccion,
        })),
        usuarios: profile.usuarios,
        rolesCount: profile.perfilesRoles.length,
        usuariosCount: profile.usuarios.length,
      };

      this.logger.debug(`Sending response: ${JSON.stringify(response)}`);

      return response;
    } catch (error) {
      this.logger.error(`Error fetching profile ${id}:`, error);
      throw error;
    }
  }

  async assignRolesToProfile(
    profileId: string,
    roleIds: string[],
    tenantId: string,
  ): Promise<{ message: string }> {
    try {
      this.logger.log(
        `Assigning ${roleIds.length} roles to profile: ${profileId}`,
      );

      // Verify profile exists and belongs to tenant
      const profile = await this.prisma.perfil.findFirst({
        where: {
          id: profileId,
          tenantId,
        },
      });

      if (!profile) {
        throw new NotFoundException('Perfil no encontrado');
      }

      // Verify all roles exist and belong to tenant
      const roles = await this.prisma.rol.findMany({
        where: {
          id: {
            in: roleIds,
          },
          tenantId,
          activo: true,
        },
      });

      if (roles.length !== roleIds.length) {
        throw new BadRequestException(
          'Algunos roles no existen o no están activos',
        );
      }

      // Delete existing role assignments for this profile
      await this.prisma.perfilRol.deleteMany({
        where: {
          perfilId: profileId,
          tenantId,
        },
      });

      // Create new role assignments
      if (roleIds.length > 0) {
        await this.prisma.perfilRol.createMany({
          data: roleIds.map((roleId) => ({
            perfilId: profileId,
            rolId: roleId,
            tenantId,
          })),
        });
      }

      this.logger.log(
        `Successfully assigned ${roleIds.length} roles to profile: ${profileId}`,
      );
      return { message: 'Roles asignados correctamente' };
    } catch (error) {
      this.logger.error(
        `Error assigning roles to profile ${profileId}:`,
        error,
      );
      throw error;
    }
  }

  async getAvailableRolesForProfile(
    profileId: string,
    tenantId: string,
  ): Promise<any[]> {
    try {
      this.logger.log(`Fetching available roles for profile: ${profileId}`);

      // Verify profile exists
      const profile = await this.prisma.perfil.findFirst({
        where: {
          id: profileId,
          tenantId,
        },
      });

      if (!profile) {
        throw new NotFoundException('Perfil no encontrado');
      }

      // Get all active roles for the tenant
      const allRoles = await this.prisma.rol.findMany({
        where: {
          tenantId,
          activo: true,
        },
        orderBy: [{ modulo: 'asc' }, { orden: 'asc' }],
      });

      // Get currently assigned roles
      const assignedRoles = await this.prisma.perfilRol.findMany({
        where: {
          perfilId: profileId,
          tenantId,
        },
        include: {
          rol: {
            select: {
              id: true,
            },
          },
        },
      });

      const assignedRoleIds = assignedRoles.map((ar) => ar.rol.id);

      // Format response
      const availableRoles = allRoles.map((role) => ({
        id: role.id,
        codigo: role.codigo,
        nombre: role.nombre,
        modulo: role.modulo,
        tipoAccion: role.tipoAccion,
        asignado: assignedRoleIds.includes(role.id),
      }));

      this.logger.log(
        `Found ${availableRoles.length} available roles for profile`,
      );
      return availableRoles;
    } catch (error) {
      this.logger.error(
        `Error fetching available roles for profile ${profileId}:`,
        error,
      );
      throw error;
    }
  }
}