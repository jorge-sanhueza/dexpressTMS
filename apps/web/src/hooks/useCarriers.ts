import { carriersService } from "@/services/carriersService";
import type { CreateCarrierDto, UpdateCarrierDto } from "@/types/carrier";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface UseCarriersFilters {
  search?: string;
  activo?: boolean;
  esPersona?: boolean;
  page?: number;
  limit?: number;
}

export const useCarriers = (tenantId: string, filters?: UseCarriersFilters) => {
  return useQuery({
    queryKey: ["carriers", tenantId, filters],
    queryFn: () => carriersService.getCarriers(filters),
    enabled: !!tenantId,
    placeholderData: (previousData) => previousData,
  });
};

export const useCarrier = (id: string) => {
  return useQuery({
    queryKey: ["carrier", id],
    queryFn: () => carriersService.getCarrierById(id),
    enabled: !!id,
  });
};

export const useCreateCarrier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carrierData: CreateCarrierDto) =>
      carriersService.createCarrier(carrierData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
    },
  });
};

export const useUpdateCarrier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      carrierData,
    }: {
      id: string;
      carrierData: UpdateCarrierDto;
    }) => carriersService.updateCarrier(id, carrierData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
      queryClient.invalidateQueries({ queryKey: ["carrier"] });
    },
  });
};

export const useDeleteCarrier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => carriersService.deleteCarrier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
    },
  });
};
