export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    tenant_id: string;
    profile_id: string;
    profile_name: string;
    permissions: string[];
  };
}
