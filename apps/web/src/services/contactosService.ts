import { apiClient } from "@/lib/api-client";
import type {
  Contacto,
  CreateContactoData,
  UpdateContactoData,
  ContactosFilter,
} from "../types/contacto";
import { API_BASE } from "./apiConfig";

class ContactosService {
  private baseUrl = `${API_BASE}/api/contactos`;

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

  async getContactos(
    filter: ContactosFilter = {}
  ): Promise<{ contactos: Contacto[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();

      if (filter.search) queryParams.append("search", filter.search);
      if (filter.activo !== undefined)
        queryParams.append("activo", filter.activo.toString());
      if (filter.esPersonaNatural !== undefined)
        queryParams.append(
          "esPersonaNatural",
          filter.esPersonaNatural.toString()
        );
      if (filter.entidadId) queryParams.append("entidadId", filter.entidadId);
      if (filter.page) queryParams.append("page", filter.page.toString());
      if (filter.limit) queryParams.append("limit", filter.limit.toString());

      return this.handleApiCall<{ contactos: Contacto[]; total: number }>(() =>
        apiClient.get(`${this.baseUrl}?${queryParams.toString()}`)
      );
    } catch (error) {
      console.error("Error fetching contactos:", error);
      throw error;
    }
  }

  async getContactoById(id: string): Promise<Contacto> {
    return this.handleApiCall<Contacto>(() =>
      apiClient.get(`${this.baseUrl}/${id}`)
    );
  }

  async getContactosByEntidad(entidadId: string): Promise<Contacto[]> {
    return this.handleApiCall<Contacto[]>(() =>
      apiClient.get(`${this.baseUrl}/entidad/${entidadId}`)
    );
  }

  async getContactoByRut(rut: string): Promise<Contacto | null> {
    return this.handleApiCall<Contacto | null>(() =>
      apiClient.get(`${this.baseUrl}/rut/${rut}`)
    );
  }

  async deactivateContacto(id: string): Promise<{ message: string }> {
    return this.handleApiCall<{ message: string }>(() =>
      apiClient.delete(`${this.baseUrl}/${id}`)
    );
  }

  async activateContacto(id: string): Promise<Contacto> {
    return this.handleApiCall<Contacto>(() =>
      apiClient.put(`${this.baseUrl}/${id}`, {
        activo: true,
      })
    );
  }

  async createContacto(contactoData: CreateContactoData): Promise<Contacto> {
    const formattedData = {
      ...contactoData,
      rut: this.formatRut(contactoData.rut),
    };

    return this.handleApiCall<Contacto>(() =>
      apiClient.post(this.baseUrl, formattedData)
    );
  }

  async updateContacto(
    id: string,
    contactoData: UpdateContactoData
  ): Promise<Contacto> {
    const formattedData = {
      ...contactoData,
      ...(contactoData.rut && { rut: this.formatRut(contactoData.rut) }),
    };

    return this.handleApiCall<Contacto>(() =>
      apiClient.put(`${this.baseUrl}/${id}`, formattedData)
    );
  }
}

export const contactosService = new ContactosService();
