import { create } from "zustand";
import { type LoginResponse } from "../types/auth";
import { tenantService } from "../services/tenantService";

interface Tenant {
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

interface User {
  id: string;
  email: string;
  name: string;
  tenant_id: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User) => void;
  setTenant: (tenant: Tenant) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  login: (response: LoginResponse) => Promise<void>;
  logout: () => void;
  fetchTenantData: (tenantId: string) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  tenant: null,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user }),

  setTenant: (tenant) => set({ tenant }),

  setLoading: (isLoading) => set({ isLoading }),

  setInitialized: (isInitialized) => set({ isInitialized }),

  login: async (response: LoginResponse) => {
    console.log("🔐 Login response:", response);
    console.log("🔐 Access token type:", typeof response.access_token);
    console.log("🔐 Access token length:", response.access_token?.length);
    console.log(
      "🔐 Access token first 50 chars:",
      response.access_token?.substring(0, 50)
    );

    // Check if it's a JWT token
    if (
      response.access_token &&
      response.access_token.split(".").length === 3
    ) {
      console.log("✅ Token appears to be a JWT");
      try {
        const payload = JSON.parse(atob(response.access_token.split(".")[1]));
        console.log("🔐 JWT payload:", payload);
      } catch (e) {
        console.log("❌ Cannot decode JWT payload");
      }
    } else {
      console.log("❌ Token is not a JWT");
    }
    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("user", JSON.stringify(response.user));

    set({
      user: response.user,
      isLoading: true,
    });

    // Fetch tenant data
    if (response.user.tenant_id) {
      await get().fetchTenantData(response.user.tenant_id);
    } else {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    set({
      user: null,
      tenant: null,
      isLoading: false,
      isInitialized: true,
    });
  },

  fetchTenantData: async (tenantId: string) => {
    try {
      set({ isLoading: true });

      const tenantData = await tenantService.getTenantById(tenantId);

      set({ tenant: tenantData });
    } catch (error) {
      const fallbackTenant: Tenant = {
        id: tenantId,
        nombre: "Organización Demo",
        contacto: "contacto@demo.cl",
        rut: "12345678-9",
        activo: true,
      };

      set({ tenant: fallbackTenant });
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  initializeAuth: async () => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      console.log("🔐 No auth data found");
      set({ isLoading: false, isInitialized: true });
      return;
    }

    try {
      const user = JSON.parse(userData);

      set({ user, isLoading: true });

      if (user.tenant_id) {
        await get().fetchTenantData(user.tenant_id);
      } else {
        try {
          console.log("🔐 No tenant_id, fetching current tenant...");
          const currentTenant = await tenantService.getCurrentUserTenant();
          set({ tenant: currentTenant, isLoading: false, isInitialized: true });
        } catch (error) {
          console.error("❌ Error fetching current tenant:", error);
          set({ isLoading: false, isInitialized: true });
        }
      }
    } catch (error) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      set({ isLoading: false, isInitialized: true });
    }
  },
}));

export const useIsAuthenticated = () => {
  const user = useAuthStore((state) => state.user);
  return !!user;
};
