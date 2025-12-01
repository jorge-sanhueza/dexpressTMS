// hooks/useTipoCarga.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tipoCargaService } from "@/services/tipoCargaService";
import type { TiposCargaFilter } from "@/services/tipoCargaService";

export const useTiposCarga = (tenantId: string, filters?: TiposCargaFilter) => {
  return useQuery({
    queryKey: ["tiposCarga", tenantId, filters],
    queryFn: () => tipoCargaService.getTiposCarga(filters),
    enabled: !!tenantId,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: "always",
  });
};

export const useTipoCarga = (id: string) => {
  return useQuery({
    queryKey: ["tipoCarga", id],
    queryFn: () => tipoCargaService.getTipoCargaById(id),
    enabled: !!id,
  });
};

export const useCreateTipoCarga = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      tipoCargaData: Parameters<typeof tipoCargaService.createTipoCarga>[0]
    ) => tipoCargaService.createTipoCarga(tipoCargaData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiposCarga"] });
    },
  });
};

export const useUpdateTipoCarga = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      tipoCargaData,
    }: {
      id: string;
      tipoCargaData: Parameters<typeof tipoCargaService.updateTipoCarga>[1];
    }) => tipoCargaService.updateTipoCarga(id, tipoCargaData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiposCarga"] });
      queryClient.invalidateQueries({ queryKey: ["tipoCarga"] });
    },
  });
};

export const useDeleteTipoCarga = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tipoCargaService.deleteTipoCarga(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiposCarga"] });
    },
    retry: false, // Add this to prevent retries
  });
};

export const useDeactivateTipoCarga = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tipoCargaService.deactivateTipoCarga(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiposCarga"] });
      queryClient.invalidateQueries({ queryKey: ["tipoCarga"] });
    },
  });
};
