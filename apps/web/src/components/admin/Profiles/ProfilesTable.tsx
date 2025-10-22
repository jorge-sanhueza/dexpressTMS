import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
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
import { useState } from "react";
import type { Profile } from "@/types/profile";
import { ChevronUp, ChevronDown } from "lucide-react";

interface ProfilesTableProps {
  data: Profile[];
  onView: (profile: Profile) => void;
  onEdit: (profile: Profile) => void;
  onDelete: (profileId: string) => void;
  onAssignRoles: (profile: Profile) => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

export const ProfilesTable: React.FC<ProfilesTableProps> = ({
  data,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
  isDeleting = false,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Profile>[] = [
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
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => {
        const tipo = row.getValue("tipo") as string;
        const isAdministrativo = tipo.toLowerCase() === "administrativo";

        return (
          <Badge
            variant="secondary"
            className={
              isAdministrativo
                ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                : "bg-blue-100 text-blue-800 hover:bg-blue-100"
            }
          >
            {tipo}
          </Badge>
        );
      },
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => (
        <div className="text-[#798283]/70 max-w-md truncate">
          {row.getValue("descripcion") || "Sin descripción"}
        </div>
      ),
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
        const profile = row.original;
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(profile)}
              disabled={isDeleting}
              className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
            >
              Ver
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(profile)}
              disabled={isDeleting}
              className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
            >
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isDeleting}
                  className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  Desactivar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción desactivará el perfil{" "}
                    <strong>"{profile.nombre}"</strong>. Los usuarios con este
                    perfil perderán sus permisos hasta que sea reactivado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(profile.id)}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Desactivando...
                      </div>
                    ) : (
                      "Desactivar"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#798283]">Cargando perfiles...</div>
      </div>
    );
  }

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;
  const startItem = currentPage * pageSize - pageSize + 1;
  const endItem = Math.min(
    currentPage * pageSize,
    table.getFilteredRowModel().rows.length
  );
  const totalItems = table.getFilteredRowModel().rows.length;

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
                      No se encontraron perfiles
                    </div>
                    <div className="text-sm text-[#798283]/50">
                      {table.getState().columnFilters.length > 0
                        ? "Intenta ajustar los filtros de búsqueda."
                        : "Comienza agregando tu primer perfil."}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-[#798283]/10">
          <div className="text-sm text-[#798283]/70">
            Página {currentPage} de {totalPages} • Mostrando {startItem}-
            {endItem} de {totalItems} perfiles
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#798283]/10 transition-all duration-200"
            >
              Anterior
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    onClick={() => table.setPageIndex(page - 1)}
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
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 border border-[#798283]/30 rounded-lg text-[#798283] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#798283]/10 transition-all duration-200"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
