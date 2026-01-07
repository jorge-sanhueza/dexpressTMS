export interface UsersFilterDto {
  search?: string;
  activo?: boolean | string;
  estado?: string;
  perfilId?: string;
  page?: number | string;
  limit?: number | string;
}