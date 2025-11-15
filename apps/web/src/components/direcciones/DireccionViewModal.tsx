import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Direccion } from "@/types/direccion";
import { Label } from "../ui/label";
import { GoogleMap } from "../maps/GoogleMap";

interface DireccionViewModalProps {
  direccion: Direccion;
  onClose: () => void;
  onEdit: () => void;
  canEdit: boolean;
}

export const DireccionViewModal: React.FC<DireccionViewModalProps> = ({
  direccion,
  onClose,
  onEdit,
  canEdit,
}) => {
  const formatDate = (date: Date) => {
    return format(new Date(date), "PPP", { locale: es });
  };

  const getEstadoLabel = (activo: boolean) => {
    return activo ? "Activa" : "Inactiva";
  };

  const getOrigenLabel = (origen: string) => {
    const origenLabels: { [key: string]: string } = {
      MANUAL: "Manual",
      IMPORTACION: "Importación",
      API: "API",
    };
    return origenLabels[origen] || origen;
  };

  const getLocationInfo = () => {
    const parts = [];
    if (direccion.comuna?.nombre) parts.push(direccion.comuna.nombre);
    if (direccion.comuna?.provincia?.nombre)
      parts.push(direccion.comuna.provincia.nombre);
    if (direccion.comuna?.provincia?.region?.nombre)
      parts.push(direccion.comuna.provincia.region.nombre);
    return parts.join(" → ");
  };

  return (
    <div className="fixed inset-0 bg-zinc-500/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#798283]">
                {direccion.nombre || "Dirección sin nombre"}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={direccion.activo ? "default" : "secondary"}
                  className={
                    direccion.activo
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {getEstadoLabel(direccion.activo)}
                </Badge>
                {direccion.esPrincipal && (
                  <Badge
                    variant="default"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                  >
                    Principal
                  </Badge>
                )}
                <Badge variant="outline" className="text-[#798283]">
                  {getOrigenLabel(direccion.origen)}
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
            {/* Address Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#798283] mb-4">
                  Información de la Dirección
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Dirección Completa
                    </label>
                    <p className="text-[#798283] font-medium">
                      {direccion.direccionTexto}
                    </p>
                  </div>

                  {direccion.calle && direccion.numero && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-[#798283]/70">
                          Calle
                        </label>
                        <p className="text-[#798283]">{direccion.calle}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#798283]/70">
                          Número
                        </label>
                        <p className="text-[#798283]">{direccion.numero}</p>
                      </div>
                    </div>
                  )}

                  {direccion.referencia && (
                    <div>
                      <label className="text-sm font-medium text-[#798283]/70">
                        Referencia
                      </label>
                      <p className="text-[#798283]">{direccion.referencia}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Ubicación Geográfica
                    </label>
                    <p className="text-[#798283]">{getLocationInfo()}</p>
                  </div>

                  {direccion.latitud && direccion.longitud && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-[#798283]/70">
                          Latitud
                        </label>
                        <p className="text-[#798283] font-mono text-sm">
                          {direccion.latitud}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-[#798283]/70">
                          Longitud
                        </label>
                        <p className="text-[#798283] font-mono text-sm">
                          {direccion.longitud}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {direccion.latitud && direccion.longitud && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-[#798283]/70 mb-2 block">
                      Ubicación en el Mapa
                    </Label>
                    <div className="rounded-lg border border-[#798283]/20 overflow-hidden">
                      <GoogleMap
                        latitud={direccion.latitud}
                        longitud={direccion.longitud}
                        direccionTexto={direccion.direccionTexto}
                        height="200px"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // You might want to open a larger map modal here
                        const url = `https://www.google.com/maps?q=${direccion.latitud},${direccion.longitud}`;
                        window.open(url, "_blank");
                      }}
                      className="mt-2 text-xs"
                    >
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      Abrir en Google Maps
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Contact & Additional Info */}
            <div className="space-y-6">
              {/* Contact Information */}
              {(direccion.contacto ||
                direccion.telefono ||
                direccion.email) && (
                <div>
                  <h3 className="text-lg font-semibold text-[#798283] mb-4">
                    Información de Contacto
                  </h3>
                  <div className="space-y-3">
                    {direccion.contacto && (
                      <div>
                        <label className="text-sm font-medium text-[#798283]/70">
                          Contacto
                        </label>
                        <p className="text-[#798283]">{direccion.contacto}</p>
                      </div>
                    )}

                    {direccion.telefono && (
                      <div>
                        <label className="text-sm font-medium text-[#798283]/70">
                          Teléfono
                        </label>
                        <p className="text-[#798283]">
                          <a
                            href={`tel:${direccion.telefono}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {direccion.telefono}
                          </a>
                        </p>
                      </div>
                    )}

                    {direccion.email && (
                      <div>
                        <label className="text-sm font-medium text-[#798283]/70">
                          Email
                        </label>
                        <p className="text-[#798283]">
                          <a
                            href={`mailto:${direccion.email}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {direccion.email}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Usage Information */}
              <div>
                <h3 className="text-lg font-semibold text-[#798283] mb-4">
                  Información de Uso
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Frecuencia de Uso
                    </label>
                    <p className="text-[#798283]">
                      {direccion.frecuencia}{" "}
                      {direccion.frecuencia === 1 ? "vez" : "veces"}
                    </p>
                  </div>

                  {direccion.ultimaVezUsada && (
                    <div>
                      <label className="text-sm font-medium text-[#798283]/70">
                        Último Uso
                      </label>
                      <p className="text-[#798283]">
                        {formatDate(direccion.ultimaVezUsada)}
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
                      {getEstadoLabel(direccion.activo)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Tipo
                    </label>
                    <p className="text-[#798283]">
                      {direccion.esPrincipal
                        ? "Dirección Principal"
                        : "Dirección Secundaria"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Origen
                    </label>
                    <p className="text-[#798283]">
                      {getOrigenLabel(direccion.origen)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Creado
                    </label>
                    <p className="text-[#798283]">
                      {formatDate(direccion.createdAt)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      Última Actualización
                    </label>
                    <p className="text-[#798283]">
                      {formatDate(direccion.updatedAt)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#798283]/70">
                      ID de la Dirección
                    </label>
                    <p className="text-[#798283] font-mono text-sm">
                      {direccion.id}
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
                Editar Dirección
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
