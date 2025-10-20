import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  embarcadoresService,
  type CreateEmbarcadorDto,
  type UpdateEmbarcadorDto,
} from "../services/embarcadoresService";

export const useEmbarcadores = (tenantId: string) => {
  return useQuery({
    queryKey: ["embarcadores", tenantId],
    queryFn: () => embarcadoresService.getEmbarcadores(),
    enabled: !!tenantId,
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
