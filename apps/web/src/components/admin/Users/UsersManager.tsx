import React, { useState, useCallback } from "react";
import { UserCreationModal } from "./UserCreationModal";
import { UserEditModal } from "./UserEditModal";
import { UsersTable } from "./UsersTable";
import { useAuthStore } from "@/store/authStore";
import type { User, UsersFilter } from "@/types/user";
import { useDeactivateUser, useUpdateUser, useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const UsersManager: React.FC = () => {
  const { hasModulePermission } = useAuthStore();

  const [filter, setFilter] = useState<UsersFilter>({
    page: 1,
    limit: 10,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: usersResponse,
    isLoading,
    error,
    isFetching,
  } = useUsers(filter);

  const deactivateUserMutation = useDeactivateUser();
  const updateUserMutation = useUpdateUser();

  const users = usersResponse?.users || [];
  const totalCount = usersResponse?.total || 0;

  // Permission checks
  const canViewUsers = hasModulePermission("usuarios", "ver");
  const canCreateUsers = hasModulePermission("usuarios", "crear");
  const canEditUsers = hasModulePermission("usuarios", "editar");
  const canDeactivateUsers = hasModulePermission("usuarios", "activar");

  // unauthorized message
  if (!canViewUsers) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#798283] mb-4">
            Acceso No Autorizado
          </div>
          <p className="text-[#798283]/70">
            No tienes permisos para ver usuarios.
          </p>
          <p className="text-sm text-[#798283]/50 mt-2">
            Contacta al administrador del sistema para solicitar acceso.
          </p>
        </div>
      </div>
    );
  }

  const isInitialLoad = isLoading && users.length === 0;
  const hasData = users.length > 0;

  const handleSearch = useCallback((term: string) => {
    const timer = setTimeout(() => {
      setFilter((prev) => ({
        ...prev,
        search: term || undefined,
        page: 1,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleStatusFilter = (activo: boolean | undefined) => {
    setFilter((prev) => ({
      ...prev,
      activo: activo,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilter((prev) => ({ ...prev, page }));
  };

  const handleEditUser = (user: User) => {
    if (canEditUsers) {
      setEditingUser(user);
      setIsEditModalOpen(true);
    }
  };

  const handleUserUpdated = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleDeactivateUser = async (userId: string) => {
    if (canDeactivateUsers) {
      try {
        await deactivateUserMutation.mutateAsync(userId);
      } catch (err) {
        console.error("Error deactivating user:", err);
      }
    }
  };

  const handleUserCreated = () => {
    setIsCreateModalOpen(false);
  };

  const clearFilters = () => {
    setFilter({
      page: 1,
      limit: 10,
    });
    setSearchTerm("");
  };

  if (isInitialLoad) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#798283]">
              Gestión de Usuarios
            </h2>
            <p className="text-[#798283]/70">Cargando usuarios...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D42B22]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#798283]/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#798283]">
              Gestión de Usuarios
            </h2>
            <p className="text-[#798283]/70 mt-1">
              Administra los usuarios del sistema
            </p>
          </div>
          {canCreateUsers && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#D42B22] hover:bg-[#B3251E] text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold"
            >
              + Nuevo Usuario
            </Button>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {(error || deactivateUserMutation.error || updateUserMutation.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700">
            {error?.message ||
              deactivateUserMutation.error?.message ||
              updateUserMutation.error?.message}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-[#798283]/10 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#798283] mb-2">
              Buscar usuarios
            </label>
            <Input
              type="text"
              placeholder="Buscar por nombre, email o contacto..."
              className="w-full"
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              value={searchTerm}
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-[#798283] mb-2">
              Estado
            </label>
            <div className="flex gap-2">
              <Button
                onClick={() => handleStatusFilter(undefined)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                  filter.activo === undefined
                    ? "bg-[#D42B22] text-white"
                    : "bg-[#EFF4F9] text-[#798283] hover:bg-[#E0E8F0]"
                }`}
              >
                Todos
              </Button>
              <Button
                onClick={() => handleStatusFilter(true)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                  filter.activo === true
                    ? "bg-[#D42B22] text-white"
                    : "bg-[#EFF4F9] text-[#798283] hover:bg-[#E0E8F0]"
                }`}
              >
                Activos
              </Button>
              <Button
                onClick={() => handleStatusFilter(false)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                  filter.activo === false
                    ? "bg-[#D42B22] text-white"
                    : "bg-[#EFF4F9] text-[#798283] hover:bg-[#E0E8F0]"
                }`}
              >
                Inactivos
              </Button>
            </div>
          </div>

          {/* Clear Filters */}
          <Button
            onClick={clearFilters}
            variant="outline"
            className="px-4 py-2 border border-[#798283]/30 text-[#798283] hover:bg-[#798283]/10"
          >
            Limpiar
          </Button>
        </div>

        {/* Loading indicator for filters */}
        {isFetching && hasData && (
          <div className="flex items-center justify-center mt-4 py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#D42B22] mr-2"></div>
            <span className="text-sm text-[#798283]">Buscando usuarios...</span>
          </div>
        )}
      </div>

      {/* Users Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
        <div className="p-6">
          <UsersTable
            data={users}
            onEdit={handleEditUser}
            onDeactivate={handleDeactivateUser}
            canEdit={canEditUsers}
            canDeactivate={canDeactivateUsers}
            isLoading={isLoading}
            isDeleting={deactivateUserMutation.isPending}
            totalCount={totalCount}
            currentPage={filter.page || 1}
            pageSize={filter.limit || 10}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* User Creation Modal */}
      <UserCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {/* User Edit Modal */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingUser(null);
          }}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
};
