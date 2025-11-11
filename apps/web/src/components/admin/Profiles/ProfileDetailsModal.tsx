import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProfileWithRoles } from "@/types/profile";

interface ProfileDetailsModalProps {
  profile: ProfileWithRoles | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAssignRoles: () => void;
  isLoadingRoles?: boolean;
  canEdit: boolean;
  canAssignRoles: boolean;
}

export const ProfileDetailsModal: React.FC<ProfileDetailsModalProps> = ({
  profile,
  isOpen,
  onClose,
  onEdit,
  onAssignRoles,
  isLoadingRoles = false,
  canEdit,
  canAssignRoles,
}) => {
  if (!profile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#798283]">
            Detalles del Perfil
          </DialogTitle>
          <DialogDescription>
            Información completa del perfil y roles asignados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic profile info */}
          <div>
            <label className="block text-sm font-medium text-[#798283] mb-1">
              Nombre del Perfil
            </label>
            <p className="text-lg font-semibold text-[#798283]">
              {profile.nombre}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#798283] mb-1">
              Descripción
            </label>
            <p className="text-[#798283]">
              {profile.descripcion || "Sin descripción"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#798283] mb-1">
              Estado
            </label>
            <Badge
              variant="secondary"
              className={
                profile.activo
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-red-100 text-red-800 hover:bg-red-100"
              }
            >
              {profile.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>
        {/* Roles section */}
        <div>
          <label className="block text-sm font-medium text-[#798283] mb-3">
            Roles Asignados {profile.roles && `(${profile.roles.length})`}
          </label>

          {isLoadingRoles ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D42B22] mx-auto"></div>
              <p className="mt-2 text-sm text-[#798283]/70">
                Cargando roles...
              </p>
            </div>
          ) : profile.roles && profile.roles.length > 0 ? (
            <div className="space-y-2">
              {profile.roles.map((role, index) => (
                <div
                  key={role.id || index}
                  className="flex items-center justify-between p-3 border border-[#798283]/20 rounded-lg"
                >
                  <div>
                    <span className="font-medium text-[#798283]">
                      {role.nombre}
                    </span>
                    {role.codigo && (
                      <p className="text-sm text-[#798283]/70">{role.codigo}</p>
                    )}
                    {role.modulo && (
                      <p className="text-xs text-[#798283]/50">
                        Módulo: {role.modulo}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-[#D42B22]/10 text-[#D42B22]"
                  >
                    {role.tipo_accion || "Asignado"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-[#798283]/20 rounded-lg">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <p className="mt-2 text-sm text-[#798283]/70">
                No hay roles asignados a este perfil
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {canEdit && (
            <Button
              onClick={onEdit}
              className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
            >
              Editar Perfil
            </Button>
          )}
          {canAssignRoles && (
            <Button
              onClick={onAssignRoles}
              className="bg-[#798283] hover:bg-[#798283]/80 text-white"
            >
              Asignar Roles
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
