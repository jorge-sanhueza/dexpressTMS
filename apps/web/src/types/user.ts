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

export interface CreateUserData {
  email: string;
  nombre: string;
  contacto?: string;
  rut?: string;
  telefono?: string;
  perfilId: string;
  tipoId?: string;
}

export interface Profile {
  id: string;
  nombre: string;
  tipo?: {
    id: string;
    tipoPerfil: string;
  };
}
