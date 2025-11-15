import type {
  CreateOrderDto,
  UpdateOrderDto,
  Order,
  OrdersFilter,
  OrdersResponse,
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

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return this.handleApiResponse<Order>(response);
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    try {
      const response = await apiClient.post(this.baseUrl, orderData);
      return this.handleApiResponse<Order>(response);
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  async updateOrder(id: string, orderData: UpdateOrderDto): Promise<Order> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, orderData);
      return this.handleApiResponse<Order>(response);
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  }

  async cancelOrder(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return this.handleApiResponse<void>(response);
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  }
}

export const ordersService = new OrdersService();
