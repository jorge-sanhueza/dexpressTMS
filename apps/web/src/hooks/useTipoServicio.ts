// hooks/useTipoServicio.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tipoServicioService } from "@/services/tipoServicioService";
import type { TiposServicioFilter } from "@/services/tipoServicioService";

export const useTiposServicio = (
  tenantId: string,
  filters?: TiposServicioFilter
) => {
  return useQuery({
    queryKey: ["tiposServicio", tenantId, filters],
    queryFn: () => tipoServicioService.getTiposServicio(filters),
    enabled: !!tenantId,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTipoServicio = (id: string) => {
  return useQuery({
    queryKey: ["tipoServicio", id],
    queryFn: () => tipoServicioService.getTipoServicioById(id),
    enabled: !!id,
  });
};

export const useTipoServicioByCodigo = (codigo: string) => {
  return useQuery({
    queryKey: ["tipoServicio", "codigo", codigo],
    queryFn: () => tipoServicioService.getTipoServicioByCodigo(codigo),
    enabled: !!codigo,
  });
};

export const useCreateTipoServicio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      tipoServicioData: Parameters<
        typeof tipoServicioService.createTipoServicio
      >[0]
    ) => tipoServicioService.createTipoServicio(tipoServicioData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiposServicio"] });
    },
  });
};

export const useUpdateTipoServicio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      tipoServicioData,
    }: {
      id: string;
      tipoServicioData: Parameters<
        typeof tipoServicioService.updateTipoServicio
      >[1];
    }) => tipoServicioService.updateTipoServicio(id, tipoServicioData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiposServicio"] });
      queryClient.invalidateQueries({ queryKey: ["tipoServicio"] });
    },
  });
};

export const useDeleteTipoServicio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tipoServicioService.deleteTipoServicio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiposServicio"] });
    },
  });
};

export const useDeactivateTipoServicio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tipoServicioService.deactivateTipoServicio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiposServicio"] });
      queryClient.invalidateQueries({ queryKey: ["tipoServicio"] });
    },
  });
};
