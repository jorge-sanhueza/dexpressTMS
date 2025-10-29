import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Client } from "@/types/client";

interface ClientsTableProps {
  data: Client[];
  onEdit: (client: Client) => void;
  onView: (client: Client) => void;
  onDeactivate: (client: Client) => void;
  onActivate: (id: string) => void;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canActivate: boolean;
  isLoading?: boolean;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  data,
  onEdit,
  onView,
  onDeactivate,
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
        <span className="ml-2 text-[#798283]/70">Cargando clientes...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-[#798283]/70 text-lg mb-2">
            No se encontraron clientes
          </div>
          <div className="text-sm text-[#798283]/50">
            Comienza agregando tu primer cliente o ajusta los filtros de
            búsqueda.
          </div>
        </div>
      </div>
    );
  }

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
          {data.map((client) => (
            <TableRow
              key={client.id}
              className="hover:bg-[#798283]/5 transition-colors duration-150"
            >
              <TableCell>
                <div>
                  <div className="font-medium text-[#798283]">
                    {client.nombre}
                  </div>
                  {client.razonSocial && (
                    <div className="text-sm text-[#798283]/70">
                      {client.razonSocial}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {client.rut}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {client.contacto}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {client.email}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {client.telefono}
              </TableCell>
              <TableCell>
                <Badge
                  variant={client.activo ? "default" : "secondary"}
                  className={
                    client.activo
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {client.activo ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {canView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(client)}
                      className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                    >
                      Ver
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(client)}
                      className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                    >
                      Editar
                    </Button>
                  )}
                  {canDelete && client.activo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeactivate(client)}
                      className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      Desactivar
                    </Button>
                  )}
                  {canActivate && !client.activo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onActivate(client.id)}
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
