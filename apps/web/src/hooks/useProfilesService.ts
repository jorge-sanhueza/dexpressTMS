import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  profilesService,
  type CreateProfileDto,
  type UpdateProfileDto,
} from "../services/profilesService";
import type { Profile } from "../types/profile";

export const profileKeys = {
  all: ["profiles"] as const,
  lists: () => [...profileKeys.all, "list"] as const,
  list: (tenantId: string) => [...profileKeys.lists(), tenantId] as const,
  details: () => [...profileKeys.all, "detail"] as const,
  detail: (id: string) => [...profileKeys.details(), id] as const,
  profileTypes: () => [...profileKeys.all, "types"] as const,
  availableRoles: (profileId: string) =>
    [...profileKeys.detail(profileId), "available-roles"] as const,
};

export function useProfileTypes() {
  return useQuery({
    queryKey: profileKeys.profileTypes(),
    queryFn: () => profilesService.getProfileTypes(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useProfiles(tenantId: string) {
  return useQuery({
    queryKey: profileKeys.list(tenantId),
    queryFn: () => profilesService.getProfiles(),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProfileWithRoles(profileId: string) {
  return useQuery({
    queryKey: profileKeys.detail(profileId),
    queryFn: () => profilesService.getProfileWithRoles(profileId),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAvailableRoles(profileId: string) {
  return useQuery({
    queryKey: profileKeys.availableRoles(profileId),
    queryFn: () => profilesService.getAvailableRoles(profileId),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: CreateProfileDto) =>
      profilesService.createProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      profileData,
    }: {
      id: string;
      profileData: UpdateProfileDto;
    }) => profilesService.updateProfile(id, profileData),
    onSuccess: (
      _: Profile,
      variables: { id: string; profileData: UpdateProfileDto }
    ) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(variables.id),
      });
    },
  });
}

export function useDeactivateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profilesService.deactivateProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useAssignRolesToProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      profileId,
      roleIds,
    }: {
      profileId: string;
      roleIds: string[];
    }) => profilesService.assignRolesToProfile(profileId, roleIds),
    onSuccess: (
      _: { message: string },
      variables: { profileId: string; roleIds: string[] }
    ) => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.availableRoles(variables.profileId),
      });
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(variables.profileId),
      });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
