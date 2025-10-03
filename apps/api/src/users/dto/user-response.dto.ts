import { User } from '../interfaces/user.interface';

export class UserResponseDto implements User {
  id: string;
  email: string;
  nombre: string;
  activo: boolean;
  contacto?: string;
  rut?: string;
  telefono?: string;
  tenantId: string;
  perfilId: string;
  estadoId: string;
  tipoId: string;
  profile_type?: string;
  createdAt: string;
  updatedAt: string;

  constructor(user: any, profileType?: string) {
    this.id = user.id;
    this.email = user.correo;
    this.nombre = user.nombre;
    this.activo = user.activo;
    this.contacto = user.contacto || undefined;
    this.rut = user.rut || undefined;
    this.telefono = user.telefono || undefined;
    this.tenantId = user.tenantId;
    this.perfilId = user.perfilId;
    this.estadoId = user.estadoId;
    this.tipoId = user.tipoId;
    this.createdAt = user.createdAt.toISOString();
    this.updatedAt = user.updatedAt.toISOString();
    this.profile_type = profileType;
  }
}
