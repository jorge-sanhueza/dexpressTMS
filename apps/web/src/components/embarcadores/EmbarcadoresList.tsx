import React, { useState } from "react";
import { WideLayout } from "../layout/WideLayout";
import { EmbarcadoresTable } from "./EmbarcadoresTable";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  useEmbarcadores,
  useCreateEmbarcador,
  useUpdateEmbarcador,
  useDeleteEmbarcador,
} from "../../hooks/useEmbarcadores";
import { useAuthStore } from "../../store/authStore";
import type {
  Embarcador,
  CreateEmbarcadorDto,
} from "../../services/embarcadoresService";
import { Input } from "../ui/input";
import { EmbarcadorForm } from "./EmbarcadorForm";
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
import { EmbarcadorViewModal } from "./EmbarcadorViewModal";

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

export const EmbarcadoresList: React.FC = () => {
  const { tenant, hasModulePermission } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string | undefined>(undefined);
  const [activoFilter, setActivoFilter] = useState<boolean | undefined>(
    undefined
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEmbarcador, setEditingEmbarcador] = useState<Embarcador | null>(
    null
  );
  const [viewingEmbarcador, setViewingEmbarcador] = useState<Embarcador | null>(
    null
  );

  // Alert Dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    embarcadorId: string | null;
    embarcadorName: string;
  }>({
    isOpen: false,
    embarcadorId: null,
    embarcadorName: "",
  });

  // Use debounced search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Build filters object for API - matches your backend EmbarcadoresFilterDto
  const filters = React.useMemo(() => {
    const filterObj: any = {};

    if (debouncedSearchTerm) {
      filterObj.search = debouncedSearchTerm;
    }

    if (tipoFilter) {
      filterObj.tipo = tipoFilter;
    }

    if (activoFilter !== undefined) {
      filterObj.activo = activoFilter;
    }

    // Add pagination if needed
    filterObj.page = 1;
    filterObj.limit = 50;

    return filterObj;
  }, [debouncedSearchTerm, tipoFilter, activoFilter]);

  // Granular permissions for embarcadores module
  const canViewEmbarcadores = hasModulePermission("embarcadores", "ver");
  const canCreateEmbarcadores = hasModulePermission("embarcadores", "crear");
  const canEditEmbarcadores = hasModulePermission("embarcadores", "editar");
  const canDeleteEmbarcadores = hasModulePermission("embarcadores", "eliminar");
  const canActivateEmbarcadores = hasModulePermission(
    "embarcadores",
    "activar"
  );

  // If user doesn't have view permission, show unauthorized message
  if (!canViewEmbarcadores) {
    return (
      <WideLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#798283] mb-4">
              Acceso No Autorizado
            </div>
            <p className="text-[#798283]/70">
              No tienes permisos para ver embarcadores.
            </p>
            <p className="text-sm text-[#798283]/50 mt-2">
              Contacta al administrador del sistema para solicitar acceso.
            </p>
          </div>
        </div>
      </WideLayout>
    );
  }

  // TanStack Query hooks with keepPreviousData
  const {
    data: embarcadoresData,
    isLoading,
    isFetching,
    error,
  } = useEmbarcadores(tenant?.id || "", filters);

  const embarcadores = embarcadoresData?.embarcadores || [];
  const totalCount = embarcadoresData?.total || 0;

  const createEmbarcadorMutation = useCreateEmbarcador();
  const updateEmbarcadorMutation = useUpdateEmbarcador();
  const deleteEmbarcadorMutation = useDeleteEmbarcador();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleTipoFilter = (tipo: string | undefined) => {
    setTipoFilter(tipo);
  };

  const handleActivoFilter = (activo: boolean | undefined) => {
    setActivoFilter(activo);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (embarcador: Embarcador) => {
    setDeleteDialog({
      isOpen: true,
      embarcadorId: embarcador.id,
      embarcadorName: embarcador.nombre,
    });
  };

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      embarcadorId: null,
      embarcadorName: "",
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.embarcadorId) return;

    try {
      await deleteEmbarcadorMutation.mutateAsync(deleteDialog.embarcadorId);
      toast.success("Embarcador eliminado correctamente");
      closeDeleteDialog();
    } catch (err: any) {
      console.error("Error deleting embarcador:", err);
      toast.error(err.message || "Error al eliminar el embarcador");
    }
  };

  const handleEdit = (embarcador: Embarcador) => {
    if (canEditEmbarcadores) {
      setEditingEmbarcador(embarcador);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await updateEmbarcadorMutation.mutateAsync({
        id,
        embarcadorData: { activo: true },
      });
      toast.success("Embarcador activado correctamente");
    } catch (err: any) {
      console.error("Error activating embarcador:", err);
      toast.error(err.message || "Error al activar el embarcador");
    }
  };

  const handleEditSubmit = async (embarcadorData: CreateEmbarcadorDto) => {
    if (!editingEmbarcador) return;

    try {
      await updateEmbarcadorMutation.mutateAsync({
        id: editingEmbarcador.id,
        embarcadorData,
      });
      setEditingEmbarcador(null);
      toast.success("Embarcador actualizado correctamente");
    } catch (err: any) {
      console.error("Error updating embarcador:", err);
      toast.error(err.message || "Error al actualizar el embarcador");
    }
  };

  const handleEditCancel = () => {
    setEditingEmbarcador(null);
  };

  const handleView = (embarcador: Embarcador) => {
    setViewingEmbarcador(embarcador);
  };

  const handleViewClose = () => {
    setViewingEmbarcador(null);
  };

  const handleCreateEmbarcador = () => {
    if (canCreateEmbarcadores) {
      setIsCreateModalOpen(true);
    }
  };

  const handleCreateSubmit = async (embarcadorData: CreateEmbarcadorDto) => {
    try {
      await createEmbarcadorMutation.mutateAsync(embarcadorData);
      setIsCreateModalOpen(false);
      toast.success("Embarcador creado correctamente");
    } catch (err: any) {
      console.error("Error creating embarcador:", err);
      toast.error(err.message || "Error al crear el embarcador");
    }
  };

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTipoFilter(undefined);
    setActivoFilter(undefined);
  };

  const isInitialLoad = isLoading && embarcadores.length === 0;

  if (isInitialLoad) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#798283]">Cargando embarcadores...</div>
      </div>
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
                Gestión de Embarcadores
              </h2>
              <p className="text-[#798283]/70">
                Crear y administrar embarcadores{" "}
                {tenant && `- ${tenant.nombre}`}
              </p>
            </div>
            {canCreateEmbarcadores && (
              <Button
                onClick={handleCreateEmbarcador}
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
                disabled={createEmbarcadorMutation.isPending}
              >
                {createEmbarcadorMutation.isPending
                  ? "Creando..."
                  : "+ Nuevo Embarcador"}
              </Button>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {(error ||
          createEmbarcadorMutation.error ||
          updateEmbarcadorMutation.error ||
          deleteEmbarcadorMutation.error) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-700">
              {error?.message ||
                createEmbarcadorMutation.error?.message ||
                updateEmbarcadorMutation.error?.message ||
                deleteEmbarcadorMutation.error?.message ||
                "Ha ocurrido un error inesperado"}
            </div>
          </div>
        )}

        {/* Enhanced Filters Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Buscar embarcadores
              </label>
              <Input
                type="text"
                placeholder="Buscar por nombre, RUT, contacto o email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Tipo Filter */}
            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Tipo
              </label>
              <div className="flex gap-2">
                <Button
                  variant={tipoFilter === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTipoFilter(undefined)}
                  className={
                    tipoFilter === undefined
                      ? "bg-[#D42B22] hover:bg-[#B3251E] text-white"
                      : ""
                  }
                >
                  Todos
                </Button>
                <Button
                  variant={tipoFilter === "exportador" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTipoFilter("exportador")}
                  className={
                    tipoFilter === "exportador"
                      ? "bg-[#D42B22] hover:bg-[#B3251E] text-white"
                      : ""
                  }
                >
                  Exportadores
                </Button>
                <Button
                  variant={tipoFilter === "importador" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTipoFilter("importador")}
                  className={
                    tipoFilter === "importador"
                      ? "bg-[#D42B22] hover:bg-[#B3251E] text-white"
                      : ""
                  }
                >
                  Importadores
                </Button>
                <Button
                  variant={tipoFilter === "nacional" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTipoFilter("nacional")}
                  className={
                    tipoFilter === "nacional"
                      ? "bg-[#D42B22] hover:bg-[#B3251E] text-white"
                      : ""
                  }
                >
                  Nacionales
                </Button>
              </div>
            </div>

            {/* Estado Filter */}
            <div>
              <label className="block text-sm font-medium text-[#798283] mb-2">
                Estado
              </label>
              <div className="flex gap-2">
                <Button
                  variant={activoFilter === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleActivoFilter(undefined)}
                  className={
                    activoFilter === undefined
                      ? "bg-[#D42B22] hover:bg-[#B3251E] text-white"
                      : ""
                  }
                >
                  Todos
                </Button>
                <Button
                  variant={activoFilter === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleActivoFilter(true)}
                  className={
                    activoFilter === true
                      ? "bg-[#D42B22] hover:bg-[#B3251E] text-white"
                      : ""
                  }
                >
                  Activos
                </Button>
                <Button
                  variant={activoFilter === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleActivoFilter(false)}
                  className={
                    activoFilter === false
                      ? "bg-[#D42B22] hover:bg-[#B3251E] text-white"
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
            <span className="text-sm text-[#798283]/70">Filtros activos:</span>
            {searchTerm && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                Búsqueda: "{searchTerm}"
              </Badge>
            )}
            {tipoFilter && (
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Tipo: {tipoFilter}
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
            {(searchTerm ||
              tipoFilter !== undefined ||
              activoFilter !== undefined) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 text-xs text-[#798283]/70 hover:text-[#798283]"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Embarcadores Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#798283]">
                Lista de Embarcadores
              </h3>
              <div className="text-sm text-[#798283]/70">
                {isFetching ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#D42B22]"></div>
                    Actualizando...
                  </div>
                ) : (
                  <>
                    {embarcadores.length} de {totalCount}{" "}
                    {totalCount === 1 ? "embarcador" : "embarcadores"}
                  </>
                )}
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

              <EmbarcadoresTable
                data={embarcadores}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={openDeleteDialog}
                onActivate={handleActivate}
                canView={canViewEmbarcadores}
                canEdit={canEditEmbarcadores}
                canDelete={canDeleteEmbarcadores}
                canActivate={canActivateEmbarcadores}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create Embarcador Modal */}
      {isCreateModalOpen && (
        <EmbarcadorForm
          onSubmit={handleCreateSubmit}
          onCancel={handleCreateCancel}
          isLoading={createEmbarcadorMutation.isPending}
        />
      )}

      {/* Edit Embarcador Modal */}
      {editingEmbarcador && (
        <EmbarcadorForm
          embarcador={editingEmbarcador}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
          isLoading={updateEmbarcadorMutation.isPending}
          isEditing={true}
        />
      )}

      {/* View Embarcador Modal */}
      {viewingEmbarcador && (
        <EmbarcadorViewModal
          embarcador={viewingEmbarcador}
          onClose={handleViewClose}
          onEdit={() => {
            setViewingEmbarcador(null);
            setEditingEmbarcador(viewingEmbarcador);
          }}
          canEdit={canEditEmbarcadores}
        />
      )}

      {/* Delete Embarcador Confirmation Dialog */}
      {canDeleteEmbarcadores && (
        <AlertDialog
          open={deleteDialog.isOpen}
          onOpenChange={closeDeleteDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar embarcador?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de eliminar al embarcador{" "}
                <strong>{deleteDialog.embarcadorName}</strong>. Esta acción no
                se puede deshacer y se perderán todos los datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={deleteEmbarcadorMutation.isPending}
                onClick={closeDeleteDialog}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleteEmbarcadorMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteEmbarcadorMutation.isPending
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
