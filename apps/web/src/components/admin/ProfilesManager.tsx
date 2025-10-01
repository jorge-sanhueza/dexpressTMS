import React, { useState, useEffect } from "react";

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
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "standard",
  });

  // Mock data - replace with API calls
  useEffect(() => {
    setProfiles([
      {
        id: "1",
        nombre: "Administrador",
        descripcion: "Acceso completo al sistema",
        activo: true,
        tipo: "administrativo",
        roles: [
          "admin_access",
          "ver_ordenes",
          "crear_ordenes",
          "editar_ordenes",
        ],
      },
      {
        id: "2",
        nombre: "Operador",
        descripcion: "Gestión de órdenes y seguimiento",
        activo: true,
        tipo: "operacional",
        roles: ["ver_ordenes", "seguir_ordenes"],
      },
    ]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to create/update profile
    console.log("Profile data:", formData);
    setShowForm(false);
    setEditingProfile(null);
    setFormData({ nombre: "", descripcion: "", tipo: "standard" });
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
            Perfiles del Sistema
          </h3>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
