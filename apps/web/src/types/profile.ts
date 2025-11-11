// In your types/profile.ts file
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

// Update this interface to expect role objects, not strings
export interface ProfileWithRoles extends Profile {
  roles: Array<{
    id: string;
    codigo: string;
    nombre: string;
    modulo: string;
    tipo_accion: string;
    // Add other role properties that your API returns
  }>;
}

export interface ProfileType {
  id: string;
  tipoPerfil: string;
}
