import { TipoAccion } from '@prisma/client';

export class RoleResponseDto {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  tipo_accion: TipoAccion;
  activo: boolean;
  orden: number;
  tenantId: string;
  visible: boolean;
  asignado: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(role: any) {
    this.id = role.id;
    this.codigo = role.codigo;
    this.nombre = role.nombre;
    this.modulo = role.modulo;
    this.tipo_accion = role.tipoAccion;
    this.activo = role.activo;
    this.orden = role.orden;
    this.tenantId = role.tenantId;
    this.visible = role.visible ?? true;
    this.asignado = role.asignado;
    this.createdAt = role.createdAt;
    this.updatedAt = role.updatedAt;
  }
}
