export interface Profile {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  tipo: string;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileWithRoles extends Profile {
  roles: string[];
}

export interface ProfileType {
  id: string;
  tipoPerfil: string;
}