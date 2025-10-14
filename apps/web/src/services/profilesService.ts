import { apiClient } from "../lib/api-client";
import { useAuthStore } from "../store/authStore";
import type { Profile, ProfileType, ProfileWithRoles } from "../types/profile";
import { API_BASE } from "./apiConfig";

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

  private getCurrentTenantId(): string {
    const { tenant } = useAuthStore.getState();
    if (!tenant) {
      throw new Error("No tenant found in auth store");
    }
    return tenant.id;
  }

  async getProfileTypes(): Promise<ProfileType[]> {
    const response = await apiClient.get(`${this.baseUrl}/types`);

    if (!response.ok) {
      throw new Error(`Failed to fetch profile types: ${response.statusText}`);
    }

    return await response.json();
  }

  async getProfiles(): Promise<Profile[]> {
    const response = await apiClient.get(this.baseUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch profiles: ${response.statusText}`);
    }

    return await response.json();
  }

  async getProfileWithRoles(profileId: string): Promise<ProfileWithRoles> {
    const response = await apiClient.get(`${this.baseUrl}/${profileId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    return await response.json();
  }

  async createProfile(profileData: CreateProfileDto): Promise<Profile> {
    const tenantId = this.getCurrentTenantId();
    const response = await apiClient.post(this.baseUrl, {
      ...profileData,
      tenantId: tenantId,
    });

    if (!response.ok) {
      throw new Error(`Failed to create profile: ${response.statusText}`);
    }

    return await response.json();
  }

  async updateProfile(
    id: string,
    profileData: UpdateProfileDto
  ): Promise<Profile> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, profileData);

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.statusText}`);
    }

    return await response.json();
  }

  async deactivateProfile(id: string): Promise<void> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to deactivate profile: ${response.statusText}`);
    }
  }

  async getProfileById(id: string): Promise<Profile> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const profile = await response.json();

    return {
      ...profile,
      roles: [],
    };
  }

  async getAvailableRoles(profileId: string): Promise<AvailableRole[]> {
    const response = await apiClient.get(
      `${this.baseUrl}/${profileId}/available-roles`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch available roles: ${response.statusText}`
      );
    }

    return await response.json();
  }

  async assignRolesToProfile(
    profileId: string,
    roleIds: string[]
  ): Promise<{ message: string }> {
    const response = await apiClient.post(
      `${this.baseUrl}/${profileId}/roles`,
      { roleIds }
    );

    if (!response.ok) {
      throw new Error(`Failed to assign roles: ${response.statusText}`);
    }

    return await response.json();
  }
}

export const profilesService = new ProfilesService();
