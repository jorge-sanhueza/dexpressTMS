import { apiClient } from "../lib/api-client";
import type { Profile } from "../types/profile";
import type {
  User,
  UsersResponse,
  UsersFilter,
  CreateUserData,
  UpdateUserData,
} from "../types/user";
import { API_BASE } from "./apiConfig";

class UsersService {
  private baseUrl = `${API_BASE}/api/users`;

  async getUsers(filter: UsersFilter = {}): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();

    // filter parameters
    if (filter.search) queryParams.append("search", filter.search);
    if (filter.activo !== undefined)
      queryParams.append("activo", filter.activo.toString());
    if (filter.perfilId) queryParams.append("perfilId", filter.perfilId);
    if (filter.page) queryParams.append("page", filter.page.toString());
    if (filter.limit) queryParams.append("limit", filter.limit.toString());

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    const response = await apiClient.get(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return await response.json();
  }

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return await response.json();
  }

  async deactivateUser(id: string): Promise<void> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to deactivate user: ${response.statusText}`
      );
    }
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const response = await apiClient.post(this.baseUrl, userData);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to create user: ${response.statusText}`
      );
    }

    return await response.json();
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, userData);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Failed to update user: ${response.statusText}`
      );
    }

    return await response.json();
  }

  async getProfiles(filters?: {
    search?: string;
    activo?: boolean;
    limit?: number;
  }): Promise<Profile[]> {
    const queryParams = new URLSearchParams();

    if (filters?.search) queryParams.append("search", filters.search);
    if (filters?.activo !== undefined)
      queryParams.append("activo", filters.activo.toString());
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());

    const response = await apiClient.get(
      `${API_BASE}/api/profiles?${queryParams}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch profiles: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.profiles || !Array.isArray(data.profiles)) {
      console.warn("Unexpected profiles API response structure:", data);
      return [];
    }

    return data.profiles.map((profile: any) => ({
      id: profile.id,
      nombre: profile.nombre,
      tipo: profile.tipo,
      descripcion: profile.descripcion,
      activo: profile.activo,
    }));
  }
}

export const usersService = new UsersService();
