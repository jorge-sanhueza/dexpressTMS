import { API_BASE } from "./apiConfig";
import { cacheService } from "./cacheService";

export interface Profile {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  activo: boolean;
  roles: string[];
}

class ProfilesService {
  private baseUrl = `${API_BASE}/api/profiles`;
  private readonly CACHE_PREFIX = "profiles-";

  private invalidateProfilesCache(): void {
    cacheService.clearByPrefix(this.CACHE_PREFIX);
    console.log("🗑️ Profiles cache invalidated");
  }

  async getProfiles(): Promise<Profile[]> {
    const cacheKey = `${this.CACHE_PREFIX}all`;

    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log("Serving profiles from cache");
      return cached;
    }
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(this.baseUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profiles: ${response.statusText}`);
      }

      const profiles = await response.json();

      const transformedProfiles = profiles.map((profile: any) => ({
        id: profile.id,
        nombre: profile.nombre,
        descripcion: profile.descripcion || "Sin descripción",
        tipo: profile.tipo || "standard",
        activo: true,
        roles: [],
      }));

      cacheService.set(cacheKey, transformedProfiles);
      return transformedProfiles;
    } catch (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }
  }

  async createProfile(profileData: {
    nombre: string;
    descripcion: string;
    tipo: string;
  }): Promise<Profile> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to create profile: ${response.statusText}`
        );
      }

      const newProfile = await response.json();

      this.invalidateProfilesCache();

      // Ensure the response includes roles
      return {
        ...newProfile,
        roles: [], // Add empty roles array
      };
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  }

  async updateProfile(
    id: string,
    profileData: {
      nombre: string;
      descripcion: string;
      tipo: string;
    }
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
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to update profile: ${response.statusText}`
        );
      }

      const updatedProfile = await response.json();

      this.invalidateProfilesCache();

      return {
        ...updatedProfile,
        roles: [],
      };
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

      // Invalidate profiles cache since we removed a profile
      this.invalidateProfilesCache();
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
