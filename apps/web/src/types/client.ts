export interface Client {
  id: string;
  nombre: string;
  razonSocial?: string;
  rut: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comunaId?: string;
  comuna?: {
    id: string;
    nombre: string;
    region?: {
      nombre: string;
    };
  };
  activo: boolean;
  estado: string;
  tipo: string;
  tipoEntidad: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientData {
  nombre: string;
  razonSocial?: string;
  rut: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comunaId?: string;
  tipo: string;
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
  tipo?: string;
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
