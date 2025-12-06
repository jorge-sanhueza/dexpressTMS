import React, { useState, useMemo } from "react";
import { WideLayout } from "../layout/WideLayout";
import { ContactosTable } from "./ContactosTable";
import { ContactoForm } from "./ContactoForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useContactos,
  useDeactivateContacto,
  useActivateContacto,
  useCreateContacto,
  useUpdateContacto,
} from "../../hooks/useContactos";
import { useAuthStore } from "../../store/authStore";
import type {
  Contacto,
  ContactosFilter,
  CreateContactoData,
  UpdateContactoData,
} from "@/types/contacto";
import { Input } from "@/components/ui/input";
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
import { ContactoDetailsModal } from "./ContactoDetailsModal";

export const ContactosList: React.FC = () => {
  // ========== STATE HOOKS ==========
  const { hasModulePermission, isInitialized } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(
    undefined
  );
  const [personTypeFilter, setPersonTypeFilter] = useState<boolean | undefined>(
    undefined
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingContacto, setEditingContacto] = useState<Contacto | null>(null);
  const [deactivateDialog, setDeactivateDialog] = useState<{
    isOpen: boolean;
    contactoId: string | null;
    contactoName: string;
  }>({
    isOpen: false,
    contactoId: null,
    contactoName: "",
  });
  const [viewingContacto, setViewingContacto] = useState<Contacto | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ========== DERIVED STATE & HOOKS ==========
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Build filters object for API
  const filters = useMemo(() => {
    const filterObj: ContactosFilter = {
      page: currentPage,
      limit: pageSize,
    };

    if (debouncedSearchTerm) {
      filterObj.search = debouncedSearchTerm;
    }

    if (statusFilter !== undefined) {
      filterObj.activo = statusFilter;
    }

    if (personTypeFilter !== undefined) {
      filterObj.esPersonaNatural = personTypeFilter;
    }

    return filterObj;
  }, [
    debouncedSearchTerm,
    statusFilter,
    personTypeFilter,
    currentPage,
    pageSize,
  ]);

  // ========== DATA FETCHING ==========
  const {
    data: contactosData,
    isLoading,
    error,
    isFetching,
  } = useContactos(filters);

  const contactos = contactosData?.contactos || [];
  const totalCount = contactosData?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const deactivateContactoMutation = useDeactivateContacto();
  const activateContactoMutation = useActivateContacto();
  const createContactoMutation = useCreateContacto();
  const updateContactoMutation = useUpdateContacto();

  // ========== ERROR HANDLING ==========
  const errors = useMemo(
    () => [
      { error, operation: "fetch" },
      { error: deactivateContactoMutation.error, operation: "deactivate" },
      { error: activateContactoMutation.error, operation: "activate" },
      { error: createContactoMutation.error, operation: "create" },
      { error: updateContactoMutation.error, operation: "update" },
    ],
    [
      error,
      deactivateContactoMutation.error,
      activateContactoMutation.error,
      createContactoMutation.error,
      updateContactoMutation.error,
    ]
  );

  const { message: errorMessage, hasError } = useCompositeError(errors);

  // Individual mutation errors for toasts
  const createError = useMutationError(createContactoMutation, "create");
  const updateError = useMutationError(updateContactoMutation, "update");
  const deactivateError = useMutationError(
    deactivateContactoMutation,
    "deactivate"
  );
  const activateError = useMutationError(activateContactoMutation, "activate");

  // ========== PERMISSIONS ==========
  const canViewContactos = hasModulePermission("clientes", "ver");
  const canCreateContactos = hasModulePermission("clientes", "crear");
  const canEditContactos = hasModulePermission("clientes", "editar");
  const canDeleteContactos = hasModulePermission("clientes", "eliminar");
  const canActivateContactos = hasModulePermission("clientes", "activar");

  // ========== EVENT HANDLERS ==========

  // Search & Filter handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    const filterValue = status === "all" ? undefined : status === "true";
    setStatusFilter(filterValue);
    setCurrentPage(1);
  };

  const handlePersonTypeFilter = (type: string) => {
    const filterValue = type === "all" ? undefined : type === "true";
    setPersonTypeFilter(filterValue);
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
    setPersonTypeFilter(undefined);
    setCurrentPage(1);
  };

  // Contacto CRUD handlers
  const handleCreateContacto = () => {
    if (canCreateContactos) {
      setIsCreateModalOpen(true);
    }
  };

  const handleCreateSubmit = async (
    contactoData: CreateContactoData | UpdateContactoData
  ) => {
    try {
      await createContactoMutation.mutateAsync(
        contactoData as CreateContactoData
      );
      setIsCreateModalOpen(false);
      toast.success("Contacto creado correctamente");
    } catch {
      if (createError) {
        toast.error(createError);
      }
    }
  };

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false);
  };

  const handleEdit = (contacto: Contacto) => {
    if (canEditContactos) {
      setEditingContacto(contacto);
    }
  };

  const handleEditSubmit = async (
    contactoData: CreateContactoData | UpdateContactoData
  ) => {
    if (!editingContacto) return;

    try {
      await updateContactoMutation.mutateAsync({
        id: editingContacto.id,
        contactoData: contactoData as UpdateContactoData,
      });
      setEditingContacto(null);
      toast.success("Contacto actualizado correctamente");
    } catch {
      if (updateError) {
        toast.error(updateError);
      }
    }
  };

  const handleEditCancel = () => {
    setEditingContacto(null);
  };

  const handleView = (contacto: Contacto) => {
    setViewingContacto(contacto);
  };

  const handleCloseView = () => {
    setViewingContacto(null);
  };

  // Activation/Deactivation handlers
  const openDeactivateDialog = (contacto: Contacto) => {
    setDeactivateDialog({
      isOpen: true,
      contactoId: contacto.id,
      contactoName: contacto.nombre,
    });
  };

  const closeDeactivateDialog = () => {
    setDeactivateDialog({
      isOpen: false,
      contactoId: null,
      contactoName: "",
    });
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateDialog.contactoId) return;

    try {
      await deactivateContactoMutation.mutateAsync(deactivateDialog.contactoId);
      toast.success("Contacto desactivado correctamente");
      closeDeactivateDialog();
    } catch {
      if (deactivateError) {
        toast.error(deactivateError);
      }
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateContactoMutation.mutateAsync(id);
      toast.success("Contacto activado correctamente");
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

  if (!canViewContactos) {
    return (
      <WideLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#798283] mb-4">
              Acceso No Autorizado
            </div>
            <p className="text-[#798283]/70">
              No tienes permisos para ver contactos.
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
              <h2 className="text-2xl font-bold text-[#798283]">Contactos</h2>
              <p className="text-[#798283]/70 mt-1">
                Gestiona los contactos de tu organización
              </p>
            </div>
            {canCreateContactos && (
              <Button
                onClick={handleCreateContacto}
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
                disabled={createContactoMutation.isPending}
              >
                {createContactoMutation.isPending
                  ? "Creando..."
                  : "+ Nuevo Contacto"}
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {hasError && <ErrorDisplay message={errorMessage!} />}

        {/* Enhanced Filters Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search Input */}
            <div>
              <Label htmlFor="search" className="text-[#798283]">
                Buscar contactos
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Buscar por nombre, RUT, cargo o email..."
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

            {/* Person Type Filter */}
            <div>
              <Label htmlFor="person-type-filter" className="text-[#798283]">
                Tipo
              </Label>
              <Select
                value={
                  personTypeFilter === undefined
                    ? "all"
                    : personTypeFilter.toString()
                }
                onValueChange={handlePersonTypeFilter}
              >
                <SelectTrigger id="person-type-filter">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="true">Personas Naturales</SelectItem>
                  <SelectItem value="false">Empresas</SelectItem>
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
            {personTypeFilter === true && (
              <Badge
                variant="secondary"
                className="bg-purple-50 text-purple-700"
              >
                Tipo: Personas Naturales
              </Badge>
            )}
            {personTypeFilter === false && (
              <Badge
                variant="secondary"
                className="bg-orange-50 text-orange-700"
              >
                Tipo: Empresas
              </Badge>
            )}
          </div>
        </div>

        {/* Contactos Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#798283]">
                Lista de Contactos
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
                      Mostrando {contactos.length} de {totalCount}{" "}
                      {totalCount === 1 ? "contacto" : "contactos"}
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

              <ContactosTable
                data={contactos}
                onEdit={handleEdit}
                onView={handleView}
                onDeactivate={openDeactivateDialog}
                onActivate={handleActivate}
                canView={canViewContactos}
                canEdit={canEditContactos}
                canDelete={canDeleteContactos}
                canActivate={canActivateContactos}
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
      {viewingContacto && (
        <ContactoDetailsModal
          contacto={viewingContacto}
          isOpen={!!viewingContacto}
          onClose={handleCloseView}
        />
      )}
      {isCreateModalOpen && (
        <ContactoForm
          onSubmit={handleCreateSubmit}
          onCancel={handleCreateCancel}
          isLoading={createContactoMutation.isPending}
        />
      )}

      {editingContacto && (
        <ContactoForm
          contacto={editingContacto}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
          isLoading={updateContactoMutation.isPending}
          isEditing={true}
        />
      )}

      {/* Deactivate Contacto Confirmation Dialog */}
      {canDeleteContactos && (
        <AlertDialog
          open={deactivateDialog.isOpen}
          onOpenChange={closeDeactivateDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Desactivar contacto?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de desactivar al contacto{" "}
                <strong>{deactivateDialog.contactoName}</strong>. Esta acción no
                se puede deshacer y el contacto ya no estará disponible para uso
                en el sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={deactivateContactoMutation.isPending}
                onClick={closeDeactivateDialog}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeactivateConfirm}
                disabled={deactivateContactoMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deactivateContactoMutation.isPending
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
