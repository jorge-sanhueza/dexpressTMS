export interface Carrier {
  id: string;
  nombre: string;
  razonSocial?: string;
  rut: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comunaId: string;
  comuna?: any;
  activo: boolean;
  esPersona: boolean;
  tipoEntidad: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCarrierDto {
  nombre: string;
  razonSocial?: string;
  rut: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comunaId: string;
  esPersona?: boolean;
}

export interface UpdateCarrierDto {
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

export interface CarriersFilterDto {
  search?: string;
  activo?: boolean;
  esPersona?: boolean;
  page?: number;
  limit?: number;
}
