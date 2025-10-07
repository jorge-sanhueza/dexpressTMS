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
  activo: boolean;
  estado: string;
  tipo: string;
  tipoEntidad: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientDto {
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
  tipo?: string;
}

export interface ClientsFilterDto {
  search?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
}