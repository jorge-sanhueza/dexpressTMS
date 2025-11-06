import { EstadoUsuario } from '@prisma/client';

export interface User {
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
}

export interface Profile {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  perfilesRoles?: Array<{
    id: string;
    rol: {
      id: string;
      codigo: string;
      nombre: string;
      modulo: string;
      tipoAccion: string;
      activo: boolean;
    };
  }>;
}

export interface Tenant {
  id: string;
  nombre: string;
  activo: boolean;
  tipoTenant: string;
  contacto: string;
  rut: string;
}

export interface UserWithDetails extends User {
  perfil: Profile;
  tenant: Tenant;
}

export interface CreateUserDto {
  email: string;
  nombre: string;
  rut?: string;
  telefono?: string;
  perfilId: string;
  tenantId: string;
  activo?: boolean;
  estado?: EstadoUsuario;
}

export interface UpdateUserDto {
  email?: string;
  nombre?: string;
  rut?: string;
  telefono?: string;
  perfilId?: string;
  activo?: boolean;
  estado?: EstadoUsuario;
}

export interface UsersFilterDto {
  search?: string;
  activo?: boolean;
  estado?: EstadoUsuario;
  perfilId?: string;
  page?: number;
  limit?: number;
}
