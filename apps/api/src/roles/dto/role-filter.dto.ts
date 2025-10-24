export class RolesFilterDto {
  search?: string;
  modulo?: string;
  tipo_accion?: string;
  activo?: boolean;
  page?: number = 1;
  limit?: number = 10;
}
