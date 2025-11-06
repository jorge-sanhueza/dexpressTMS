import { EstadoUsuario } from '@prisma/client';

export class UserResponseDto {
  id: string;
  email: string;
  nombre: string;
  activo: boolean;
  estado: EstadoUsuario;
  rut?: string;
  telefono?: string;
  tenantId: string;
  perfilId: string;
  perfilNombre?: string;
  createdAt: string;
  updatedAt: string;
  rolesCount?: number;

  constructor(user: any) {
    this.id = user.id;
    this.email = user.correo;
    this.nombre = user.nombre;
    this.activo = user.activo;
    this.estado = user.estado;
    this.rut = user.rut || undefined;
    this.telefono = user.telefono || undefined;
    this.tenantId = user.tenantId;
    this.perfilId = user.perfilId;
    this.perfilNombre = user.perfil?.nombre;
    this.createdAt = user.createdAt.toISOString();
    this.updatedAt = user.updatedAt.toISOString();
    this.rolesCount = user.perfil?.perfilesRoles?.length || 0;
  }
}