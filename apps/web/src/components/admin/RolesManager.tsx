import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "../../hooks/useRoles";
import type { Rol } from "../../types/role";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RolesTable } from "./RolesTable";

export const RolesManager: React.FC = () => {
  const { tenant } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [uniqueModules, setUniqueModules] = useState<string[]>([]);
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
    modulo: undefined as string | undefined,
    tipo_accion: undefined as string | undefined,
    estado: undefined as string | undefined,
  });

  // Use TanStack Query hooks
  const { data: roles = [], isLoading, error } = useRoles(tenant?.id || "");

  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  const commonModules = [
    "general",
    "ordenes",
    "usuarios",
    "reportes",
    "sistema",
  ];

  useEffect(() => {
    if (roles.length > 0) {
      const roleModules = [...new Set(roles.map((role) => role.modulo))];
      const allModules = [
        ...new Set([...commonModules, ...roleModules]),
      ].sort();
      setUniqueModules(allModules);
    }
  }, [roles]);

  // Apply filters
  const filteredRoles = roles.filter((role) => {
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !role.codigo.toLowerCase().includes(searchLower) &&
        !role.nombre.toLowerCase().includes(searchLower) &&
        !role.descripcion?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Apply module filter
    if (filters.modulo && role.modulo !== filters.modulo) {
      return false;
    }

    // Apply action type filter
    if (filters.tipo_accion && role.tipo_accion !== filters.tipo_accion) {
      return false;
    }

    // Apply status filter
    if (filters.estado) {
      const isActive = filters.estado === "activo";
      if (role.activo !== isActive) {
        return false;
      }
    }

    return true;
  });

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      modulo: undefined,
      tipo_accion: undefined,
      estado: undefined,
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
      if (editingRol) {
        await updateRoleMutation.mutateAsync({
          id: editingRol.id,
          roleData: formData,
        });
      } else {
        await createRoleMutation.mutateAsync({
          ...formData,
          activo: true,
        });
      }

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
      // Error is handled by the mutation
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
        await deleteRoleMutation.mutateAsync(roleId);
      } catch (err) {
        // Error is handled by the mutation
        console.error("Failed to delete role:", err);
      }
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const isInitialLoad = isLoading && roles.length === 0;

  if (isInitialLoad) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#798283]">Cargando roles...</div>
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
              Gestión de Roles
            </h2>
            <p className="text-[#798283]/70">
              Crear y administrar roles de permisos
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#D42B22] hover:bg-[#B3251E] text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold"
          >
            + Nuevo Rol
          </Button>
        </div>
      </div>

      {/* Error Messages */}
      {(error ||
        createRoleMutation.error ||
        updateRoleMutation.error ||
        deleteRoleMutation.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700">
            {error?.message ||
              createRoleMutation.error?.message ||
              updateRoleMutation.error?.message ||
              deleteRoleMutation.error?.message}
          </div>
        </div>
      )}

      {/* Role Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
          <h3 className="text-lg font-semibold text-[#798283] mb-4">
            {editingRol ? "Editar Rol" : "Crear Nuevo Rol"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Código del Rol *
              </label>
              <Input
                type="text"
                required
                value={formData.codigo}
                onChange={(e) =>
                  setFormData({ ...formData, codigo: e.target.value })
                }
                disabled={
                  createRoleMutation.isPending || updateRoleMutation.isPending
                }
                className="placeholder-[#798283]/60 text-[#798283]"
                placeholder="Ej: ver_ordenes, crear_usuarios"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Nombre del Rol *
              </label>
              <Input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                disabled={
                  createRoleMutation.isPending || updateRoleMutation.isPending
                }
                placeholder="Ej: Ver Órdenes, Crear Usuarios"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Módulo *
              </label>
              <Select
                value={formData.modulo}
                onValueChange={(value) =>
                  setFormData({ ...formData, modulo: value })
                }
                disabled={
                  createRoleMutation.isPending || updateRoleMutation.isPending
                }
              >
                <SelectTrigger className="text-[#798283] border-[#798283]/30 focus:ring-[#D42B22]">
                  <SelectValue placeholder="Seleccionar módulo" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueModules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Tipo de Acción *
              </label>
              <Select
                value={formData.tipo_accion}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo_accion: value })
                }
                disabled={
                  createRoleMutation.isPending || updateRoleMutation.isPending
                }
              >
                <SelectTrigger className="text-[#798283] border-[#798283]/30 focus:ring-[#D42B22]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ver">Ver</SelectItem>
                  <SelectItem value="crear">Crear</SelectItem>
                  <SelectItem value="editar">Editar</SelectItem>
                  <SelectItem value="eliminar">Eliminar</SelectItem>
                  <SelectItem value="activar">Administrar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={
                  createRoleMutation.isPending || updateRoleMutation.isPending
                }
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white px-6 py-2 rounded-lg transition-all duration-200 font-semibold disabled:opacity-50"
              >
                {createRoleMutation.isPending ||
                updateRoleMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editingRol ? "Actualizando..." : "Creando..."}
                  </div>
                ) : editingRol ? (
                  "Actualizar Rol"
                ) : (
                  "Crear Rol"
                )}
              </Button>
              <Button
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
                disabled={
                  createRoleMutation.isPending || updateRoleMutation.isPending
                }
                className="bg-[#798283]/10 hover:bg-[#798283]/20 text-[#798283] px-6 py-2 rounded-lg transition-all duration-200 font-semibold disabled:opacity-50"
              >
                Cancelar
              </Button>
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
            <Input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="placeholder-[#798283]/60 text-[#798283]"
              placeholder="Buscar por código, nombre o descripción..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#798283] mb-2">
              Módulo
            </label>
            <Select
              value={filters.modulo}
              onValueChange={(value) => handleFilterChange("modulo", value)}
            >
              <SelectTrigger className="w-full md:w-40 text-[#798283] border-[#798283]/30 focus:ring-[#D42B22]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="ordenes">Órdenes</SelectItem>
                <SelectItem value="usuarios">Usuarios</SelectItem>
                <SelectItem value="reportes">Reportes</SelectItem>
                <SelectItem value="sistema">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#798283] mb-2">
              Acción
            </label>
            <Select
              value={filters.tipo_accion}
              onValueChange={(value) =>
                handleFilterChange("tipo_accion", value)
              }
            >
              <SelectTrigger className="w-full md:w-40 text-[#798283] border-[#798283]/30 focus:ring-[#D42B22]">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ver">Ver</SelectItem>
                <SelectItem value="crear">Crear</SelectItem>
                <SelectItem value="editar">Editar</SelectItem>
                <SelectItem value="eliminar">Eliminar</SelectItem>
                <SelectItem value="activar">Administrar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#798283] mb-2">
              Estado
            </label>
            <Select
              value={filters.estado}
              onValueChange={(value) => handleFilterChange("estado", value)}
            >
              <SelectTrigger className="w-full md:w-40 text-[#798283] border-[#798283]/30 focus:ring-[#D42B22]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={clearFilters}
            className="bg-[#798283]/10 hover:bg-[#798283]/20 text-[#798283] px-4 py-2 rounded-lg transition-all duration-200 font-semibold h-[42px]"
          >
            Limpiar
          </Button>
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
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-20 text-[#798283] border-[#798283]/30 focus:ring-[#D42B22]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Roles Table Component */}
          <RolesTable
            data={currentRoles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#798283]/10">
              <div className="text-sm text-[#798283]/70">
                Página {currentPage} de {totalPages} • Mostrando{" "}
                {startIndex + 1}-{Math.min(endIndex, filteredRoles.length)} de{" "}
                {filteredRoles.length} roles
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#798283]/10 transition-all duration-200"
                >
                  Anterior
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                          currentPage === page
                            ? "bg-[#D42B22] text-white"
                            : "border border-[#798283]/30 text-[#798283] hover:bg-[#798283]/10"
                        }`}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#798283]/10 transition-all duration-200"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
