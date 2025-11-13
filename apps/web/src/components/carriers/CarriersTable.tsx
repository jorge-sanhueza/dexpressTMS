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
import type { Carrier } from "@/types/carrier";

interface CarriersTableProps {
  data: Carrier[];
  onEdit: (carrier: Carrier) => void;
  onView: (carrier: Carrier) => void;
  onDelete: (carrier: Carrier) => void;
  onActivate: (id: string) => void;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canActivate: boolean;
  isLoading?: boolean;
}

export const CarriersTable: React.FC<CarriersTableProps> = ({
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
        <span className="ml-2 text-[#798283]/70">Cargando carriers...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-[#798283]/70 text-lg mb-2">
            No se encontraron carriers
          </div>
          <div className="text-sm text-[#798283]/50">
            Comienza agregando tu primer carrier o ajusta los filtros de
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

  const getEquipmentCount = (carrier: Carrier) => {
    return carrier.equipos?.length || 0;
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
              Equipos
            </TableHead>
            <TableHead className="text-[#798283] font-medium">Estado</TableHead>
            <TableHead className="text-[#798283] font-medium">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((carrier) => (
            <TableRow
              key={carrier.id}
              className="hover:bg-[#798283]/5 transition-colors duration-150"
            >
              <TableCell>
                <div>
                  <div className="font-medium text-[#798283]">
                    {carrier.nombre}
                  </div>
                  <div className="text-sm text-[#798283]/70">
                    {carrier.razonSocial}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {carrier.rut}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {carrier.contacto}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {carrier.email}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[#798283]">
                  {getEquipmentCount(carrier)} equipo
                  {getEquipmentCount(carrier) !== 1 ? "s" : ""}
                </Badge>
              </TableCell>
              <TableCell>{getEstadoBadge(carrier.activo)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {canView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(carrier)}
                      className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                    >
                      Ver
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(carrier)}
                      className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                    >
                      Editar
                    </Button>
                  )}
                  {canDelete && carrier.activo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(carrier)}
                      className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  )}
                  {canActivate && !carrier.activo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onActivate(carrier.id)}
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
