import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type LoginResponse } from "../types/auth";

interface Tenant {
  id: string;
  nombre: string;
  contacto: string;
  rut: string;
  activo: boolean;
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

  // Computed properties (getters)
  isAuthenticated: boolean;

  // Sync actions
  setUser: (user: User) => void;
  setTenant: (tenant: Tenant) => void;
  setLoading: (loading: boolean) => void;

  // Auth actions
  login: (response: LoginResponse) => Promise<void>;
  logout: () => void;

  // Data fetching
  fetchTenantData: (tenantId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      isLoading: true,

      // Computed property
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setTenant: (tenant) => set({ tenant }),

      setLoading: (isLoading) => set({ isLoading }),

      login: async (response: LoginResponse) => {
        // Store in localStorage
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));

        // Update store
        set({
          user: response.user,
          isAuthenticated: true,
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
          isAuthenticated: false,
          isLoading: false,
        });
      },

      fetchTenantData: async (tenantId: string) => {
        try {
          set({ isLoading: true });

          // Mock tenant data - replace with real API later
          await new Promise((resolve) => setTimeout(resolve, 500));

          const tenantData: Tenant = {
            id: tenantId,
            nombre: "Organización Demo",
            contacto: "contacto@demo.cl",
            rut: "12345678-9",
            activo: true,
          };

          set({ tenant: tenantData });
        } catch (error) {
          console.error("Error fetching tenant data:", error);
          set({
            tenant: {
              id: tenantId,
              nombre: "Mi Organización",
              contacto: "No disponible",
              rut: "No disponible",
              activo: true,
            },
          });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
