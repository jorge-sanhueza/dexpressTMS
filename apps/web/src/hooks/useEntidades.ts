// hooks/useEntidades.ts
import { useQuery } from "@tanstack/react-query";
import { entidadesService } from "@/services/entidadesService";
import type { EntidadesFilter } from "@/services/entidadesService";

export const useEntidades = (filter: EntidadesFilter = {}) => {
  return useQuery({
    queryKey: ["entidades", filter],
    queryFn: () => entidadesService.getEntidades(filter),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

export const useEntidad = (id: string) => {
  return useQuery({
    queryKey: ["entidad", id],
    queryFn: () => entidadesService.getEntidadById(id),
    enabled: !!id,
  });
};

// Add a convenience hook for searching entidades
export const useSearchEntidades = (
  searchTerm: string,
  tipoEntidad?: string
) => {
  return useQuery({
    queryKey: ["entidades", "search", searchTerm, tipoEntidad],
    queryFn: () => entidadesService.searchEntidades(searchTerm, tipoEntidad),
    enabled: searchTerm.length > 1,
    staleTime: 2 * 60 * 1000,
  });
};
