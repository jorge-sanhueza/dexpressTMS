import { TipoEntidad } from '@prisma/client';

export class CarrierResponseDto {
  id: string;
  nombre: string;
  razonSocial?: string;
  rut: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comunaId: string;
  activo: boolean;
  esPersona: boolean;
  tipoEntidad: TipoEntidad;
  tenantId: string;
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

  constructor(carrier: any) {
    this.id = carrier.id;
    this.nombre = carrier.nombre;
    this.razonSocial = carrier.razonSocial;
    this.rut = carrier.rut;
    this.contacto = carrier.contacto;
    this.email = carrier.email;
    this.telefono = carrier.telefono;
    this.direccion = carrier.direccion;
    this.comunaId = carrier.comunaId;
    this.activo = carrier.activo;
    this.esPersona = carrier.esPersona;
    this.tipoEntidad = carrier.tipoEntidad;
    this.tenantId = carrier.tenantId;
    this.createdAt = carrier.createdAt;
    this.updatedAt = carrier.updatedAt;

    if (carrier.comuna) {
      this.comuna = {
        id: carrier.comuna.id,
        nombre: carrier.comuna.nombre,
        ...(carrier.comuna.provincia && {
          provincia: {
            id: carrier.comuna.provincia.id,
            nombre: carrier.comuna.provincia.nombre,
            ...(carrier.comuna.provincia.region && {
              region: {
                id: carrier.comuna.provincia.region.id,
                nombre: carrier.comuna.provincia.region.nombre,
              },
            }),
          },
        }),
      };
    }

    if (carrier.equipos) {
      this.equipos = carrier.equipos.map((equipo: any) => ({
        id: equipo.id,
        nombre: equipo.nombre,
        patente: equipo.patente,
        activo: equipo.activo,
        ...(equipo.tipoEquipo && {
          tipoEquipo: {
            id: equipo.tipoEquipo.id,
            nombre: equipo.tipoEquipo.nombre,
          },
        }),
        ...(equipo.modeloTransporte && {
          modeloTransporte: {
            id: equipo.modeloTransporte.id,
            nombre: equipo.modeloTransporte.nombre,
            tipoModelo: equipo.modeloTransporte.tipoModelo,
          },
        }),
      }));
    }
  }
}
