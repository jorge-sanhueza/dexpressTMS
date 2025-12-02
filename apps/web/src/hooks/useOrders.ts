import { ordersService } from "@/services/orderService";
import type {
  CreateOrderDto,
  UpdateOrderDto,
  OrderStatusUpdateDto,
  OrdersFilter,
} from "@/types/order";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export const useOrders = (filters?: OrdersFilter) => {
  const { tenant } = useAuthStore();

  return useQuery({
    queryKey: ["orders", tenant, filters],
    queryFn: () => ordersService.getOrders({ ...filters }),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!tenant,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useOrderStats = () => {
  const { tenant } = useAuthStore();

  return useQuery({
    queryKey: ["order-stats", tenant],
    queryFn: () => ordersService.getOrderStats(),
    enabled: !!tenant,
    staleTime: 1000 * 60, // 1 minute
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success(data.message || "Orden creada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear la orden");
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.order.id] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success(data.message || "Orden actualizada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la orden");
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      statusData,
    }: {
      id: string;
      statusData: OrderStatusUpdateDto;
    }) => ordersService.updateOrderStatus(id, statusData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.order.id] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success(data.message || "Estado actualizado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar el estado");
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersService.cancelOrder(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.order.id] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success(data.message || "Orden cancelada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al cancelar la orden");
    },
  });
};

export const useDuplicateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersService.duplicateOrder(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success(data.message || "Orden duplicada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al duplicar la orden");
    },
  });
};

export const useExportOrders = () => {
  return useMutation({
    mutationFn: (filters?: OrdersFilter) => ordersService.exportOrders(filters),
    onSuccess: (blob) => {
      const filename = `ordenes_${new Date().toISOString().split("T")[0]}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Órdenes exportadas exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al exportar órdenes");
    },
  });
};
