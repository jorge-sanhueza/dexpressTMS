import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../services/usersService";
import type {
  User,
  UsersResponse,
  UsersFilter,
  CreateUserData,
  UpdateUserData,
} from "../types/user";

// Query keys for consistent cache management
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filter: UsersFilter) => [...userKeys.lists(), filter] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profiles: () => [...userKeys.all, "profiles"] as const,
};

// Hook for fetching users with filters
export function useUsers(filter: UsersFilter = {}) {
  return useQuery({
    queryKey: userKeys.list(filter),
    queryFn: () => usersService.getUsers(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (cache time)
  });
}

// Hook for fetching a single user
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersService.getUserById(id),
    enabled: !!id, // Only run if id exists
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for creating a user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserData) => usersService.createUser(userData),
    onSuccess: () => {
      // Invalidate all users lists to refetch data
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: Error) => {
      console.error("Error creating user:", error);
    },
  });
}

// Hook for updating a user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UpdateUserData }) =>
      usersService.updateUser(id, userData),
    onSuccess: (
      _: User,
      variables: { id: string; userData: UpdateUserData }
    ) => {
      // Add types
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: Error) => {
      console.error("Error updating user:", error);
    },
  });
}

// Hook for deactivating a user
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.deactivateUser(id),
    onSuccess: () => {
      // Invalidate all users lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: Error) => {
      console.error("Error deactivating user:", error);
    },
  });
}

// Hook for fetching profiles
export function useProfiles(filters?: {
  search?: string;
  activo?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...userKeys.profiles(), filters],
    queryFn: () => usersService.getProfiles(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// Optimistic updates hook for instant UI feedback
export function useOptimisticUserUpdate() {
  const queryClient = useQueryClient();

  const updateUser = (updatedUser: User) => {
    queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);

    // Update user in all lists
    queryClient.setQueriesData(
      { queryKey: userKeys.lists() },
      (old: UsersResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          users: old.users.map((user) =>
            user.id === updatedUser.id ? updatedUser : user
          ),
        };
      }
    );
  };

  return { updateUser };
}
