export interface UsersFilterDto {
  search?: string;
  activo?: boolean;
  estado?: string;
  perfilId?: string;
  page?: number;
  limit?: number;
}
