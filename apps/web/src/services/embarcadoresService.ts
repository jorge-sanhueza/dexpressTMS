import { API_BASE } from "./apiConfig";

export interface Embarcador {
  id: string;
  nombre: string;
  razonSocial: string;
  rut: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comunaId: string;
  comuna?: any;
  activo: boolean;
  estado: string;
  tipo: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmbarcadorDto {
  nombre: string;
  razonSocial: string;
  rut: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comunaId: string;
  tipo: string;
}

export interface UpdateEmbarcadorDto {
  nombre?: string;
  razonSocial?: string;
  rut?: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  comunaId?: string;
  tipo?: string;
  activo?: boolean;
}

export interface EmbarcadoresFilter {
  search?: string;
  activo?: boolean;
  tipo?: string;
  page?: number;
  limit?: number;
}

export interface EmbarcadoresResponse {
  embarcadores: Embarcador[];
  total: number;
  page: number;
  limit: number;
}

class EmbarcadoresService {
  private baseUrl = `${API_BASE}/api/embarcadores`;

  async getEmbarcadores(
    filter: EmbarcadoresFilter = {}
  ): Promise<EmbarcadoresResponse> {
    try {
      const token = localStorage.getItem("access_token");
      const queryParams = new URLSearchParams();

      if (filter.search) queryParams.append("search", filter.search);
      if (filter.activo !== undefined)
        queryParams.append("activo", filter.activo.toString());
      if (filter.tipo) queryParams.append("tipo", filter.tipo);
      if (filter.page) queryParams.append("page", filter.page.toString());
      if (filter.limit) queryParams.append("limit", filter.limit.toString());

      const url = `${this.baseUrl}?${queryParams.toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch embarcadores: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching embarcadores:", error);
      throw error;
    }
  }

  async getEmbarcadorById(id: string): Promise<Embarcador> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch embarcador: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching embarcador:", error);
      throw error;
    }
  }

  async createEmbarcador(
    embarcadorData: CreateEmbarcadorDto
  ): Promise<Embarcador> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(embarcadorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create embarcador");
      }

      return await response.json();
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
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(embarcadorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update embarcador");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating embarcador:", error);
      throw error;
    }
  }

  async deleteEmbarcador(id: string): Promise<void> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete embarcador");
      }
    } catch (error) {
      console.error("Error deleting embarcador:", error);
      throw error;
    }
  }
}

export const embarcadoresService = new EmbarcadoresService();
