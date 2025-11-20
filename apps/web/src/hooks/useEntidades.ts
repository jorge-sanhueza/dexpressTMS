// hooks/useEntidades.ts
import { useQuery } from "@tanstack/react-query";
import { entidadesService } from "@/services/entidadesService";

export const useEntidades = (
  filter: {
    search?: string;
    activo?: boolean;
    page?: number;
    limit?: number;
  } = {}
) => {
  return useQuery({
    queryKey: ["entidades", filter],
    queryFn: () => entidadesService.getEntidades(filter),
  });
};

export const useEntidad = (id: string) => {
  return useQuery({
    queryKey: ["entidad", id],
    queryFn: () => entidadesService.getEntidadById(id),
    enabled: !!id,
  });
};
