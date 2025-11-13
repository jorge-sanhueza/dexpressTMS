import type {
  CreateCarrierDto,
  Carrier,
  CarriersFilter,
  CarriersResponse,
  UpdateCarrierDto,
} from "@/types/carrier";
import { apiClient } from "../lib/api-client";
import { API_BASE } from "./apiConfig";

class CarriersService {
  private baseUrl = `${API_BASE}/api/carriers`;

  private formatRut(rut: string): string {
    return rut.replace(/\./g, "");
  }

  private async handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getCarriers(filter: CarriersFilter = {}): Promise<CarriersResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filter.search) queryParams.append("search", filter.search);
      if (filter.activo !== undefined)
        queryParams.append("activo", filter.activo.toString());
      if (filter.esPersona !== undefined)
        queryParams.append("esPersona", filter.esPersona.toString());
      if (filter.page) queryParams.append("page", filter.page.toString());
      if (filter.limit) queryParams.append("limit", filter.limit.toString());

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      const response = await apiClient.get(url);
      return this.handleApiResponse<CarriersResponse>(response);
    } catch (error) {
      console.error("Error fetching carriers:", error);
      throw error;
    }
  }

  async getCarrierById(id: string): Promise<Carrier> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return this.handleApiResponse<Carrier>(response);
    } catch (error) {
      console.error("Error fetching carrier:", error);
      throw error;
    }
  }

  async createCarrier(carrierData: CreateCarrierDto): Promise<Carrier> {
    try {
      const formattedData = {
        ...carrierData,
        rut: this.formatRut(carrierData.rut),
        esPersona: carrierData.esPersona || false,
      };

      const response = await apiClient.post(this.baseUrl, formattedData);
      return this.handleApiResponse<Carrier>(response);
    } catch (error) {
      console.error("Error creating carrier:", error);
      throw error;
    }
  }

  async updateCarrier(
    id: string,
    carrierData: UpdateCarrierDto
  ): Promise<Carrier> {
    try {
      const formattedData = {
        ...carrierData,
        ...(carrierData.rut && { rut: this.formatRut(carrierData.rut) }),
      };

      const response = await apiClient.put(
        `${this.baseUrl}/${id}`,
        formattedData
      );

      return this.handleApiResponse<Carrier>(response);
    } catch (error) {
      console.error("Error updating carrier:", error);
      throw error;
    }
  }

  async deleteCarrier(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return this.handleApiResponse<void>(response);
    } catch (error) {
      console.error("Error deleting carrier:", error);
      throw error;
    }
  }

  async getCarrierByRut(rut: string): Promise<Carrier | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/rut/${rut}`);
      return this.handleApiResponse<Carrier>(response);
    } catch (error) {
      console.error("Error fetching carrier by RUT:", error);
      throw error;
    }
  }
}

export const carriersService = new CarriersService();
