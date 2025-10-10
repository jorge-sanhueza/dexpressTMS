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

class ProfilesService {
  private baseUrl = `${API_BASE}/api/profiles`;
  private readonly CACHE_PREFIX = "profiles-";

  private getCurrentTenantId(): string {
    const { tenant } = useAuthStore.getState();
    if (!tenant) {
      throw new Error("No tenant found in auth store");
    }
    return tenant.id;
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

      console.log("🔍 Fetching profile types from:", url);
      console.log("🔑 Token exists:", !!token);

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
      console.log("✅ Profile types received:", types);

      // Cache the result
      cacheService.set(cacheKey, types);
      console.log("💾 Cached profile types");

      return types;
    } catch (error) {
      console.error("Error fetching profile types:", error);
      throw error;
    }
  }

  private clearProfileTypesCache(): void {
    const cacheKey = `profile-types:${this.getCurrentTenantId()}`;
    cacheService.delete(cacheKey);
  }

  async getProfiles(): Promise<Profile[]> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch profiles: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }
  }

  // In profilesService.ts
  async getProfileWithRoles(profileId: string): Promise<ProfileWithRoles> {
    try {
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
      console.log("✅ Profile with roles received:", profile);
      return profile;
    } catch (error) {
      console.error("Error fetching profile with roles:", error);
      throw error;
    }
  }

  async createProfile(profileData: CreateProfileDto): Promise<Profile> {
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
      this.clearProfileTypesCache();
      console.log("🗑️ Cleared profile types cache after creating profile");

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
      this.clearProfileTypesCache();
      console.log("🗑️ Cleared profile types cache after updating profile");

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

      this.clearProfileTypesCache();
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
}

export const profilesService = new ProfilesService();
