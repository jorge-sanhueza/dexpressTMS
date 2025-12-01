export interface Entidad {
  id: string;
  nombre: string;
  rut: string;
  tipoEntidad: string;
  activo: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  contacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface EntidadesResponse {
  entidades: Entidad[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EntidadesFilter {
  search?: string;
  tipoEntidad?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
}
