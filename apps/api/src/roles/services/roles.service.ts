import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RoleResponseDto } from '../dto/role-response.dto';

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

  async createRole(roleData: any): Promise<RoleResponseDto> {
    try {
      const tipoAccion = await this.prisma.tipoAccion.findFirst({
        where: {
          tipoAccion: roleData.tipo_accion,
        },
      });

      if (!tipoAccion) {
        throw new Error(`TipoAccion '${roleData.tipo_accion}' not found`);
      }

      const role = await this.prisma.rol.create({
        data: {
          codigo: roleData.codigo,
          nombre: roleData.nombre,
          modulo: roleData.modulo,
          tipoAccionId: tipoAccion.id,
          activo: true,
          tenantId: roleData.tenantId || 'default-tenant',
          orden: roleData.orden || 0,
          estadoId: roleData.estadoId || (await this.getDefaultEstadoId()),
        },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          modulo: true,
          activo: true,
          tipoAccion: {
            select: {
              tipoAccion: true,
            },
          },
        },
      });

      return new RoleResponseDto(role);
    } catch (error) {
      this.logger.error('Error creating role:', error);
      throw error;
    }
  }

  async updateRole(id: string, roleData: any): Promise<RoleResponseDto> {
    try {
      const existingRole = await this.prisma.rol.findUnique({
        where: { id },
      });

      if (!existingRole) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      // If tipo_accion is being updated, find the new TipoAccion ID
      let tipoAccionId = existingRole.tipoAccionId;
      if (roleData.tipo_accion) {
        const tipoAccion = await this.prisma.tipoAccion.findFirst({
          where: {
            tipoAccion: roleData.tipo_accion,
          },
        });

        if (!tipoAccion) {
          throw new Error(`TipoAccion '${roleData.tipo_accion}' not found`);
        }
        tipoAccionId = tipoAccion.id;
      }

      const role = await this.prisma.rol.update({
        where: { id },
        data: {
          codigo: roleData.codigo,
          nombre: roleData.nombre,
          modulo: roleData.modulo,
          tipoAccionId: tipoAccionId,
          activo: roleData.activo,
          orden: roleData.orden,
        },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          modulo: true,
          activo: true,
          tipoAccion: {
            select: {
              tipoAccion: true,
            },
          },
        },
      });

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
