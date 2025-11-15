import { ordersService } from "@/services/orderServices";
import type { CreateOrderDto, UpdateOrderDto } from "@/types/order";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface UseOrdersFilters {
  search?: string;
  estado?: string;
  clienteId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  page?: number;
  limit?: number;
}

export const useOrders = (tenantId: string, filters?: UseOrdersFilters) => {
  return useQuery({
    queryKey: ["orders", tenantId, filters],
    queryFn: () => ordersService.getOrders(filters),
    enabled: !!tenantId,
    placeholderData: (previousData) => previousData,
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersService.getOrderById(id),
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CreateOrderDto) =>
      ordersService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      orderData,
    }: {
      id: string;
      orderData: UpdateOrderDto;
    }) => ordersService.updateOrder(id, orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
