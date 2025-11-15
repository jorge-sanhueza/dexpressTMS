import type {
  CreateDireccionDto,
  UpdateDireccionDto,
  Direccion,
  DireccionesFilter,
  DireccionesResponse,
} from "../types/direccion";
import { API_BASE } from "./apiConfig";
import { apiClient } from "../lib/api-client";

class DireccionesService {
  private baseUrl = `${API_BASE}/api/direcciones`;

  private async handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getDirecciones(
    filter: DireccionesFilter = {}
  ): Promise<DireccionesResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filter.search) queryParams.append("search", filter.search);
      if (filter.activo !== undefined)
        queryParams.append("activo", filter.activo.toString());
      if (filter.comunaId) queryParams.append("comunaId", filter.comunaId);
      if (filter.esPrincipal !== undefined)
        queryParams.append("esPrincipal", filter.esPrincipal.toString());
      if (filter.origen) queryParams.append("origen", filter.origen);
      if (filter.page) queryParams.append("page", filter.page.toString());
      if (filter.limit) queryParams.append("limit", filter.limit.toString());

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      const response = await apiClient.get(url);
      return this.handleApiResponse<DireccionesResponse>(response);
    } catch (error) {
      console.error("Error fetching direcciones:", error);
      throw error;
    }
  }

  async getDireccionById(id: string): Promise<Direccion> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return this.handleApiResponse<Direccion>(response);
    } catch (error) {
      console.error("Error fetching direccion:", error);
      throw error;
    }
  }

  async createDireccion(direccionData: CreateDireccionDto): Promise<Direccion> {
    try {
      const response = await apiClient.post(this.baseUrl, direccionData);
      return this.handleApiResponse<Direccion>(response);
    } catch (error) {
      console.error("Error creating direccion:", error);
      throw error;
    }
  }

  async updateDireccion(
    id: string,
    direccionData: UpdateDireccionDto
  ): Promise<Direccion> {
    try {
      const response = await apiClient.put(
        `${this.baseUrl}/${id}`,
        direccionData
      );
      return this.handleApiResponse<Direccion>(response);
    } catch (error) {
      console.error("Error updating direccion:", error);
      throw error;
    }
  }

  async deleteDireccion(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return this.handleApiResponse<void>(response);
    } catch (error) {
      console.error("Error deleting direccion:", error);
      throw error;
    }
  }

  async getDireccionesByComuna(comunaId: string): Promise<Direccion[]> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/comuna/${comunaId}`
      );
      return this.handleApiResponse<Direccion[]>(response);
    } catch (error) {
      console.error("Error fetching direcciones by comuna:", error);
      throw error;
    }
  }

  async getActivePrincipales(): Promise<Direccion[]> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/principales/activas`
      );
      return this.handleApiResponse<Direccion[]>(response);
    } catch (error) {
      console.error("Error fetching active principales direcciones:", error);
      throw error;
    }
  }

  async incrementFrequency(id: string): Promise<void> {
    try {
      // Note: This would need a separate endpoint in your backend
      // For now, we'll handle frequency updates during usage
      await this.updateDireccion(id, {
        frecuencia: { increment: 1 } as any, // This will be handled by the update
      });
    } catch (error) {
      console.error("Error incrementing frequency:", error);
      throw error;
    }
  }
}

export const direccionesService = new DireccionesService();
