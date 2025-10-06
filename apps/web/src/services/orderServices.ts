import type {
  CreateOrderDto,
  UpdateOrderDto,
  Order,
  OrdersFilterDto,
} from "../types/order";
import { API_BASE } from "./apiConfig";
import { cacheService } from "./cacheService";

class OrdersService {
  private baseUrl = `${API_BASE}/api/orders`;

  async getOrders(
    filter: OrdersFilterDto = {}
  ): Promise<{ orders: Order[]; total: number }> {
    const cacheKey = `orders-${JSON.stringify(filter)}`;

    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log("serving orders from cache");
      return cached;
    }

    try {
      const token = localStorage.getItem("access_token");
      const queryParams = new URLSearchParams();

      // Add filter parameters
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

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const data = await response.json();

      cacheService.set(cacheKey, data);

      return data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  private invalidateOrdersCache(): void {
    // Clear all orders-related cache
    const keys = Array.from(cacheService["cache"].keys());
    keys.forEach((key) => {
      if (key.startsWith("orders-")) {
        cacheService.delete(key);
      }
    });
  }

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const newOrder = await this.makeRequest(this.baseUrl, "POST", orderData);
    this.invalidateOrdersCache();
    return newOrder;
  }

  async updateOrder(id: string, orderData: UpdateOrderDto): Promise<Order> {
    const updatedOrder = await this.makeRequest(
      `${this.baseUrl}/${id}`,
      "PUT",
      orderData
    );
    this.invalidateOrdersCache();
    return updatedOrder;
  }

  async cancelOrder(id: string): Promise<void> {
    await this.makeRequest(`${this.baseUrl}/${id}`, "DELETE");
    this.invalidateOrdersCache();
  }

  private async makeRequest(
    url: string,
    method: string,
    data?: any
  ): Promise<any> {
    const token = localStorage.getItem("access_token");
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Request failed: ${response.statusText}`
      );
    }

    return response.json();
  }
}

export const ordersService = new OrdersService();
