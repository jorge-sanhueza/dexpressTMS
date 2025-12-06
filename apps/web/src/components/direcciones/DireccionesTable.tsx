import React from "react";
import type { Direccion } from "@/types/direccion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  MapPin,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Navigation,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DireccionesTableProps {
  data: Direccion[];
  onEdit: (direccion: Direccion) => void;
  onView: (direccion: Direccion) => void;
  onDelete: (direccion: Direccion) => void;
  onActivate: (id: string) => void;
  onViewMap: (direccion: Direccion) => void;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canActivate: boolean;
  isLoading: boolean;
}

export const DireccionesTable: React.FC<DireccionesTableProps> = ({
  data,
  onEdit,
  onView,
  onDelete,
  onActivate,
  onViewMap,
  canView,
  canEdit,
  canDelete,
  canActivate,
  isLoading,
}) => {
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: es });
  };

  const getOrigenLabel = (origen: string) => {
    const origenLabels: { [key: string]: string } = {
      MANUAL: "Manual",
      IMPORTACION: "Importación",
      API: "API",
    };
    return origenLabels[origen] || origen;
  };

  const getLocationInfo = (direccion: Direccion) => {
    const parts = [];
    if (direccion.comuna?.nombre) parts.push(direccion.comuna.nombre);
    if (direccion.comuna?.provincia?.nombre)
      parts.push(direccion.comuna.provincia.nombre);
    if (direccion.comuna?.provincia?.region?.nombre)
      parts.push(direccion.comuna.provincia.region.nombre);
    return parts.join(", ");
  };

  const hasCoordinates = (direccion: Direccion) => {
    return direccion.latitud !== undefined && direccion.longitud !== undefined;
  };

  if (isLoading && data.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-2xl font-bold text-[#798283] mb-4">
          No se encontraron direcciones
        </div>
        <p className="text-[#798283]/70">
          No hay direcciones que coincidan con tus filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#798283]/10">
            <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
              Dirección
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
              Ubicación
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
              Contacto
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
              Estado
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
              Última Actualización
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((direccion) => (
            <tr
              key={direccion.id}
              className="border-b border-[#798283]/5 hover:bg-[#798283]/5 transition-colors"
            >
              {/* Address Column */}
              <td className="py-4 px-4">
                <div className="space-y-1">
                  <div className="font-medium text-[#798283] flex items-center gap-2">
                    {direccion.nombre || "Sin nombre"}
                    {direccion.esPrincipal && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                      >
                        Principal
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-[#798283]/70">
                    {direccion.direccionTexto}
                  </div>
                  {direccion.referencia && (
                    <div className="text-xs text-[#798283]/50">
                      Ref: {direccion.referencia}
                    </div>
                  )}
                  <div className="text-xs text-[#798283]/50">
                    {getOrigenLabel(direccion.origen)} • Usada{" "}
                    {direccion.frecuencia}{" "}
                    {direccion.frecuencia === 1 ? "vez" : "veces"}
                  </div>
                </div>
              </td>

              {/* Location Column */}
              <td className="py-4 px-4">
                <div className="space-y-1">
                  <div className="text-sm text-[#798283]">
                    {getLocationInfo(direccion)}
                  </div>
                  <div className="flex items-center gap-2">
                    {hasCoordinates(direccion) ? (
                      <>
                        <Badge
                          variant="outline"
                          className="text-green-700 border-green-200 bg-green-50 text-xs"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          Coordenadas
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewMap(direccion)}
                          className="h-6 px-2 text-xs"
                          title="Ver en mapa"
                        >
                          <Navigation className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-amber-700 border-amber-200 bg-amber-50 text-xs"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Sin coordenadas
                      </Badge>
                    )}
                  </div>
                </div>
              </td>

              {/* Contact Column */}
              <td className="py-4 px-4">
                <div className="space-y-1">
                  {direccion.contacto && (
                    <div className="text-sm text-[#798283]">
                      {direccion.contacto}
                    </div>
                  )}
                  {direccion.telefono && (
                    <div className="text-sm text-[#798283]/70">
                      📞 {direccion.telefono}
                    </div>
                  )}
                  {direccion.email && (
                    <div className="text-sm text-[#798283]/70">
                      ✉️ {direccion.email}
                    </div>
                  )}
                </div>
              </td>

              {/* Status Column */}
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  {direccion.activo ? (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 hover:bg-green-100"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activa
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-800 hover:bg-red-100"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactiva
                    </Badge>
                  )}
                </div>
              </td>

              {/* Last Updated Column */}
              <td className="py-4 px-4">
                <div className="text-sm text-[#798283]/70">
                  {formatDate(direccion.updatedAt)}
                </div>
              </td>

              {/* Actions Column */}
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  {canView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(direccion)}
                      className="h-8 w-8 p-0"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}

                  {canEdit && direccion.activo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(direccion)}
                      className="h-8 w-8 p-0"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}

                  {canActivate && !direccion.activo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onActivate(direccion.id)}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Activar"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}

                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(direccion)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
