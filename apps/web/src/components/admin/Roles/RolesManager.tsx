import React, { useState, useEffect } from "react";
import { RolesTable } from "./RolesTable";
import { TableFilters } from "@/components/TableFilters";
import { rolesFilterConfig } from "./roles-filter-config";
import { useAuthStore } from "@/store/authStore";
import {
  useCreateRole,
  useDeleteRole,
  useRoles,
  useUpdateRole,
} from "@/hooks/useRoles";
import type { Rol } from "@/types/role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
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
    try {
      await deleteRoleMutation.mutateAsync(roleId);
    } catch (err) {
      console.error("Failed to delete role:", err);
    }
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

      {/* Reusable Filters Component */}
      <TableFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        filterConfigs={rolesFilterConfig}
        resultsInfo={{
          currentCount: filteredRoles.length,
          totalCount: roles.length,
          filteredCount:
            filteredRoles.length !== roles.length
              ? filteredRoles.length
              : undefined,
          singularLabel: "rol",
          pluralLabel: "roles",
        }}
      />

      {/* Roles Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
        <div className="p-6">
          <RolesTable
            data={filteredRoles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
