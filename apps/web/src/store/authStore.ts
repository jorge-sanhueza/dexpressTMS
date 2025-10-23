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
      console.error("Invalid JWT format: expected 3 parts separated by dots.");
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
    console.log("🔄 Login started", response.user);
    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("user", JSON.stringify(response.user));

    set({ user: response.user });

    // Check if tenant_id exists and is a non-empty string
    if (
      typeof response.user.tenant_id === "string" &&
      response.user.tenant_id.trim() !== ""
    ) {
      await get().fetchTenantData(response.user.tenant_id);

      if (response.user.permissions && response.user.permissions.length > 0) {
        await get().fetchUserRoles(response.user.permissions);
      } else {
        set({ rolesLoaded: true });
      }
    } else {
      set({ isLoading: false, rolesLoaded: true });
    }
    console.log("✅ Login completed");
  },

  fetchTenantData: async (tenant_id: string) => {
    try {
      set({ isLoading: true });
      let tenantData: Tenant;

      try {
        tenantData = await tenantService.getTenantById(tenant_id);
      } catch (apiError: unknown) {
        if (apiError instanceof Error) {
          console.error("API Error message:", apiError.message);
          console.error("API Error name:", apiError.name);
        } else {
          console.error("Unknown API error type:", apiError);
        }

        // Use fallback
        tenantData = {
          id: tenant_id,
          nombre: "Organización Demo",
          contacto: "contacto@demo.cl",
          rut: "12345678-9",
          activo: true,
        };
        console.log("🔄 Using fallback tenant:", tenantData);
      }
      set({ tenant: tenantData });
    } catch (error: unknown) {
      console.error("❌ Unexpected error in fetchTenantData:");

      if (error instanceof Error) {
        console.error("Unexpected error message:", error.message);
        console.error("Unexpected error name:", error.name);
      } else {
        console.error("Unknown unexpected error type:", error);
      }

      // Final fallback
      const fallbackTenant: Tenant = {
        id: tenant_id,
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
      if (roles.length === 0) {
        console.warn(
          "⚠️ WARNING: Roles service returned empty array despite having",
          rolesIds.length,
          "role IDs"
        );
      }
      set({ roles, rolesLoaded: true });
    } catch (error) {
      console.error("❌ Error fetching user roles:", error);
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
      (role) => role.modulo === module && role.tipo_accion === action
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

      const user = JSON.parse(userData ?? "") as AuthUser;
      set({ user, isLoading: true, rolesLoaded: false });

      await get().handleTenantAndRoles(user);
    } catch (error) {
      console.error("❌ Error initializing auth:", error);
      get().clearAuth();
    }
  },
}));

export const useIsAuthenticated = (): boolean => {
  const user = useAuthStore((state) => state.user);
  return !!user;
};
