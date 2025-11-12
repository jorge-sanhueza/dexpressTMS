export interface Client {
  id: string;
  nombre?: string;
  razonSocial?: string;
  rut: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comunaId: string;
  comuna?: {
    id: string;
    nombre: string;
    region?: {
      nombre: string;
    };
  };
  activo: boolean;
  esPersona: boolean;
  tipoEntidad: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientData {
  nombre?: string;
  razonSocial?: string;
  rut: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comunaId: string;
  esPersona: boolean;
}

export interface UpdateClientData {
  nombre?: string;
  razonSocial?: string;
  rut?: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  comunaId?: string;
  activo?: boolean;
  esPersona?: boolean;
}

export interface ClientsFilter {
  search?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface ClientsResponse {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
}
