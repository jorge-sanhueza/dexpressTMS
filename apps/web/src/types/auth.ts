export interface User {
  id: string;
  email: string;
  name: string;
  tenant_id: string;
  profile_id: string;
  profile_type: string;
  permissions: string[];
}

export interface Rol {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  activo: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
