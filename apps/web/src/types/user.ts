export interface User {
  id: string;
  email: string;
  nombre: string;
  activo: boolean;
  contacto?: string;
  rut?: string;
  telefono?: string;
  tenantId: string;
  perfilId: string;
  estadoId: string;
  tipoId: string;
  profile_type?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UsersFilter {
  search?: string;
  activo?: boolean;
  perfilId?: string;
  page?: number;
  limit?: number;
}
