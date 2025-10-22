import { API_BASE } from "./apiConfig";

export interface Region {
  id: string;
  nombre: string;
  codigo: string;
}

export interface Provincia {
  id: string;
  nombre: string;
}

export interface Comuna {
  id: string;
  nombre: string;
  region?: Region | null;
  provincia?: Provincia | null;
}

export interface ComunaFilter {
  search?: string;
  regionId?: string;
}

class ComunasService {
  private baseUrl = `${API_BASE}/api/comunas`;

  async getComunas(filter: ComunaFilter = {}): Promise<Comuna[]> {
    try {
      const token = localStorage.getItem("access_token");
      const queryParams = new URLSearchParams();

      if (filter.search) queryParams.append("search", filter.search);
      if (filter.regionId) queryParams.append("regionId", filter.regionId);

      const url = `${this.baseUrl}?${queryParams.toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch comunas: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching comunas:", error);
      throw error;
    }
  }

  async getComunaById(id: string): Promise<Comuna> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch comuna: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching comuna:", error);
      throw error;
    }
  }
}

export const comunasService = new ComunasService();
