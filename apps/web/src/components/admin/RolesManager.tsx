import React, { useState, useEffect } from "react";

interface Role {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  tipo_accion: string;
  activo: boolean;
  descripcion?: string;
}

export const RolesManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    modulo: "general",
    tipo_accion: "ver",
    descripcion: "",
  });

  // Mock data - replace with API calls
  useEffect(() => {
    setRoles([
      {
        id: "1",
        codigo: "admin_access",
        nombre: "Acceso Administrativo",
        modulo: "sistema",
        tipo_accion: "administrar",
        activo: true,
        descripcion: "Acceso completo al sistema administrativo",
      },
      {
        id: "2",
        codigo: "ver_ordenes",
        nombre: "Ver Órdenes",
        modulo: "ordenes",
        tipo_accion: "ver",
        activo: true,
      },
      {
        id: "3",
        codigo: "crear_ordenes",
        nombre: "Crear Órdenes",
        modulo: "ordenes",
        tipo_accion: "crear",
        activo: true,
      },
    ]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to create/update role
    console.log("Role data:", formData);
    setShowForm(false);
    setEditingRole(null);
    setFormData({
      codigo: "",
      nombre: "",
      modulo: "general",
      tipo_accion: "ver",
      descripcion: "",
    });
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      codigo: role.codigo,
      nombre: role.nombre,
      modulo: role.modulo,
      tipo_accion: role.tipo_accion,
      descripcion: role.descripcion || "",
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#798283]">
            Gestión de Roles
          </h2>
          <p className="text-[#798283]/70">
            Crear y administrar roles de permisos
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#D42B22] hover:bg-[#B3251E] text-[#798283] px-6 py-3 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
        >
          + Nuevo Rol
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
          <h3 className="text-lg font-semibold text-[#798283] mb-4">
            {editingRole ? "Editar Rol" : "Crear Nuevo Rol"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Código del Rol *
              </label>
              <input
                type="text"
                required
                value={formData.codigo}
                onChange={(e) =>
                  setFormData({ ...formData, codigo: e.target.value })
                }
                className="w-full px-4 py-2 border border-[#798283]/30 rounded-lg placeholder-[#798283]/60 text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
                placeholder="Ej: ver_ordenes, crear_usuarios"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Nombre del Rol *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full px-4 py-2 border border-[#798283]/30 rounded-lg placeholder-[#798283]/60 text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
                placeholder="Ej: Ver Órdenes, Crear Usuarios"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Módulo *
              </label>
              <select
                value={formData.modulo}
                onChange={(e) =>
                  setFormData({ ...formData, modulo: e.target.value })
                }
                className="w-full px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
              >
                <option value="general">General</option>
                <option value="ordenes">Órdenes</option>
                <option value="usuarios">Usuarios</option>
                <option value="reportes">Reportes</option>
                <option value="sistema">Sistema</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Tipo de Acción *
              </label>
              <select
                value={formData.tipo_accion}
                onChange={(e) =>
                  setFormData({ ...formData, tipo_accion: e.target.value })
                }
                className="w-full px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
              >
                <option value="ver">Ver</option>
                <option value="crear">Crear</option>
                <option value="editar">Editar</option>
                <option value="eliminar">Eliminar</option>
                <option value="administrar">Administrar</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-2 border border-[#798283]/30 rounded-lg placeholder-[#798283]/60 text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
                placeholder="Descripción del permiso..."
              />
            </div>

            <div className="md:col-span-2 flex space-x-3 pt-4">
              <button
                type="submit"
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white px-6 py-2 rounded-lg transition-all duration-200 font-semibold"
              >
                {editingRole ? "Actualizar" : "Crear"} Rol
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingRole(null);
                  setFormData({
                    codigo: "",
                    nombre: "",
                    modulo: "general",
                    tipo_accion: "ver",
                    descripcion: "",
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

      {/* Roles List */}
      <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[#798283] mb-4">
            Roles del Sistema
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#798283]/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
                    Código
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
                    Nombre
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
                    Módulo
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
                    Acción
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
                    Estado
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr
                    key={role.id}
                    className="border-b border-[#798283]/5 hover:bg-[#EFF4F9]"
                  >
                    <td className="py-3 px-4">
                      <code className="text-sm bg-[#798283]/10 px-2 py-1 rounded text-[#798283]">
                        {role.codigo}
                      </code>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#798283]">
                      {role.nombre}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-[#798283]/10 text-[#798283] rounded-full">
                        {role.modulo}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          role.tipo_accion === "administrar"
                            ? "bg-purple-100 text-purple-800"
                            : role.tipo_accion === "crear"
                            ? "bg-green-100 text-green-800"
                            : role.tipo_accion === "editar"
                            ? "bg-blue-100 text-blue-800"
                            : role.tipo_accion === "eliminar"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {role.tipo_accion}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          role.activo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {role.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleEdit(role)}
                        className="text-[#798283] hover:text-[#D42B22] transition-colors duration-200 text-sm font-medium"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
