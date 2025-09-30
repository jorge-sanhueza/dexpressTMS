export interface Tenant {
  id: string;
  nombre: string;
  contacto: string;
  rut: string;
  activo: boolean;
  logo_url?: string;
  tipo_tenant_id?: string;
  estado_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const tenantService = {
  async getTenantById(tenantId: string): Promise<Tenant> {
    const response = await fetch(
      `http://localhost:3000/api/tenants/${tenantId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tenant data");
    }

    return response.json();
  },

  async getCurrentUserTenant(): Promise<Tenant> {
    const response = await fetch("http://localhost:3000/api/tenants/current");

    if (!response.ok) {
      throw new Error("Failed to fetch current tenant data");
    }

    return response.json();
  },
};
