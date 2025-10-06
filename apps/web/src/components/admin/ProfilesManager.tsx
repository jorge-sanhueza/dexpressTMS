import React, { useState, useEffect } from "react";
import { profilesService } from "../../services/profilesService";

interface Profile {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  tipo: string;
  roles: string[];
}

export const ProfilesManager: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "standard",
  });

  // Fetch real data from API
  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profilesService.getProfiles();
      setProfiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading profiles");
      console.error("Error loading profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProfile) {
        // Update existing profile
        await profilesService.updateProfile(editingProfile.id, formData);
      } else {
        // Create new profile
        await profilesService.createProfile(formData);
      }

      // Reload profiles
      await loadProfiles();
      setShowForm(false);
      setEditingProfile(null);
      setFormData({ nombre: "", descripcion: "", tipo: "standard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving profile");
      console.error("Error saving profile:", err);
    }
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      nombre: profile.nombre,
      descripcion: profile.descripcion,
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
      await loadProfiles(); // This will now show cached data
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
      <div className="flex justify-between items-center">
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
          className="bg-[#D42B22] hover:bg-[#B3251E] text-[#798283] px-6 py-3 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
        >
          + Nuevo Perfil
        </button>
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
                <option value="standard">Standard</option>
                <option value="administrativo">Administrativo</option>
                <option value="operacional">Operacional</option>
                <option value="supervisor">Supervisor</option>
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
                    {profile.roles && profile.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {profile.roles.slice(0, 3).map((role) => (
                          <span
                            key={role}
                            className="px-2 py-1 text-xs bg-[#D42B22]/10 text-[#D42B22] rounded"
                          >
                            {role}
                          </span>
                        ))}
                        {profile.roles.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-[#798283]/10 text-[#798283] rounded">
                            +{profile.roles.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(profile)}
                      className="text-[#798283] hover:text-[#D42B22] transition-colors duration-200"
                    >
                      Editar
                    </button>
                    <button className="text-[#798283] hover:text-[#D42B22] transition-colors duration-200">
                      Asignar Roles
                    </button>
                    <button
                      onClick={() => handleDeactivate(profile.id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
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
