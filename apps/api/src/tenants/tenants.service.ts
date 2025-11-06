import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipoTenant } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        contacto: true,
        rut: true,
        activo: true,
        logoUrl: true,
        tipoTenant: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async findCurrent() {
    const defaultTenant = await this.prisma.tenant.findFirst({
      where: { nombre: 'Tenant Administrativo' },
      select: {
        id: true,
        nombre: true,
        contacto: true,
        rut: true,
        activo: true,
        logoUrl: true,
        tipoTenant: true,
      },
    });

    if (!defaultTenant) {
      throw new NotFoundException('No tenant found');
    }

    return defaultTenant;
  }

  // New method: Get all tenants (useful for admin)
  async findAll() {
    return await this.prisma.tenant.findMany({
      select: {
        id: true,
        nombre: true,
        contacto: true,
        rut: true,
        activo: true,
        logoUrl: true,
        tipoTenant: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  // New method: Create tenant
  async create(tenantData: {
    nombre: string;
    contacto: string;
    rut: string;
    tipoTenant: TipoTenant;
    logoUrl?: string;
  }) {
    return await this.prisma.tenant.create({
      data: {
        nombre: tenantData.nombre,
        contacto: tenantData.contacto,
        rut: tenantData.rut,
        tipoTenant: tenantData.tipoTenant,
        logoUrl: tenantData.logoUrl,
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        contacto: true,
        rut: true,
        activo: true,
        logoUrl: true,
        tipoTenant: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // New method: Update tenant
  async update(
    id: string,
    updateData: {
      nombre?: string;
      contacto?: string;
      rut?: string;
      activo?: boolean;
      logoUrl?: string;
      tipoTenant?: TipoTenant;
    },
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return await this.prisma.tenant.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        contacto: true,
        rut: true,
        activo: true,
        logoUrl: true,
        tipoTenant: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // New method: Soft delete tenant
  async deactivate(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Check if tenant has active users before deactivating
    const activeUsersCount = await this.prisma.usuario.count({
      where: {
        tenantId: id,
        activo: true,
      },
    });

    if (activeUsersCount > 0) {
      throw new BadRequestException(
        'Cannot deactivate tenant with active users',
      );
    }

    return await this.prisma.tenant.update({
      where: { id },
      data: { activo: false },
      select: {
        id: true,
        nombre: true,
        activo: true,
        updatedAt: true,
      },
    });
  }

  // New method: Get tenant statistics
  async getStats(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        tipoTenant: true,
        activo: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const [usersCount, activeUsersCount, profilesCount, rolesCount] =
      await Promise.all([
        this.prisma.usuario.count({ where: { tenantId: id } }),
        this.prisma.usuario.count({
          where: {
            tenantId: id,
            activo: true,
          },
        }),
        this.prisma.perfil.count({ where: { tenantId: id } }),
        this.prisma.rol.count({ where: { tenantId: id } }),
      ]);

    return {
      tenant: {
        id: tenant.id,
        nombre: tenant.nombre,
        tipoTenant: tenant.tipoTenant,
        activo: tenant.activo,
      },
      statistics: {
        totalUsers: usersCount,
        activeUsers: activeUsersCount,
        totalProfiles: profilesCount,
        totalRoles: rolesCount,
      },
    };
  }
}
