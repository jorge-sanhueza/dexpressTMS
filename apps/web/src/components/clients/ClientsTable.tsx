import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/types/client";

interface ClientsTableProps {
  data: Client[];
  onEdit: (client: Client) => void;
  onView: (client: Client) => void;
  onDeactivate: (client: Client) => void;
  onActivate: (id: string) => void;
  canManageClients: boolean;
  isLoading?: boolean;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  data,
  onEdit,
  onView,
  onDeactivate,
  onActivate,
  canManageClients,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
        <span className="ml-2 text-muted-foreground">Cargando clientes...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se encontraron clientes</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-foreground">
              Nombre
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-foreground">
              RUT
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-foreground">
              Contacto
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-foreground">
              Email
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-foreground">
              Teléfono
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-foreground">
              Estado
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-foreground">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((client) => (
            <tr
              key={client.id}
              className="border-b border-border hover:bg-muted/50"
            >
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-foreground">
                    {client.nombre}
                  </div>
                  {client.razonSocial && (
                    <div className="text-sm text-muted-foreground">
                      {client.razonSocial}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-sm">{client.rut}</td>
              <td className="py-3 px-4 text-sm">{client.contacto}</td>
              <td className="py-3 px-4 text-sm">{client.email}</td>
              <td className="py-3 px-4 text-sm">{client.telefono}</td>
              <td className="py-3 px-4">
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
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(client)}
                    className="text-zinc-500 border-blue-200 hover:bg-blue-50"
                  >
                    Ver
                  </Button>
                  {canManageClients && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(client)}
                        className="text-zinc-500 border-blue-200 hover:bg-blue-50"
                      >
                        Editar
                      </Button>
                      {client.activo ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeactivate(client)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Desactivar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onActivate(client.id)}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          Activar
                        </Button>
                      )}
                    </>
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
