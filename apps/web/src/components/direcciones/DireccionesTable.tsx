import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { Direccion } from "@/types/direccion";

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
  isLoading?: boolean;
}

export const DireccionesTable: React.FC<DireccionesTableProps> = ({
  data,
  onEdit,
  onView,
  onDelete,
  onActivate,
  canView,
  canEdit,
  canDelete,
  canActivate,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D42B22]"></div>
        <span className="ml-2 text-[#798283]/70">Cargando direcciones...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-[#798283]/70 text-lg mb-2">
            No se encontraron direcciones
          </div>
          <div className="text-sm text-[#798283]/50">
            Comienza agregando tu primera dirección o ajusta los filtros de
            búsqueda.
          </div>
        </div>
      </div>
    );
  }

  const getEstadoBadge = (activo: boolean) => {
    return (
      <Badge
        variant={activo ? "default" : "secondary"}
        className={
          activo
            ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
            : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
        }
      >
        {activo ? "Activa" : "Inactiva"}
      </Badge>
    );
  };

  const getPrincipalBadge = (esPrincipal: boolean) => {
    if (!esPrincipal) return null;

    return (
      <Badge
        variant="default"
        className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 text-xs font-medium"
      >
        Principal
      </Badge>
    );
  };

  const getOrigenBadge = (origen: string) => {
    // Convert to title case
    const formatOrigen = (origen: string): string => {
      const origenMap: { [key: string]: string } = {
        MANUAL: "Manual",
        IMPORTACION: "Importación",
        API: "API",
      };
      return (
        origenMap[origen] || origen.charAt(0) + origen.slice(1).toLowerCase()
      );
    };

    const origenConfig: {
      [key: string]: {
        variant: "default" | "secondary" | "outline";
        className: string;
      };
    } = {
      MANUAL: {
        variant: "default",
        className:
          "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200",
      },
      IMPORTACION: {
        variant: "secondary",
        className:
          "bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200",
      },
      API: {
        variant: "default",
        className:
          "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
      },
    };

    const config = origenConfig[origen] || {
      variant: "outline",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <Badge
        variant={config.variant}
        className={`${config.className} text-xs font-medium`}
      >
        {formatOrigen(origen)}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-CL");
  };

  const getLocationInfo = (direccion: Direccion) => {
    const parts = [];
    if (direccion.comuna?.nombre) parts.push(direccion.comuna.nombre);
    if (direccion.comuna?.provincia?.region?.nombre)
      parts.push(direccion.comuna.provincia.region.nombre);
    return parts.join(", ");
  };

  return (
    <div className="rounded-md border border-[#798283]/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[#798283] font-medium">
              Nombre/Dirección
            </TableHead>
            <TableHead className="text-[#798283] font-medium">
              Contacto
            </TableHead>
            <TableHead className="text-[#798283] font-medium">
              Ubicación
            </TableHead>
            <TableHead className="text-[#798283] font-medium text-center">
              Frecuencia
            </TableHead>
            <TableHead className="text-[#798283] font-medium text-center">
              Estado
            </TableHead>
            <TableHead className="text-[#798283] font-medium text-center">
              Tipo/Origen
            </TableHead>
            <TableHead className="text-[#798283] font-medium text-center">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((direccion) => (
            <TableRow
              key={direccion.id}
              className="hover:bg-[#798283]/5 transition-colors duration-150"
            >
              <TableCell>
                <div>
                  <div className="font-medium text-[#798283]">
                    {direccion.nombre || "Sin nombre"}
                  </div>
                  <div className="text-sm text-[#798283]/70">
                    {direccion.direccionTexto}
                  </div>
                  {direccion.referencia && (
                    <div className="text-xs text-[#798283]/50 mt-1">
                      Ref: {direccion.referencia}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                <div>
                  {direccion.contacto && (
                    <div className="font-medium">{direccion.contacto}</div>
                  )}
                  {direccion.telefono && (
                    <div className="text-[#798283]/70">
                      {direccion.telefono}
                    </div>
                  )}
                  {direccion.email && (
                    <div className="text-[#798283]/70 text-xs">
                      {direccion.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {getLocationInfo(direccion)}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-[#798283]">
                    {direccion.frecuencia}
                  </span>
                  {direccion.ultimaVezUsada && (
                    <div className="text-xs text-[#798283]/50">
                      {formatDate(direccion.ultimaVezUsada)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {getEstadoBadge(direccion.activo)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 items-center">
                  {getPrincipalBadge(direccion.esPrincipal)}
                  {getOrigenBadge(direccion.origen)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2 justify-center">
                  {canView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(direccion)}
                      className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                    >
                      Ver
                    </Button>
                  )}
                  {canView && direccion.latitud && direccion.longitud && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(direccion)}
                      className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      title="Ver en mapa"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(direccion)}
                      className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                    >
                      Editar
                    </Button>
                  )}
                  {canDelete && direccion.activo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(direccion)}
                      className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  )}
                  {canActivate && !direccion.activo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onActivate(direccion.id)}
                      className="h-8 px-2 text-green-600 hover:text-green-800 hover:bg-green-50"
                    >
                      Activar
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
