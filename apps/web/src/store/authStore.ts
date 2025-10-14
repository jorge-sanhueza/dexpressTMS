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
    console.log("🔄 Login started", response.user);
    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("user", JSON.stringify(response.user));

    set({
      user: response.user,
      isLoading: true,
      rolesLoaded: false,
    });

    // FIX: Check if tenant_id exists properly
    if (response.user.tenant_id) {
      console.log(
        "📋 Fetching tenant data for tenant_id:",
        response.user.tenant_id
      );
      await get().fetchTenantData(response.user.tenant_id);

      if (response.user.permissions && response.user.permissions.length > 0) {
        console.log("🔐 Fetching user roles...", response.user.permissions);
        await get().fetchUserRoles(response.user.permissions);
      } else {
        console.log("ℹ️ No permissions to fetch");
        set({ rolesLoaded: true });
      }
    } else {
      console.log("❌ No tenant ID found in user response");
      set({ isLoading: false, rolesLoaded: true });
    }

    console.log("✅ Login completed");
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

  fetchTenantData: async (tenant_id: string) => {
    console.log("🎯 fetchTenantData CALLED with tenant_id:", tenant_id);

    try {
      console.log("📋 fetchTenantData started for tenant:", tenant_id);
      set({ isLoading: true });

      let tenantData: Tenant;

      try {
        console.log("🏢 Calling tenantService.getTenantById...");
        tenantData = await tenantService.getTenantById(tenant_id);
        console.log("✅ Tenant data fetched from API:", tenantData);
      } catch (apiError: unknown) {
        console.error("❌ API call failed, using fallback:");

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

      console.log("🏢 Setting tenant data in store:", tenantData);
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

      console.log("🔄 Using final fallback tenant");
      set({ tenant: fallbackTenant });
    } finally {
      console.log("📋 fetchTenantData completed");
      set({ isLoading: false, isInitialized: true });
    }
  },

  fetchUserRoles: async (rolesIds: string[]) => {
    try {
      console.log("🔄 fetchUserRoles called with IDs:", rolesIds);
      console.log("🔄 Number of role IDs:", rolesIds.length);
      console.log("🔄 First few role IDs:", rolesIds.slice(0, 5));

      // Add debug for the API call
      console.log("🌐 Making API call to roles service...");
      const roles = await rolesService.getRolesByIds(rolesIds);

      console.log("✅ Roles fetched successfully:", roles);
      console.log("✅ Number of roles returned:", roles.length);

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
      /*     console.error("❌ Error details:", {
      message: error.message,
      stack: error.stack
    }); */
      set({ roles: [], rolesLoaded: true });
    }
  },

  hasPermission: (permissionCode: string): boolean => {
    const { roles } = get();
    return roles.some((role) => role.codigo === permissionCode);
  },

  initializeAuth: async () => {
    console.log("🔄 initializeAuth started");
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    console.log("🔍 Storage check - Token:", !!token, "User:", !!userData);

    if (!token || !userData) {
      console.log("❌ No token or user data in storage");
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

      const user = JSON.parse(userData) as AuthUser;
      console.log("👤 User parsed from storage:", user);
      console.log("🏢 User tenant_id:", user.tenant_id);

      set({ user, isLoading: true, rolesLoaded: false });

      // FIX: Check if tenant_id exists (not just truthy)
      if (user.tenant_id) {
        console.log("📋 Starting tenant and roles fetch...");
        await get().fetchTenantData(user.tenant_id);
        if (user.permissions && user.permissions.length > 0) {
          console.log("🔐 Fetching user roles...");
          await get().fetchUserRoles(user.permissions);
        } else {
          console.log("ℹ️ No permissions to fetch");
          set({ rolesLoaded: true });
        }
      } else {
        console.log("❌ No tenant ID found in user object");
        set({ isLoading: false, isInitialized: true, rolesLoaded: true });
      }

      console.log("✅ Auth initialization completed");
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
