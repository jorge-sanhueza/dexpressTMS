// backend: dto/tipo-servicio-response.dto.ts
export class TipoServicioResponseDto {
  id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
  orden: number;
  visible: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(tipoServicio: any) {
    this.id = tipoServicio.id;
    this.nombre = tipoServicio.nombre;
    this.codigo = tipoServicio.codigo;
    this.descripcion = tipoServicio.descripcion;
    this.activo = tipoServicio.activo;
    this.orden = tipoServicio.orden;
    this.visible = tipoServicio.visible;
    this.tenantId = tipoServicio.tenantId;
    this.createdAt = tipoServicio.createdAt;
    this.updatedAt = tipoServicio.updatedAt;
  }
}
