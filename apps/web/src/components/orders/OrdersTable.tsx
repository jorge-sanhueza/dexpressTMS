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
import type { Order } from "@/types/order";

interface OrdersTableProps {
  data: Order[];
  onEdit: (order: Order) => void;
  onView: (order: Order) => void;
  onCancel: (order: Order) => void;
  canView: boolean;
  canEdit: boolean;
  canCancel: boolean;
  isLoading?: boolean;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  data,
  onEdit,
  onView,
  onCancel,
  canView,
  canEdit,
  canCancel,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D42B22]"></div>
        <span className="ml-2 text-[#798283]/70">Cargando órdenes...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-[#798283]/70 text-lg mb-2">
            No se encontraron órdenes
          </div>
          <div className="text-sm text-[#798283]/50">
            Comienza agregando tu primera orden o ajusta los filtros de
            búsqueda.
          </div>
        </div>
      </div>
    );
  }

  const getEstadoBadge = (estado: string) => {
    const estadoConfig: {
      [key: string]: {
        variant: "default" | "secondary" | "outline";
        className: string;
      };
    } = {
      PENDIENTE: {
        variant: "secondary",
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      },
      PLANIFICADA: {
        variant: "default",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      },
      EN_TRANSPORTE: {
        variant: "default",
        className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      },
      ENTREGADA: {
        variant: "default",
        className: "bg-green-100 text-green-800 hover:bg-green-100",
      },
      CANCELADA: {
        variant: "secondary",
        className: "bg-red-100 text-red-800 hover:bg-red-100",
      },
    };

    const config = estadoConfig[estado] || {
      variant: "outline",
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {estado.replace("_", " ")}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-CL");
  };

  return (
    <div className="rounded-md border border-[#798283]/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[#798283] font-medium">Código</TableHead>
            <TableHead className="text-[#798283] font-medium">OT</TableHead>
            <TableHead className="text-[#798283] font-medium">
              Cliente
            </TableHead>
            <TableHead className="text-[#798283] font-medium">Fecha</TableHead>
            <TableHead className="text-[#798283] font-medium">Estado</TableHead>
            <TableHead className="text-[#798283] font-medium">
              Tipo Tarifa
            </TableHead>
            <TableHead className="text-[#798283] font-medium">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((order) => (
            <TableRow
              key={order.id}
              className="hover:bg-[#798283]/5 transition-colors duration-150"
            >
              <TableCell className="font-medium text-[#798283]">
                {order.codigo}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {order.numeroOt}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {order.cliente?.nombre || "N/A"}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {formatDate(order.fecha)}
              </TableCell>
              <TableCell>{getEstadoBadge(order.estado)}</TableCell>
              <TableCell className="text-sm text-[#798283]">
                {order.tipoTarifa.replace("_", " ")}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {canView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(order)}
                      className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                    >
                      Ver
                    </Button>
                  )}
                  {canEdit && order.estado !== "CANCELADA" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(order)}
                      className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                    >
                      Editar
                    </Button>
                  )}
                  {canCancel && order.estado !== "CANCELADA" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancel(order)}
                      className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      Cancelar
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
