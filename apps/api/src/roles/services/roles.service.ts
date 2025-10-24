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
import { RolesFilterDto } from '../dto/role-filter.dto';

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
      const result = await this.getRolesByTenantWithFilters(tenantId, {});
      return result.roles;
    } catch (error) {
      this.logger.error(`Error fetching roles for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  async getRolesByTenantWithFilters(
    tenantId: string,
    filter: RolesFilterDto = {},
  ): Promise<{ roles: RoleResponseDto[]; total: number }> {
    try {
      const {
        search,
        modulo,
        tipo_accion,
        activo,
        page = 1,
        limit = 10,
      } = filter;

      const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
      const limitNumber =
        typeof limit === 'string' ? parseInt(limit, 10) : limit;
      const skip = (pageNumber - 1) * limitNumber;

      const where: any = {
        tenantId,
      };
      // Search filter (across multiple fields)
      if (search) {
        where.OR = [
          { codigo: { contains: search, mode: 'insensitive' } },
          { nombre: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Module filter
      if (modulo) {
        where.modulo = { contains: modulo, mode: 'insensitive' };
      }

      // TipoAccion filter
      if (tipo_accion) {
        where.tipoAccion = {
          tipoAccion: { contains: tipo_accion, mode: 'insensitive' },
        };
      }

      // Active filter
      if (activo !== undefined) {
        where.activo = typeof activo === 'string' ? activo === 'true' : activo;
      }

      const [roles, total] = await this.prisma.$transaction([
        this.prisma.rol.findMany({
          where,
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
          skip,
          take: limitNumber,
          orderBy: [{ modulo: 'asc' }, { orden: 'asc' }],
        }),
        this.prisma.rol.count({ where }),
      ]);

      const roleDtos = roles.map((role) => new RoleResponseDto(role));

      this.logger.log(`Found ${roles.length} roles out of ${total} total`);

      return {
        roles: roleDtos,
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching roles with filters:', error);
      throw error;
    }
  }

  async getAvailableModules(tenantId: string): Promise<string[]> {
    try {
      const modules = await this.prisma.rol.findMany({
        where: {
          tenantId,
          activo: true,
        },
        distinct: ['modulo'],
        select: {
          modulo: true,
        },
        orderBy: {
          modulo: 'asc',
        },
      });

      return modules.map((module) => module.modulo).filter(Boolean);
    } catch (error) {
      this.logger.error('Error fetching available modules:', error);
      throw error;
    }
  }

  // Add this method to get available tipoAccion values for filtering
  async getAvailableTipoAcciones(tenantId: string): Promise<string[]> {
    try {
      const tipoAcciones = await this.prisma.rol.findMany({
        where: {
          tenantId,
          activo: true,
        },
        include: {
          tipoAccion: {
            select: {
              tipoAccion: true,
            },
          },
        },
        distinct: ['tipoAccionId'],
      });

      return tipoAcciones
        .map((role) => role.tipoAccion?.tipoAccion)
        .filter(Boolean)
        .sort();
    } catch (error) {
      this.logger.error('Error fetching available tipo acciones:', error);
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
