import { create } from "zustand";
import { type LoginResponse, type Rol } from "../types/auth";
import { tenantService } from "../services/tenantService";
import { rolesService } from "../services/rolesService";

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
  profile_id: string;
  profile_type: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  roles: Rol[];
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User) => void;
  setTenant: (tenant: Tenant) => void;
  setRoles: (roles: Rol[]) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  login: (response: LoginResponse) => Promise<void>;
  logout: () => void;
  fetchTenantData: (tenantId: string) => Promise<void>;
  fetchUserRoles: (rolesIds: string[]) => Promise<void>;
  initializeAuth: () => Promise<void>;
  hasPermission: (permissionCode: string) => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  tenant: null,
  roles: [],
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user }),

  setTenant: (tenant) => set({ tenant }),

  setRoles: (roles) => set({ roles }),

  setLoading: (isLoading) => set({ isLoading }),

  setInitialized: (isInitialized) => set({ isInitialized }),

  login: async (response: LoginResponse) => {
    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("user", JSON.stringify(response.user));

    set({
      user: response.user,
      isLoading: true,
    });

    // Fetch tenant data
    if (response.user.tenant_id) {
      await get().fetchTenantData(response.user.tenant_id);
      if (response.user.permissions && response.user.permissions.length > 0) {
        await get().fetchUserRoles(response.user.permissions);
      }
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
      roles: [],
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

  fetchUserRoles: async (rolesIds: string[]) => {
    try {
      const roles = await rolesService.getRolesByIds(rolesIds);
      set({ roles });
    } catch (error) {
      console.error("Error fetching user roles:", error);
      set({ roles: [] });
    }
  },

  hasPermission: (permissionCode: string): boolean => {
    const { roles } = get();

    console.log("🔍 hasPermission check:");
    console.log("   Checking for permission code:", permissionCode);
    console.log(
      "   Available roles:",
      roles.map((r) => ({ id: r.id, codigo: r.codigo, nombre: r.nombre }))
    );
    console.log(
      "   Match found:",
      roles.some((role) => role.codigo === permissionCode)
    );

    return roles.some((role) => role.codigo === permissionCode);
  },

  initializeAuth: async () => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      set({ isLoading: false, isInitialized: true });
      return;
    }

    try {
      const user = JSON.parse(userData);
      console.log("🔄 Initializing auth with user:", user);
      console.log("🔄 User permissions (role IDs):", user.permissions);

      set({ user, isLoading: true });

      if (user.tenant_id) {
        await get().fetchTenantData(user.tenant_id);
        if (user.permissions && user.permissions.length > 0) {
          console.log(
            "🔄 Fetching roles for permission IDs:",
            user.permissions
          );
          await get().fetchUserRoles(user.permissions);
        } else {
          console.log("🔄 No permissions found for user");
        }
      } else {
        try {
          const currentTenant = await tenantService.getCurrentUserTenant();
          set({ tenant: currentTenant, isLoading: false, isInitialized: true });
        } catch (error) {
          set({ isLoading: false, isInitialized: true });
        }
      }
    } catch (error) {
      console.error("❌ Error initializing auth:", error);
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
