export interface AuthUser {
  id: string;
  email: string;
  name: string;
  tenant_id: string;
  profile_id: string;
  profile_name: string;
  permissions: string[];
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}
