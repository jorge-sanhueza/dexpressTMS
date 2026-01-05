import { create } from "zustand";
import { type AuthUser, type LoginResponse } from "../types/auth";
import { tenantService, type Tenant } from "../services/tenantService";
import { rolesService } from "../services/rolesService";
import type { Rol } from "../types/role";

interface AuthState {
  user: AuthUser | null;
  tenant: Tenant | null;
  roles: Rol[];
  isLoading: boolean;
  isInitialized: boolean;
  rolesLoaded: boolean;

  // Actions
  setUser: (user: AuthUser) => void;
  setTenant: (tenant: Tenant) => void;
  setRoles: (roles: Rol[]) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setRolesLoaded: (loaded: boolean) => void;
  login: (response: LoginResponse) => Promise<void>;
  logout: () => void;
  clearAuth: () => void;
  fetchTenantData: (tenant_id: string) => Promise<void>;
  fetchUserRoles: (rolesIds: string[]) => Promise<void>;
  initializeAuth: () => Promise<void>;
  hasPermission: (permissionCode: string) => boolean;
  hasModulePermission: (module: string, action: string) => boolean;
  handleTenantAndRoles: (user: AuthUser) => Promise<void>;
  isTokenExpired: (token: string) => boolean;
}

// JWT decoding utility function (base64url safe)
const decodeJWT = (token: string): any => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid JWT format");
      return null;
    }
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    return JSON.parse(atob(padded));
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

  logout: () => {
    get().clearAuth();
  },

  login: async (response: LoginResponse) => {

    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("user", JSON.stringify(response.user));

    set({ user: response.user });

    if (
      typeof response.user.tenant_id === "string" &&
      response.user.tenant_id.trim() !== ""
    ) {
      await get().fetchTenantData(response.user.tenant_id);

      if (response.user.permissions && response.user.permissions.length > 0) {
        console.log("Fetching roles with IDs:", response.user.permissions);
        await get().fetchUserRoles(response.user.permissions);
      } else {
        console.log("No permissions found in user object");
        set({ rolesLoaded: true });
      }
    } else {
      console.log("No tenant_id found");
      set({ isLoading: false, rolesLoaded: true });
    }
  },

  fetchTenantData: async (tenant_id: string) => {
    set({ isLoading: true });

    try {
      const tenantData = await tenantService.getTenantById(tenant_id);
      set({ tenant: tenantData });
    } catch (error: unknown) {
      const fallbackTenant: Tenant = {
        id: tenant_id,
        nombre: "Organización Demo",
        contacto: "contacto@demo.cl",
        rut: "12345678-9",
        activo: true,
      };
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      console.error("Failed to fetch tenant:", errorMessage);
      set({ tenant: fallbackTenant });
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  fetchUserRoles: async (roleCodes: string[]) => {
    try {
      console.log("Fetching roles by codes:", roleCodes);
      const roles = await rolesService.getRolesByCodes(roleCodes);
      console.log("Fetched roles:", roles);
      set({ roles, rolesLoaded: true });
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      set({ rolesLoaded: true });
    }
  },

  hasPermission: (permissionCode: string): boolean => {
    const { roles } = get();
    return roles.some((role) => role.codigo === permissionCode);
  },

  hasModulePermission: (module: string, action: string): boolean => {
    const { roles } = get();
    return roles.some(
      (role) =>
        role.modulo.toLowerCase() === module.toLowerCase() &&
        role.tipo_accion.toLowerCase() === action.toLowerCase()
    );
  },

  isTokenExpired: (token: string): boolean => {
    if (!token) return true;
    const decodedToken = decodeJWT(token);
    return (
      decodedToken && decodedToken.exp && decodedToken.exp * 1000 < Date.now()
    );
  },

  handleTenantAndRoles: async (user: AuthUser) => {
    if (user.tenant_id) {
      await get().fetchTenantData(user.tenant_id);
      if (user.permissions && user.permissions.length > 0) {
        await get().fetchUserRoles(user.permissions);
      } else {
        set({ rolesLoaded: true, isLoading: false });
      }
    } else {
      set({ isLoading: false, isInitialized: true, rolesLoaded: true });
    }
  },

  initializeAuth: async () => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      get().clearAuth();
      return;
    }
    try {
      if (get().isTokenExpired(token)) {
        get().clearAuth();
        return;
      }

      const user = JSON.parse(userData) as AuthUser;
      set({ user, isLoading: true, rolesLoaded: false });

      await get().handleTenantAndRoles(user);
    } catch (error) {
      get().clearAuth();
    }
  },
}));

export const useIsAuthenticated = (): boolean => {
  const user = useAuthStore((state) => state.user);
  return !!user;
};
