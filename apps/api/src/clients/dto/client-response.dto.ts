export class ClientResponseDto {
  id: string;
  nombre?: string;
  razonSocial?: string;
  rut: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comunaId: string;
  activo: boolean;
  esPersona: boolean;
  tipoEntidad: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  comuna?: any;

  constructor(client: any) {
    this.id = client.id;
    this.nombre = client.nombre;
    this.razonSocial = client.razonSocial;
    this.rut = client.rut;
    this.contacto = client.contacto;
    this.email = client.email;
    this.telefono = client.telefono;
    this.direccion = client.direccion;
    this.comunaId = client.comunaId;
    this.activo = client.activo;
    this.esPersona = client.esPersona;
    this.tipoEntidad = client.tipoEntidad;
    this.tenantId = client.tenantId;
    this.createdAt = client.createdAt;
    this.updatedAt = client.updatedAt;

    if (client.comuna) {
      this.comuna = client.comuna;
    }
  }
}
