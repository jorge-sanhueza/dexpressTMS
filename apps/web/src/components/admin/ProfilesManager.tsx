import React, { useState, useEffect } from "react";
import {
  profilesService,
  type ProfileType,
} from "../../services/profilesService";
import type { Profile, ProfileWithRoles } from "../../types/auth";

export const ProfilesManager: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileTypes, setProfileTypes] = useState<ProfileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [viewingProfile, setViewingProfile] = useState<ProfileWithRoles | null>(
    null
  );
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "",
  });

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profilesService.getProfiles();
      console.log("📋 Profiles data received (without roles):", data);
      setProfiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading profiles");
      console.error("Error loading profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadProfileTypes = async () => {
    try {
      const types = await profilesService.getProfileTypes();
      setProfileTypes(types);
    } catch (err) {
      console.error("Error loading profile types:", err);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadProfiles(), loadProfileTypes()]);
    };
    initializeData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProfile) {
        await profilesService.updateProfile(editingProfile.id, formData);
      } else {
        await profilesService.createProfile(formData);
      }

      await loadProfiles();
      setShowForm(false);
      setEditingProfile(null);
      setFormData({
        nombre: "",
        descripcion: "",
        tipo: profileTypes[0]?.tipoPerfil || "básico",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving profile");
      console.error("Error saving profile:", err);
    }
  };

  const handleViewProfile = async (profile: Profile) => {
    // Start with empty roles
    setViewingProfile({
      ...profile,
      roles: [],
    } as ProfileWithRoles);
    setLoadingRoles(true);

    try {
      const profileWithRoles = await profilesService.getProfileWithRoles(
        profile.id
      );
      setViewingProfile(profileWithRoles);
    } catch (err) {
      console.error("Error loading roles:", err);
      setError("Error loading roles del perfil");
      setViewingProfile({ ...profile, roles: [] } as ProfileWithRoles);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleCloseView = () => {
    setViewingProfile(null);
    setLoadingRoles(false);
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

  const handleDeactivate = async (profileId: string) => {
    if (
      !window.confirm("¿Estás seguro de que deseas desactivar este perfil?")
    ) {
      return;
    }

    try {
      await profilesService.deactivateProfile(profileId);
      await loadProfiles();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error desactivando perfil"
      );
    }
  };

  if (loading) {
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
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#D42B22] hover:bg-[#B3251E] text-[#798283] px-6 py-3 rounded-lg transition-all duration-200 font-semibold"
          >
            + Nuevo Perfil
          </button>
        </div>
      </div>
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
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
                Nombre del Perfil
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full px-4 py-2 border border-[#798283]/30 rounded-lg placeholder-[#798283]/60 text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
                placeholder="Ej: Administrador, Operador, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-[#798283]/30 rounded-lg placeholder-[#798283]/60 text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
                placeholder="Descripción de las funciones y permisos del perfil..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Tipo de Perfil
              </label>
              <select
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value })
                }
                className="w-full px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
              >
                <option value="">Seleccionar tipo</option>
                {profileTypes.map((type) => (
                  <option key={type.id} value={type.tipoPerfil}>
                    {type.tipoPerfil.charAt(0).toUpperCase() +
                      type.tipoPerfil.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white px-6 py-2 rounded-lg transition-all duration-200 font-semibold"
              >
                {editingProfile ? "Actualizar" : "Crear"} Perfil
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProfile(null);
                  setFormData({
                    nombre: "",
                    descripcion: "",
                    tipo: "standard",
                  });
                }}
                className="bg-[#798283]/10 hover:bg-[#798283]/20 text-[#798283] px-6 py-2 rounded-lg transition-all duration-200 font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Profile modal */}
      {viewingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#798283]">
                  Detalles del Perfil
                </h3>
                <button
                  onClick={handleCloseView}
                  className="text-[#798283] hover:text-[#D42B22] transition-colors duration-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic profile info - always shown */}
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-1">
                    Nombre del Perfil
                  </label>
                  <p className="text-lg font-semibold text-[#798283]">
                    {viewingProfile.nombre}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-1">
                    Tipo de Perfil
                  </label>
                  <span className="px-3 py-1 text-sm bg-[#798283]/10 text-[#798283] rounded-full">
                    {viewingProfile.tipo}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-1">
                    Descripción
                  </label>
                  <p className="text-[#798283]">
                    {viewingProfile.descripcion || "Sin descripción"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-1">
                    Estado
                  </label>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      viewingProfile.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {viewingProfile.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>

                {/* Roles section with loading state */}
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-3">
                    Roles Asignados{" "}
                    {viewingProfile.roles && `(${viewingProfile.roles.length})`}
                  </label>

                  {loadingRoles ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D42B22] mx-auto"></div>
                      <p className="mt-2 text-sm text-[#798283]/70">
                        Cargando roles...
                      </p>
                    </div>
                  ) : viewingProfile.roles &&
                    viewingProfile.roles.length > 0 ? (
                    <div className="space-y-2">
                      {viewingProfile.roles.map((role, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-[#798283]/20 rounded-lg"
                        >
                          <div>
                            <span className="font-medium text-[#798283]">
                              {role}
                            </span>
                          </div>
                          <span className="px-2 py-1 text-xs bg-[#D42B22]/10 text-[#D42B22] rounded">
                            Asignado
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-[#798283]/20 rounded-lg">
                      <svg
                        className="mx-auto h-12 w-12 text-[#798283]/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-[#798283]/70">
                        No hay roles asignados a este perfil
                      </p>
                      <button
                        onClick={() => {
                          handleCloseView();
                          // We'll implement this later
                          console.log(
                            "Navigate to role assignment for:",
                            viewingProfile.id
                          );
                        }}
                        className="mt-3 bg-[#D42B22] hover:bg-[#B3251E] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Asignar Roles
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-[#798283]/10">
                <button
                  onClick={() => {
                    handleCloseView();
                    handleEdit(viewingProfile);
                  }}
                  className="bg-[#798283]/10 hover:bg-[#798283]/20 text-[#798283] px-6 py-2 rounded-lg transition-all duration-200 font-semibold"
                >
                  Editar Perfil
                </button>
                <button
                  onClick={() => {
                    handleCloseView();
                    // We'll implement role assignment modal later
                    console.log("Assign roles to:", viewingProfile.id);
                  }}
                  className="bg-[#D42B22] hover:bg-[#B3251E] text-white px-6 py-2 rounded-lg transition-all duration-200 font-semibold"
                >
                  Gestionar Roles
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profiles List */}
      <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[#798283] mb-4">
            Perfiles del Sistema ({profiles.length})
          </h3>
          {profiles.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-[#798283]/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-[#798283]">
                No se encontraron perfiles
              </h3>
              <p className="mt-1 text-sm text-[#798283]/70">
                Comienza creando el primer perfil para tu organización.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex justify-between items-center p-4 border border-[#798283]/10 rounded-lg hover:bg-[#EFF4F9] transition-colors duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-[#798283]">
                        {profile.nombre}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          profile.activo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {profile.activo ? "Activo" : "Inactivo"}
                      </span>
                      <span className="px-2 py-1 text-xs bg-[#798283]/10 text-[#798283] rounded-full">
                        {profile.tipo}
                      </span>
                    </div>
                    <p className="text-sm text-[#798283]/70 mt-1">
                      {profile.descripcion}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewProfile(profile)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm font-medium"
                    >
                      Ver Perfil
                    </button>
                    <button
                      onClick={() => handleEdit(profile)}
                      className="text-[#798283] hover:text-[#D42B22] transition-colors duration-200 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        // We'll implement this later
                        console.log("Assign roles to:", profile.id);
                      }}
                      className="text-green-600 hover:text-green-800 transition-colors duration-200 text-sm font-medium"
                    >
                      Asignar Roles
                    </button>
                    <button
                      onClick={() => handleDeactivate(profile.id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200 text-sm font-medium"
                    >
                      Desactivar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
