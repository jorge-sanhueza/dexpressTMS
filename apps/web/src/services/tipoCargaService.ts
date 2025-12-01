import { apiClient } from "@/lib/api-client";
import { API_BASE } from "./apiConfig";

export interface TipoCarga {
  id: string;
  nombre: string;
  observaciones?: string;
  activo: boolean;
  requiereEquipoEspecial: boolean;
  requiereTempControlada: boolean;
  orden: number;
  visible: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TiposCargaResponse {
  tiposCarga: TipoCarga[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TiposCargaFilter {
  search?: string;
  activo?: boolean;
  visible?: boolean;
  page?: number;
  limit?: number;
}

const appendParam = (
  params: URLSearchParams,
  key: string,
  value: any
): void => {
  if (value !== undefined) {
    params.append(key, String(value));
  }
};

class TipoCargaService {
  private baseUrl = `${API_BASE}/api/tipo-carga`;

  // Unified response handler – works for JSON and 204 No Content
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let message = response.statusText;
      try {
        const errorBody = await response.json();
        message = errorBody.message || message;
      } catch {
        // ignore if no JSON
      }
      throw new Error(message);
    }

    // DELETE often returns 204 No Content → no body
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  private buildQueryParams(filter: TiposCargaFilter): string {
    const params = new URLSearchParams();

    appendParam(params, "search", filter.search);
    appendParam(params, "activo", filter.activo);
    appendParam(params, "visible", filter.visible);
    appendParam(params, "page", filter.page);
    appendParam(params, "limit", filter.limit);

    return params.toString();
  }

  async getTiposCarga(
    filter: TiposCargaFilter = {}
  ): Promise<TiposCargaResponse> {
    const query = this.buildQueryParams(filter);
    const response = await apiClient.get(
      `${this.baseUrl}${query ? `?${query}` : ""}`
    );
    return this.handleResponse<TiposCargaResponse>(response);
  }

  async getTipoCargaById(id: string): Promise<TipoCarga> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return this.handleResponse<TipoCarga>(response);
  }

  async createTipoCarga(data: {
    nombre: string;
    observaciones?: string;
    requiereEquipoEspecial?: boolean;
    requiereTempControlada?: boolean;
    orden?: number;
    activo?: boolean;
    visible?: boolean;
  }): Promise<TipoCarga> {
    const response = await apiClient.post(this.baseUrl, data);
    return this.handleResponse<TipoCarga>(response);
  }

  async updateTipoCarga(
    id: string,
    data: Partial<
      Pick<
        TipoCarga,
        | "nombre"
        | "observaciones"
        | "requiereEquipoEspecial"
        | "requiereTempControlada"
        | "orden"
        | "activo"
        | "visible"
      >
    >
  ): Promise<TipoCarga> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return this.handleResponse<TipoCarga>(response);
  }

  async deleteTipoCarga(id: string): Promise<void> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    await this.handleResponse<void>(response); // now safe for 204
  }

  async deactivateTipoCarga(id: string): Promise<TipoCarga> {
    const response = await apiClient.put(`${this.baseUrl}/${id}/deactivate`);
    return this.handleResponse<TipoCarga>(response);
  }
}

export const tipoCargaService = new TipoCargaService();
