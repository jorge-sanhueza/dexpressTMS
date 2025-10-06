import type {
  User,
  UsersResponse,
  UsersFilter,
  Profile,
  CreateUserData,
} from "../types/user";
import { API_BASE } from "./apiConfig";
import { cacheService } from "./cacheService";

class UsersService {
  private baseUrl = `${API_BASE}/api/users`;

  async getUsers(filter: UsersFilter = {}): Promise<UsersResponse> {
    const cacheKey = `users-${JSON.stringify(filter)}`;

    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log("serving users from cache");
      return cached;
    }

    try {
      const token = localStorage.getItem("access_token");
      const queryParams = new URLSearchParams();

      // Add filter parameters
      if (filter.search) queryParams.append("search", filter.search);
      if (filter.activo !== undefined)
        queryParams.append("activo", filter.activo.toString());
      if (filter.perfilId) queryParams.append("perfilId", filter.perfilId);
      if (filter.page) queryParams.append("page", filter.page.toString());
      if (filter.limit) queryParams.append("limit", filter.limit.toString());

      const url = `${this.baseUrl}?${queryParams.toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();

      cacheService.set(cacheKey, data);

      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  private invalidateUsersCache(): void {
    // Clear all users-related cache
    const keys = Array.from(cacheService["cache"].keys());
    keys.forEach((key) => {
      if (key.startsWith("users-")) {
        cacheService.delete(key);
      }
    });
  }

  async deactivateUser(id: string): Promise<void> {
    await this.makeRequest(`${this.baseUrl}/${id}`, "DELETE");
    this.invalidateUsersCache();
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const newUser = await this.makeRequest(this.baseUrl, "POST", userData);
    this.invalidateUsersCache();
    return newUser;
  }

  async getProfiles(): Promise<Profile[]> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE}/api/profiles`, {
        // Fix this URL too
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profiles: ${response.statusText}`);
      }

      const profiles = await response.json();

      // Transform to match our Profile interface
      return profiles.map((profile: any) => ({
        id: profile.id, // This is now the actual UUID from database
        nombre: profile.nombre,
        tipo: profile.tipo ? { tipoPerfil: profile.tipo } : undefined,
      }));
    } catch (error) {
      console.error("Error fetching profiles:", error);

      // Fallback - we should never get here if the endpoint is working
      return [
        { id: "fallback-1", nombre: "Administrativo" },
        { id: "fallback-2", nombre: "Usuario Estándar" },
        { id: "fallback-3", nombre: "Operativo" },
      ];
    }
  }

  private async makeRequest(
    url: string,
    method: string,
    data?: any
  ): Promise<any> {
    const token = localStorage.getItem("access_token");
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Request failed: ${response.statusText}`
      );
    }

    return response.json();
  }
}

export const usersService = new UsersService();
