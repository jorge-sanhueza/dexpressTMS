export class ProfileResponseDto {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  roles?: any[];
  rolesCount?: number;
  usuariosCount?: number;

  constructor(profile: any) {
    this.id = profile.id;
    this.nombre = profile.nombre;
    this.descripcion = profile.descripcion || '';
    this.activo = profile.activo;
    this.roles = profile.roles;
    this.rolesCount = profile.rolesCount;
    this.usuariosCount = profile.usuariosCount;
  }
}
