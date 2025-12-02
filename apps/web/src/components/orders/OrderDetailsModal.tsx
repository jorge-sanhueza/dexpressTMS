import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Order } from "@/types/order";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (order: Order) => void;
  onDuplicate?: (order: Order) => void;
  onCancel?: (order: Order) => void;
  canEdit?: boolean;
  canDuplicate?: boolean;
  canCancel?: boolean;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onCancel,
  canEdit = false,
  canDuplicate = false,
  canCancel = false,
}) => {
  if (!isOpen || !order) return null;

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PLANIFICADA":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "EN_TRANSPORTE":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ENTREGADA":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELADA":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTipoTarifaText = (tipoTarifa: string) => {
    switch (tipoTarifa) {
      case "PESO_VOLUMEN":
        return "Peso/Volumen";
      case "EQUIPO":
        return "Por Equipo";
      default:
        return tipoTarifa;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#798283]/20">
            <div>
              <h2 className="text-2xl font-bold text-[#798283]">
                Orden #{order.codigo}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={`border ${getStatusColor(order.estado)}`}>
                  {order.estado.replace("_", " ")}
                </Badge>
                <span className="text-sm text-[#798283]/70">
                  OT: {order.numeroOt}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-[#798283]/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Order Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column 1: Basic Info */}
              <div className="space-y-6">
                {/* Dates */}
                <div className="bg-[#EFF4F9] p-4 rounded-lg">
                  <h3 className="font-semibold text-[#798283] mb-3">
                    Fechas
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#798283]/70">
                        Fecha de orden:
                      </span>
                      <span className="text-sm font-medium text-[#798283]">
                        {format(new Date(order.fecha), "PPP", { locale: es })}
                      </span>
                    </div>
                    {order.fechaEntregaEstimada && (
                      <div className="flex justify-between">
                        <span className="text-sm text-[#798283]/70">
                          Entrega estimada:
                        </span>
                        <span className="text-sm font-medium text-[#798283]">
                          {format(
                            new Date(order.fechaEntregaEstimada),
                            "PPP",
                            { locale: es }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Client */}
                <div className="bg-[#EFF4F9] p-4 rounded-lg">
                  <h3 className="font-semibold text-[#798283] mb-3">
                    Cliente
                  </h3>
                  {order.cliente ? (
                    <div>
                      <div className="font-medium text-[#798283]">
                        {order.cliente.nombre}
                      </div>
                      <div className="text-sm text-[#798283]/70">
                        RUT: {order.cliente.rut}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-[#798283]/70">
                      No especificado
                    </div>
                  )}
                </div>

                {/* Service Details */}
                <div className="bg-[#EFF4F9] p-4 rounded-lg">
                  <h3 className="font-semibold text-[#798283] mb-3">
                    Detalles del Servicio
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#798283]/70">
                        Tipo de carga:
                      </span>
                      <span className="text-sm font-medium text-[#798283]">
                        {order.tipoCarga?.nombre || "No especificado"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#798283]/70">
                        Tipo de servicio:
                      </span>
                      <span className="text-sm font-medium text-[#798283]">
                        {order.tipoServicio?.nombre || "No especificado"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#798283]/70">
                        Tipo de tarifa:
                      </span>
                      <span className="text-sm font-medium text-[#798283]">
                        {getTipoTarifaText(order.tipoTarifa)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Parties & Measurements */}
              <div className="space-y-6">
                {/* Parties */}
                <div className="bg-[#EFF4F9] p-4 rounded-lg">
                  <h3 className="font-semibold text-[#798283] mb-3">
                    Partes Involucradas
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-[#798283]/70 mb-1">
                        Remitente
                      </div>
                      {order.remitente ? (
                        <div>
                          <div className="font-medium text-[#798283]">
                            {order.remitente.nombre}
                          </div>
                          <div className="text-sm text-[#798283]/70">
                            RUT: {order.remitente.rut}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-[#798283]/70">
                          No especificado
                        </div>
                      )}
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm font-medium text-[#798283]/70 mb-1">
                        Destinatario
                      </div>
                      {order.destinatario ? (
                        <div>
                          <div className="font-medium text-[#798283]">
                            {order.destinatario.nombre}
                          </div>
                          <div className="text-sm text-[#798283]/70">
                            RUT: {order.destinatario.rut}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-[#798283]/70">
                          No especificado
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Measurements */}
                <div className="bg-[#EFF4F9] p-4 rounded-lg">
                  <h3 className="font-semibold text-[#798283] mb-3">
                    Medidas y Peso
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {order.pesoTotalKg && (
                      <div>
                        <div className="text-sm text-[#798283]/70">
                          Peso Total
                        </div>
                        <div className="font-medium text-[#798283]">
                          {order.pesoTotalKg} kg
                        </div>
                      </div>
                    )}
                    {order.volumenTotalM3 && (
                      <div>
                        <div className="text-sm text-[#798283]/70">
                          Volumen
                        </div>
                        <div className="font-medium text-[#798283]">
                          {order.volumenTotalM3} m³
                        </div>
                      </div>
                    )}
                    {order.altoCm && (
                      <div>
                        <div className="text-sm text-[#798283]/70">Alto</div>
                        <div className="font-medium text-[#798283]">
                          {order.altoCm} cm
                        </div>
                      </div>
                    )}
                    {order.largoCm && (
                      <div>
                        <div className="text-sm text-[#798283]/70">Largo</div>
                        <div className="font-medium text-[#798283]">
                          {order.largoCm} cm
                        </div>
                      </div>
                    )}
                    {order.anchoCm && (
                      <div>
                        <div className="text-sm text-[#798283]/70">Ancho</div>
                        <div className="font-medium text-[#798283]">
                          {order.anchoCm} cm
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Addresses */}
                <div className="bg-[#EFF4F9] p-4 rounded-lg">
                  <h3 className="font-semibold text-[#798283] mb-3">
                    Direcciones
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-[#798283]/70 mb-1">
                        Origen
                      </div>
                      <div className="text-sm text-[#798283]">
                        {order.direccionOrigen?.direccionTexto || "No especificada"}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm font-medium text-[#798283]/70 mb-1">
                        Destino
                      </div>
                      <div className="text-sm text-[#798283]">
                        {order.direccionDestino?.direccionTexto || "No especificada"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Observations */}
            {order.observaciones && (
              <div className="mt-6 bg-[#EFF4F9] p-4 rounded-lg">
                <h3 className="font-semibold text-[#798283] mb-3">
                  Observaciones
                </h3>
                <p className="text-sm text-[#798283] whitespace-pre-wrap">
                  {order.observaciones}
                </p>
              </div>
            )}

            {/* Created Info */}
            <div className="mt-6 pt-4 border-t border-[#798283]/20">
              <div className="text-xs text-[#798283]/50">
                Creado el {format(new Date(order.createdAt), "PPP", { locale: es })} 
                {order.updatedAt && order.updatedAt !== order.createdAt && 
                  ` • Última actualización: ${format(new Date(order.updatedAt), "PPP", { locale: es })}`
                }
              </div>
            </div>
          </div>

          {/* Footer with Actions */}
          <div className="border-t border-[#798283]/20 p-4">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-[#798283]/20 text-[#798283] hover:bg-[#798283]/10"
              >
                Cerrar
              </Button>
              
              {canCancel && order.estado !== "CANCELADA" && (
                <Button
                  variant="outline"
                  onClick={() => onCancel?.(order)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Cancelar Orden
                </Button>
              )}
              
              {canDuplicate && (
                <Button
                  variant="outline"
                  onClick={() => onDuplicate?.(order)}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  Duplicar
                </Button>
              )}
              
              {canEdit && order.estado !== "CANCELADA" && (
                <Button
                  onClick={() => onEdit?.(order)}
                  className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
                >
                  Editar Orden
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};