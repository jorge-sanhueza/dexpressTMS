// services/tipoServicioService.ts
import { apiClient } from "@/lib/api-client";
import { API_BASE } from "./apiConfig";

export interface TipoServicio {
  id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
  orden: number;
  visible: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TiposServicioResponse {
  tiposServicio: TipoServicio[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TiposServicioFilter {
  search?: string;
  activo?: boolean;
  visible?: boolean;
  page?: number;
  limit?: number;
}

class TipoServicioService {
  private baseUrl = `${API_BASE}/api/tipo-servicio`;

  private async handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getTiposServicio(
    filter: TiposServicioFilter = {}
  ): Promise<TiposServicioResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filter.search) queryParams.append("search", filter.search);
      if (filter.activo !== undefined)
        queryParams.append("activo", filter.activo.toString());
      if (filter.visible !== undefined)
        queryParams.append("visible", filter.visible.toString());
      if (filter.page) queryParams.append("page", filter.page.toString());
      if (filter.limit) queryParams.append("limit", filter.limit.toString());

      const response = await apiClient.get(
        `${this.baseUrl}?${queryParams.toString()}`
      );
      return this.handleApiResponse<TiposServicioResponse>(response);
    } catch (error) {
      console.error("Error fetching tipos de servicio:", error);
      throw error;
    }
  }

  async getTipoServicioById(id: string): Promise<TipoServicio> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return this.handleApiResponse<TipoServicio>(response);
    } catch (error) {
      console.error("Error fetching tipo de servicio:", error);
      throw error;
    }
  }

  async getTipoServicioByCodigo(codigo: string): Promise<TipoServicio> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/codigo/${codigo}`);
      return this.handleApiResponse<TipoServicio>(response);
    } catch (error) {
      console.error("Error fetching tipo de servicio by codigo:", error);
      throw error;
    }
  }

  async createTipoServicio(tipoServicioData: {
    nombre: string;
    codigo: string;
    descripcion?: string;
    orden?: number;
    activo?: boolean;
    visible?: boolean;
  }): Promise<TipoServicio> {
    try {
      const response = await apiClient.post(this.baseUrl, tipoServicioData);
      return this.handleApiResponse<TipoServicio>(response);
    } catch (error) {
      console.error("Error creating tipo de servicio:", error);
      throw error;
    }
  }

  async updateTipoServicio(
    id: string,
    tipoServicioData: {
      nombre?: string;
      codigo?: string;
      descripcion?: string;
      orden?: number;
      activo?: boolean;
      visible?: boolean;
    }
  ): Promise<TipoServicio> {
    try {
      const response = await apiClient.put(
        `${this.baseUrl}/${id}`,
        tipoServicioData
      );
      return this.handleApiResponse<TipoServicio>(response);
    } catch (error) {
      console.error("Error updating tipo de servicio:", error);
      throw error;
    }
  }

  async deleteTipoServicio(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return this.handleApiResponse<void>(response);
    } catch (error) {
      console.error("Error deleting tipo de servicio:", error);
      throw error;
    }
  }

  async deactivateTipoServicio(id: string): Promise<TipoServicio> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}/deactivate`);
      return this.handleApiResponse<TipoServicio>(response);
    } catch (error) {
      console.error("Error deactivating tipo de servicio:", error);
      throw error;
    }
  }
}

export const tipoServicioService = new TipoServicioService();
