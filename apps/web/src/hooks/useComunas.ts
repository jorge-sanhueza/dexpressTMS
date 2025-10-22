import { comunasService } from "@/services/comunasService";
import type { Comuna, ComunaFilter } from "@/services/comunasService";
import { useQuery } from "@tanstack/react-query";

export const useComunas = (filter: ComunaFilter = {}) => {
  return useQuery({
    queryKey: ["comunas", filter],
    queryFn: () => comunasService.getComunas(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useComuna = (id: string) => {
  return useQuery({
    queryKey: ["comuna", id],
    queryFn: () => comunasService.getComunaById(id),
    enabled: !!id,
  });
};
