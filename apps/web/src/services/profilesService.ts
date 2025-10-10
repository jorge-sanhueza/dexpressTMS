import { useAuthStore } from "../store/authStore";
import type { Profile, ProfileWithRoles } from "../types/auth";
import { API_BASE } from "./apiConfig";
import { cacheService } from "./cacheService";

export interface CreateProfileDto {
  nombre: string;
  descripcion?: string;
  tipo: string;
  contacto?: string;
  rut?: string;
}

export interface UpdateProfileDto {
  nombre?: string;
  descripcion?: string;
  tipo?: string;
  contacto?: string;
  rut?: string;
  activo?: boolean;
}

export interface ProfileType {
  id: string;
  tipoPerfil: string;
}

export interface AvailableRole {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  tipo_accion: string;
  asignado: boolean;
}

class ProfilesService {
  private baseUrl = `${API_BASE}/api/profiles`;
  private readonly CACHE_PREFIX = "profiles-";
  private readonly CACHE_KEYS = {
    ALL_PROFILES: (tenantId: string) => `profiles:all:${tenantId}`,
    PROFILE_DETAIL: (profileId: string) => `profiles:detail:${profileId}`,
    PROFILE_ROLES: (profileId: string) => `profiles:roles:${profileId}`,
  };

  private getCurrentTenantId(): string {
    const { tenant } = useAuthStore.getState();
    if (!tenant) {
      throw new Error("No tenant found in auth store");
    }
    return tenant.id;
  }

  private clearProfilesCache(): void {
    const tenantId = this.getCurrentTenantId();
    cacheService.delete(this.CACHE_KEYS.ALL_PROFILES(tenantId));
    cacheService.clearByPrefix("profiles:detail:");
    cacheService.clearByPrefix("profiles:roles:");
    cacheService.clearByPrefix("profiles:");
  }

  async getProfileTypes(): Promise<ProfileType[]> {
    try {
      const cacheKey = `profile-types:${this.getCurrentTenantId()}`;
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log("📦 Returning profile types from cache");
        return cached;
      }

      const token = localStorage.getItem("access_token");
      const url = `${this.baseUrl}/types`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 Response status:", response.status, response.statusText);

      if (!response.ok) {
        let errorDetails = response.statusText;
        try {
          const errorBody = await response.text();
          console.log("❌ Error response body:", errorBody);
          errorDetails = errorBody || response.statusText;
        } catch (e) {
          console.log("❌ Could not read error response body");
        }
        throw new Error(
          `Failed to fetch profile types: ${response.status} ${errorDetails}`
        );
      }

      const types = await response.json();

      cacheService.set(cacheKey, types);

      return types;
    } catch (error) {
      console.error("Error fetching profile types:", error);
      throw error;
    }
  }

  async getProfiles(): Promise<Profile[]> {
    try {
      const tenantId = this.getCurrentTenantId();
      const cacheKey = this.CACHE_KEYS.ALL_PROFILES(tenantId);

      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log("📦 Returning profiles from cache");
        return cached;
      }

      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profiles: ${response.statusText}`);
      }

      const profiles = await response.json();

      cacheService.set(cacheKey, profiles);

      return profiles;
    } catch (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }
  }

  async getProfileWithRoles(profileId: string): Promise<ProfileWithRoles> {
    try {
      const cacheKey = this.CACHE_KEYS.PROFILE_DETAIL(profileId);

      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log("📦 Returning profile with roles from cache");
        return cached;
      }

      const token = localStorage.getItem("access_token");
      console.log(
        `🔍 Fetching profile with roles: ${this.baseUrl}/${profileId}`
      );

      const response = await fetch(`${this.baseUrl}/${profileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const profile = await response.json();

      cacheService.set(cacheKey, profile);

      return profile;
    } catch (error) {
      console.error("Error fetching profile with roles:", error);
      throw error;
    }
  }

  async createProfile(profileData: any): Promise<Profile> {
    try {
      const tenantId = this.getCurrentTenantId();
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...profileData,
          tenantId: tenantId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create profile: ${response.statusText}`);
      }

      const newProfile = await response.json();

      this.clearProfilesCache();

      return newProfile;
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  }

  async updateProfile(
    id: string,
    profileData: UpdateProfileDto
  ): Promise<Profile> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      const updatedProfile = await response.json();
      this.clearProfilesCache();
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  async deactivateProfile(id: string): Promise<void> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to deactivate profile: ${response.statusText}`);
      }

      this.clearProfilesCache();
      console.log("🗑️ Cleared profile types cache after deactivating profile");
    } catch (error) {
      console.error("Error deactivating profile:", error);
      throw error;
    }
  }

  async getProfileById(id: string): Promise<Profile> {
    const cacheKey = `${this.CACHE_PREFIX}${id}`;

    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log("📦 Serving profile from cache");
      return cached;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const profile = await response.json();

      const transformedProfile = {
        ...profile,
        roles: [],
      };

      cacheService.set(cacheKey, transformedProfile);
      return transformedProfile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  }

  async getAvailableRoles(profileId: string): Promise<AvailableRole[]> {
    try {
      const cacheKey = `profiles:available_roles:${profileId}`;

      // Try cache first
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log("📦 Returning available roles from cache");
        return cached;
      }

      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${this.baseUrl}/${profileId}/available-roles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch available roles: ${response.statusText}`
        );
      }

      const roles = await response.json();
      cacheService.set(cacheKey, roles);
      console.log("💾 Cached available roles");

      return roles;
    } catch (error) {
      console.error("Error fetching available roles:", error);
      throw error;
    }
  }

  async assignRolesToProfile(
    profileId: string,
    roleIds: string[]
  ): Promise<{ message: string }> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/${profileId}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roleIds }),
      });

      if (!response.ok) {
        throw new Error(`Failed to assign roles: ${response.statusText}`);
      }

      const result = await response.json();

      this.clearProfilesCache();
      cacheService.delete(`profiles:available_roles:${profileId}`);
      console.log("🗑️ Cleared profiles cache after assigning roles");

      return result;
    } catch (error) {
      console.error("Error assigning roles to profile:", error);
      throw error;
    }
  }
}

export const profilesService = new ProfilesService();
