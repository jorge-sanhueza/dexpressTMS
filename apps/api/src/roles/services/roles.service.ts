import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RoleResponseDto } from '../dto/role-response.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private prisma: PrismaService) {}

  async getRolesByIds(roleIds: string[]): Promise<RoleResponseDto[]> {
    this.logger.log(`Fetching roles by IDs: ${roleIds.length} roles`);
    this.logger.debug(`Role IDs: ${JSON.stringify(roleIds)}`); // Add this line
    try {
      this.logger.log(`Fetching roles by IDs: ${roleIds.length} roles`);

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
        },
      });
      this.logger.debug(`Found ${roles.length} roles`); // Add this line
      this.logger.debug(`Roles found: ${JSON.stringify(roles)}`); // Add this line
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
}
