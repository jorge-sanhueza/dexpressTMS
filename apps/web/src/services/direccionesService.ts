import type {
  CreateDireccionDto,
  UpdateDireccionDto,
  Direccion,
  DireccionesFilter,
  DireccionesResponse,
  GeocodingResponse,
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
      // Set default values
      const dataWithDefaults = {
        ...direccionData,
        frecuencia: direccionData.frecuencia || 1,
        origen: direccionData.origen || "MANUAL",
      };

      const response = await apiClient.post(this.baseUrl, dataWithDefaults);
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
      await this.updateDireccion(id, {
        frecuencia: { increment: 1 } as any,
      });
    } catch (error) {
      console.error("Error incrementing frequency:", error);
      throw error;
    }
  }

  // New method to geocode an address
  async geocodeAddress(
    direccionTexto: string,
    comunaId?: string
  ): Promise<GeocodingResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("direccion", direccionTexto);
      if (comunaId) queryParams.append("comunaId", comunaId);

      const response = await apiClient.get(
        `${this.baseUrl}/geocode?${queryParams.toString()}`
      );
      return this.handleApiResponse<GeocodingResponse>(response);
    } catch (error) {
      console.error("Error geocoding address:", error);
      throw error;
    }
  }

  // New method to reverse geocode coordinates
  async reverseGeocode(
    latitud: number,
    longitud: number
  ): Promise<GeocodingResponse> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/reverse-geocode?latitud=${latitud}&longitud=${longitud}`
      );
      return this.handleApiResponse<GeocodingResponse>(response);
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      throw error;
    }
  }

  async getCoordinatesFromAddress(
    address: string,
    comunaId?: string
  ): Promise<{ latitud: number; longitud: number; address?: string }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("address", address);
      if (comunaId) queryParams.append("comunaId", comunaId);

      // This would call your backend which integrates with Google Maps API
      const response = await apiClient.get(
        `${this.baseUrl}/geocode?${queryParams}`
      );
      return this.handleApiResponse<{
        latitud: number;
        longitud: number;
        address?: string;
      }>(response);
    } catch (error) {
      console.error("Error getting coordinates:", error);
      throw error;
    }
  }

  async validateCoordinates(
    latitud: number,
    longitud: number
  ): Promise<boolean> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/validate-coordinates?latitud=${latitud}&longitud=${longitud}`
      );
      const result = await this.handleApiResponse<{
        valid: boolean;
        address?: string;
      }>(response);
      return result.valid;
    } catch (error) {
      console.error("Error validating coordinates:", error);
      return false;
    }
  }
}

export const direccionesService = new DireccionesService();
