import type {
  Client,
  CreateClientData,
  UpdateClientData,
  ClientsFilter,
} from "../types/client";
import { API_BASE } from "./apiConfig";

class ClientsService {
  private baseUrl = `${API_BASE}/api/clients`;

  async getClients(
    filter: ClientsFilter = {}
  ): Promise<{ clients: Client[]; total: number }> {
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
        throw new Error(`Failed to fetch clients: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  }

  async deactivateClient(id: string): Promise<void> {
    await this.makeRequest(`${this.baseUrl}/${id}`, "DELETE");
  }

  async activateClient(id: string): Promise<Client> {
    return await this.makeRequest(`${this.baseUrl}/${id}`, "PUT", {
      activo: true,
    });
  }

  async createClient(clientData: CreateClientData): Promise<Client> {
    return await this.makeRequest(this.baseUrl, "POST", clientData);
  }

  async updateClient(
    id: string,
    clientData: UpdateClientData
  ): Promise<Client> {
    return await this.makeRequest(`${this.baseUrl}/${id}`, "PUT", clientData);
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
