import React, { useState } from "react";
import { WideLayout } from "../layout/WideLayout";
import { ClientsTable } from "./ClientsTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useClients,
  useDeactivateClient,
  useActivateClient,
  useCreateClient,
  useUpdateClient,
} from "../../hooks/useClients";
import { useAuthStore } from "../../store/authStore";
import type {
  Client,
  ClientsFilter,
  CreateClientData,
  UpdateClientData,
} from "@/types/client";
import { Input } from "@/components/ui/input";
import { ClientForm } from "./ClientForm";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClientViewModal } from "./ClientViewModal";

// Debounce hook for search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const ClientsList: React.FC = () => {
  const { hasModulePermission } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(
    undefined
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  // Alert Dialog state
  const [deactivateDialog, setDeactivateDialog] = useState<{
    isOpen: boolean;
    clientId: string | null;
    clientName: string;
  }>({
    isOpen: false,
    clientId: null,
    clientName: "",
  });

  // Use debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filters state
  const [filters, setFilters] = useState<ClientsFilter>({
    search: "",
    activo: undefined,
  });

  // Update filters when debounced search term changes
  React.useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearchTerm || undefined,
    }));
  }, [debouncedSearchTerm]);

  // Granular permissions for clients module
  const canViewClients = hasModulePermission("clientes", "ver");
  const canCreateClients = hasModulePermission("clientes", "crear");
  const canEditClients = hasModulePermission("clientes", "editar");
  const canDeleteClients = hasModulePermission("clientes", "eliminar");
  const canActivateClients = hasModulePermission("clientes", "activar");

  // If user doesn't have view permission, show unauthorized message
  if (!canViewClients) {
    return (
      <WideLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-4">
              Acceso No Autorizado
            </div>
            <p className="text-muted-foreground">
              No tienes permisos para ver clientes.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Contacta al administrador del sistema para solicitar acceso.
            </p>
          </div>
        </div>
      </WideLayout>
    );
  }

  // Use TanStack Query hooks
  const { data: clientsData, isLoading, error } = useClients(filters);

  const clients = clientsData?.clients || [];

  const deactivateClientMutation = useDeactivateClient();
  const activateClientMutation = useActivateClient();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusFilter = (activo: boolean | undefined) => {
    setStatusFilter(activo);
    setFilters((prev) => ({
      ...prev,
      activo,
    }));
  };

  // Open deactivate confirmation dialog
  const openDeactivateDialog = (client: Client) => {
    setDeactivateDialog({
      isOpen: true,
      clientId: client.id,
      clientName: client.nombre,
    });
  };

  // Close deactivate dialog
  const closeDeactivateDialog = () => {
    setDeactivateDialog({
      isOpen: false,
      clientId: null,
      clientName: "",
    });
  };

  // Handle deactivate confirmation
  const handleDeactivateConfirm = async () => {
    if (!deactivateDialog.clientId) return;

    try {
      await deactivateClientMutation.mutateAsync(deactivateDialog.clientId);
      toast.success("Cliente desactivado correctamente");
      closeDeactivateDialog();
    } catch (err: any) {
      console.error("Error deactivating client:", err);
      toast.error(err.message || "Error al desactivar el cliente");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateClientMutation.mutateAsync(id);
      toast.success("Cliente activado correctamente");
    } catch (err: any) {
      console.error("Error activating client:", err);
      toast.error(err.message || "Error al activar el cliente");
    }
  };

  const handleEdit = (client: Client) => {
    if (canEditClients) {
      setEditingClient(client);
    }
  };

  const handleEditSubmit = async (clientData: UpdateClientData) => {
    if (!editingClient) return;

    try {
      await updateClientMutation.mutateAsync({
        id: editingClient.id,
        clientData,
      });
      setEditingClient(null);
      toast.success("Cliente actualizado correctamente");
    } catch (err: any) {
      console.error("Error updating client:", err);
      toast.error(err.message || "Error al actualizar el cliente");
    }
  };

  const handleEditCancel = () => {
    setEditingClient(null);
  };

  const handleView = (client: Client) => {
    setViewingClient(client);
  };

  const handleViewClose = () => {
    setViewingClient(null);
  };

  const handleCreateClient = () => {
    if (canCreateClients) {
      setIsCreateModalOpen(true);
    }
  };

  const handleCreateSubmit = async (clientData: CreateClientData) => {
    try {
      await createClientMutation.mutateAsync(clientData);
      setIsCreateModalOpen(false);
      toast.success("Cliente creado correctamente");
    } catch (err: any) {
      console.error("Error creating client:", err);

      // Handle specific backend errors
      if (err.message?.includes("RUT already exists")) {
        toast.error("Ya existe un cliente con este RUT");
      } else {
        toast.error(err.message || "Error al crear el cliente");
      }
    }
  };

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter(undefined);
    setFilters({ search: "", activo: undefined });
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
            {canCreateClients && (
              <Button
                onClick={handleCreateClient}
                className="bg-brand hover:bg-brand/90 text-white"
                disabled={createClientMutation.isPending}
              >
                {createClientMutation.isPending
                  ? "Creando..."
                  : "+ Nuevo Cliente"}
              </Button>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {(error ||
          deactivateClientMutation.error ||
          activateClientMutation.error ||
          createClientMutation.error ||
          updateClientMutation.error) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-700">
              {error?.message ||
                deactivateClientMutation.error?.message ||
                activateClientMutation.error?.message ||
                createClientMutation.error?.message ||
                updateClientMutation.error?.message ||
                "Ha ocurrido un error inesperado"}
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
                onClick={handleClearFilters}
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
                {isLoading ? (
                  "Cargando..."
                ) : (
                  <>
                    {clients.length}{" "}
                    {clients.length === 1 ? "cliente" : "clientes"} encontrados
                    {clientsData?.total &&
                      clientsData.total > clients.length &&
                      ` de ${clientsData.total}`}
                  </>
                )}
              </div>
            </div>

            <ClientsTable
              data={clients}
              onEdit={handleEdit}
              onView={handleView}
              onDeactivate={openDeactivateDialog}
              onActivate={handleActivate}
              canView={canViewClients}
              canEdit={canEditClients}
              canDelete={canDeleteClients}
              canActivate={canActivateClients}
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

      {/* Create Client Modal */}
      {isCreateModalOpen && (
        <ClientForm
          onSubmit={
            handleCreateSubmit as (
              data: CreateClientData | UpdateClientData
            ) => void
          }
          onCancel={handleCreateCancel}
          isLoading={createClientMutation.isPending}
        />
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <ClientForm
          client={editingClient}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
          isLoading={updateClientMutation.isPending}
          isEditing={true}
        />
      )}

      {/* View Client Modal */}
      {viewingClient && (
        <ClientViewModal
          client={viewingClient}
          onClose={handleViewClose}
          onEdit={() => {
            setViewingClient(null);
            setEditingClient(viewingClient);
          }}
          canEdit={canEditClients}
        />
      )}

      {/* Deactivate Client Confirmation Dialog */}
      {canDeleteClients && (
        <AlertDialog
          open={deactivateDialog.isOpen}
          onOpenChange={closeDeactivateDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Desactivar cliente?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de desactivar al cliente{" "}
                <strong>{deactivateDialog.clientName}</strong>. Esta acción no
                se puede deshacer y el cliente ya no podrá acceder al sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={deactivateClientMutation.isPending}
                onClick={closeDeactivateDialog}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeactivateConfirm}
                disabled={deactivateClientMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deactivateClientMutation.isPending
                  ? "Desactivando..."
                  : "Sí, desactivar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </WideLayout>
  );
};
