// apps/api/src/embarcadores/dto/embarcador-response.dto.ts
export class EmbarcadorResponseDto {
  id: string;
  nombre: string;
  razonSocial: string;
  rut: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comunaId: string;
  comuna?: { nombre: string };
  activo: boolean;
  estado: string;
  tipo: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;

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
    this.comuna = embarcador.comuna ? { nombre: embarcador.comuna.nombre } : undefined;
    this.activo = embarcador.activo;
    this.estado = embarcador.estado;
    this.tipo = embarcador.tipo;
    this.tenantId = embarcador.tenantId;
    this.createdAt = embarcador.createdAt;
    this.updatedAt = embarcador.updatedAt;
  }
}