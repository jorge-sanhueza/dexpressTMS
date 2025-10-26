import { embarcadoresService } from "@/services/embarcadoresService";
import type { CreateEmbarcadorDto, UpdateEmbarcadorDto } from "@/types/shipper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface UseEmbarcadoresFilters {
  search?: string;
  activo?: boolean;
  tipo?: string;
  page?: number;
  limit?: number;
}

export const useEmbarcadores = (
  tenantId: string,
  filters?: UseEmbarcadoresFilters
) => {
  return useQuery({
    queryKey: ["embarcadores", tenantId, filters],
    queryFn: () => embarcadoresService.getEmbarcadores(filters),
    enabled: !!tenantId,
    placeholderData: (previousData) => previousData,
  });
};

export const useEmbarcador = (id: string) => {
  return useQuery({
    queryKey: ["embarcador", id],
    queryFn: () => embarcadoresService.getEmbarcadorById(id),
    enabled: !!id,
  });
};

export const useCreateEmbarcador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (embarcadorData: CreateEmbarcadorDto) =>
      embarcadoresService.createEmbarcador(embarcadorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["embarcadores"] });
    },
  });
};

export const useUpdateEmbarcador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      embarcadorData,
    }: {
      id: string;
      embarcadorData: UpdateEmbarcadorDto;
    }) => embarcadoresService.updateEmbarcador(id, embarcadorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["embarcadores"] });
      queryClient.invalidateQueries({ queryKey: ["embarcador"] });
    },
  });
};

export const useDeleteEmbarcador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => embarcadoresService.deleteEmbarcador(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["embarcadores"] });
    },
  });
};
