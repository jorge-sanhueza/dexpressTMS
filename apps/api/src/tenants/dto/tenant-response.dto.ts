import { TipoTenant } from '@prisma/client';

export class TenantResponseDto {
  id: string;
  nombre: string;
  contacto: string;
  rut: string;
  activo: boolean;
  logoUrl?: string;
  tipoTenant: TipoTenant;
  createdAt: string;
  updatedAt: string;

  constructor(tenant: any) {
    this.id = tenant.id;
    this.nombre = tenant.nombre;
    this.contacto = tenant.contacto;
    this.rut = tenant.rut;
    this.activo = tenant.activo;
    this.logoUrl = tenant.logoUrl || undefined;
    this.tipoTenant = tenant.tipoTenant;
    this.createdAt = tenant.createdAt.toISOString();
    this.updatedAt = tenant.updatedAt.toISOString();
  }
}
