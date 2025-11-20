export class ContactoResponseDto {
  id: string;
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
  direccion?: string; // Added as optional
  cargo?: string;
  contacto?: string;
  esPersonaNatural: boolean;
  activo: boolean;
  entidadId: string;
  comunaId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  entidad?: {
    id: string;
    nombre: string;
    rut: string;
    tipoEntidad: string;
    direccion?: string; // Also add to entidad relation if needed
  };

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

  constructor(contacto: any) {
    this.id = contacto.id;
    this.nombre = contacto.nombre;
    this.rut = contacto.rut;
    this.email = contacto.email;
    this.telefono = contacto.telefono;
    this.direccion = contacto.direccion; // Added
    this.cargo = contacto.cargo;
    this.contacto = contacto.contacto;
    this.esPersonaNatural = contacto.esPersonaNatural;
    this.activo = contacto.activo;
    this.entidadId = contacto.entidadId;
    this.comunaId = contacto.comunaId;
    this.tenantId = contacto.tenantId;
    this.createdAt = contacto.createdAt;
    this.updatedAt = contacto.updatedAt;

    // Map relations
    if (contacto.entidad) {
      this.entidad = {
        id: contacto.entidad.id,
        nombre: contacto.entidad.nombre,
        rut: contacto.entidad.rut,
        tipoEntidad: contacto.entidad.tipoEntidad,
        direccion: contacto.entidad.direccion,
      };
    }

    if (contacto.comuna) {
      this.comuna = {
        id: contacto.comuna.id,
        nombre: contacto.comuna.nombre,
      };

      if (contacto.comuna.provincia) {
        this.comuna.provincia = {
          id: contacto.comuna.provincia.id,
          nombre: contacto.comuna.provincia.nombre,
        };

        if (contacto.comuna.provincia.region) {
          this.comuna.provincia.region = {
            id: contacto.comuna.provincia.region.id,
            nombre: contacto.comuna.provincia.region.nombre,
          };
        }
      }
    }
  }
}
