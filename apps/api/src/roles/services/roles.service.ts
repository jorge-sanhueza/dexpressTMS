import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RoleResponseDto } from '../dto/role-response.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private prisma: PrismaService) {}

  async getRolesByIds(roleIds: string[]): Promise<RoleResponseDto[]> {
    this.logger.log(`Fetching roles by IDs: ${roleIds.length} roles`);
    try {
      const roles = await this.prisma.rol.findMany({
        where: {
          id: {
            in: roleIds,
          },
          activo: true,
        },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          modulo: true,
          activo: true,
          orden: true,
          tenantId: true,
          tipoAccion: {
            select: {
              tipoAccion: true,
            },
          },
        },
      });
      this.logger.debug(`Found ${roles.length} roles`);
      return roles.map((role) => new RoleResponseDto(role));
    } catch (error) {
      this.logger.error('Error fetching roles by IDs:', error);
      throw error;
    }
  }

  async getRoleByCode(codigo: string): Promise<RoleResponseDto | null> {
    try {
      const role = await this.prisma.rol.findFirst({
        where: {
          codigo,
          activo: true,
        },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          modulo: true,
          activo: true,
          orden: true,
          tenantId: true,
          tipoAccion: {
            select: {
              tipoAccion: true,
            },
          },
        },
      });

      return role ? new RoleResponseDto(role) : null;
    } catch (error) {
      this.logger.error(`Error fetching role by code ${codigo}:`, error);
      throw error;
    }
  }

  async getRolesByTenant(tenantId: string): Promise<RoleResponseDto[]> {
    try {
      const roles = await this.prisma.rol.findMany({
        where: {
          tenantId,
          activo: true,
        },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          modulo: true,
          activo: true,
          orden: true,
          tenantId: true,
          tipoAccion: {
            select: {
              tipoAccion: true,
            },
          },
        },
        orderBy: {
          orden: 'asc',
        },
      });

      return roles.map((role) => new RoleResponseDto(role));
    } catch (error) {
      this.logger.error(`Error fetching roles for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    try {
      // Validation is now handled by DTO and class-validator
      const existingRole = await this.prisma.rol.findFirst({
        where: {
          codigo: createRoleDto.codigo,
          tenantId: createRoleDto.tenantId,
        },
      });

      if (existingRole) {
        throw new ConflictException(
          `Role with code '${createRoleDto.codigo}' already exists`,
        );
      }

      const tipoAccion = await this.prisma.tipoAccion.findFirst({
        where: {
          tipoAccion: createRoleDto.tipo_accion,
        },
      });

      if (!tipoAccion) {
        throw new BadRequestException(
          `TipoAccion '${createRoleDto.tipo_accion}' not found`,
        );
      }

      const role = await this.prisma.rol.create({
        data: {
          codigo: createRoleDto.codigo,
          nombre: createRoleDto.nombre,
          modulo: createRoleDto.modulo,
          tipoAccionId: tipoAccion.id,
          activo: createRoleDto.activo ?? true,
          tenantId: createRoleDto.tenantId || 'default-tenant',
          orden: createRoleDto.orden || 0,
          estadoId: await this.getDefaultEstadoId(),
        },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          modulo: true,
          activo: true,
          orden: true,
          tenantId: true,
          tipoAccion: {
            select: {
              tipoAccion: true,
            },
          },
        },
      });
      this.logger.log(`Role created successfully: ${role.codigo}`);
      return new RoleResponseDto(role);
    } catch (error) {
      this.logger.error('Error creating role:', error);
      throw error;
    }
  }

  async updateRole(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    try {
      const existingRole = await this.prisma.rol.findUnique({
        where: { id },
      });

      if (!existingRole) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      if (
        updateRoleDto.codigo &&
        updateRoleDto.codigo !== existingRole.codigo
      ) {
        const duplicateRole = await this.prisma.rol.findFirst({
          where: {
            codigo: updateRoleDto.codigo,
            tenantId: existingRole.tenantId,
            id: { not: id },
          },
        });

        if (duplicateRole) {
          throw new ConflictException(
            `Role with code '${updateRoleDto.codigo}' already exists`,
          );
        }
      }

      let tipoAccionId = existingRole.tipoAccionId;
      if (updateRoleDto.tipo_accion) {
        const tipoAccion = await this.prisma.tipoAccion.findFirst({
          where: {
            tipoAccion: updateRoleDto.tipo_accion,
          },
        });

        if (!tipoAccion) {
          throw new BadRequestException(
            `TipoAccion '${updateRoleDto.tipo_accion}' not found`,
          );
        }
        tipoAccionId = tipoAccion.id;
      }

      const role = await this.prisma.rol.update({
        where: { id },
        data: {
          codigo: updateRoleDto.codigo,
          nombre: updateRoleDto.nombre,
          modulo: updateRoleDto.modulo,
          tipoAccionId: tipoAccionId,
          activo: updateRoleDto.activo,
          orden: updateRoleDto.orden,
        },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          modulo: true,
          activo: true,
          orden: true,
          tenantId: true,
          tipoAccion: {
            select: {
              tipoAccion: true,
            },
          },
        },
      });
      this.logger.log(`Role updated successfully: ${role.codigo}`);
      return new RoleResponseDto(role);
    } catch (error) {
      this.logger.error(`Error updating role ${id}:`, error);
      throw error;
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      await this.prisma.rol.update({
        where: { id },
        data: { activo: false },
      });
      this.logger.log(`Role soft-deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting role ${id}:`, error);
      throw error;
    }
  }

  private async getDefaultEstadoId(): Promise<string> {
    const defaultEstado = await this.prisma.estadoRegistro.findFirst({
      where: {
        estado: 'activo',
      },
    });

    if (!defaultEstado) {
      throw new Error('Default estado not found');
    }

    return defaultEstado.id;
  }
}
