import { TipoEntidad } from '@prisma/client';

export class EmbarcadorResponseDto {
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

  constructor(embarcador: any) {
    this.id = embarcador.id;
    this.nombre = embarcador.nombre;
    this.razonSocial = embarcador.razonSocial;
    this.rut = embarcador.rut;
    this.contacto = embarcador.contacto;
    this.email = embarcador.email;
    this.telefono = embarcador.telefono;
    this.direccion = embarcador.direccion;
    this.comunaId = embarcador.comunaId;
    this.activo = embarcador.activo;
    this.esPersona = embarcador.esPersona;
    this.tipoEntidad = embarcador.tipoEntidad;
    this.tenantId = embarcador.tenantId;
    this.createdAt = embarcador.createdAt;
    this.updatedAt = embarcador.updatedAt;

    if (embarcador.comuna) {
      this.comuna = {
        id: embarcador.comuna.id,
        nombre: embarcador.comuna.nombre,
        ...(embarcador.comuna.provincia && {
          provincia: {
            id: embarcador.comuna.provincia.id,
            nombre: embarcador.comuna.provincia.nombre,
            ...(embarcador.comuna.provincia.region && {
              region: {
                id: embarcador.comuna.provincia.region.id,
                nombre: embarcador.comuna.provincia.region.nombre,
              },
            }),
          },
        }),
      };
    }
  }
}
