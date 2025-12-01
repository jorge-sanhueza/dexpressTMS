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
  contacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface EntidadesResponse {
  entidades: Entidad[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface EntidadesFilter {
  search?: string;
  activo?: boolean;
  tipoEntidad?: string;
  page?: number;
  limit?: number;
}

class EntidadesService {
  private baseUrl = `${API_BASE}/api/entidades`;

  private async handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getEntidades(filter: EntidadesFilter = {}): Promise<EntidadesResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filter.search) queryParams.append("search", filter.search);
      if (filter.activo !== undefined)
        queryParams.append("activo", filter.activo.toString());
      if (filter.tipoEntidad)
        queryParams.append("tipoEntidad", filter.tipoEntidad);
      if (filter.page) queryParams.append("page", filter.page.toString());
      if (filter.limit) queryParams.append("limit", filter.limit.toString());

      const response = await apiClient.get(
        `${this.baseUrl}?${queryParams.toString()}`
      );

      const data = await this.handleApiResponse<EntidadesResponse>(response);

      // Calculate totalPages if not provided by backend
      if (data.totalPages === undefined) {
        data.totalPages = Math.ceil(data.total / (filter.limit || 10));
      }

      return data;
    } catch (error) {
      console.error("Error fetching entidades:", error);
      throw error;
    }
  }

  async getEntidadById(id: string): Promise<Entidad> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return this.handleApiResponse<Entidad>(response);
    } catch (error) {
      console.error("Error fetching entidad:", error);
      throw error;
    }
  }

  // Add this convenience method for search
  async searchEntidades(
    searchTerm: string,
    tipoEntidad?: string
  ): Promise<Entidad[]> {
    try {
      const filter: EntidadesFilter = {
        search: searchTerm,
        activo: true,
        limit: 50, // Higher limit for search
      };

      if (tipoEntidad) {
        filter.tipoEntidad = tipoEntidad;
      }

      const response = await this.getEntidades(filter);
      return response.entidades;
    } catch (error) {
      console.error("Error searching entidades:", error);
      throw error;
    }
  }
}

export const entidadesService = new EntidadesService();
