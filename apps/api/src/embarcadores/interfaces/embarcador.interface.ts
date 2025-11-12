export interface Embarcador {
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

export interface CreateEmbarcadorDto {
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

export interface UpdateEmbarcadorDto {
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

export interface EmbarcadoresFilterDto {
  search?: string;
  activo?: boolean;
  esPersona?: boolean;
  page?: number;
  limit?: number;
}
