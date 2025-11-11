import React, { useState } from "react";
import { RolesTable } from "./RolesTable";
import { rolesFilterConfig } from "./roles-filter-config";
import type { Rol, RolesFilterDto } from "@/types/role";
import {
  useCreateRole,
  useDeleteRole,
  useRoles,
  useAvailableModules,
  useAvailableTipoAcciones,
  useUpdateRole,
} from "@/hooks/useRoles";
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
import { useAuthStore } from "@/store/authStore";

export const RolesManager: React.FC = () => {
  const { hasModulePermission } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Rol | null>(null);
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    modulo: "general",
    tipo_accion: "ver",
  });

  const [filters, setFilters] = useState<RolesFilterDto>({
    search: "",
    modulo: undefined,
    tipo_accion: undefined,
    activo: undefined,
    page: 1,
    limit: 10,
  });

  const canViewRoles = hasModulePermission("roles", "ver");
  const canCreateRoles = hasModulePermission("roles", "crear");
  const canEditRoles = hasModulePermission("roles", "editar");
  const canDeleteRoles = hasModulePermission("roles", "eliminar");

  if (!canViewRoles) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#798283] mb-4">
            Acceso No Autorizado
          </div>
          <p className="text-[#798283]/70">
            No tienes permisos para ver roles.
          </p>
          <p className="text-sm text-[#798283]/50 mt-2">
            Contacta al administrador del sistema para solicitar acceso.
          </p>
        </div>
      </div>
    );
  }

  const { data: rolesData, isLoading, error: rolesError } = useRoles(filters);

  const roles = rolesData?.roles || [];
  const totalCount = rolesData?.total || 0;
  const currentPage = Number(rolesData?.page) || 1;
  const limit = Number(rolesData?.limit) || 10;

  const { data: availableModules = [] } = useAvailableModules();
  const { data: availableTipoAcciones = [] } = useAvailableTipoAcciones();

  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  React.useEffect(() => {
    if (availableModules.length > 0 && !formData.modulo) {
      setFormData((prev) => ({
        ...prev,
        modulo: availableModules[0] || "general",
      }));
    }
    if (availableTipoAcciones.length > 0 && !formData.tipo_accion) {
      setFormData((prev) => ({
        ...prev,
        tipo_accion: availableTipoAcciones[0] || "ver",
      }));
    }
  }, [
    availableModules,
    availableTipoAcciones,
    formData.modulo,
    formData.tipo_accion,
  ]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      modulo: undefined,
      tipo_accion: undefined,
      activo: undefined,
      page: 1,
      limit: 10,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page: Number(page),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRole) {
        await updateRoleMutation.mutateAsync({
          id: editingRole.id,
          roleData: formData,
        });
      } else {
        await createRoleMutation.mutateAsync({
          ...formData,
          activo: true,
        });
      }

      setShowForm(false);
      setEditingRole(null);
      setFormData({
        codigo: "",
        nombre: "",
        modulo: availableModules[0] || "general",
        tipo_accion: availableTipoAcciones[0] || "ver",
      });
    } catch (err) {
      console.error("Error saving role:", err);
    }
  };

  const handleEdit = (role: Rol) => {
    if (canEditRoles) {
      setEditingRole(role);
      setFormData({
        codigo: role.codigo,
        nombre: role.nombre,
        modulo: role.modulo,
        tipo_accion: role.tipo_accion,
      });
      setShowForm(true);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (canDeleteRoles) {
      try {
        await deleteRoleMutation.mutateAsync(roleId);
      } catch (err) {
        console.error("Error deleting role:", err);
      }
    }
  };

  const updatedFilterConfig = rolesFilterConfig.map((config) => {
    if (config.key === "modulo") {
      return {
        ...config,
        options: availableModules.map((module) => ({
          value: module,
          label: module.charAt(0).toUpperCase() + module.slice(1),
        })),
      };
    }
    if (config.key === "tipo_accion") {
      return {
        ...config,
        options: availableTipoAcciones.map((accion) => ({
          value: accion,
          label: accion.charAt(0).toUpperCase() + accion.slice(1),
        })),
      };
    }
    return config;
  });

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
          {canCreateRoles && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#D42B22] hover:bg-[#B3251E] text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold"
            >
              + Nuevo Rol
            </Button>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {(rolesError ||
        createRoleMutation.error ||
        updateRoleMutation.error ||
        deleteRoleMutation.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700">
            {rolesError?.message ||
              createRoleMutation.error?.message ||
              updateRoleMutation.error?.message ||
              deleteRoleMutation.error?.message}
          </div>
        </div>
      )}

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
                  {availableModules.map((module) => (
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
                  {availableTipoAcciones.map((accion) => (
                    <SelectItem key={accion} value={accion}>
                      {accion.charAt(0).toUpperCase() + accion.slice(1)}
                    </SelectItem>
                  ))}
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
                    {editingRole ? "Actualizando..." : "Creando..."}
                  </div>
                ) : editingRole ? (
                  "Actualizar Rol"
                ) : (
                  "Crear Rol"
                )}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingRole(null);
                  setFormData({
                    codigo: "",
                    nombre: "",
                    modulo: availableModules[0] || "general",
                    tipo_accion: availableTipoAcciones[0] || "ver",
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
        filterConfigs={updatedFilterConfig}
        resultsInfo={{
          currentCount: roles.length,
          totalCount: totalCount,
          singularLabel: "rol",
          pluralLabel: "roles",
        }}
      />

      {/* Roles Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
        <div className="p-6">
          <RolesTable
            data={roles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={canEditRoles}
            canDelete={canDeleteRoles}
            isLoading={isLoading}
            isDeleting={deleteRoleMutation.isPending}
            pagination={{
              currentPage: currentPage,
              totalPages: Math.ceil(totalCount / limit),
              onPageChange: handlePageChange,
              totalItems: totalCount,
              itemsPerPage: limit,
            }}
          />
        </div>
      </div>
    </div>
  );
};
