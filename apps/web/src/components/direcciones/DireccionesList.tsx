import React, { useState, useMemo } from "react";
import { WideLayout } from "../layout/WideLayout";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  useDirecciones,
  useCreateDireccion,
  useUpdateDireccion,
  useDeleteDireccion,
} from "../../hooks/useDirecciones";
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
import type { CreateDireccionDto, Direccion } from "@/types/direccion";
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
import { DireccionesTable } from "./DireccionesTable";
import { DireccionForm } from "./DireccionForm";
import { DireccionViewModal } from "./DireccionViewModal";
import { MapModal } from "../maps/MapModal";

export const DireccionesList: React.FC = () => {
  // ========== STATE HOOKS ==========
  const { tenant, hasModulePermission, isInitialized } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activoFilter, setActivoFilter] = useState<boolean | undefined>(
    undefined
  );
  const [esPrincipalFilter, setEsPrincipalFilter] = useState<
    boolean | undefined
  >(undefined);
  const [origenFilter, setOrigenFilter] = useState<string | undefined>(
    undefined
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDireccion, setEditingDireccion] = useState<Direccion | null>(
    null
  );
  const [viewingDireccion, setViewingDireccion] = useState<Direccion | null>(
    null
  );
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    direccionId: string | null;
    direccionName: string;
  }>({
    isOpen: false,
    direccionId: null,
    direccionName: "",
  });

  const [mapModal, setMapModal] = useState<{
    isOpen: boolean;
    direccion: Direccion | null;
  }>({
    isOpen: false,
    direccion: null,
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

    if (esPrincipalFilter !== undefined) {
      filterObj.esPrincipal = esPrincipalFilter;
    }

    if (origenFilter) {
      filterObj.origen = origenFilter;
    }

    filterObj.page = currentPage;
    filterObj.limit = pageSize;

    return filterObj;
  }, [
    debouncedSearchTerm,
    activoFilter,
    esPrincipalFilter,
    origenFilter,
    currentPage,
    pageSize,
  ]);

  // ========== DATA FETCHING ==========
  const {
    data: direccionesData,
    isLoading,
    isFetching,
    error,
  } = useDirecciones(tenant?.id || "", filters);

  const direcciones = direccionesData?.direcciones || [];
  const totalCount = direccionesData?.total || 0;
  const totalPages =
    direccionesData?.totalPages || Math.ceil(totalCount / pageSize);

  const createDireccionMutation = useCreateDireccion();
  const updateDireccionMutation = useUpdateDireccion();
  const deleteDireccionMutation = useDeleteDireccion();

  // ========== ERROR HANDLING ==========
  const errors = useMemo(
    () => [
      { error, operation: "fetch" },
      { error: createDireccionMutation.error, operation: "create" },
      { error: updateDireccionMutation.error, operation: "update" },
      { error: deleteDireccionMutation.error, operation: "delete" },
    ],
    [
      error,
      createDireccionMutation.error,
      updateDireccionMutation.error,
      deleteDireccionMutation.error,
    ]
  );

  const { message: errorMessage, hasError } = useCompositeError(errors);

  // Individual mutation errors for toasts
  const createError = useMutationError(createDireccionMutation, "create");
  const updateError = useMutationError(updateDireccionMutation, "update");
  const deleteError = useMutationError(deleteDireccionMutation, "delete");

  // ========== PERMISSIONS ==========
  const canViewDirecciones = hasModulePermission("dashboard", "ver");
  const canCreateDirecciones = hasModulePermission("dashboard", "crear");
  const canEditDirecciones = hasModulePermission("dashboard", "editar");
  const canDeleteDirecciones = hasModulePermission("dashboard", "eliminar");
  const canActivateDirecciones = hasModulePermission("dashboard", "activar");

  // ========== EVENT HANDLERS ==========
  const handleViewMap = (direccion: Direccion) => {
    setMapModal({
      isOpen: true,
      direccion,
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleActivoFilter = (activo: string) => {
    const filterValue = activo === "all" ? undefined : activo === "true";
    setActivoFilter(filterValue);
    setCurrentPage(1);
  };

  const handleEsPrincipalFilter = (esPrincipal: string) => {
    const filterValue =
      esPrincipal === "all" ? undefined : esPrincipal === "true";
    setEsPrincipalFilter(filterValue);
    setCurrentPage(1);
  };

  const handleOrigenFilter = (origen: string) => {
    const filterValue = origen === "all" ? undefined : origen;
    setOrigenFilter(filterValue);
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
  const openDeleteDialog = (direccion: Direccion) => {
    setDeleteDialog({
      isOpen: true,
      direccionId: direccion.id,
      direccionName: direccion.nombre || direccion.direccionTexto,
    });
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      direccionId: null,
      direccionName: "",
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.direccionId) return;

    try {
      await deleteDireccionMutation.mutateAsync(deleteDialog.direccionId);
      toast.success("Dirección eliminada correctamente");
      closeDeleteDialog();
    } catch {
      if (deleteError) {
        toast.error(deleteError);
      }
    }
  };

  const handleEdit = (direccion: Direccion) => {
    if (canEditDirecciones) {
      setEditingDireccion(direccion);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await updateDireccionMutation.mutateAsync({
        id,
        direccionData: { activo: true },
      });
      toast.success("Dirección activada correctamente");
    } catch {
      if (updateError) {
        toast.error(updateError);
      }
    }
  };

  const handleEditSubmit = async (direccionData: CreateDireccionDto) => {
    if (!editingDireccion) return;

    try {
      await updateDireccionMutation.mutateAsync({
        id: editingDireccion.id,
        direccionData,
      });
      setEditingDireccion(null);
      toast.success("Dirección actualizada correctamente");
    } catch {
      if (updateError) {
        toast.error(updateError);
      }
    }
  };

  const handleEditCancel = () => {
    setEditingDireccion(null);
  };

  const handleView = (direccion: Direccion) => {
    setViewingDireccion(direccion);
  };

  const handleViewClose = () => {
    setViewingDireccion(null);
  };

  const handleCreateDireccion = () => {
    if (canCreateDirecciones) {
      setIsCreateModalOpen(true);
    }
  };

  const handleCreateSubmit = async (direccionData: CreateDireccionDto) => {
    try {
      await createDireccionMutation.mutateAsync(direccionData);
      setIsCreateModalOpen(false);
      toast.success("Dirección creada correctamente");
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
    setEsPrincipalFilter(undefined);
    setOrigenFilter(undefined);
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

  if (!canViewDirecciones) {
    return (
      <WideLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#798283] mb-4">
              Acceso No Autorizado
            </div>
            <p className="text-[#798283]/70">
              No tienes permisos para ver direcciones.
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
                Gestión de Direcciones
              </h2>
              <p className="text-[#798283]/70">
                Crear y administrar direcciones {tenant && `- ${tenant.nombre}`}
              </p>
            </div>
            {canCreateDirecciones && (
              <Button
                onClick={handleCreateDireccion}
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
                disabled={createDireccionMutation.isPending}
              >
                {createDireccionMutation.isPending
                  ? "Creando..."
                  : "+ Nueva Dirección"}
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {hasError && <ErrorDisplay message={errorMessage!} />}

        {/* Enhanced Filters Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-2">
              <Label htmlFor="search" className="text-[#798283]">
                Buscar direcciones
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Buscar por dirección, nombre, contacto o referencia..."
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
                  <SelectItem value="true">Activas</SelectItem>
                  <SelectItem value="false">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Principal Filter */}
            <div>
              <Label htmlFor="principal-filter" className="text-[#798283]">
                Tipo
              </Label>
              <Select
                value={
                  esPrincipalFilter === undefined
                    ? "all"
                    : esPrincipalFilter.toString()
                }
                onValueChange={handleEsPrincipalFilter}
              >
                <SelectTrigger id="principal-filter">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las direcciones</SelectItem>
                  <SelectItem value="true">Principales</SelectItem>
                  <SelectItem value="false">Secundarias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Origen Filter */}
            <div>
              <Label htmlFor="origen-filter" className="text-[#798283]">
                Origen
              </Label>
              <Select
                value={origenFilter || "all"}
                onValueChange={handleOrigenFilter}
              >
                <SelectTrigger id="origen-filter">
                  <SelectValue placeholder="Todos los orígenes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los orígenes</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="IMPORTACION">Importación</SelectItem>
                  <SelectItem value="API">API</SelectItem>
                </SelectContent>
              </Select>
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
                Estado: {activoFilter ? "Activas" : "Inactivas"}
              </Badge>
            )}
            {esPrincipalFilter !== undefined && (
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Tipo: {esPrincipalFilter ? "Principales" : "Secundarias"}
              </Badge>
            )}
            {origenFilter && (
              <Badge
                variant="secondary"
                className="bg-orange-50 text-orange-700"
              >
                Origen: {origenFilter}
              </Badge>
            )}
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="border-[#798283]/20 text-[#798283] hover:bg-[#798283]/10"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Direcciones Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#798283]">
                Lista de Direcciones
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
                      Mostrando {direcciones.length} de {totalCount}{" "}
                      {totalCount === 1 ? "dirección" : "direcciones"}
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

              <DireccionesTable
                data={direcciones}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={openDeleteDialog}
                onActivate={handleActivate}
                onViewMap={handleViewMap}
                canView={canViewDirecciones}
                canEdit={canEditDirecciones}
                canDelete={canDeleteDirecciones}
                canActivate={canActivateDirecciones}
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

      {/* Create Direccion Modal */}
      {isCreateModalOpen && (
        <DireccionForm
          onSubmit={handleCreateSubmit}
          onCancel={handleCreateCancel}
          isLoading={createDireccionMutation.isPending}
        />
      )}

      {/* Edit Direccion Modal */}
      {editingDireccion && (
        <DireccionForm
          direccion={editingDireccion}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
          isLoading={updateDireccionMutation.isPending}
          isEditing={true}
        />
      )}

      {/* View Direccion Modal */}
      {viewingDireccion && (
        <DireccionViewModal
          direccion={viewingDireccion}
          onClose={handleViewClose}
          onEdit={() => {
            setViewingDireccion(null);
            setEditingDireccion(viewingDireccion);
          }}
          canEdit={canEditDirecciones}
        />
      )}

      {/* View Map Modal */}
      {mapModal.direccion && (
        <MapModal
          isOpen={mapModal.isOpen}
          onClose={() => setMapModal({ isOpen: false, direccion: null })}
          latitud={mapModal.direccion.latitud!}
          longitud={mapModal.direccion.longitud!}
          direccionTexto={mapModal.direccion.direccionTexto}
          title={`Ubicación: ${mapModal.direccion.nombre || "Dirección"}`}
        />
      )}

      {/* Delete Direccion Confirmation Dialog */}
      {canDeleteDirecciones && (
        <AlertDialog
          open={deleteDialog.isOpen}
          onOpenChange={closeDeleteDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar dirección?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de eliminar la dirección{" "}
                <strong>{deleteDialog.direccionName}</strong>. Esta acción no se
                puede deshacer y se perderán todos los datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={deleteDireccionMutation.isPending}
                onClick={closeDeleteDialog}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleteDireccionMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteDireccionMutation.isPending
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
