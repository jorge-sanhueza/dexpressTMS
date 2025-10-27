import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React, { useState } from "react";
import type { Rol } from "@/types/role";
import { ChevronUp, ChevronDown } from "lucide-react";

interface RolesTableProps {
  data: Rol[];
  onEdit: (role: Rol) => void;
  onDelete: (roleId: string) => void;
  isLoading?: boolean;
  isDeleting?: boolean;
  canEdit: boolean;
  canDelete: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const RolesTable: React.FC<RolesTableProps> = React.memo(
  ({
    data,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
    isLoading = false,
    isDeleting = false,
    pagination,
  }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const getTipoAccionBadgeVariant = (tipoAccion: string) => {
      switch (tipoAccion) {
        case "activar":
          return "bg-purple-100 text-purple-800 hover:bg-purple-100";
        case "crear":
          return "bg-green-100 text-green-800 hover:bg-green-100";
        case "editar":
          return "bg-blue-100 text-blue-800 hover:bg-blue-100";
        case "eliminar":
          return "bg-red-100 text-red-800 hover:bg-red-100";
        default:
          return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      }
    };

    const columns: ColumnDef<Rol>[] = [
      {
        accessorKey: "codigo",
        header: "Código",
        cell: ({ row }) => (
          <code className="text-sm bg-[#798283]/10 px-2 py-1 rounded text-[#798283]">
            {row.getValue("codigo")}
          </code>
        ),
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
        cell: ({ row }) => (
          <div className="font-medium text-[#798283]">
            {row.getValue("nombre")}
          </div>
        ),
      },
      {
        accessorKey: "modulo",
        header: "Módulo",
        cell: ({ row }) => (
          <Badge variant="secondary" className="bg-[#798283]/10 text-[#798283]">
            {row.getValue("modulo")}
          </Badge>
        ),
      },
      {
        accessorKey: "tipo_accion",
        header: "Acción",
        cell: ({ row }) => {
          const tipoAccion = row.getValue("tipo_accion") as string;
          return (
            <Badge
              variant="secondary"
              className={getTipoAccionBadgeVariant(tipoAccion)}
            >
              {tipoAccion}
            </Badge>
          );
        },
      },
      {
        accessorKey: "activo",
        header: "Estado",
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className={
              row.getValue("activo")
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-red-100 text-red-800 hover:bg-red-100"
            }
          >
            {row.getValue("activo") ? "Activo" : "Inactivo"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          const role = row.original;
          return (
            <div className="flex space-x-2">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(role)}
                  disabled={isDeleting}
                  className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                >
                  Editar
                </Button>
              )}
              {canDelete && role.codigo !== "admin_access" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isDeleting}
                      className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. El rol{" "}
                        <strong>"{role.nombre}"</strong> será eliminado
                        permanentemente del sistema.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(role.id)}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isDeleting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Eliminando...
                          </div>
                        ) : (
                          "Eliminar"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          );
        },
      },
    ];

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      state: {
        sorting,
        columnFilters,
      },
    });

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-[#798283]">Cargando roles...</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-md border border-[#798283]/10">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="text-[#798283] cursor-pointer hover:bg-[#798283]/5 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {{
                            asc: <ChevronUp className="ml-1 h-4 w-4" />,
                            desc: <ChevronDown className="ml-1 h-4 w-4" />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-[#EFF4F9]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="text-[#798283]/70 text-lg mb-2">
                        No se encontraron roles
                      </div>
                      <div className="text-sm text-[#798283]/50">
                        {table.getState().columnFilters.length > 0
                          ? "Intenta ajustar los filtros de búsqueda."
                          : "Comienza agregando tu primer rol."}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Server-side Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t border-[#798283]/10">
            <div className="text-sm text-[#798283]/70">
              Página {pagination.currentPage} de {pagination.totalPages} •
              Mostrando{" "}
              {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}
              de {pagination.totalItems} roles
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  pagination.onPageChange(Number(pagination.currentPage) - 1)
                }
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#798283]/10 transition-all duration-200"
              >
                Anterior
              </Button>

              <div className="flex gap-1">
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <Button
                    key={page}
                    onClick={() => pagination.onPageChange(Number(page))}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                      Number(pagination.currentPage) === page
                        ? "bg-[#D42B22] text-white"
                        : "border border-[#798283]/30 text-[#798283] hover:bg-[#798283]/10"
                    }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                onClick={() =>
                  pagination.onPageChange(Number(pagination.currentPage) + 1)
                }
                disabled={
                  Number(pagination.currentPage) === pagination.totalPages
                }
                className="px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#798283]/10 transition-all duration-200"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);
