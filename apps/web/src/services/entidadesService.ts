// services/entidadesService.ts
import { apiClient } from "@/lib/api-client";
import { API_BASE } from "./apiConfig";

export interface Entidad {
  id: string;
  nombre: string;
  rut: string;
  tipoEntidad: string;
  activo: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntidadesResponse {
  entidades: Entidad[];
  total: number;
  page: number;
  limit: number;
}

class EntidadesService {
  private baseUrl = `${API_BASE}/api/entidades`;

  async getEntidades(
    filter: {
      search?: string;
      activo?: boolean;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<EntidadesResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filter.search) queryParams.append("search", filter.search);
      if (filter.activo !== undefined)
        queryParams.append("activo", filter.activo.toString());
      if (filter.page) queryParams.append("page", filter.page.toString());
      if (filter.limit) queryParams.append("limit", filter.limit.toString());

      const response = await apiClient.get(
        `${this.baseUrl}?${queryParams.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `API error: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching entidades:", error);
      throw error;
    }
  }

  async getEntidadById(id: string): Promise<Entidad> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }

    return await response.json();
  }
}

export const entidadesService = new EntidadesService();
