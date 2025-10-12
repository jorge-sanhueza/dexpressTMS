import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  profilesService,
  type CreateProfileDto,
  type UpdateProfileDto,
} from "../services/profilesService";

// Query keys
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

// Hook for fetching profile types
export function useProfileTypes() {
  return useQuery({
    queryKey: profileKeys.profileTypes(),
    queryFn: () => profilesService.getProfileTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutes (types don't change often)
  });
}

// Hook for fetching all profiles
export function useProfiles(tenantId: string) {
  return useQuery({
    queryKey: profileKeys.list(tenantId),
    queryFn: () => profilesService.getProfiles(),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching a profile with roles
export function useProfileWithRoles(profileId: string) {
  return useQuery({
    queryKey: profileKeys.detail(profileId),
    queryFn: () => profilesService.getProfileWithRoles(profileId),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching available roles for a profile
export function useAvailableRoles(profileId: string) {
  return useQuery({
    queryKey: profileKeys.availableRoles(profileId),
    queryFn: () => profilesService.getAvailableRoles(profileId),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for creating a profile
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

// Hook for updating a profile
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(variables.id),
      });
    },
  });
}

// Hook for deactivating a profile
export function useDeactivateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profilesService.deactivateProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// Hook for assigning roles to a profile
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
    onSuccess: (_, variables) => {
      // Invalidate the available roles for this profile
      queryClient.invalidateQueries({
        queryKey: profileKeys.availableRoles(variables.profileId),
      });
      // Also invalidate the profile details
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(variables.profileId),
      });
      // Invalidate all profiles list
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}
