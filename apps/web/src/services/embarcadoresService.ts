import type {
  CreateEmbarcadorDto,
  Embarcador,
  EmbarcadoresFilter,
  EmbarcadoresResponse,
  UpdateEmbarcadorDto,
} from "@/types/shipper";
import { apiClient } from "../lib/api-client";
import { API_BASE } from "./apiConfig";

class EmbarcadoresService {
  private baseUrl = `${API_BASE}/api/embarcadores`;

  private async handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getEmbarcadores(
    filter: EmbarcadoresFilter = {}
  ): Promise<EmbarcadoresResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filter.search) queryParams.append("search", filter.search);
      if (filter.activo !== undefined)
        queryParams.append("activo", filter.activo.toString());
      if (filter.tipo) queryParams.append("tipo", filter.tipo);
      if (filter.page) queryParams.append("page", filter.page.toString());
      if (filter.limit) queryParams.append("limit", filter.limit.toString());

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      const response = await apiClient.get(url);
      return this.handleApiResponse<EmbarcadoresResponse>(response);
    } catch (error) {
      console.error("Error fetching embarcadores:", error);
      throw error;
    }
  }

  async getEmbarcadorById(id: string): Promise<Embarcador> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return this.handleApiResponse<Embarcador>(response);
    } catch (error) {
      console.error("Error fetching embarcador:", error);
      throw error;
    }
  }

  async createEmbarcador(
    embarcadorData: CreateEmbarcadorDto
  ): Promise<Embarcador> {
    try {
      const response = await apiClient.post(this.baseUrl, embarcadorData);
      return this.handleApiResponse<Embarcador>(response);
    } catch (error) {
      console.error("Error creating embarcador:", error);
      throw error;
    }
  }

  async updateEmbarcador(
    id: string,
    embarcadorData: UpdateEmbarcadorDto
  ): Promise<Embarcador> {
    try {
      const response = await apiClient.put(
        `${this.baseUrl}/${id}`,
        embarcadorData
      );

      return this.handleApiResponse<Embarcador>(response);
    } catch (error) {
      console.error("Error updating embarcador:", error);
      throw error;
    }
  }

  async deleteEmbarcador(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return this.handleApiResponse<void>(response);
    } catch (error) {
      console.error("Error deleting embarcador:", error);
      throw error;
    }
  }
}

export const embarcadoresService = new EmbarcadoresService();
