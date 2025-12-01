export class EntidadResponseDto {
  id: string;
  nombre: string;
  rut: string;
  tipoEntidad: string;
  activo: boolean;
  contacto: string;
  email: string;
  telefono: string;
  direccion?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;

  comuna?: {
    id: string;
    nombre: string;
    region?: {
      id: string;
      nombre: string;
    };
  };

  constructor(entidad: any) {
    this.id = entidad.id;
    this.nombre = entidad.nombre;
    this.rut = entidad.rut;
    this.tipoEntidad = entidad.tipoEntidad;
    this.activo = entidad.activo;
    this.contacto = entidad.contacto;
    this.email = entidad.email;
    this.telefono = entidad.telefono;
    this.direccion = entidad.direccion;
    this.tenantId = entidad.tenantId;
    this.createdAt = entidad.createdAt;
    this.updatedAt = entidad.updatedAt;

    if (entidad.comuna) {
      this.comuna = {
        id: entidad.comuna.id,
        nombre: entidad.comuna.nombre,
        ...(entidad.comuna.region && {
          region: {
            id: entidad.comuna.region.id,
            nombre: entidad.comuna.region.nombre,
          },
        }),
      };
    }
  }
}
