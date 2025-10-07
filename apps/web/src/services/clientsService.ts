import type {
  Client,
  CreateClientData,
  UpdateClientData,
  ClientsFilter,
} from "../types/client";
import { API_BASE } from "./apiConfig";
import { cacheService } from "./cacheService";

class ClientsService {
  private baseUrl = `${API_BASE}/api/clients`;

  async getClients(
    filter: ClientsFilter = {}
  ): Promise<{ clients: Client[]; total: number }> {
    const cacheKey = `clients-${JSON.stringify(filter)}`;

    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log("serving clients from cache");
      return cached;
    }

    try {
      const token = localStorage.getItem("access_token");
      const queryParams = new URLSearchParams();

      // Add filter parameters
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
        throw new Error(`Failed to fetch clients: ${response.statusText}`);
      }

      const data = await response.json();

      cacheService.set(cacheKey, data);

      return data;
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  }

  async getClientById(id: string): Promise<Client> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch client: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching client:", error);
      throw error;
    }
  }

  private invalidateClientsCache(): void {
    // Clear all clients-related cache
    const keys = Array.from(cacheService["cache"].keys());
    keys.forEach((key) => {
      if (key.startsWith("clients-")) {
        cacheService.delete(key);
      }
    });
  }

  async deactivateClient(id: string): Promise<void> {
    await this.makeRequest(`${this.baseUrl}/${id}`, "DELETE");
    this.invalidateClientsCache();
  }

  async activateClient(id: string): Promise<Client> {
    const client = await this.makeRequest(
      `${this.baseUrl}/${id}/activate`,
      "PUT"
    );
    this.invalidateClientsCache();
    return client;
  }

  async createClient(clientData: CreateClientData): Promise<Client> {
    const newClient = await this.makeRequest(this.baseUrl, "POST", clientData);
    this.invalidateClientsCache();
    return newClient;
  }

  async updateClient(
    id: string,
    clientData: UpdateClientData
  ): Promise<Client> {
    const updatedClient = await this.makeRequest(
      `${this.baseUrl}/${id}`,
      "PUT",
      clientData
    );
    this.invalidateClientsCache();
    return updatedClient;
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

export const clientsService = new ClientsService();
