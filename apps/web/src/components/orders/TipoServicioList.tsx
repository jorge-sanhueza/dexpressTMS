import React, { useState, useMemo, useEffect } from "react";
import { WideLayout } from "../layout/WideLayout";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  useTiposServicio,
  useCreateTipoServicio,
  useUpdateTipoServicio,
  useDeleteTipoServicio,
  useDeactivateTipoServicio,
} from "../../hooks/useTipoServicio";
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
import { TipoServicioTable } from "./TipoServicioTable";
import { TipoServicioForm } from "./TipoServicioForm";

export const TipoServicioList: React.FC = () => {
  const { tenant, hasModulePermission, isInitialized } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activoFilter, setActivoFilter] = useState<boolean | undefined>(
    undefined
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTipoServicio, setEditingTipoServicio] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    tipoServicioId: string | null;
    tipoServicioName: string;
  }>({
    isOpen: false,
    tipoServicioId: null,
    tipoServicioName: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filters = useMemo(() => {
    const filterObj: any = {
      search: debouncedSearchTerm,
      page: currentPage,
      limit: pageSize,
    };

    if (activoFilter !== undefined) {
      filterObj.activo = activoFilter;
    }

    return filterObj;
  }, [debouncedSearchTerm, activoFilter, currentPage, pageSize]);

  useEffect(() => {
    console.log("Current filters:", filters);
    console.log("activoFilter:", activoFilter);
  }, [filters]);

  const {
    data: tiposServicioData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useTiposServicio(tenant?.id || "", filters);

  const tiposServicio = tiposServicioData?.tiposServicio || [];
  const totalCount = tiposServicioData?.total || 0;
  const totalPages =
    tiposServicioData?.totalPages || Math.ceil(totalCount / pageSize);

  const createTipoServicioMutation = useCreateTipoServicio();
  const updateTipoServicioMutation = useUpdateTipoServicio();
  const deleteTipoServicioMutation = useDeleteTipoServicio();
  const deactivateTipoServicioMutation = useDeactivateTipoServicio();

  useEffect(() => {
    if (activoFilter !== undefined) {
      refetch();
    }
  }, [activoFilter, refetch]);

  useEffect(() => {
    console.log("=== FILTER DEBUG ===");
    console.log("activoFilter state:", activoFilter);
    console.log("Current filters object:", filters);
    console.log("Debounced search:", debouncedSearchTerm);
    console.log("=== END FILTER DEBUG ===");
  }, [filters, activoFilter, debouncedSearchTerm]);

  const errors = useMemo(
    () => [
      { error, operation: "fetch" },
      { error: createTipoServicioMutation.error, operation: "create" },
      { error: updateTipoServicioMutation.error, operation: "update" },
      { error: deleteTipoServicioMutation.error, operation: "delete" },
      { error: deactivateTipoServicioMutation.error, operation: "deactivate" },
    ],
    [
      error,
      createTipoServicioMutation.error,
      updateTipoServicioMutation.error,
      deleteTipoServicioMutation.error,
      deactivateTipoServicioMutation.error,
    ]
  );

  const { message: errorMessage, hasError } = useCompositeError(errors);

  const createError = useMutationError(createTipoServicioMutation, "create");
  const updateError = useMutationError(updateTipoServicioMutation, "update");
  const deleteError = useMutationError(deleteTipoServicioMutation, "delete");
  const deactivateError = useMutationError(
    deactivateTipoServicioMutation,
    "deactivate"
  );

  const canViewTiposServicio = hasModulePermission("ordenes", "ver");
  const canCreateTiposServicio = hasModulePermission("ordenes", "crear");
  const canEditTiposServicio = hasModulePermission("ordenes", "editar");
  const canDeleteTiposServicio = hasModulePermission("ordenes", "eliminar");
  const canActivateTiposServicio = hasModulePermission("ordenes", "activar");

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleActivoFilter = (activo: string) => {
    console.log("handleActivoFilter called with:", activo);

    const filterValue = activo === "all" ? undefined : activo === "true";
    console.log("Setting activoFilter to:", filterValue);

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

  const openDeleteDialog = (tipoServicio: any) => {
    setDeleteDialog({
      isOpen: true,
      tipoServicioId: tipoServicio.id,
      tipoServicioName: tipoServicio.nombre,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      tipoServicioId: null,
      tipoServicioName: "",
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.tipoServicioId || deletingId) return; // Prevent double click

    try {
      setDeletingId(deleteDialog.tipoServicioId); // Set deleting state
      await deleteTipoServicioMutation.mutateAsync(deleteDialog.tipoServicioId);
      toast.success("Tipo de servicio eliminado correctamente");
      closeDeleteDialog();
    } catch (error) {
      // If it's a 404, the record was already deleted - treat as success
      if (error === 404) {
        toast.success("Tipo de servicio eliminado correctamente");
        closeDeleteDialog();
      } else if (deleteError) {
        toast.error(deleteError);
      }
    } finally {
      setDeletingId(null); // Clear deleting state
    }
  };

  const handleEdit = (tipoServicio: any) => {
    if (canEditTiposServicio) {
      setEditingTipoServicio(tipoServicio);
    }
  };

  const handleDeactivate = async (tipoServicio: any) => {
    try {
      await deactivateTipoServicioMutation.mutateAsync(tipoServicio.id);
      toast.success("Tipo de servicio desactivado correctamente");
    } catch {
      if (deactivateError) {
        toast.error(deactivateError);
      }
    }
  };

  const handleEditSubmit = async (tipoServicioData: any) => {
    if (!editingTipoServicio) return;

    try {
      await updateTipoServicioMutation.mutateAsync({
        id: editingTipoServicio.id,
        tipoServicioData,
      });
      setEditingTipoServicio(null);
      toast.success("Tipo de servicio actualizado correctamente");
    } catch {
      if (updateError) {
        toast.error(updateError);
      }
    }
  };

  const handleEditCancel = () => {
    setEditingTipoServicio(null);
  };

  const handleCreateTipoServicio = () => {
    if (canCreateTiposServicio) {
      setIsCreateModalOpen(true);
    }
  };

  const handleCreateSubmit = async (tipoServicioData: any) => {
    try {
      await createTipoServicioMutation.mutateAsync(tipoServicioData);
      setIsCreateModalOpen(false);
      toast.success("Tipo de servicio creado correctamente");
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

  if (!canViewTiposServicio) {
    return (
      <WideLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#798283] mb-4">
              Acceso No Autorizado
            </div>
            <p className="text-[#798283]/70">
              No tienes permisos para ver tipos de servicio.
            </p>
          </div>
        </div>
      </WideLayout>
    );
  }

  return (
    <WideLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-[#798283]/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#798283]">
                Gestión de Tipos de Servicio
              </h2>
              <p className="text-[#798283]/70">
                Crear y administrar tipos de servicio{" "}
                {tenant && `- ${tenant.nombre}`}
              </p>
            </div>
            {canCreateTiposServicio && (
              <Button
                onClick={handleCreateTipoServicio}
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
                disabled={createTipoServicioMutation.isPending}
              >
                {createTipoServicioMutation.isPending
                  ? "Creando..."
                  : "+ Nuevo Tipo de Servicio"}
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {hasError && <ErrorDisplay message={errorMessage!} />}

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search Input */}
            <div>
              <Label htmlFor="search" className="text-[#798283]">
                Buscar tipos de servicio
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Buscar por nombre, código o descripción..."
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
        </div>

        {/* Tipos de Servicio Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#798283]">
                Lista de Tipos de Servicio
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
                      Mostrando {tiposServicio.length} de {totalCount}{" "}
                      {totalCount === 1
                        ? "tipo de servicio"
                        : "tipos de servicio"}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="relative">
              {isFetching && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex items-center gap-2 text-[#798283]">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D42B22]"></div>
                    <span>Actualizando datos...</span>
                  </div>
                </div>
              )}

              <TipoServicioTable
                data={tiposServicio}
                onEdit={handleEdit}
                onDelete={openDeleteDialog}
                onDeactivate={handleDeactivate}
                canEdit={canEditTiposServicio}
                canDelete={canDeleteTiposServicio}
                canActivate={canActivateTiposServicio}
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

      {/* Create TipoServicio Modal */}
      {isCreateModalOpen && (
        <TipoServicioForm
          onSubmit={handleCreateSubmit}
          onCancel={handleCreateCancel}
          isLoading={createTipoServicioMutation.isPending}
        />
      )}

      {/* Edit TipoServicio Modal */}
      {editingTipoServicio && (
        <TipoServicioForm
          tipoServicio={editingTipoServicio}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
          isLoading={updateTipoServicioMutation.isPending}
          isEditing={true}
        />
      )}

      {/* Delete TipoServicio Confirmation Dialog */}
      {canDeleteTiposServicio && (
        <AlertDialog
          open={deleteDialog.isOpen}
          onOpenChange={closeDeleteDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar tipo de servicio?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de eliminar el tipo de servicio{" "}
                <strong>{deleteDialog.tipoServicioName}</strong>. Esta acción no
                se puede deshacer y se perderán todos los datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={deleteTipoServicioMutation.isPending}
                onClick={closeDeleteDialog}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={
                  deleteTipoServicioMutation.isPending || deletingId !== null
                }
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteTipoServicioMutation.isPending || deletingId !== null
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
