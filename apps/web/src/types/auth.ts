export interface AuthUser {
  id: string;
  email: string;
  name: string;
  tenant_id: string;
  profile_id: string;
  profile_type: string;
  permissions: string[];
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}