import React, { useState, useMemo } from "react";
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
import { useDebounce } from "@/hooks/useDebounce";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { useCompositeError, useMutationError } from "@/hooks/useErrorHandling";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const ClientsList: React.FC = () => {
  // ========== STATE HOOKS ==========
  const { hasModulePermission, isInitialized } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(
    undefined
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [deactivateDialog, setDeactivateDialog] = useState<{
    isOpen: boolean;
    clientId: string | null;
    clientName: string;
  }>({
    isOpen: false,
    clientId: null,
    clientName: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ========== DERIVED STATE & HOOKS ==========
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Build filters object for API
  const filters = useMemo(() => {
    const filterObj: ClientsFilter = {
      page: currentPage,
      limit: pageSize,
    };

    if (debouncedSearchTerm) {
      filterObj.search = debouncedSearchTerm;
    }

    if (statusFilter !== undefined) {
      filterObj.activo = statusFilter;
    }

    return filterObj;
  }, [debouncedSearchTerm, statusFilter, currentPage, pageSize]);

  // ========== DATA FETCHING ==========
  const {
    data: clientsData,
    isLoading,
    error,
    isFetching,
  } = useClients(filters);

  const clients = clientsData?.clients || [];
  const totalCount = clientsData?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const deactivateClientMutation = useDeactivateClient();
  const activateClientMutation = useActivateClient();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();

  // ========== ERROR HANDLING ==========
  const errors = useMemo(
    () => [
      { error, operation: "fetch" },
      { error: deactivateClientMutation.error, operation: "deactivate" },
      { error: activateClientMutation.error, operation: "activate" },
      { error: createClientMutation.error, operation: "create" },
      { error: updateClientMutation.error, operation: "update" },
    ],
    [
      error,
      deactivateClientMutation.error,
      activateClientMutation.error,
      createClientMutation.error,
      updateClientMutation.error,
    ]
  );

  const { message: errorMessage, hasError } = useCompositeError(errors);

  // Individual mutation errors for toasts
  const createError = useMutationError(createClientMutation, "create");
  const updateError = useMutationError(updateClientMutation, "update");
  const deactivateError = useMutationError(
    deactivateClientMutation,
    "deactivate"
  );
  const activateError = useMutationError(activateClientMutation, "activate");

  // ========== PERMISSIONS ==========
  const canViewClients = hasModulePermission("clientes", "ver");
  const canCreateClients = hasModulePermission("clientes", "crear");
  const canEditClients = hasModulePermission("clientes", "editar");
  const canDeleteClients = hasModulePermission("clientes", "eliminar");
  const canActivateClients = hasModulePermission("clientes", "activar");

  // ========== EVENT HANDLERS ==========

  // Search & Filter handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (status: string) => {
    // Use "all" for "Todos" option
    const filterValue = status === "all" ? undefined : status === "true";
    setStatusFilter(filterValue);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter(undefined);
    setCurrentPage(1);
  };

  // Client CRUD handlers
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
    } catch {
      if (createError) {
        toast.error(createError);
      }
    }
  };

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false);
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
    } catch {
      if (updateError) {
        toast.error(updateError);
      }
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

  // Activation/Deactivation handlers
  const openDeactivateDialog = (client: Client) => {
    setDeactivateDialog({
      isOpen: true,
      clientId: client.id,
      clientName: client.nombre,
    });
  };

  const closeDeactivateDialog = () => {
    setDeactivateDialog({
      isOpen: false,
      clientId: null,
      clientName: "",
    });
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateDialog.clientId) return;

    try {
      await deactivateClientMutation.mutateAsync(deactivateDialog.clientId);
      toast.success("Cliente desactivado correctamente");
      closeDeactivateDialog();
    } catch {
      if (deactivateError) {
        toast.error(deactivateError);
      }
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateClientMutation.mutateAsync(id);
      toast.success("Cliente activado correctamente");
    } catch {
      if (activateError) {
        toast.error(activateError);
      }
    }
  };

  // ========== LOADING & AUTH STATES ==========
  if (isLoading || !isInitialized) {
    return (
      <WideLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D42B22]"></div>
          <span className="ml-3 text-[#798283]">Cargando...</span>
        </div>
      </WideLayout>
    );
  }

  if (!canViewClients) {
    return (
      <WideLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#798283] mb-4">
              Acceso No Autorizado
            </div>
            <p className="text-[#798283]/70">
              No tienes permisos para ver clientes.
            </p>
            <p className="text-sm text-[#798283]/50 mt-2">
              Contacta al administrador del sistema para solicitar acceso.
            </p>
          </div>
        </div>
      </WideLayout>
    );
  }

  // ========== RENDER ==========
  return (
    <WideLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-[#798283]/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#798283]">Clientes</h2>
              <p className="text-[#798283]/70 mt-1">
                Gestiona los clientes de tu organización
              </p>
            </div>
            {canCreateClients && (
              <Button
                onClick={handleCreateClient}
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
                disabled={createClientMutation.isPending}
              >
                {createClientMutation.isPending
                  ? "Creando..."
                  : "+ Nuevo Cliente"}
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {hasError && <ErrorDisplay message={errorMessage!} />}

        {/* Enhanced Filters Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Search Input */}
            <div>
              <Label htmlFor="search" className="text-[#798283]">
                Buscar clientes
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Buscar por nombre, RUT, contacto o email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div>
              <Label htmlFor="status-filter" className="text-[#798283]">
                Estado
              </Label>
              <Select
                value={
                  statusFilter === undefined ? "all" : statusFilter.toString()
                }
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div>
              <Label className="text-[#798283] opacity-0">Acciones</Label>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full border-[#798283]/20 text-[#798283] hover:bg-[#798283]/10"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>

          {/* Active filters display */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-[#798283]/70">Filtros activos:</span>
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
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#798283]">
                Lista de Clientes
              </h3>
              <div className="flex items-center gap-4">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="page-size"
                    className="text-sm text-[#798283]/70"
                  >
                    Mostrar:
                  </Label>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-[#798283]/70">
                  {isFetching ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#D42B22]"></div>
                      Actualizando...
                    </div>
                  ) : (
                    <>
                      Mostrando {clients.length} de {totalCount}{" "}
                      {totalCount === 1 ? "cliente" : "clientes"}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Show loading overlay only on the table during filter changes */}
            <div className="relative">
              {isFetching && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex items-center gap-2 text-[#798283]">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D42B22]"></div>
                    <span>Actualizando datos...</span>
                  </div>
                </div>
              )}

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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-6 border-t border-[#798283]/10 mt-6">
                  <div className="text-sm text-[#798283]/70">
                    Página {currentPage} de {totalPages}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#798283]/10 transition-all duration-200"
                    >
                      Anterior
                    </Button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                              currentPage === page
                                ? "bg-[#D42B22] text-white"
                                : "border border-[#798283]/30 text-[#798283] hover:bg-[#798283]/10"
                            }`}
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>

                    <Button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#798283]/10 transition-all duration-200"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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

      {editingClient && (
        <ClientForm
          client={editingClient}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
          isLoading={updateClientMutation.isPending}
          isEditing={true}
        />
      )}

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
