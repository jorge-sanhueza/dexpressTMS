export interface Contacto {
  id: string;
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  cargo?: string;
  contacto?: string;
  esPersonaNatural: boolean;
  activo: boolean;
  entidadId: string;
  comunaId: string;
  comuna?: {
    id: string;
    nombre: string;
    provincia?: {
      id: string;
      nombre: string;
      region?: {
        id: string;
        nombre: string;
      };
    };
  };
  entidad?: {
    id: string;
    nombre: string;
    rut: string;
    tipoEntidad: string;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactoData {
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  cargo?: string;
  contacto: string;
  esPersonaNatural?: boolean;
  comunaId: string;
}

export interface UpdateContactoData {
  nombre?: string;
  rut?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  cargo?: string;
  contacto?: string;
  esPersonaNatural?: boolean;
  activo?: boolean;
  comunaId?: string;
}

export interface ContactosFilter {
  search?: string;
  activo?: boolean;
  esPersonaNatural?: boolean;
  entidadId?: string;
  page?: number;
  limit?: number;
}

export interface ContactosResponse {
  contactos: Contacto[];
  total: number;
  page: number;
  limit: number;
}
