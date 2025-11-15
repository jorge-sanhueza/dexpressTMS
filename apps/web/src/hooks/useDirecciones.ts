import { direccionesService } from "@/services/direccionesService";
import type { CreateDireccionDto, UpdateDireccionDto } from "@/types/direccion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface UseDireccionesFilters {
  search?: string;
  activo?: boolean;
  comunaId?: string;
  esPrincipal?: boolean;
  origen?: string;
  page?: number;
  limit?: number;
}

export const useDirecciones = (
  tenantId: string,
  filters?: UseDireccionesFilters
) => {
  return useQuery({
    queryKey: ["direcciones", tenantId, filters],
    queryFn: () => direccionesService.getDirecciones(filters),
    enabled: !!tenantId,
    placeholderData: (previousData) => previousData,
  });
};

export const useDireccion = (id: string) => {
  return useQuery({
    queryKey: ["direccion", id],
    queryFn: () => direccionesService.getDireccionById(id),
    enabled: !!id,
  });
};

export const useCreateDireccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (direccionData: CreateDireccionDto) =>
      direccionesService.createDireccion(direccionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direcciones"] });
    },
  });
};

export const useUpdateDireccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      direccionData,
    }: {
      id: string;
      direccionData: UpdateDireccionDto;
    }) => direccionesService.updateDireccion(id, direccionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direcciones"] });
      queryClient.invalidateQueries({ queryKey: ["direccion"] });
    },
  });
};

export const useDeleteDireccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => direccionesService.deleteDireccion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direcciones"] });
    },
  });
};

export const useDireccionesByComuna = (comunaId: string) => {
  return useQuery({
    queryKey: ["direcciones", "comuna", comunaId],
    queryFn: () => direccionesService.getDireccionesByComuna(comunaId),
    enabled: !!comunaId,
  });
};

export const useActivePrincipales = () => {
  return useQuery({
    queryKey: ["direcciones", "principales", "activas"],
    queryFn: () => direccionesService.getActivePrincipales(),
  });
};
