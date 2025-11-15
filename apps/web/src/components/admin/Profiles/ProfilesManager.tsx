import React, { useState } from "react";
import { ProfilesTable } from "./ProfilesTable";
import { ProfileDetailsModal } from "./ProfileDetailsModal";
import { profilesFilterConfig } from "./profiles-filter-config";
import type { Profile, ProfileWithRoles } from "@/types/profile";
import {
  useCreateProfile,
  useDeactivateProfile,
  useProfiles,
  useProfileWithRoles,
  useUpdateProfile,
} from "@/hooks/useProfiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableFilters } from "@/components/TableFilters";
import { RoleAssignmentModal } from "../Roles/RoleAssignmentModal";
import { useAuthStore } from "@/store/authStore";
import { Textarea } from "@/components/ui/textarea";

interface ProfilesFilter {
  search?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
}

export const ProfilesManager: React.FC = () => {
  const { hasModulePermission } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [roleAssignmentModalOpen, setRoleAssignmentModalOpen] = useState(false);
  const [selectedProfileForRoles, setSelectedProfileForRoles] =
    useState<Profile | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [viewingProfile, setViewingProfile] = useState<ProfileWithRoles | null>(
    null
  );
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  // Filter state
  const [filters, setFilters] = useState<ProfilesFilter>({
    search: "",
    activo: undefined,
    page: 1,
    limit: 10,
  });

  const canViewProfiles = hasModulePermission("perfiles", "ver");
  const canCreateProfiles = hasModulePermission("perfiles", "crear");
  const canEditProfiles = hasModulePermission("perfiles", "editar");
  const canDeleteProfiles = hasModulePermission("perfiles", "eliminar");
  const canAssignRoles = hasModulePermission("perfiles", "editar");

  console.log("User Permissions:", {
    canViewProfiles,
    canCreateProfiles,
    canEditProfiles,
    canDeleteProfiles,
    canAssignRoles,
  });

  // unauthorized message
  if (!canViewProfiles) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#798283] mb-4">
            Acceso No Autorizado
          </div>
          <p className="text-[#798283]/70">
            No tienes permisos para ver perfiles.
          </p>
          <p className="text-sm text-[#798283]/50 mt-2">
            Contacta al administrador del sistema para solicitar acceso.
          </p>
        </div>
      </div>
    );
  }

  // TanStack Query hooks
  const {
    data: profilesData,
    isLoading,
    error: profilesError,
  } = useProfiles(filters);

  const profiles = profilesData?.profiles || [];
  const totalCount = profilesData?.total || 0;

  const {
    data: profileWithRoles,
    isLoading: profileRolesLoading,
    error: profileRolesError,
  } = useProfileWithRoles(viewingProfile?.id || "");

  const createProfileMutation = useCreateProfile();
  const updateProfileMutation = useUpdateProfile();
  const deactivateProfileMutation = useDeactivateProfile();

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      activo: undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProfile) {
        await updateProfileMutation.mutateAsync({
          id: editingProfile.id,
          profileData: formData,
        });
      } else {
        await createProfileMutation.mutateAsync(formData);
      }

      setShowForm(false);
      setEditingProfile(null);
      setFormData({
        nombre: "",
        descripcion: "",
      });
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  const handleViewProfile = (profile: Profile) => {
    setViewingProfile({
      ...profile,
      roles: [],
    } as ProfileWithRoles);
  };

  React.useEffect(() => {
    if (profileWithRoles && viewingProfile) {
      setViewingProfile(profileWithRoles);
    }
  }, [profileWithRoles, viewingProfile]);

  const handleCloseView = () => {
    setViewingProfile(null);
  };

  const handleEdit = (profile: Profile) => {
    if (canEditProfiles) {
      setEditingProfile(profile);
      setFormData({
        nombre: profile.nombre,
        descripcion: profile.descripcion || "",
      });
      setShowForm(true);
    }
  };

  const handleOpenRoleAssignment = (profile: Profile) => {
    if (canAssignRoles) {
      setSelectedProfileForRoles(profile);
      setRoleAssignmentModalOpen(true);
    }
  };

  const handleCloseRoleAssignment = () => {
    setRoleAssignmentModalOpen(false);
    setSelectedProfileForRoles(null);
  };

  const handleDeactivate = async (profileId: string) => {
    if (canDeleteProfiles) {
      try {
        await deactivateProfileMutation.mutateAsync(profileId);
      } catch (err) {
        console.error("Error deactivating profile:", err);
      }
    }
  };

  const isInitialLoad = isLoading && profiles.length === 0;

  if (isInitialLoad) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#798283]">
              Gestión de Perfiles
            </h2>
            <p className="text-[#798283]/70">Cargando perfiles...</p>
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
              Gestión de Perfiles
            </h2>
            <p className="text-[#798283]/70">
              Crear y administrar perfiles de usuario
            </p>
          </div>
          {canCreateProfiles && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#D42B22] hover:bg-[#B3251E] text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold"
            >
              + Nuevo Perfil
            </Button>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {(profilesError ||
        createProfileMutation.error ||
        updateProfileMutation.error ||
        deactivateProfileMutation.error ||
        profileRolesError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700">
            {profilesError?.message ||
              createProfileMutation.error?.message ||
              updateProfileMutation.error?.message ||
              deactivateProfileMutation.error?.message ||
              profileRolesError?.message}
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
          <h3 className="text-lg font-semibold text-[#798283] mb-4">
            {editingProfile ? "Editar Perfil" : "Crear Nuevo Perfil"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Nombre del Perfil *
              </label>
              <Input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                disabled={
                  createProfileMutation.isPending ||
                  updateProfileMutation.isPending
                }
                className="placeholder-[#798283]/60 text-[#798283]"
                placeholder="Ej: Administrador, Operador, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Descripción
              </label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={3}
                disabled={
                  createProfileMutation.isPending ||
                  updateProfileMutation.isPending
                }
                className="placeholder-[#798283]/60 text-[#798283] resize-none"
                placeholder="Descripción de las funciones y permisos del perfil..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={
                  createProfileMutation.isPending ||
                  updateProfileMutation.isPending
                }
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white px-6 py-2 rounded-lg transition-all duration-200 font-semibold disabled:opacity-50"
              >
                {createProfileMutation.isPending ||
                updateProfileMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingProfile ? "Actualizando..." : "Creando..."}
                  </div>
                ) : editingProfile ? (
                  "Actualizar Perfil"
                ) : (
                  "Crear Perfil"
                )}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProfile(null);
                  setFormData({
                    nombre: "",
                    descripcion: "",
                  });
                }}
                disabled={
                  createProfileMutation.isPending ||
                  updateProfileMutation.isPending
                }
                className="bg-[#798283]/10 hover:bg-[#798283]/20 text-[#798283] px-6 py-2 rounded-lg transition-all duration-200 font-semibold disabled:opacity-50"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reusable Filters Component */}
      <TableFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        filterConfigs={profilesFilterConfig}
        resultsInfo={{
          currentCount: profiles.length,
          totalCount: totalCount,
          singularLabel: "perfil",
          pluralLabel: "perfiles",
        }}
      />

      {/* Profiles Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
        <div className="p-6">
          <ProfilesTable
            data={profiles}
            totalCount={totalCount}
            currentPage={filters.page || 1}
            pageSize={filters.limit || 10}
            onPageChange={handlePageChange}
            onView={handleViewProfile}
            onEdit={handleEdit}
            onDelete={handleDeactivate}
            onAssignRoles={handleOpenRoleAssignment}
            canView={canViewProfiles}
            canEdit={canEditProfiles}
            canDelete={canDeleteProfiles}
            canAssignRoles={canAssignRoles}
            isLoading={isLoading}
            isDeleting={deactivateProfileMutation.isPending}
          />
        </div>
      </div>

      {/* Profile Details Modal */}
      {viewingProfile && (
        <ProfileDetailsModal
          profile={viewingProfile}
          isOpen={!!viewingProfile}
          onClose={handleCloseView}
          onEdit={() => {
            if (viewingProfile) {
              setViewingProfile(null);
              handleEdit(viewingProfile);
            }
          }}
          onAssignRoles={() => {
            if (viewingProfile) {
              setViewingProfile(null);
              handleOpenRoleAssignment(viewingProfile);
            }
          }}
          isLoadingRoles={profileRolesLoading}
          canEdit={canEditProfiles}
          canAssignRoles={canAssignRoles}
        />
      )}

      {/* Role Assignment Modal */}
      {selectedProfileForRoles && (
        <RoleAssignmentModal
          profile={selectedProfileForRoles}
          isOpen={roleAssignmentModalOpen}
          onClose={handleCloseRoleAssignment}
        />
      )}
    </div>
  );
};
