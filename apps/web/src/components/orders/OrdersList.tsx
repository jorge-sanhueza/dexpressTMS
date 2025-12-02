import React, { useState, useMemo } from "react";
import { WideLayout } from "../layout/WideLayout";
import { OrdersTable } from "./OrdersTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useOrders,
  useOrderStats,
  useCancelOrder,
  useDuplicateOrder,
  useExportOrders,
} from "@/hooks/useOrders";
import { useAuthStore } from "@/store/authStore";
import type { Order, OrdersFilter } from "@/types/order";
import { Input } from "@/components/ui/input";
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
import { useCompositeError } from "@/hooks/useErrorHandling";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Download, Filter, PlusCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const OrdersList: React.FC = () => {
  const navigate = useNavigate();

  // ========== STATE HOOKS ==========
  const { hasModulePermission, isInitialized } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string | undefined>(
    undefined
  );
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>(undefined);
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"list" | "stats">("list");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Cancel dialog
  const [cancelDialog, setCancelDialog] = useState<{
    isOpen: boolean;
    orderId: string | null;
    orderCode: string;
  }>({
    isOpen: false,
    orderId: null,
    orderCode: "",
  });

  // ========== DERIVED STATE & HOOKS ==========
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Build filters object for API
  const filters = useMemo(() => {
    const filterObj: OrdersFilter = {
      page: currentPage,
      limit: pageSize,
    };

    if (debouncedSearchTerm) filterObj.search = debouncedSearchTerm;
    if (estadoFilter && estadoFilter !== "all") filterObj.estado = estadoFilter;
    if (fechaDesde) filterObj.fechaDesde = fechaDesde;
    if (fechaHasta) filterObj.fechaHasta = fechaHasta;

    return filterObj;
  }, [
    debouncedSearchTerm,
    estadoFilter,
    fechaDesde,
    fechaHasta,
    currentPage,
    pageSize,
  ]);

  // ========== DATA FETCHING ==========
  const {
    data: ordersData,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useOrders(filters);

  const { data: statsData } = useOrderStats();

  const orders = ordersData?.orders || [];
  const totalCount = ordersData?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // ========== MUTATIONS ==========
  const cancelOrderMutation = useCancelOrder();
  const duplicateOrderMutation = useDuplicateOrder();
  const exportOrdersMutation = useExportOrders();

  // ========== ERROR HANDLING ==========
  const errors = useMemo(
    () => [
      { error, operation: "fetch" },
      { error: cancelOrderMutation.error, operation: "cancel" },
      { error: duplicateOrderMutation.error, operation: "duplicate" },
      { error: exportOrdersMutation.error, operation: "export" },
    ],
    [
      error,
      cancelOrderMutation.error,
      duplicateOrderMutation.error,
      exportOrdersMutation.error,
    ]
  );

  const { message: errorMessage, hasError } = useCompositeError(errors);

  // ========== PERMISSIONS ==========
  const canViewOrders = hasModulePermission("ordenes", "ver");
  const canCreateOrders = hasModulePermission("ordenes", "crear");
  const canEditOrders = hasModulePermission("ordenes", "editar");
  const canCancelOrders = hasModulePermission("ordenes", "eliminar");
  const canDuplicateOrders = hasModulePermission("ordenes", "crear");
  const canExportOrders = hasModulePermission("ordenes", "ver");

  // ========== EVENT HANDLERS ==========

  // Search & Filter handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEstadoFilter = (estado: string) => {
    setEstadoFilter(estado);
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
    setEstadoFilter(undefined);
    setFechaDesde(undefined);
    setFechaHasta(undefined);
    setCurrentPage(1);
  };

  const handleExportOrders = () => {
    exportOrdersMutation.mutate(filters);
  };

  // ---- NAVIGATION HANDLERS ----
  const handleCreateOrder = () => {
    if (canCreateOrders) {
      navigate("/ordenes/crear");
    }
  };

  const handleEdit = (order: Order) => {
    if (canEditOrders) {
      navigate(`/ordenes/editar/${order.id}`);
    }
  };

  const handleView = (order: Order) => {
    // Opción 1: redirigir a detalle completo
    navigate(`/ordenes/${order.id}`);

    // Opción 2: mantener modal simple (descomenta si prefieres modal)
    // setViewingOrder(order);
  };

  const handleDuplicate = (order: Order) => {
    if (canDuplicateOrders) {
      duplicateOrderMutation.mutate(order.id, {
        onSuccess: () => {
          toast.success("Orden duplicada correctamente");
          refetch();
        },
      });
    }
  };

  // Cancel order handlers
  const openCancelDialog = (order: Order) => {
    setCancelDialog({
      isOpen: true,
      orderId: order.id,
      orderCode: order.codigo,
    });
  };

  const closeCancelDialog = () => {
    setCancelDialog({
      isOpen: false,
      orderId: null,
      orderCode: "",
    });
  };

  const handleCancelConfirm = async () => {
    if (!cancelDialog.orderId) return;

    try {
      await cancelOrderMutation.mutateAsync(cancelDialog.orderId);
      closeCancelDialog();
      refetch();
    } catch (error) {
      console.error("Error cancelling order:", error);
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

  if (!canViewOrders) {
    return (
      <WideLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#798283] mb-4">
              Acceso No Autorizado
            </div>
            <p className="text-[#798283]/70">
              No tienes permisos para ver órdenes.
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
              <h2 className="text-2xl font-bold text-[#798283]">Órdenes</h2>
              <p className="text-[#798283]/70 mt-1">
                Gestiona las órdenes de transporte de tu organización
              </p>
            </div>
            <div className="flex items-center gap-3">
              {canExportOrders && (
                <Button
                  variant="outline"
                  onClick={handleExportOrders}
                  disabled={exportOrdersMutation.isPending}
                  className="border-[#798283]/20 text-[#798283] hover:bg-[#798283]/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportOrdersMutation.isPending
                    ? "Exportando..."
                    : "Exportar"}
                </Button>
              )}
              {canCreateOrders && (
                <Button
                  onClick={handleCreateOrder}
                  className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nueva Orden
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {hasError && <ErrorDisplay message={errorMessage!} />}

        {/* View Tabs */}
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as "list" | "stats")}
        >
          <TabsList className="grid w-full md:w-auto grid-cols-2 bg-muted/50 rounded-lg p-1">
            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground border border-border rounded-md transition-all duration-200"
            >
              Lista de Órdenes
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground border border-border rounded-md transition-all duration-200"
            >
              Estadísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {/* Enhanced Filters Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#798283]">
                  Filtros
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-8 px-3"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                </Button>
              </div>

              {showFilters && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Search Input */}
                    <div>
                      <Label htmlFor="search" className="text-[#798283]">
                        Buscar órdenes
                      </Label>
                      <Input
                        id="search"
                        type="text"
                        placeholder="Buscar por código, OT, cliente..."
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
                        value={estadoFilter || "all"}
                        onValueChange={handleEstadoFilter}
                      >
                        <SelectTrigger id="status-filter">
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                          <SelectItem value="PLANIFICADA">
                            Planificada
                          </SelectItem>
                          <SelectItem value="EN_TRANSPORTE">
                            En Transporte
                          </SelectItem>
                          <SelectItem value="ENTREGADA">Entregada</SelectItem>
                          <SelectItem value="CANCELADA">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Range - From */}
                    <div>
                      <Label htmlFor="fecha-desde" className="text-[#798283]">
                        Fecha desde
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !fechaDesde && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fechaDesde ? (
                              format(fechaDesde, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={fechaDesde}
                            onSelect={setFechaDesde}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Date Range - To */}
                    <div>
                      <Label htmlFor="fecha-hasta" className="text-[#798283]">
                        Fecha hasta
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !fechaHasta && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fechaHasta ? (
                              format(fechaHasta, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={fechaHasta}
                            onSelect={setFechaHasta}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Active filters display and Clear Filters button */}
                  <div className="flex items-center justify-between gap-2 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#798283]/70">
                        Filtros activos:
                      </span>
                      {searchTerm && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700"
                        >
                          Búsqueda: "{searchTerm}"
                        </Badge>
                      )}
                      {estadoFilter && estadoFilter !== "all" && (
                        <Badge
                          variant="secondary"
                          className="bg-green-50 text-green-700"
                        >
                          Estado: {estadoFilter.replace("_", " ")}
                        </Badge>
                      )}
                      {fechaDesde && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-50 text-yellow-700"
                        >
                          Desde: {format(fechaDesde, "dd/MM/yy")}
                        </Badge>
                      )}
                      {fechaHasta && (
                        <Badge
                          variant="secondary"
                          className="bg-purple-50 text-purple-700"
                        >
                          Hasta: {format(fechaHasta, "dd/MM/yy")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleClearFilters}
                        className="border-[#798283]/20 text-[#798283] hover:bg-[#798283]/10"
                      >
                        Limpiar Filtros
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-[#798283]">
                    Lista de Órdenes
                    {totalCount > 0 && (
                      <span className="ml-2 text-sm font-normal text-[#798283]/70">
                        ({totalCount} {totalCount === 1 ? "orden" : "órdenes"})
                      </span>
                    )}
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
                          Página {currentPage} de {totalPages}
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

                  <OrdersTable
                    data={orders}
                    onEdit={handleEdit}
                    onView={handleView}
                    onCancel={openCancelDialog}
                    onDuplicate={handleDuplicate}
                    canView={canViewOrders}
                    canEdit={canEditOrders}
                    canCancel={canCancelOrders}
                    canDuplicate={canDuplicateOrders}
                    isLoading={isLoading}
                  />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-6 border-t border-[#798283]/10 mt-6">
                      <div className="text-sm text-[#798283]/70">
                        Mostrando {orders.length} de {totalCount}{" "}
                        {totalCount === 1 ? "orden" : "órdenes"}
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
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
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
                          ))}
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
          </TabsContent>

          <TabsContent value="stats">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-[#798283]">
                    Total Órdenes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#798283]">
                    {statsData?.total || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-[#798283]">
                    Pendientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {statsData?.pendientes || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-[#798283]">
                    Planificadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {statsData?.planificadas || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-[#798283]">
                    En Transporte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {statsData?.enTransporte || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-[#798283]">
                    Entregadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {statsData?.entregadas || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-[#798283]">
                    Canceladas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {statsData?.canceladas || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel Order Confirmation Dialog */}
      {canCancelOrders && (
        <AlertDialog
          open={cancelDialog.isOpen}
          onOpenChange={closeCancelDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cancelar orden?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de cancelar la orden{" "}
                <strong>{cancelDialog.orderCode}</strong>. Esta acción no se
                puede deshacer y la orden quedará marcada como cancelada.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={cancelOrderMutation.isPending}
                onClick={closeCancelDialog}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelConfirm}
                disabled={cancelOrderMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {cancelOrderMutation.isPending
                  ? "Cancelando..."
                  : "Sí, cancelar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </WideLayout>
  );
};
