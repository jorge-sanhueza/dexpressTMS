export interface Direccion {
  id: string;
  activo: boolean;
  calle?: string;
  comunaId: string;
  contacto?: string;
  direccionTexto: string;
  frecuencia: number;
  latitud?: number;
  longitud?: number;
  nombre?: string;
  numero?: string;
  origen: string;
  tenantId: string;
  ultimaVezUsada?: Date;
  esPrincipal: boolean;
  email?: string;
  referencia?: string;
  telefono?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
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
}

export interface CreateDireccionDto {
  calle?: string;
  comunaId: string;
  contacto?: string;
  direccionTexto: string;
  frecuencia?: number;
  latitud?: number;
  longitud?: number;
  nombre?: string;
  numero?: string;
  origen?: string;
  esPrincipal?: boolean;
  email?: string;
  referencia?: string;
  telefono?: string;
}

export interface UpdateDireccionDto {
  calle?: string;
  comunaId?: string;
  contacto?: string;
  direccionTexto?: string;
  frecuencia?: number;
  latitud?: number;
  longitud?: number;
  nombre?: string;
  numero?: string;
  origen?: string;
  activo?: boolean;
  esPrincipal?: boolean;
  email?: string;
  referencia?: string;
  telefono?: string;
}

export interface DireccionesFilter {
  search?: string;
  activo?: boolean;
  comunaId?: string;
  esPrincipal?: boolean;
  origen?: string;
  page?: number;
  limit?: number;
}

export interface DireccionesResponse {
  direcciones: Direccion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Coordinates {
  latitud: number;
  longitud: number;
}

export interface GeocodingResponse {
  latitud: number;
  longitud: number;
  direccionFormateada: string;
}
