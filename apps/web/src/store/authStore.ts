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
  rolesLoaded: boolean;

  // Actions
  setUser: (user: User) => void;
  setTenant: (tenant: Tenant) => void;
  setRoles: (roles: Rol[]) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setRolesLoaded: (loaded: boolean) => void;
  login: (response: LoginResponse) => Promise<void>;
  logout: () => void;
  clearAuth: () => void;
  fetchTenantData: (tenantId: string) => Promise<void>;
  fetchUserRoles: (rolesIds: string[]) => Promise<void>;
  initializeAuth: () => Promise<void>;
  hasPermission: (permissionCode: string) => boolean;
}

// JWT decoding utility function
const decodeJWT = (token: string): any => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  tenant: null,
  roles: [],
  isLoading: true,
  isInitialized: false,
  rolesLoaded: false,

  setUser: (user) => set({ user }),

  setTenant: (tenant) => set({ tenant }),

  setRoles: (roles) => set({ roles }),

  setLoading: (isLoading) => set({ isLoading }),

  setInitialized: (isInitialized) => set({ isInitialized }),

  setRolesLoaded: (rolesLoaded) => set({ rolesLoaded }),

  clearAuth: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    set({
      user: null,
      tenant: null,
      roles: [],
      isLoading: false,
      isInitialized: true,
      rolesLoaded: false,
    });
  },

  login: async (response: LoginResponse) => {
    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("user", JSON.stringify(response.user));

    set({
      user: response.user,
      isLoading: true,
      rolesLoaded: false,
    });

    // Fetch tenant data
    if (response.user.tenant_id) {
      await get().fetchTenantData(response.user.tenant_id);
      if (response.user.permissions && response.user.permissions.length > 0) {
        await get().fetchUserRoles(response.user.permissions);
      } else {
        set({ rolesLoaded: true });
      }
    } else {
      set({ isLoading: false, rolesLoaded: true });
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
      rolesLoaded: false,
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
      set({ roles, rolesLoaded: true });
    } catch (error) {
      console.error("Error fetching user roles:", error);
      set({ roles: [], rolesLoaded: true });
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
      set({ isLoading: false, isInitialized: true, rolesLoaded: true });
      return;
    }

    try {
      // Check if token is expired before even trying to use it
      const decodedToken = decodeJWT(token);
      if (
        decodedToken &&
        decodedToken.exp &&
        decodedToken.exp * 1000 < Date.now()
      ) {
        console.log("🔄 Token expired, clearing auth...");
        get().clearAuth();
        return;
      }

      const user = JSON.parse(userData);

      set({ user, isLoading: true, rolesLoaded: false });

      if (user.tenant_id) {
        await get().fetchTenantData(user.tenant_id);
        if (user.permissions && user.permissions.length > 0) {
          await get().fetchUserRoles(user.permissions);
        } else {
          set({ rolesLoaded: true });
        }
      } else {
        set({ isLoading: false, isInitialized: true, rolesLoaded: true });
      }
    } catch (error) {
      console.error("❌ Error initializing auth:", error);
      // Clear auth on any error during initialization
      get().clearAuth();
    }
  },
}));

export const useIsAuthenticated = () => {
  const user = useAuthStore((state) => state.user);
  return !!user;
};
