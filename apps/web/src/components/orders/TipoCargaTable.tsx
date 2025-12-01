import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { TipoCarga } from "@/services/tipoCargaService";

interface TipoCargaTableProps {
  data: TipoCarga[];
  onEdit: (tipoCarga: TipoCarga) => void;
  onDelete: (tipoCarga: TipoCarga) => void;
  onDeactivate?: (tipoCarga: TipoCarga) => void;
  canEdit: boolean;
  canDelete: boolean;
  canActivate: boolean;
  isLoading?: boolean;
}

export const TipoCargaTable: React.FC<TipoCargaTableProps> = ({
  data,
  onEdit,
  onDelete,
  onDeactivate,
  canEdit,
  canDelete,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D42B22]"></div>
        <span className="ml-3 text-[#798283]">Cargando tipos de carga...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-2xl font-bold text-[#798283] mb-2">
          No se encontraron tipos de carga
        </div>
        <p className="text-[#798283]/70">
          No hay tipos de carga que coincidan con los criterios de búsqueda.
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
              Nombre
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-[#798283]">
              Características
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
          {data.map((tipoCarga) => (
            <tr
              key={tipoCarga.id}
              className="border-b border-[#798283]/10 hover:bg-[#EFF4F9] transition-colors"
            >
              <td className="py-3 px-4">
                <div className="font-medium text-[#798283]">
                  {tipoCarga.nombre}
                </div>
                {tipoCarga.observaciones && (
                  <div className="text-sm text-[#798283]/70 mt-1">
                    {tipoCarga.observaciones}
                  </div>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {tipoCarga.requiereEquipoEspecial && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 text-xs"
                    >
                      Equipo Especial
                    </Badge>
                  )}
                  {tipoCarga.requiereTempControlada && (
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-700 text-xs"
                    >
                      Temp. Controlada
                    </Badge>
                  )}
                  {!tipoCarga.requiereEquipoEspecial &&
                    !tipoCarga.requiereTempControlada && (
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-700 text-xs border border-gray-300"
                      >
                        Estándar
                      </Badge>
                    )}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  <Badge
                    variant={tipoCarga.activo ? "default" : "secondary"}
                    className={
                      tipoCarga.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {tipoCarga.activo ? "Activo" : "Inactivo"}
                  </Badge>
                  {!tipoCarga.visible && (
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
                      onClick={() => onEdit(tipoCarga)}
                      className="border-[#798283]/20 text-[#798283] hover:bg-[#798283]/10"
                    >
                      Editar
                    </Button>
                  )}
                  {canDelete && tipoCarga.activo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeactivate?.(tipoCarga)}
                      className="border-orange-200 text-orange-600 hover:bg-orange-50"
                    >
                      Desactivar
                    </Button>
                  )}
                  {canDelete && !tipoCarga.activo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(tipoCarga)}
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
