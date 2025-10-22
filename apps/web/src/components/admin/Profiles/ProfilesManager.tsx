import React, { useState } from "react";
import { ProfilesTable } from "./ProfilesTable";
import { ProfileDetailsModal } from "./ProfileDetailsModal";
import { profilesFilterConfig } from "./profiles-filter-config";
import type { Profile, ProfileType, ProfileWithRoles } from "@/types/profile";
import {
  useCreateProfile,
  useDeactivateProfile,
  useProfiles,
  useProfileTypes,
  useProfileWithRoles,
  useUpdateProfile,
} from "@/hooks/useProfilesService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableFilters } from "@/components/TableFilters";
import { RoleAssignmentModal } from "../Roles/RoleAssignmentModal";
import { useAuthStore } from "@/store/authStore";
import { Textarea } from "@/components/ui/textarea";

export const ProfilesManager: React.FC = () => {
  const { tenant } = useAuthStore();
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
    tipo: "",
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    tipo: undefined as string | undefined,
    estado: undefined as string | undefined,
  });

  // TanStack Query hooks
  const {
    data: profiles = [],
    isLoading,
    error: profilesError,
  } = useProfiles(tenant?.id || "");

  const { data: profileTypes = [], isLoading: profileTypesLoading } =
    useProfileTypes();

  const {
    data: profileWithRoles,
    isLoading: profileRolesLoading,
    error: profileRolesError,
  } = useProfileWithRoles(viewingProfile?.id || "");

  const createProfileMutation = useCreateProfile();
  const updateProfileMutation = useUpdateProfile();
  const deactivateProfileMutation = useDeactivateProfile();

  // Set default profile type when types load
  React.useEffect(() => {
    if (profileTypes.length > 0 && !formData.tipo) {
      setFormData((prev) => ({
        ...prev,
        tipo: profileTypes[0]?.tipoPerfil || "básico",
      }));
    }
  }, [profileTypes, formData.tipo]);

  // Apply filters
  const filteredProfiles = profiles.filter((profile) => {
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !profile.nombre.toLowerCase().includes(searchLower) &&
        !profile.descripcion?.toLowerCase().includes(searchLower) &&
        !profile.tipo.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Apply type filter
    if (filters.tipo && profile.tipo !== filters.tipo) {
      return false;
    }

    // Apply status filter
    if (filters.estado) {
      const isActive = filters.estado === "activo";
      if (profile.activo !== isActive) {
        return false;
      }
    }

    return true;
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      tipo: undefined,
      estado: undefined,
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
        tipo: profileTypes[0]?.tipoPerfil || "básico",
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
    setEditingProfile(profile);
    setFormData({
      nombre: profile.nombre,
      descripcion: profile.descripcion || "",
      tipo: profile.tipo,
    });
    setShowForm(true);
  };

  const handleOpenRoleAssignment = (profile: Profile) => {
    setSelectedProfileForRoles(profile);
    setRoleAssignmentModalOpen(true);
  };

  const handleCloseRoleAssignment = () => {
    setRoleAssignmentModalOpen(false);
    setSelectedProfileForRoles(null);
  };

  const handleDeactivate = async (profileId: string) => {
    try {
      await deactivateProfileMutation.mutateAsync(profileId);
    } catch (err) {
      console.error("Error deactivating profile:", err);
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
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#D42B22] hover:bg-[#B3251E] text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold"
          >
            + Nuevo Perfil
          </Button>
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

            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Tipo de Perfil *
              </label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo: value })
                }
                disabled={
                  createProfileMutation.isPending ||
                  updateProfileMutation.isPending ||
                  profileTypesLoading
                }
              >
                <SelectTrigger className="text-[#798283] border-[#798283]/30 focus:ring-[#D42B22]">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {profileTypesLoading ? (
                    <SelectItem value="" disabled>
                      Cargando tipos...
                    </SelectItem>
                  ) : (
                    profileTypes.map((type: ProfileType) => (
                      <SelectItem key={type.id} value={type.tipoPerfil}>
                        {type.tipoPerfil.charAt(0).toUpperCase() +
                          type.tipoPerfil.slice(1)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={
                  createProfileMutation.isPending ||
                  updateProfileMutation.isPending ||
                  profileTypesLoading
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
                    tipo: profileTypes[0]?.tipoPerfil || "básico",
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
          currentCount: filteredProfiles.length,
          totalCount: profiles.length,
          filteredCount:
            filteredProfiles.length !== profiles.length
              ? filteredProfiles.length
              : undefined,
          singularLabel: "perfil",
          pluralLabel: "perfiles",
        }}
      />

      {/* Profiles Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
        <div className="p-6">
          <ProfilesTable
            data={filteredProfiles}
            onView={handleViewProfile}
            onEdit={handleEdit}
            onDelete={handleDeactivate}
            onAssignRoles={handleOpenRoleAssignment}
            isLoading={isLoading}
            isDeleting={deactivateProfileMutation.isPending}
          />
        </div>
      </div>

      {/* Profile Details Modal */}
      <ProfileDetailsModal
        profile={viewingProfile}
        isOpen={!!viewingProfile}
        onClose={handleCloseView}
        onEdit={handleEdit}
        onAssignRoles={handleOpenRoleAssignment}
        isLoadingRoles={profileRolesLoading}
      />

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
