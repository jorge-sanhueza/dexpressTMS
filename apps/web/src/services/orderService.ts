import type {
  CreateOrderDto,
  UpdateOrderDto,
  Order,
  OrdersFilter,
  OrdersResponse,
  OrderStats,
  OrderStatusUpdateDto,
  CreateOrderResponse,
  UpdateOrderResponse,
} from "../types/order";
import { API_BASE } from "./apiConfig";
import { apiClient } from "../lib/api-client";

class OrdersService {
  private baseUrl = `${API_BASE}/api/orders`;

  private async handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getOrders(filter: OrdersFilter = {}): Promise<OrdersResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filter.search) queryParams.append("search", filter.search);
      if (filter.estado) queryParams.append("estado", filter.estado);
      if (filter.clienteId) queryParams.append("clienteId", filter.clienteId);
      if (filter.fechaDesde)
        queryParams.append("fechaDesde", filter.fechaDesde.toISOString());
      if (filter.fechaHasta)
        queryParams.append("fechaHasta", filter.fechaHasta.toISOString());
      if (filter.tipoCargaId)
        queryParams.append("tipoCargaId", filter.tipoCargaId);
      if (filter.tipoServicioId)
        queryParams.append("tipoServicioId", filter.tipoServicioId);
      if (filter.remitenteId)
        queryParams.append("remitenteId", filter.remitenteId);
      if (filter.destinatarioId)
        queryParams.append("destinatarioId", filter.destinatarioId);
      if (filter.page) queryParams.append("page", filter.page.toString());
      if (filter.limit) queryParams.append("limit", filter.limit.toString());

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      const response = await apiClient.get(url);
      return this.handleApiResponse<OrdersResponse>(response);
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  async getOrderStats(): Promise<OrderStats> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats`);
      return this.handleApiResponse<OrderStats>(response);
    } catch (error) {
      console.error("Error fetching order stats:", error);
      throw error;
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return this.handleApiResponse<Order>(response);
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  async createOrder(orderData: CreateOrderDto): Promise<CreateOrderResponse> {
    try {
      const response = await apiClient.post(this.baseUrl, orderData);
      return this.handleApiResponse<CreateOrderResponse>(response);
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async updateOrder(
    id: string,
    orderData: UpdateOrderDto
  ): Promise<UpdateOrderResponse> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, orderData);
      return this.handleApiResponse<UpdateOrderResponse>(response);
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  }

  async updateOrderStatus(
    id: string,
    statusData: OrderStatusUpdateDto
  ): Promise<UpdateOrderResponse> {
    try {
      const response = await apiClient.patch(
        `${this.baseUrl}/${id}/status`,
        statusData
      );
      return this.handleApiResponse<UpdateOrderResponse>(response);
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  async cancelOrder(id: string): Promise<UpdateOrderResponse> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}/cancel`);
      return this.handleApiResponse<UpdateOrderResponse>(response);
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  }

  async duplicateOrder(id: string): Promise<CreateOrderResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${id}/duplicate`);
      return this.handleApiResponse<CreateOrderResponse>(response);
    } catch (error) {
      console.error("Error duplicating order:", error);
      throw error;
    }
  }

  async exportOrders(filter: OrdersFilter = {}): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();

      if (filter.search) queryParams.append("search", filter.search);
      if (filter.estado) queryParams.append("estado", filter.estado);
      if (filter.clienteId) queryParams.append("clienteId", filter.clienteId);
      if (filter.fechaDesde)
        queryParams.append("fechaDesde", filter.fechaDesde.toISOString());
      if (filter.fechaHasta)
        queryParams.append("fechaHasta", filter.fechaHasta.toISOString());

      const url = `${this.baseUrl}/export?${queryParams.toString()}`;
      const response = await apiClient.get(url, {
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      return response.blob();
    } catch (error) {
      console.error("Error exporting orders:", error);
      throw error;
    }
  }
}

export const ordersService = new OrdersService();
