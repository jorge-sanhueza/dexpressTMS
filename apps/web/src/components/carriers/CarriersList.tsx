import React, { useState, useMemo } from "react";
import { WideLayout } from "../layout/WideLayout";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  useCarriers,
  useCreateCarrier,
  useUpdateCarrier,
  useDeleteCarrier,
} from "../../hooks/useCarriers";
import { useAuthStore } from "../../store/authStore";
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
} from "../ui/alert-dialog";
import type { CreateCarrierDto, Carrier } from "@/types/carrier";
import { useDebounce } from "@/hooks/useDebounce";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { useCompositeError, useMutationError } from "@/hooks/useErrorHandling";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { CarriersTable } from "./CarriersTable";
import { CarrierForm } from "./CarrierForm";
import { CarrierViewModal } from "./CarrierViewModal";

export const CarriersList: React.FC = () => {
  // ========== STATE HOOKS ==========
  const { tenant, hasModulePermission, isInitialized } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activoFilter, setActivoFilter] = useState<boolean | undefined>(
    undefined
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [viewingCarrier, setViewingCarrier] = useState<Carrier | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    carrierId: string | null;
    carrierName: string;
  }>({
    isOpen: false,
    carrierId: null,
    carrierName: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ========== DERIVED STATE & HOOKS ==========
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Build filters object for API
  const filters = useMemo(() => {
    const filterObj: any = {};

    if (debouncedSearchTerm) {
      filterObj.search = debouncedSearchTerm;
    }

    if (activoFilter !== undefined) {
      filterObj.activo = activoFilter;
    }

    filterObj.page = currentPage;
    filterObj.limit = pageSize;

    return filterObj;
  }, [debouncedSearchTerm, activoFilter, currentPage, pageSize]);

  // ========== DATA FETCHING ==========
  const {
    data: carriersData,
    isLoading,
    isFetching,
    error,
  } = useCarriers(tenant?.id || "", filters);

  const carriers = carriersData?.carriers || [];
  const totalCount = carriersData?.total || 0;
  const totalPages =
    carriersData?.totalPages || Math.ceil(totalCount / pageSize);

  const createCarrierMutation = useCreateCarrier();
  const updateCarrierMutation = useUpdateCarrier();
  const deleteCarrierMutation = useDeleteCarrier();

  // ========== ERROR HANDLING ==========
  const errors = useMemo(
    () => [
      { error, operation: "fetch" },
      { error: createCarrierMutation.error, operation: "create" },
      { error: updateCarrierMutation.error, operation: "update" },
      { error: deleteCarrierMutation.error, operation: "delete" },
    ],
    [
      error,
      createCarrierMutation.error,
      updateCarrierMutation.error,
      deleteCarrierMutation.error,
    ]
  );

  const { message: errorMessage, hasError } = useCompositeError(errors);

  // Individual mutation errors for toasts
  const createError = useMutationError(createCarrierMutation, "create");
  const updateError = useMutationError(updateCarrierMutation, "update");
  const deleteError = useMutationError(deleteCarrierMutation, "delete");

  // ========== PERMISSIONS ==========
  const canViewCarriers = hasModulePermission("carriers", "ver");
  const canCreateCarriers = hasModulePermission("carriers", "crear");
  const canEditCarriers = hasModulePermission("carriers", "editar");
  const canDeleteCarriers = hasModulePermission("carriers", "eliminar");
  const canActivateCarriers = hasModulePermission("carriers", "activar");

  // ========== EVENT HANDLERS ==========
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleActivoFilter = (activo: string) => {
    // Use "all" for "Todos" option
    const filterValue = activo === "all" ? undefined : activo === "true";
    setActivoFilter(filterValue);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size));
    setCurrentPage(1);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (carrier: Carrier) => {
    setDeleteDialog({
      isOpen: true,
      carrierId: carrier.id,
      carrierName: carrier.nombre,
    });
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      carrierId: null,
      carrierName: "",
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.carrierId) return;

    try {
      await deleteCarrierMutation.mutateAsync(deleteDialog.carrierId);
      toast.success("Carrier eliminado correctamente");
      closeDeleteDialog();
    } catch {
      if (deleteError) {
        toast.error(deleteError);
      }
    }
  };

  const handleEdit = (carrier: Carrier) => {
    if (canEditCarriers) {
      setEditingCarrier(carrier);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await updateCarrierMutation.mutateAsync({
        id,
        carrierData: { activo: true },
      });
      toast.success("Carrier activado correctamente");
    } catch {
      if (updateError) {
        toast.error(updateError);
      }
    }
  };

  const handleEditSubmit = async (carrierData: CreateCarrierDto) => {
    if (!editingCarrier) return;

    try {
      await updateCarrierMutation.mutateAsync({
        id: editingCarrier.id,
        carrierData,
      });
      setEditingCarrier(null);
      toast.success("Carrier actualizado correctamente");
    } catch {
      if (updateError) {
        toast.error(updateError);
      }
    }
  };

  const handleEditCancel = () => {
    setEditingCarrier(null);
  };

  const handleView = (carrier: Carrier) => {
    setViewingCarrier(carrier);
  };

  const handleViewClose = () => {
    setViewingCarrier(null);
  };

  const handleCreateCarrier = () => {
    if (canCreateCarriers) {
      setIsCreateModalOpen(true);
    }
  };

  const handleCreateSubmit = async (carrierData: CreateCarrierDto) => {
    try {
      await createCarrierMutation.mutateAsync(carrierData);
      setIsCreateModalOpen(false);
      toast.success("Carrier creado correctamente");
    } catch {
      if (createError) {
        toast.error(createError);
      }
    }
  };

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setActivoFilter(undefined);
    setCurrentPage(1);
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

  if (!canViewCarriers) {
    return (
      <WideLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#798283] mb-4">
              Acceso No Autorizado
            </div>
            <p className="text-[#798283]/70">
              No tienes permisos para ver carriers.
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
              <h2 className="text-2xl font-bold text-[#798283]">
                Gestión de Carriers
              </h2>
              <p className="text-[#798283]/70">
                Crear y administrar carriers {tenant && `- ${tenant.nombre}`}
              </p>
            </div>
            {canCreateCarriers && (
              <Button
                onClick={handleCreateCarrier}
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
                disabled={createCarrierMutation.isPending}
              >
                {createCarrierMutation.isPending
                  ? "Creando..."
                  : "+ Nuevo Carrier"}
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
                Buscar carriers
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

            {/* Estado Filter */}
            <div>
              <Label htmlFor="estado-filter" className="text-[#798283]">
                Estado
              </Label>
              <Select
                value={
                  activoFilter === undefined ? "all" : activoFilter.toString()
                }
                onValueChange={handleActivoFilter}
              >
                <SelectTrigger id="estado-filter">
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
            {activoFilter !== undefined && (
              <Badge
                variant="secondary"
                className="bg-purple-50 text-purple-700"
              >
                Estado: {activoFilter ? "Activos" : "Inactivos"}
              </Badge>
            )}
          </div>
        </div>

        {/* Carriers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#798283]">
                Lista de Carriers
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
                      Mostrando {carriers.length} de {totalCount}{" "}
                      {totalCount === 1 ? "carrier" : "carriers"}
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

              <CarriersTable
                data={carriers}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={openDeleteDialog}
                onActivate={handleActivate}
                canView={canViewCarriers}
                canEdit={canEditCarriers}
                canDelete={canDeleteCarriers}
                canActivate={canActivateCarriers}
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

      {/* Create Carrier Modal */}
      {isCreateModalOpen && (
        <CarrierForm
          onSubmit={handleCreateSubmit}
          onCancel={handleCreateCancel}
          isLoading={createCarrierMutation.isPending}
        />
      )}

      {/* Edit Carrier Modal */}
      {editingCarrier && (
        <CarrierForm
          carrier={editingCarrier}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
          isLoading={updateCarrierMutation.isPending}
          isEditing={true}
        />
      )}

      {/* View Carrier Modal */}
      {viewingCarrier && (
        <CarrierViewModal
          carrier={viewingCarrier}
          onClose={handleViewClose}
          onEdit={() => {
            setViewingCarrier(null);
            setEditingCarrier(viewingCarrier);
          }}
          canEdit={canEditCarriers}
        />
      )}

      {/* Delete Carrier Confirmation Dialog */}
      {canDeleteCarriers && (
        <AlertDialog
          open={deleteDialog.isOpen}
          onOpenChange={closeDeleteDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar carrier?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de eliminar al carrier{" "}
                <strong>{deleteDialog.carrierName}</strong>. Esta acción no se
                puede deshacer y se perderán todos los datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={deleteCarrierMutation.isPending}
                onClick={closeDeleteDialog}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleteCarrierMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteCarrierMutation.isPending
                  ? "Eliminando..."
                  : "Sí, eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </WideLayout>
  );
};
