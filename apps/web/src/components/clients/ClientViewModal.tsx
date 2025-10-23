import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/types/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ClientViewModalProps {
  client: Client;
  onClose: () => void;
  onEdit: () => void;
  canManageClients: boolean;
}

export const ClientViewModal: React.FC<ClientViewModalProps> = ({
  client,
  onClose,
  onEdit,
  canManageClients,
}) => {
  const formatDate = (date: Date) => {
    return format(new Date(date), "PPP", { locale: es });
  };

  return (
    <div className="fixed inset-0 bg-zinc-500/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {client.nombre}
              </h2>
              <div className="flex items-center gap-2 mt-2">
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
                <Badge variant="outline" className="text-muted-foreground">
                  {client.tipo}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Información Básica
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      RUT
                    </label>
                    <p className="text-foreground">{client.rut}</p>
                  </div>

                  {client.razonSocial && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Razón Social
                      </label>
                      <p className="text-foreground">{client.razonSocial}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tipo de Entidad
                    </label>
                    <p className="text-foreground capitalize">
                      {client.tipoEntidad}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Información de Contacto
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Contacto Principal
                    </label>
                    <p className="text-foreground">{client.contacto}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-foreground">
                      <a
                        href={`mailto:${client.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {client.email}
                      </a>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Teléfono
                    </label>
                    <p className="text-foreground">
                      <a
                        href={`tel:${client.telefono}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {client.telefono}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Additional Info */}
            <div className="space-y-6">
              {/* Location Information */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Ubicación
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Dirección
                    </label>
                    <p className="text-foreground">{client.direccion}</p>
                  </div>

                  {client.comuna && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Comuna
                      </label>
                      <p className="text-foreground">
                        {client.comuna.nombre}
                        {client.comuna.region &&
                          `, ${client.comuna.region.nombre}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* System Information */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Información del Sistema
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Estado
                    </label>
                    <p className="text-foreground capitalize">
                      {client.estado}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Creado
                    </label>
                    <p className="text-foreground">
                      {formatDate(client.createdAt)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Última Actualización
                    </label>
                    <p className="text-foreground">
                      {formatDate(client.updatedAt)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      ID del Cliente
                    </label>
                    <p className="text-foreground font-mono text-sm">
                      {client.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {canManageClients && (
              <Button
                onClick={onEdit}
                className="bg-brand hover:bg-brand/90 text-white"
              >
                Editar Cliente
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
