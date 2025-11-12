import { apiClient } from "@/lib/api-client";
import type {
  Client,
  CreateClientData,
  UpdateClientData,
  ClientsFilter,
} from "../types/client";
import { API_BASE } from "./apiConfig";

class ClientsService {
  private baseUrl = `${API_BASE}/api/clients`;

  private formatRut(rut: string): string {
    return rut.replace(/\./g, "");
  }

  private async handleApiCall<T>(apiCall: () => Promise<Response>): Promise<T> {
    try {
      const response = await apiCall();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `API error: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }

  async getClients(
    filter: ClientsFilter = {}
  ): Promise<{ clients: Client[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();

      if (filter.search) queryParams.append("search", filter.search);
      if (filter.activo !== undefined)
        queryParams.append("activo", filter.activo.toString());
      if (filter.page) queryParams.append("page", filter.page.toString());
      if (filter.limit) queryParams.append("limit", filter.limit.toString());
      return this.handleApiCall<{ clients: Client[]; total: number }>(() =>
        apiClient.get(`${this.baseUrl}?${queryParams.toString()}`)
      );
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  }

  async getClientById(id: string): Promise<Client> {
    return this.handleApiCall<Client>(() =>
      apiClient.get(`${this.baseUrl}/${id}`)
    );
  }

  async deactivateClient(id: string): Promise<void> {
    return this.handleApiCall<void>(() =>
      apiClient.delete(`${this.baseUrl}/${id}`)
    );
  }

  async activateClient(id: string): Promise<Client> {
    return this.handleApiCall<Client>(() =>
      apiClient.put(`${this.baseUrl}/${id}`, {
        activo: true,
      })
    );
  }

  async createClient(clientData: CreateClientData): Promise<Client> {
    const formattedData = {
      ...clientData,
      rut: this.formatRut(clientData.rut),
    };

    return this.handleApiCall<Client>(() =>
      apiClient.post(this.baseUrl, formattedData)
    );
  }

  async updateClient(
    id: string,
    clientData: UpdateClientData
  ): Promise<Client> {
    const formattedData = {
      ...clientData,
      ...(clientData.rut && { rut: this.formatRut(clientData.rut) }),
    };

    return this.handleApiCall<Client>(() =>
      apiClient.put(`${this.baseUrl}/${id}`, formattedData)
    );
  }
}

export const clientsService = new ClientsService();
