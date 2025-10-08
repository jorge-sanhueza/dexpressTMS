import React, { useState, useEffect } from "react";
import type { Rol } from "../../types/auth";
import { useAuthStore } from "../../store/authStore";
import { rolesService } from "../../services/rolesService";

export const RolesManager: React.FC = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    modulo: "general",
    tipo_accion: "ver",
    descripcion: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    modulo: "",
    tipo_accion: "",
    estado: "",
  });

  const { tenant } = useAuthStore();

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [roles, filters, currentPage]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const rolesData = await rolesService.getAllRoles();
      setRoles(rolesData);
    } catch (err) {
      setError("Error loading roles");
      console.error("Failed to load roles:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...roles];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (role) =>
          role.codigo.toLowerCase().includes(searchLower) ||
          role.nombre.toLowerCase().includes(searchLower) ||
          role.descripcion?.toLowerCase().includes(searchLower)
      );
    }

    // Apply module filter
    if (filters.modulo) {
      filtered = filtered.filter((role) => role.modulo === filters.modulo);
    }

    // Apply action type filter
    if (filters.tipo_accion) {
      filtered = filtered.filter(
        (role) => role.tipo_accion === filters.tipo_accion
      );
    }

    // Apply status filter
    if (filters.estado) {
      const isActive = filters.estado === "activo";
      filtered = filtered.filter((role) => role.activo === isActive);
    }

    setFilteredRoles(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      modulo: "",
      tipo_accion: "",
      estado: "",
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      if (editingRol) {
        await rolesService.updateRole(editingRol.id, formData);
      } else {
        await rolesService.createRole({
          ...formData,
          activo: true,
        });
      }
      await loadRoles();
      setShowForm(false);
      setEditingRol(null);
      setFormData({
        codigo: "",
        nombre: "",
        modulo: "general",
        tipo_accion: "ver",
        descripcion: "",
      });
    } catch (err) {
      setError("Error saving role");
      console.error("Failed to save role:", err);
    }
  };

  const handleEdit = (role: Rol) => {
    setEditingRol(role);
    setFormData({
      codigo: role.codigo,
      nombre: role.nombre,
      modulo: role.modulo,
      tipo_accion: role.tipo_accion,
      descripcion: role.descripcion || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (roleId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este rol?")) {
      try {
        setError(null);
        await rolesService.deleteRole(roleId);
        await loadRoles();
      } catch (err) {
        setError("Error eliminando rol");
        console.error("Failed to delete role:", err);
      }
    }
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#798283]">Cargando roles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#798283]">
            Gestión de Roles
          </h2>
          <p className="text-[#798283]/70">
            Crear y administrar roles de permisos{" "}
            {tenant && `- ${tenant.nombre}`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#D42B22] hover:bg-[#B3251E] text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
        >
          + Nuevo Rol
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
          <h3 className="text-lg font-semibold text-[#798283] mb-4">
            {editingRol ? "Editar Rol" : "Crear Nuevo Rol"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Form fields remain the same */}
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
                {editingRol ? "Actualizar" : "Crear"} Rol
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingRol(null);
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

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#798283] mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-4 py-2 border border-[#798283]/30 rounded-lg placeholder-[#798283]/60 text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
              placeholder="Buscar por código, nombre o descripción..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#798283] mb-2">
              Módulo
            </label>
            <select
              value={filters.modulo}
              onChange={(e) => handleFilterChange("modulo", e.target.value)}
              className="w-full md:w-40 px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
            >
              <option value="">Todos</option>
              <option value="general">General</option>
              <option value="ordenes">Órdenes</option>
              <option value="usuarios">Usuarios</option>
              <option value="reportes">Reportes</option>
              <option value="sistema">Sistema</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#798283] mb-2">
              Acción
            </label>
            <select
              value={filters.tipo_accion}
              onChange={(e) =>
                handleFilterChange("tipo_accion", e.target.value)
              }
              className="w-full md:w-40 px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
            >
              <option value="">Todas</option>
              <option value="ver">Ver</option>
              <option value="crear">Crear</option>
              <option value="editar">Editar</option>
              <option value="eliminar">Eliminar</option>
              <option value="administrar">Administrar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#798283] mb-2">
              Estado
            </label>
            <select
              value={filters.estado}
              onChange={(e) => handleFilterChange("estado", e.target.value)}
              className="w-full md:w-40 px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
            >
              <option value="">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="bg-[#798283]/10 hover:bg-[#798283]/20 text-[#798283] px-4 py-2 rounded-lg transition-all duration-200 font-semibold h-[42px]"
          >
            Limpiar
          </button>
        </div>

        <div className="text-sm text-[#798283]/70">
          Mostrando {currentRoles.length} de {filteredRoles.length} roles
          {filters.search ||
          filters.modulo ||
          filters.tipo_accion ||
          filters.estado
            ? ` (filtrados de ${roles.length} totales)`
            : ` de ${roles.length} totales`}
        </div>
      </div>

      {/* Roles List */}
      <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#798283]">
              Roles del Sistema
            </h3>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#798283]">Mostrar:</label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-3 py-1 border border-[#798283]/30 rounded text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

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
                {currentRoles.length > 0 ? (
                  currentRoles.map((role) => (
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
                      <td className="py-3 px-4 space-x-2">
                        <button
                          onClick={() => handleEdit(role)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-[#798283]/70"
                    >
                      No se encontraron roles que coincidan con los filtros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#798283]/10">
              <div className="text-sm text-[#798283]/70">
                Página {currentPage} de {totalPages} • Mostrando{" "}
                {startIndex + 1}-{Math.min(endIndex, filteredRoles.length)} de{" "}
                {filteredRoles.length} roles
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#798283]/10 transition-all duration-200"
                >
                  Anterior
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                          currentPage === page
                            ? "bg-[#D42B22] text-white"
                            : "border border-[#798283]/30 text-[#798283] hover:bg-[#798283]/10"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#798283]/10 transition-all duration-200"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
