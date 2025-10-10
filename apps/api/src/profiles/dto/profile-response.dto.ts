export class ProfileResponseDto {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  activo: boolean;
  roles?: string[];

  constructor(profile: any) {
    this.id = profile.id;
    this.nombre = profile.nombre;
    this.descripcion = profile.descripcion || '';
    this.tipo = profile.tipo?.tipoPerfil || profile.tipo;
    this.activo = profile.activo;
    this.roles = profile.roles;
  }
}