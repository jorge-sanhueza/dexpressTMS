export interface Role {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  activo: boolean;
  visible: boolean;
  orden: number;
  tenantId: string;
  tipoAccion: 'VER' | 'CREAR' | 'EDITAR' | 'ELIMINAR';
  createdAt: string;
  updatedAt: string;
}

export interface RoleResponse {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  activo: boolean;
}
