export class RoleResponseDto {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  tipo_accion: string;
  activo: boolean;

  constructor(role: any) {
    this.id = role.id;
    this.codigo = role.codigo;
    this.nombre = role.nombre;
    this.modulo = role.modulo;
    this.tipo_accion = role.tipoAccion?.tipoAccion || '';
    this.activo = role.activo;
  }
}
