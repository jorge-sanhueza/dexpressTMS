import { OrigenDireccion } from '@prisma/client';

export class DireccionResponseDto {
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

  constructor(direccion: any) {
    this.id = direccion.id;
    this.activo = direccion.activo;
    this.calle = direccion.calle;
    this.comunaId = direccion.comunaId;
    this.contacto = direccion.contacto;
    this.direccionTexto = direccion.direccionTexto;
    this.frecuencia = direccion.frecuencia;
    this.latitud = direccion.latitud;
    this.longitud = direccion.longitud;
    this.nombre = direccion.nombre;
    this.numero = direccion.numero;
    this.origen = direccion.origen;
    this.tenantId = direccion.tenantId;
    this.ultimaVezUsada = direccion.ultimaVezUsada;
    this.esPrincipal = direccion.esPrincipal;
    this.email = direccion.email;
    this.referencia = direccion.referencia;
    this.telefono = direccion.telefono;
    this.createdAt = direccion.createdAt;
    this.updatedAt = direccion.updatedAt;

    if (direccion.comuna) {
      this.comuna = {
        id: direccion.comuna.id,
        nombre: direccion.comuna.nombre,
        ...(direccion.comuna.provincia && {
          provincia: {
            id: direccion.comuna.provincia.id,
            nombre: direccion.comuna.provincia.nombre,
            ...(direccion.comuna.provincia.region && {
              region: {
                id: direccion.comuna.provincia.region.id,
                nombre: direccion.comuna.provincia.region.nombre,
              },
            }),
          },
        }),
      };
    }
  }
}
