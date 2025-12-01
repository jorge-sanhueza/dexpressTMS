// components/tipoServicio/TipoServicioTable.tsx
import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { TipoServicio } from "@/services/tipoServicioService";

interface TipoServicioTableProps {
  data: TipoServicio[];
  onEdit: (tipoServicio: TipoServicio) => void;
  onDelete: (tipoServicio: TipoServicio) => void;
  onDeactivate?: (tipoServicio: TipoServicio) => void;
  canEdit: boolean;
  canDelete: boolean;
  canActivate: boolean;
  isLoading?: boolean;
}

export const TipoServicioTable: React.FC<TipoServicioTableProps> = ({
  data,
  onEdit,
  onDelete,
  onDeactivate,
  canEdit,
  canDelete,
  canActivate,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D42B22]"></div>
        <span className="ml-3 text-[#798283]">
          Cargando tipos de servicio...
        </span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-2xl font-bold text-[#798283] mb-2">
          No se encontraron tipos de servicio
        </div>
        <p className="text-[#798283]/70">
          No hay tipos de servicio que coincidan con los criterios de búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#798283]/20">
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#798283]">
              Código
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#798283]">
              Nombre
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#798283]">
              Descripción
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#798283]">
              Orden
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#798283]">
              Estado
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#798283]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((tipoServicio) => (
            <tr
              key={tipoServicio.id}
              className="border-b border-[#798283]/10 hover:bg-[#EFF4F9] transition-colors"
            >
              <td className="py-3 px-4">
                <div className="font-mono font-bold text-[#798283] bg-[#798283]/10 px-2 py-1 rounded inline-block">
                  {tipoServicio.codigo}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="font-medium text-[#798283]">
                  {tipoServicio.nombre}
                </div>
              </td>
              <td className="py-3 px-4">
                {tipoServicio.descripcion ? (
                  <div className="text-sm text-[#798283]/70">
                    {tipoServicio.descripcion}
                  </div>
                ) : (
                  <span className="text-xs text-[#798283]/50">
                    Sin descripción
                  </span>
                )}
              </td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-[#798283]/10 rounded text-sm font-medium text-[#798283]">
                  {tipoServicio.orden}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  <Badge
                    variant={tipoServicio.activo ? "default" : "secondary"}
                    className={
                      tipoServicio.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {tipoServicio.activo ? "Activo" : "Inactivo"}
                  </Badge>
                  {!tipoServicio.visible && (
                    <Badge
                      variant="secondary"
                      className="bg-orange-50 text-orange-700"
                    >
                      Oculto
                    </Badge>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(tipoServicio)}
                      className="border-[#798283]/20 text-[#798283] hover:bg-[#798283]/10"
                    >
                      Editar
                    </Button>
                  )}
                  {canDelete && tipoServicio.activo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeactivate?.(tipoServicio)}
                      className="border-orange-200 text-orange-600 hover:bg-orange-50"
                    >
                      Desactivar
                    </Button>
                  )}
                  {canDelete && !tipoServicio.activo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(tipoServicio)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Eliminar
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
