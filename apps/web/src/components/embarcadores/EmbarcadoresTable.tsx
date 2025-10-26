import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { Embarcador } from "@/types/shipper";

interface EmbarcadoresTableProps {
  data: Embarcador[];
  onEdit: (embarcador: Embarcador) => void;
  onView: (embarcador: Embarcador) => void;
  onDelete: (embarcador: Embarcador) => void;
  onActivate: (id: string) => void;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canActivate: boolean;
  isLoading?: boolean;
}

export const EmbarcadoresTable: React.FC<EmbarcadoresTableProps> = ({
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
        <span className="ml-2 text-[#798283]/70">Cargando embarcadores...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#798283]/70">No se encontraron embarcadores</p>
      </div>
    );
  }

  const getTipoBadge = (tipo: string) => {
    const variants = {
      exportador: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      importador: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      nacional: "bg-green-100 text-green-800 hover:bg-green-100",
    };

    const labels = {
      exportador: "Exportador",
      importador: "Importador",
      nacional: "Nacional",
    };

    return (
      <Badge
        variant="secondary"
        className={variants[tipo as keyof typeof variants]}
      >
        {labels[tipo as keyof typeof labels]}
      </Badge>
    );
  };

  const getEstadoBadge = (activo: boolean) => {
    return (
      <Badge
        variant={activo ? "default" : "secondary"}
        className={
          activo
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : "bg-red-100 text-red-800 hover:bg-red-100"
        }
      >
        {activo ? "Activo" : "Inactivo"}
      </Badge>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#798283]/20">
            <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
              Nombre
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
              RUT
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
              Contacto
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
              Email
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
              Teléfono
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
              Tipo
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
              Estado
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-[#798283]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((embarcador) => (
            <tr
              key={embarcador.id}
              className="border-b border-[#798283]/10 hover:bg-[#798283]/5"
            >
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-[#798283]">
                    {embarcador.nombre}
                  </div>
                  <div className="text-sm text-[#798283]/70">
                    {embarcador.razonSocial}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-[#798283]">
                {embarcador.rut}
              </td>
              <td className="py-3 px-4 text-sm text-[#798283]">
                {embarcador.contacto}
              </td>
              <td className="py-3 px-4 text-sm text-[#798283]">
                {embarcador.email}
              </td>
              <td className="py-3 px-4 text-sm text-[#798283]">
                {embarcador.telefono}
              </td>
              <td className="py-3 px-4">{getTipoBadge(embarcador.tipo)}</td>
              <td className="py-3 px-4">{getEstadoBadge(embarcador.activo)}</td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  {canView && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(embarcador)}
                      className="text-[#798283] border-[#798283]/20 hover:bg-[#798283]/10"
                    >
                      Ver
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(embarcador)}
                      className="text-[#798283] border-[#798283]/20 hover:bg-[#798283]/10"
                    >
                      Editar
                    </Button>
                  )}
                  {canDelete && embarcador.activo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(embarcador)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  )}
                  {canActivate && !embarcador.activo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onActivate(embarcador.id)}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      Activar
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
