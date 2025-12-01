export class TipoCargaResponseDto {
  id: string;
  nombre: string;
  observaciones?: string;
  activo: boolean;
  requiereEquipoEspecial: boolean;
  requiereTempControlada: boolean;
  orden: number;
  visible: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(tipoCarga: any) {
    this.id = tipoCarga.id;
    this.nombre = tipoCarga.nombre;
    this.observaciones = tipoCarga.observaciones;
    this.activo = tipoCarga.activo;
    this.requiereEquipoEspecial = tipoCarga.requiereEquipoEspecial;
    this.requiereTempControlada = tipoCarga.requiereTempControlada;
    this.orden = tipoCarga.orden;
    this.visible = tipoCarga.visible;
    this.tenantId = tipoCarga.tenantId;
    this.createdAt = tipoCarga.createdAt;
    this.updatedAt = tipoCarga.updatedAt;
  }
}
