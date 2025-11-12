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
  activo: boolean;
  esPersona: boolean;
  tipoEntidad: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientDto {
  nombre?: string;
  razonSocial?: string;
  rut: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comunaId: string;
  esPersona?: boolean;
}

export interface UpdateClientDto {
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

export interface ClientsFilterDto {
  search?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
}
