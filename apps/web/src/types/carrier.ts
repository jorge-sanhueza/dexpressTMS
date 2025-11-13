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
  equipos?: Array<{
    id: string;
    nombre: string;
    patente: string;
    activo: boolean;
    tipoEquipo?: {
      id: string;
      nombre: string;
    };
    modeloTransporte?: {
      id: string;
      nombre: string;
      tipoModelo: string;
    };
  }>;
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

export interface CarriersFilter {
  search?: string;
  activo?: boolean;
  esPersona?: boolean;
  page?: number;
  limit?: number;
}

export interface CarriersResponse {
  carriers: Carrier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
