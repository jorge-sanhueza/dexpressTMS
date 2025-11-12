import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useComuna } from "@/hooks/useComunas";
import type { Embarcador } from "@/types/shipper";

interface EmbarcadorViewModalProps {
  embarcador: Embarcador;
  onClose: () => void;
  onEdit: () => void;
  canEdit: boolean;
}

export const EmbarcadorViewModal: React.FC<EmbarcadorViewModalProps> = ({
  embarcador,
  onClose,
  onEdit,
  canEdit,
}) => {
  const { data: comunaData } = useComuna(embarcador.comunaId);
  console.log("EmbarcadorViewModal - comunaData:", embarcador.comunaId);

  const formatDate = (date: Date) => {
    return format(new Date(date), "PPP", { locale: es });
  };

  const getEstadoLabel = (activo: boolean) => {
    return activo ? "Activo" : "Inactivo";
  };

  return (
    <div className="fixed inset-0 bg-zinc-500/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#798283]">
                {embarcador.nombre}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={embarcador.activo ? "default" : "secondary"}
                  className={
                    embarcador.activo
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {getEstadoLabel(embarcador.activo)}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-[#798283]"
            >
              ×
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#798283] mb-4">
                  Información Básica
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      RUT
                    </label>
                    <p className="text-[#798283]">{embarcador.rut}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Razón Social
                    </label>
                    <p className="text-[#798283]">{embarcador.razonSocial}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-[#798283] mb-4">
                  Información de Contacto
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Contacto Principal
                    </label>
                    <p className="text-[#798283]">{embarcador.contacto}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Email
                    </label>
                    <p className="text-[#798283]">
                      <a
                        href={`mailto:${embarcador.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {embarcador.email}
                      </a>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Teléfono
                    </label>
                    <p className="text-[#798283]">
                      <a
                        href={`tel:${embarcador.telefono}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {embarcador.telefono}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Additional Info */}
            <div className="space-y-6">
              {/* Location Information */}
              <div>
                <h3 className="text-lg font-semibold text-[#798283] mb-4">
                  Ubicación
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Dirección
                    </label>
                    <p className="text-[#798283]">{embarcador.direccion}</p>
                  </div>

                  {comunaData && (
                    <div>
                      <label className="text-sm font-medium text-[#798283]/70">
                        Comuna
                      </label>
                      <p className="text-[#798283]">
                        {comunaData.nombre}
                        {comunaData.region && `, ${comunaData.region.nombre}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* System Information */}
              <div>
                <h3 className="text-lg font-semibold text-[#798283] mb-4">
                  Información del Sistema
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Estado
                    </label>
                    <p className="text-[#798283] capitalize">
                      {getEstadoLabel(embarcador.activo)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Creado
                    </label>
                    <p className="text-[#798283]">
                      {formatDate(embarcador.createdAt)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Última Actualización
                    </label>
                    <p className="text-[#798283]">
                      {formatDate(embarcador.updatedAt)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      ID del Embarcador
                    </label>
                    <p className="text-[#798283] font-mono text-sm">
                      {embarcador.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#798283]/30 text-[#798283]"
            >
              Cerrar
            </Button>
            {canEdit && (
              <Button
                onClick={onEdit}
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
              >
                Editar Embarcador
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
