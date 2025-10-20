import React, { useState } from "react";
import { WideLayout } from "../layout/WideLayout";
import { ClientsTable } from "./ClientsTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useClients,
  useDeactivateClient,
  useActivateClient,
} from "../../hooks/useClients";
import { useAuthStore } from "../../store/authStore";
import type { Client, ClientsFilter } from "@/types/client";
import { Input } from "@/components/ui/input";

export const ClientsList: React.FC = () => {
  const { hasPermission } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(
    undefined
  );

  // Filters state
  const [filters, setFilters] = useState<ClientsFilter>({
    search: "",
    activo: undefined,
  });

  // Use TanStack Query hooks
  const { data: clientsData, isLoading, error } = useClients(filters);

  const clients = clientsData?.clients || [];

  const deactivateClientMutation = useDeactivateClient();
  const activateClientMutation = useActivateClient();

  const canManageClients = hasPermission("admin_access");

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    // Debounce search - update filters after a delay
    setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: value || undefined,
      }));
    }, 300);
  };

  const handleStatusFilter = (activo: boolean | undefined) => {
    setStatusFilter(activo);
    setFilters((prev) => ({
      ...prev,
      activo,
    }));
  };

  const handleDeactivate = async (id: string) => {
    if (window.confirm("¿Está seguro de que desea desactivar este cliente?")) {
      try {
        await deactivateClientMutation.mutateAsync(id);
      } catch (err) {
        console.error("Error deactivating client:", err);
      }
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateClientMutation.mutateAsync(id);
    } catch (err) {
      console.error("Error activating client:", err);
    }
  };

  const handleEdit = (client: Client) => {
    // TODO: Implement edit functionality
    console.log("Edit client:", client);
  };

  const handleView = (client: Client) => {
    // TODO: Implement view functionality
    console.log("View client:", client);
  };

  const handleCreateClient = () => {
    // TODO: Implement create client functionality
    console.log("Create new client");
  };

  return (
    <WideLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Clientes</h2>
              <p className="text-muted-foreground mt-1">
                Gestiona los clientes de tu organización
              </p>
            </div>
            {canManageClients && (
              <Button
                onClick={handleCreateClient}
                className="bg-brand hover:bg-brand/90 text-white"
              >
                + Nuevo Cliente
              </Button>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {(error ||
          deactivateClientMutation.error ||
          activateClientMutation.error) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-700">
              {error?.message ||
                deactivateClientMutation.error?.message ||
                activateClientMutation.error?.message}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                Buscar clientes
              </label>
              <Input
                type="text"
                placeholder="Buscar por nombre, RUT, contacto o email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <label className="block text-sm font-medium text-foreground mb-2 sm:mb-0 sm:mr-2 sm:self-center">
                Estado:
              </label>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter(undefined)}
                  className={
                    statusFilter === undefined
                      ? "bg-brand hover:bg-brand/90 text-white"
                      : ""
                  }
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter(true)}
                  className={
                    statusFilter === true
                      ? "bg-brand hover:bg-brand/90 text-white"
                      : ""
                  }
                >
                  Activos
                </Button>
                <Button
                  variant={statusFilter === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilter(false)}
                  className={
                    statusFilter === false
                      ? "bg-brand hover:bg-brand/90 text-white"
                      : ""
                  }
                >
                  Inactivos
                </Button>
              </div>
            </div>
          </div>

          {/* Active filters display */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">
              Filtros activos:
            </span>
            {searchTerm && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                Búsqueda: "{searchTerm}"
              </Badge>
            )}
            {statusFilter === true && (
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Estado: Activos
              </Badge>
            )}
            {statusFilter === false && (
              <Badge variant="secondary" className="bg-red-50 text-red-700">
                Estado: Inactivos
              </Badge>
            )}
            {(searchTerm || statusFilter !== undefined) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter(undefined);
                  setFilters({ search: "", activo: undefined });
                }}
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-border">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Lista de Clientes
              </h3>
              <div className="text-sm text-muted-foreground">
                {clients.length} {clients.length === 1 ? "cliente" : "clientes"}{" "}
                encontrados
              </div>
            </div>

            <ClientsTable
              data={clients}
              onEdit={handleEdit}
              onView={handleView}
              onDeactivate={handleDeactivate}
              onActivate={handleActivate}
              canManageClients={canManageClients}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Loading state */}
        {isLoading && clients.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            <span className="ml-3 text-muted-foreground">
              Cargando clientes...
            </span>
          </div>
        )}
      </div>
    </WideLayout>
  );
};
