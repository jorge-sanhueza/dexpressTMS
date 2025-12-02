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
import { Eye, Edit, X, Copy, Truck, Calendar } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OrdersTableProps {
  data: Order[];
  onEdit: (order: Order) => void;
  onView: (order: Order) => void;
  onCancel: (order: Order) => void;
  onDuplicate?: (order: Order) => void;
  onPlanificar?: (order: Order) => void;
  onAddSlot?: (order: Order) => void;
  canView: boolean;
  canEdit: boolean;
  canCancel: boolean;
  canDuplicate?: boolean;
  canPlanificar?: boolean;
  canAddSlot?: boolean;
  isLoading?: boolean;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  data,
  onEdit,
  onView,
  onCancel,
  onDuplicate,
  onPlanificar,
  onAddSlot,
  canView,
  canEdit,
  canCancel,
  canDuplicate = false,
  canPlanificar = false,
  canAddSlot = false,
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
        label: string;
        variant: "default" | "secondary" | "outline";
        className: string;
        icon?: string;
      };
    } = {
      PENDIENTE: {
        label: "Pendiente",
        variant: "secondary",
        className:
          "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
      },
      PLANIFICADA: {
        label: "Planificada",
        variant: "default",
        className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      },
      EN_TRANSPORTE: {
        label: "En Transporte",
        variant: "default",
        className:
          "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
      },
      ENTREGADA: {
        label: "Entregada",
        variant: "default",
        className:
          "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
      },
      CANCELADA: {
        label: "Cancelada",
        variant: "secondary",
        className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
      },
    };

    const config = estadoConfig[estado] || {
      label: estado.replace("_", " "),
      variant: "outline",
      className: "bg-gray-50 text-gray-700 border-gray-200",
    };

    return (
      <Badge variant={config.variant} className={`border ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTipoTarifaLabel = (tipoTarifa: string) => {
    return tipoTarifa === "PESO_VOLUMEN" ? "Peso/Volumen" : "Equipo";
  };

  return (
    <TooltipProvider>
      <div className="rounded-md border border-[#798283]/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#798283]/5">
              <TableHead className="text-[#798283] font-medium text-center">
                Código
              </TableHead>
              <TableHead className="text-[#798283] font-medium text-center">
                OT
              </TableHead>
              <TableHead className="text-[#798283] font-medium text-center">
                Cliente
              </TableHead>
              <TableHead className="text-[#798283] font-medium text-center">
                Fecha Orden
              </TableHead>
              <TableHead className="text-[#798283] font-medium text-center">
                Estado
              </TableHead>
              <TableHead className="text-[#798283] font-medium text-center">
                Tarifa
              </TableHead>
              <TableHead className="text-[#798283] font-medium text-center">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((order) => (
              <TableRow
                key={order.id}
                className="hover:bg-[#798283]/2 transition-colors duration-150"
              >
                <TableCell className="font-medium text-[#798283] text-center">
                  <div className="flex flex-col">
                    <span>{order.codigo}</span>
                    {order.equipo && (
                      <span className="text-xs text-[#798283]/70">
                        {order.equipo.patente}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-[#798283] text-center">
                  {order.numeroOt}
                </TableCell>
                <TableCell className="text-sm text-[#798283]">
                  <div className="flex flex-col">
                    <span>
                      {order.cliente?.nombre ||
                        order.cliente?.razonSocial ||
                        "N/A"}
                    </span>
                    <span className="text-xs text-[#798283]/70">
                      {order.cliente?.rut || ""}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-[#798283] text-center">
                  <div className="flex flex-col">
                    <span>{formatDate(order.fecha)}</span>
                    {order.fechaEntregaEstimada && (
                      <span className="text-xs text-[#798283]/70">
                        Entrega: {formatDate(order.fechaEntregaEstimada)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    {getEstadoBadge(order.estado)}
                    {order.planificaciones &&
                      order.planificaciones.length > 0 && (
                        <span className="text-xs text-blue-600">
                          {order.planificaciones.length} planif.
                        </span>
                      )}
                    {order.retiros && order.retiros.length > 0 && (
                      <span className="text-xs text-purple-600">
                        {order.retiros.length} retiros
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-[#798283] text-center">
                  <div className="flex flex-col">
                    <span>{getTipoTarifaLabel(order.tipoTarifa)}</span>
                    {(order.pesoTotalKg || order.volumenTotalM3) && (
                      <span className="text-xs text-[#798283]/70">
                        {order.pesoTotalKg ? `${order.pesoTotalKg} kg` : ""}
                        {order.pesoTotalKg && order.volumenTotalM3 ? " / " : ""}
                        {order.volumenTotalM3
                          ? `${order.volumenTotalM3} m³`
                          : ""}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {canView && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(order)}
                            className="h-8 w-8 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </TooltipTrigger>
                      <TooltipContent>Ver detalles</TooltipContent>
                    </Tooltip>

                    {canEdit &&
                      order.estado !== "CANCELADA" &&
                      order.estado !== "ENTREGADA" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(order)}
                              className="h-8 w-8 text-[#798283] hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar orden</TooltipContent>
                        </Tooltip>
                      )}

                    {canDuplicate && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDuplicate?.(order)}
                            className="h-8 w-8 text-[#798283] hover:text-green-600 hover:bg-green-50"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Duplicar orden</TooltipContent>
                      </Tooltip>
                    )}

                    {canPlanificar && order.estado === "PENDIENTE" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onPlanificar?.(order)}
                            className="h-8 w-8 text-[#798283] hover:text-purple-600 hover:bg-purple-50"
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Planificar orden</TooltipContent>
                      </Tooltip>
                    )}

                    {canAddSlot &&
                      (order.estado === "PENDIENTE" ||
                        order.estado === "PLANIFICADA") && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onAddSlot?.(order)}
                              className="h-8 w-8 text-[#798283] hover:text-orange-600 hover:bg-orange-50"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Agregar slot</TooltipContent>
                        </Tooltip>
                      )}

                    {canCancel &&
                      order.estado !== "CANCELADA" &&
                      order.estado !== "ENTREGADA" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onCancel(order)}
                              className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Cancelar orden</TooltipContent>
                        </Tooltip>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};
