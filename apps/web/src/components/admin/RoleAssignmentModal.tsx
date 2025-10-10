import React, { useState, useEffect } from "react";
import { profilesService } from "../../services/profilesService";
import type { Profile } from "../../types/auth";

interface RoleAssignmentModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onRolesAssigned: () => void;
}

interface AvailableRole {
  id: string;
  codigo: string;
  nombre: string;
  modulo: string;
  tipo_accion: string;
  asignado: boolean;
}

export const RoleAssignmentModal: React.FC<RoleAssignmentModalProps> = ({
  profile,
  isOpen,
  onClose,
  onRolesAssigned,
}) => {
  const [availableRoles, setAvailableRoles] = useState<AvailableRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadAvailableRoles();
    }
  }, [isOpen]);

  const loadAvailableRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const roles = await profilesService.getAvailableRoles(profile.id);
      setAvailableRoles(roles);

      // Pre-select currently assigned roles
      const assignedRoleIds = roles
        .filter((role) => role.asignado)
        .map((role) => role.id);
      setSelectedRoles(assignedRoleIds);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error loading available roles"
      );
      console.error("Error loading available roles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSelectAll = () => {
    const allRoleIds = availableRoles.map((role) => role.id);
    setSelectedRoles(allRoleIds);
  };

  const handleDeselectAll = () => {
    setSelectedRoles([]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await profilesService.assignRolesToProfile(profile.id, selectedRoles);
      onRolesAssigned();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error assigning roles");
      console.error("Error assigning roles:", err);
    } finally {
      setSaving(false);
    }
  };

  // Filter roles based on search and module filter
  const filteredRoles = availableRoles.filter((role) => {
    const matchesSearch =
      role.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.modulo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = !moduleFilter || role.modulo === moduleFilter;

    return matchesSearch && matchesModule;
  });

  // Get unique modules for filter
  const modules = [
    ...new Set(availableRoles.map((role) => role.modulo)),
  ].sort();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-[#798283]/10">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-[#798283]">
                Gestionar Roles - {profile.nombre}
              </h3>
              <p className="text-sm text-[#798283]/70 mt-1">
                Selecciona los roles que quieres asignar a este perfil
              </p>
            </div>
            <button
              onClick={onClose}
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
        </div>

        {/* Filters */}
        <div className="p-4 bg-[#EFF4F9] border-b border-[#798283]/10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar roles por código, nombre o módulo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
              />
            </div>
            <div>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
              >
                <option value="">Todos los módulos</option>
                {modules.map((module) => (
                  <option key={module} value={module}>
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="p-4 bg-[#EFF4F9] border-b border-[#798283]/10 flex justify-between items-center">
          <div className="text-sm text-[#798283]">
            {selectedRoles.length} de {availableRoles.length} roles
            seleccionados
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm bg-[#798283]/10 hover:bg-[#798283]/20 text-[#798283] rounded transition-all duration-200"
            >
              Seleccionar Todos
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1 text-sm bg-[#798283]/10 hover:bg-[#798283]/20 text-[#798283] rounded transition-all duration-200"
            >
              Deseleccionar Todos
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}

        {/* Roles List */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D42B22] mx-auto"></div>
              <p className="mt-2 text-sm text-[#798283]/70">
                Cargando roles disponibles...
              </p>
            </div>
          ) : filteredRoles.length > 0 ? (
            <div className="divide-y divide-[#798283]/10">
              {filteredRoles.map((role) => (
                <div
                  key={role.id}
                  className="p-4 hover:bg-[#EFF4F9] transition-colors duration-200"
                >
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => handleRoleToggle(role.id)}
                      className="mt-1 rounded border-[#798283]/30 text-[#D42B22] focus:ring-[#D42B22]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-[#798283]">
                            {role.nombre}
                          </h4>
                          <p className="text-sm text-[#798283]/70 mt-1">
                            <code className="bg-[#798283]/10 px-1 rounded">
                              {role.codigo}
                            </code>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 text-xs bg-[#798283]/10 text-[#798283] rounded-full">
                            {role.modulo}
                          </span>
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
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-[#798283]/70">
                No se encontraron roles que coincidan con los filtros
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-[#798283]/10 bg-[#EFF4F9]">
          <div className="flex justify-between items-center">
            <div className="text-sm text-[#798283]">
              {selectedRoles.length} roles seleccionados
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-6 py-2 border border-[#798283]/30 text-[#798283] rounded-lg hover:bg-[#798283]/10 transition-all duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-[#D42B22] hover:bg-[#B3251E] text-white rounded-lg transition-all duration-200 font-semibold disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
