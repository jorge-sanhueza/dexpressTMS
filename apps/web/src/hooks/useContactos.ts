import { contactosService } from "@/services/contactosService";
import type { CreateContactoData, UpdateContactoData } from "@/types/contacto";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useContactos = (filter: any = {}) => {
  return useQuery({
    queryKey: ["contactos", filter],
    queryFn: () => contactosService.getContactos(filter),
  });
};

export const useContacto = (id: string) => {
  return useQuery({
    queryKey: ["contacto", id],
    queryFn: () => contactosService.getContactoById(id),
    enabled: !!id,
  });
};

export const useContactosByEntidad = (entidadId: string) => {
  return useQuery({
    queryKey: ["contactos", "entidad", entidadId],
    queryFn: () => contactosService.getContactosByEntidad(entidadId),
    enabled: !!entidadId,
  });
};

export const useContactoByRut = (rut: string) => {
  return useQuery({
    queryKey: ["contacto", "rut", rut],
    queryFn: () => contactosService.getContactoByRut(rut),
    enabled: !!rut,
  });
};

export const useCreateContacto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactoData: CreateContactoData) =>
      contactosService.createContacto(contactoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
    },
  });
};

export const useUpdateContacto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      contactoData,
    }: {
      id: string;
      contactoData: UpdateContactoData;
    }) => contactosService.updateContacto(id, contactoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
      queryClient.invalidateQueries({ queryKey: ["contacto"] });
    },
  });
};

export const useDeactivateContacto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactosService.deactivateContacto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
    },
  });
};

export const useActivateContacto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactosService.activateContacto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactos"] });
    },
  });
};
