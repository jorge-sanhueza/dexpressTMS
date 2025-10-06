import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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
        tipoTenantId: true,
        estadoId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
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
      },
    });

    if (!defaultTenant) {
      throw new Error('No tenant found');
    }

    return defaultTenant;
  }
}
