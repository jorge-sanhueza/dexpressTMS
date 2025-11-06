export interface Auth0User {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  tenant_id?: string;
  tenantId?: string;
  tenant?: { id: string };
}