export interface Embarcador {
  id: string;
  nombre: string;
  razonSocial: string;
  rut: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comunaId: string;
  comuna?: any;
  activo: boolean;
  estado: string;
  tipo: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmbarcadorDto {
  nombre: string;
  razonSocial: string;
  rut: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comunaId: string;
  tipo: string;
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
  tipo?: string;
  activo?: boolean;
}

export interface EmbarcadoresFilter {
  search?: string;
  activo?: boolean;
  tipo?: string;
  page?: number;
  limit?: number;
}

export interface EmbarcadoresResponse {
  embarcadores: Embarcador[];
  total: number;
  page: number;
  limit: number;
}
