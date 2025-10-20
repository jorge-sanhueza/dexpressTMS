import { clientsService } from "@/services/clientsService";
import type { CreateClientData, UpdateClientData } from "@/types/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useClients = (filter: any = {}) => {
  return useQuery({
    queryKey: ["clients", filter],
    queryFn: () => clientsService.getClients(filter),
  });
};

export const useClient = (id: string) => {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => clientsService.getClientById(id),
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientData: CreateClientData) =>
      clientsService.createClient(clientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      clientData,
    }: {
      id: string;
      clientData: UpdateClientData;
    }) => clientsService.updateClient(id, clientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client"] });
    },
  });
};

export const useDeactivateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsService.deactivateClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};

export const useActivateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsService.activateClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};
