export class RoleResponseDto {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  activo: boolean;

  constructor(role: any) {
    this.id = role.id;
    this.codigo = role.codigo;
    this.nombre = role.nombre;
    this.modulo = role.modulo;
    this.activo = role.activo;
  }
}