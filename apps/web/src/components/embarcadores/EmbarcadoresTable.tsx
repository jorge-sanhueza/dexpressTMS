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
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-[#798283]/70 text-lg mb-2">
            No se encontraron embarcadores
          </div>
          <div className="text-sm text-[#798283]/50">
            Comienza agregando tu primer embarcador o ajusta los filtros de
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
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : "bg-red-100 text-red-800 hover:bg-red-100"
        }
      >
        {activo ? "Activo" : "Inactivo"}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border border-[#798283]/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[#798283] font-medium">Nombre</TableHead>
            <TableHead className="text-[#798283] font-medium">RUT</TableHead>
            <TableHead className="text-[#798283] font-medium">
              Contacto
            </TableHead>
            <TableHead className="text-[#798283] font-medium">Email</TableHead>
            <TableHead className="text-[#798283] font-medium">
              Teléfono
            </TableHead>
            <TableHead className="text-[#798283] font-medium">Estado</TableHead>
            <TableHead className="text-[#798283] font-medium">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((embarcador) => (
            <TableRow
              key={embarcador.id}
              className="hover:bg-[#798283]/5 transition-colors duration-150"
            >
              <TableCell>
                <div>
                  <div className="font-medium text-[#798283]">
                    {embarcador.nombre}
                  </div>
                  <div className="text-sm text-[#798283]/70">
                    {embarcador.razonSocial}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {embarcador.rut}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {embarcador.contacto}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {embarcador.email}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {embarcador.telefono}
              </TableCell>
              <TableCell>{getEstadoBadge(embarcador.activo)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {canView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(embarcador)}
                      className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                    >
                      Ver
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(embarcador)}
                      className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                    >
                      Editar
                    </Button>
                  )}
                  {canDelete && embarcador.activo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(embarcador)}
                      className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  )}
                  {canActivate && !embarcador.activo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onActivate(embarcador.id)}
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
