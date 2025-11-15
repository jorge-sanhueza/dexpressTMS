import { OrigenDireccion } from '@prisma/client';

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
  origen: OrigenDireccion;
  tenantId: string;
  ultimaVezUsada?: Date;
  esPrincipal: boolean;
  email?: string;
  referencia?: string;
  telefono?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  comuna?: any;
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
  origen?: OrigenDireccion;
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
  origen?: OrigenDireccion;
  activo?: boolean;
  esPrincipal?: boolean;
  email?: string;
  referencia?: string;
  telefono?: string;
}

export interface DireccionesFilterDto {
  search?: string;
  activo?: boolean;
  comunaId?: string;
  esPrincipal?: boolean;
  origen?: OrigenDireccion;
  page?: number;
  limit?: number;
}
