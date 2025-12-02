import { useQuery } from "@tanstack/react-query";
import { entidadesService } from "@/services/entidadesService";
import type { EntidadesFilter } from "@/services/entidadesService";
import { useDebounce } from "./useDebounce";

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

export const useSearchEntidades = (
  searchTerm: string,
  tipoEntidad?: string
) => {
  const debouncedSearch = useDebounce(searchTerm, 300);

  return useQuery({
    queryKey: ["entidades", "search", debouncedSearch, tipoEntidad],
    queryFn: () =>
      entidadesService.searchEntidades(debouncedSearch, tipoEntidad),
    enabled: debouncedSearch.trim().length > 1,
    staleTime: 2 * 60 * 1000,
  });
};
