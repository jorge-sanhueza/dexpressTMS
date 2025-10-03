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

export interface ProfileType {
  id: string;
  tipoPerfil: string;
}

export interface Profile {
  id: string;
  nombre: string;
  tipo?: ProfileType;
}

export interface UserType {
  id: string;
  tipoUsuario: string;
}

export interface Status {
  id: string;
  estado: string;
}

export interface Tenant {
  id: string;
  nombre: string;
}

export interface UserWithDetails extends User {
  perfil?: Profile;
  tipo?: UserType;
  estado?: Status;
}

export interface UserWithFullDetails extends User {
  perfil?: Profile;
  tipo?: UserType;
  estado?: Status;
  tenant?: Tenant;
}

export interface CreateUserDto {
  email: string;
  nombre: string;
  contacto?: string;
  rut?: string;
  telefono?: string;
  perfilId: string;
  tenantId: string;
  tipoId?: string;
}

export interface UpdateUserDto {
  nombre?: string;
  contacto?: string;
  rut?: string;
  telefono?: string;
  perfilId?: string;
  activo?: boolean;
  tipoId?: string;
}

export interface UsersFilterDto {
  search?: string;
  activo?: boolean;
  perfilId?: string;
  page?: number;
  limit?: number;
}
