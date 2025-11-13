import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useComuna } from "@/hooks/useComunas";
import type { Carrier } from "@/types/carrier";

interface CarrierViewModalProps {
  carrier: Carrier;
  onClose: () => void;
  onEdit: () => void;
  canEdit: boolean;
}

export const CarrierViewModal: React.FC<CarrierViewModalProps> = ({
  carrier,
  onClose,
  onEdit,
  canEdit,
}) => {
  const { data: comunaData } = useComuna(carrier.comunaId);

  const formatDate = (date: Date) => {
    return format(new Date(date), "PPP", { locale: es });
  };

  const getEstadoLabel = (activo: boolean) => {
    return activo ? "Activo" : "Inactivo";
  };

  const getEquipmentCount = () => {
    return carrier.equipos?.length || 0;
  };

  return (
    <div className="fixed inset-0 bg-zinc-500/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#798283]">
                {carrier.nombre}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={carrier.activo ? "default" : "secondary"}
                  className={
                    carrier.activo
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {getEstadoLabel(carrier.activo)}
                </Badge>
                <Badge variant="outline" className="text-[#798283]">
                  {getEquipmentCount()} equipo
                  {getEquipmentCount() !== 1 ? "s" : ""}
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
                    <p className="text-[#798283]">{carrier.rut}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Razón Social
                    </label>
                    <p className="text-[#798283]">{carrier.razonSocial}</p>
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
                    <p className="text-[#798283]">{carrier.contacto}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Email
                    </label>
                    <p className="text-[#798283]">
                      <a
                        href={`mailto:${carrier.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {carrier.email}
                      </a>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Teléfono
                    </label>
                    <p className="text-[#798283]">
                      <a
                        href={`tel:${carrier.telefono}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {carrier.telefono}
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
                    <p className="text-[#798283]">{carrier.direccion}</p>
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

              {/* Equipment Information */}
              {carrier.equipos && carrier.equipos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#798283] mb-4">
                    Equipos Asociados
                  </h3>
                  <div className="space-y-2">
                    {carrier.equipos.map((equipo) => (
                      <div
                        key={equipo.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-[#798283]">
                            {equipo.nombre}
                          </p>
                          <p className="text-sm text-[#798283]/70">
                            {equipo.patente} • {equipo.tipoEquipo?.nombre}
                          </p>
                        </div>
                        <Badge
                          variant={equipo.activo ? "default" : "secondary"}
                          className={
                            equipo.activo
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {equipo.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                      {getEstadoLabel(carrier.activo)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Creado
                    </label>
                    <p className="text-[#798283]">
                      {formatDate(carrier.createdAt)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Última Actualización
                    </label>
                    <p className="text-[#798283]">
                      {formatDate(carrier.updatedAt)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      ID del Carrier
                    </label>
                    <p className="text-[#798283] font-mono text-sm">
                      {carrier.id}
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
                Editar Carrier
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
