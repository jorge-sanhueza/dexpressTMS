export interface Rol {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  tipo_accion: string;
  activo: boolean;
  descripcion?: string;
  tenantId?: string;
  orden?: number;
}

export interface CreateRoleDto {
  codigo: string;
  nombre: string;
  modulo: string;
  tipo_accion: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
  tenantId?: string;
}

export interface UpdateRoleDto {
  codigo?: string;
  nombre?: string;
  modulo?: string;
  tipo_accion?: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
}

export interface RolesFilterDto {
  search?: string;
  modulo?: string;
  tipo_accion?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedRolesResponse {
  roles: Rol[];
  total: number;
  page: number;
  limit: number;
}
