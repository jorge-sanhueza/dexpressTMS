import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { TenantResponseDto } from '../dto/tenant-response.dto';
import { TenantStatsResponseDto } from '../dto/tenant-stats-response.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  // Helper to normalize RUT format (remove dots for storage)
  private normalizeRut(rut: string): string {
    if (!rut) return rut;
    // Remove dots, keep dash and verification digit
    return rut.replace(/\./g, '');
  }

  private formatRutForDisplay(rut: string): string {
    if (!rut || typeof rut !== 'string') return rut;

    // Remove any existing dots
    const cleanRut = rut.replace(/\./g, '');

    // Find the dash
    const dashIndex = cleanRut.indexOf('-');
    if (dashIndex === -1) return rut;

    const body = cleanRut.slice(0, dashIndex);
    const verifier = cleanRut.slice(dashIndex); // Includes dash

    // Chilean RUT formatting: group from RIGHT to LEFT in groups of 3
    // But the first group (nearest the dash) can be 1-3 digits
    let formatted = '';
    let remaining = body;

    while (remaining.length > 3) {
      // Take last 3 digits
      formatted = remaining.slice(-3) + (formatted ? '.' + formatted : '');
      remaining = remaining.slice(0, -3);
    }

    // Add whatever is left (1-3 digits)
    formatted = remaining + (formatted ? '.' + formatted : '');

    return formatted + verifier;
  }

  async findById(id: string): Promise<TenantResponseDto> {
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

    // Format RUT for display before returning
    const tenantWithFormattedRut = {
      ...tenant,
      rut: this.formatRutForDisplay(tenant.rut),
    };

    return new TenantResponseDto(tenantWithFormattedRut);
  }

  async findCurrent(): Promise<TenantResponseDto> {
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
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!defaultTenant) {
      throw new NotFoundException('No tenant found');
    }

    // Format RUT for display
    const tenantWithFormattedRut = {
      ...defaultTenant,
      rut: this.formatRutForDisplay(defaultTenant.rut),
    };

    return new TenantResponseDto(tenantWithFormattedRut);
  }

  async findAll(): Promise<TenantResponseDto[]> {
    const tenants = await this.prisma.tenant.findMany({
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

    // Format RUTs for display and convert to DTOs
    return tenants.map((tenant) => {
      const tenantWithFormattedRut = {
        ...tenant,
        rut: this.formatRutForDisplay(tenant.rut),
      };
      return new TenantResponseDto(tenantWithFormattedRut);
    });
  }

  async create(createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    // Normalize RUT for storage (remove dots)
    const normalizedRut = this.normalizeRut(createTenantDto.rut);

    // Check if RUT already exists
    const existingTenant = await this.prisma.tenant.findFirst({
      where: { rut: normalizedRut },
    });

    if (existingTenant) {
      throw new BadRequestException('A tenant with this RUT already exists');
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        nombre: createTenantDto.nombre,
        contacto: createTenantDto.contacto,
        rut: normalizedRut, // Store without dots
        tipoTenant: createTenantDto.tipoTenant,
        logoUrl: createTenantDto.logoUrl,
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

    // Format RUT for display
    const tenantWithFormattedRut = {
      ...tenant,
      rut: this.formatRutForDisplay(tenant.rut),
    };

    return new TenantResponseDto(tenantWithFormattedRut);
  }

  async update(
    id: string,
    updateTenantDto: UpdateTenantDto,
  ): Promise<TenantResponseDto> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Prepare update data
    const updateData: any = { ...updateTenantDto };

    // Normalize RUT if provided
    if (updateTenantDto.rut) {
      const normalizedRut = this.normalizeRut(updateTenantDto.rut);

      // Check if new RUT conflicts with another tenant
      if (normalizedRut !== tenant.rut) {
        const existingTenant = await this.prisma.tenant.findFirst({
          where: {
            rut: normalizedRut,
            id: { not: id },
          },
        });

        if (existingTenant) {
          throw new BadRequestException(
            'A tenant with this RUT already exists',
          );
        }
      }

      updateData.rut = normalizedRut;
    }

    const updatedTenant = await this.prisma.tenant.update({
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

    // Format RUT for display
    const tenantWithFormattedRut = {
      ...updatedTenant,
      rut: this.formatRutForDisplay(updatedTenant.rut),
    };

    return new TenantResponseDto(tenantWithFormattedRut);
  }

  async deactivate(id: string): Promise<TenantResponseDto> {
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

    const deactivatedTenant = await this.prisma.tenant.update({
      where: { id },
      data: { activo: false },
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

    // Format RUT for display
    const tenantWithFormattedRut = {
      ...deactivatedTenant,
      rut: this.formatRutForDisplay(deactivatedTenant.rut),
    };

    return new TenantResponseDto(tenantWithFormattedRut);
  }

  async getStats(id: string): Promise<TenantStatsResponseDto> {
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

    const stats = {
      tenant,
      statistics: {
        totalUsers: usersCount,
        activeUsers: activeUsersCount,
        totalProfiles: profilesCount,
        totalRoles: rolesCount,
      },
    };

    return new TenantStatsResponseDto(stats);
  }

  // Optional: Add a method to validate RUT format
  async validateRutFormat(rut: string): Promise<boolean> {
    // Chilean RUT validation
    if (!rut || typeof rut !== 'string') return false;

    const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    if (cleanRut.length < 2) return false;

    const rutDigits = cleanRut.slice(0, -1);
    const verifier = cleanRut.slice(-1);

    if (!/^\d+$/.test(rutDigits)) return false;
    if (!/^[\dK]$/.test(verifier)) return false;

    // Validate using Chilean RUT algorithm
    let sum = 0;
    let multiplier = 2;

    for (let i = rutDigits.length - 1; i >= 0; i--) {
      sum += parseInt(rutDigits[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedVerifier = 11 - (sum % 11);
    let expectedVerifierChar: string;

    if (expectedVerifier === 11) expectedVerifierChar = '0';
    else if (expectedVerifier === 10) expectedVerifierChar = 'K';
    else expectedVerifierChar = expectedVerifier.toString();

    return expectedVerifierChar === verifier;
  }
}
