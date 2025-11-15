export interface Contacto {
  id: string;
  nombre: string;
  rut: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  cargo?: string;
  contacto?: string;
  esPersonaNatural: boolean;
  activo: boolean;
  entidadId: string;
  comunaId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}
