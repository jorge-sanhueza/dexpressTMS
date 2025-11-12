import { apiClient } from "../lib/api-client";
import type { Profile, ProfileType, ProfileWithRoles } from "../types/profile";
import { API_BASE } from "./apiConfig";

export interface CreateProfileDto {
  nombre: string;
  descripcion?: string;
  contacto?: string;
  rut?: string;
}

export interface UpdateProfileDto {
  nombre?: string;
  descripcion?: string;
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

export interface ProfilesFilter {
  search?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface ProfilesResponse {
  profiles: Profile[];
  total: number;
  page: number;
  limit: number;
}

class ProfilesService {
  private baseUrl = `${API_BASE}/api/profiles`;

  async getProfileTypes(): Promise<ProfileType[]> {
    const response = await apiClient.get(`${this.baseUrl}/types`);

    if (!response.ok) {
      throw new Error(`Failed to fetch profile types: ${response.statusText}`);
    }

    return await response.json();
  }

  async getProfiles(filter: ProfilesFilter = {}): Promise<ProfilesResponse> {
    try {
      const token = localStorage.getItem("access_token");
      const queryParams = new URLSearchParams();

      if (filter.search) queryParams.append("search", filter.search);
      if (filter.activo !== undefined)
        queryParams.append("activo", filter.activo.toString());
      if (filter.page) queryParams.append("page", filter.page.toString());
      if (filter.limit) queryParams.append("limit", filter.limit.toString());

      const url = `${this.baseUrl}?${queryParams.toString()}`;

      const response = await fetch(url, {
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

  async getProfileWithRoles(profileId: string): Promise<ProfileWithRoles> {
    const response = await apiClient.get(`${this.baseUrl}/${profileId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    return await response.json();
  }

  async createProfile(profileData: CreateProfileDto): Promise<Profile> {
    const response = await apiClient.post(this.baseUrl, profileData);

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
