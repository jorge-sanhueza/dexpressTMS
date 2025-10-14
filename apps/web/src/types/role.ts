export interface Rol {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  tipo_accion: string;
  activo: boolean;
  descripcion?: string;
  tenantId?: string;
  orden?: number;
}