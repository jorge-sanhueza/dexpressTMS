export class CreateRoleDto {
  codigo: string;
  nombre: string;
  modulo: string;
  tipo_accion: string;
  orden?: number;
  activo?: boolean;
  tenantId?: string;
}
