export interface Auth0User {
  sub: string; // auth0 user id
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  // Custom claims we'll add in Auth0 rules
  tenant_id?: string;
  app_metadata?: {
    tenant_id: string;
  };
}
