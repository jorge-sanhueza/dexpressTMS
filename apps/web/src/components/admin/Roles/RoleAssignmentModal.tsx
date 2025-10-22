import React, { useState, useEffect } from "react";
import {
  useAvailableRoles,
  useAssignRolesToProfile,
} from "../../../hooks/useProfiles";
import type { AvailableRole } from "../../../services/profilesService";
import type { Profile } from "../../../types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RoleAssignmentModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

export const RoleAssignmentModal: React.FC<RoleAssignmentModalProps> = ({
  profile,
  isOpen,
  onClose,
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string | undefined>(
    undefined
  );

  const {
    data: availableRoles = [],
    isLoading,
    error,
  } = useAvailableRoles(profile.id);

  const assignRolesMutation = useAssignRolesToProfile();

  useEffect(() => {
    if (isOpen && availableRoles.length > 0) {
      const assignedRoleIds = availableRoles
        .filter((role: AvailableRole) => role.asignado)
        .map((role: AvailableRole) => role.id);
      setSelectedRoles(assignedRoleIds as string[]);
    }
  }, [isOpen, availableRoles]);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSelectAll = () => {
    const allRoleIds = availableRoles.map((role: AvailableRole) => role.id);
    setSelectedRoles(allRoleIds);
  };

  const handleDeselectAll = () => {
    setSelectedRoles([]);
  };

  const handleSave = async () => {
    try {
      await assignRolesMutation.mutateAsync({
        profileId: profile.id,
        roleIds: selectedRoles,
      });
      onClose();
    } catch (err) {
      console.error("Error assigning roles:", err);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setModuleFilter(undefined);
    setSelectedRoles([]);
    assignRolesMutation.reset();
    onClose();
  };

  const filteredRoles = availableRoles.filter((role: AvailableRole) => {
    const matchesSearch =
      role.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.modulo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = !moduleFilter || role.modulo === moduleFilter;

    return matchesSearch && matchesModule;
  });

  const modules = [
    ...new Set(availableRoles.map((role: AvailableRole) => role.modulo)),
  ].sort();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[#798283]">
            Gestionar Roles - {profile.nombre}
          </DialogTitle>
          <DialogDescription>
            Selecciona los roles que quieres asignar a este perfil
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filter Section */}
        <div className="p-4 bg-[#EFF4F9] border-b border-[#798283]/10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar roles por código, nombre o módulo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={assignRolesMutation.isPending}
                className="placeholder-[#798283]/60 text-[#798283]"
              />
            </div>
            <div>
              <Select
                value={moduleFilter}
                onValueChange={setModuleFilter}
                disabled={assignRolesMutation.isPending}
              >
                <SelectTrigger className="w-full md:w-48 text-[#798283] border-[#798283]/30 focus:ring-[#D42B22]">
                  <SelectValue placeholder="Todos los módulos" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module: string) => (
                    <SelectItem key={module} value={module}>
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center mt-2 py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#D42B22] mr-2"></div>
              <span className="text-sm text-[#798283]">
                Cargando roles disponibles...
              </span>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        <div className="p-4 bg-[#EFF4F9] border-b border-[#798283]/10 flex justify-between items-center">
          <div className="text-sm text-[#798283]">
            {selectedRoles.length} de {availableRoles.length} roles
            seleccionados
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={
                assignRolesMutation.isPending || availableRoles.length === 0
              }
              className="bg-[#798283]/10 hover:bg-[#798283]/20 text-[#798283]"
            >
              Seleccionar Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              disabled={
                assignRolesMutation.isPending || selectedRoles.length === 0
              }
              className="bg-[#798283]/10 hover:bg-[#798283]/20 text-[#798283]"
            >
              Deseleccionar Todos
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {(error || assignRolesMutation.error) && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="text-red-700 text-sm">
              {error?.message || assignRolesMutation.error?.message}
            </div>
          </div>
        )}

        {/* Roles List */}
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D42B22] mx-auto"></div>
              <p className="mt-2 text-sm text-[#798283]/70">
                Cargando roles disponibles...
              </p>
            </div>
          ) : filteredRoles.length > 0 ? (
            <div className="divide-y divide-[#798283]/10">
              {filteredRoles.map((role: AvailableRole) => (
                <div
                  key={role.id as string}
                  className="p-4 hover:bg-[#EFF4F9] transition-colors duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedRoles.includes(role.id as string)}
                      onCheckedChange={() =>
                        handleRoleToggle(role.id as string)
                      }
                      disabled={assignRolesMutation.isPending}
                      className="mt-1"
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
                          <Badge
                            variant="secondary"
                            className="bg-[#798283]/10 text-[#798283]"
                          >
                            {role.modulo as string}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={
                              role.tipo_accion === "administrar"
                                ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                                : role.tipo_accion === "crear"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : role.tipo_accion === "editar"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : role.tipo_accion === "eliminar"
                                ? "bg-red-100 text-red-800 hover:bg-red-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {role.tipo_accion as string}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-[#798283]/40 mb-3">
                <svg
                  className="mx-auto h-12 w-12"
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
              </div>
              <p className="mt-2 text-sm text-[#798283]/70">
                {availableRoles.length === 0
                  ? "No hay roles disponibles para asignar"
                  : "No se encontraron roles que coincidan con los filtros"}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#798283]/10 bg-[#EFF4F9]">
          <div className="flex justify-between items-center">
            <div className="text-sm text-[#798283]">
              {selectedRoles.length} roles seleccionados
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={assignRolesMutation.isPending}
                className="border-[#798283]/30 text-[#798283] hover:bg-[#798283]/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={assignRolesMutation.isPending || isLoading}
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
              >
                {assignRolesMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
