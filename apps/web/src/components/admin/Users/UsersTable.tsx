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
import { useState, useMemo } from "react";
import type { User } from "@/types/user";
import { ChevronUp, ChevronDown } from "lucide-react";

interface UsersTableProps {
  data: User[];
  onEdit: (user: User) => void;
  onDeactivate: (userId: string) => void;
  isLoading?: boolean;
  isDeleting?: boolean;
  canEdit?: boolean;
  canDeactivate?: boolean;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  data,
  onEdit,
  onDeactivate,
  isLoading = false,
  isDeleting = false,
  canEdit = true,
  canDeactivate = true,
  totalCount = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Safe data handling
  const safeData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      console.warn("UsersTable: Invalid data provided", data);
      return [];
    }
    return data;
  }, [data]);

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "nombre",
        header: "Usuario",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-[#798283]">
              {row.getValue("nombre") || "Sin nombre"}
            </div>
            <div className="text-sm text-[#798283]/70">
              {row.original.email || "Sin email"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "contacto",
        header: "Contacto",
        cell: ({ row }) => (
          <div>
            <div className="text-sm text-[#798283]">
              {row.original.telefono || "No especificado"}
            </div>
            <div className="text-sm text-[#798283]/70">
              {row.getValue("contacto") || "Sin contacto"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "profile_type",
        header: "Perfil",
        cell: ({ row }) => {
          const profileType = row.getValue("profile_type") as string;
          const profileMap: { [key: string]: { color: string; text: string } } =
            {
              administrativo: {
                color: "bg-purple-100 text-purple-800",
                text: "Administrativo",
              },
              standard: {
                color: "bg-blue-100 text-blue-800",
                text: "Estándar",
              },
              operativo: {
                color: "bg-orange-100 text-orange-800",
                text: "Operativo",
              },
            };

          const profile =
            profileMap[profileType || "standard"] || profileMap.standard;

          return (
            <Badge
              variant="secondary"
              className={`${profile.color} hover:${
                profile.color.split(" ")[0]
              }`}
            >
              {profile.text}
            </Badge>
          );
        },
      },
      {
        accessorKey: "activo",
        header: "Estado",
        cell: ({ row }) => {
          const activo = row.getValue("activo");
          const isActive = activo === true || activo === "true" || activo === 1;

          return (
            <Badge
              variant="secondary"
              className={
                isActive
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-red-100 text-red-800 hover:bg-red-100"
              }
            >
              {isActive ? "Activo" : "Inactivo"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Fecha Creación",
        cell: ({ row }) => {
          const dateString = row.getValue("createdAt") as string;
          const formattedDate = dateString
            ? new Date(dateString).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "No disponible";

          return <div className="text-sm text-[#798283]">{formattedDate}</div>;
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex space-x-2 justify-end">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(user)}
                  disabled={isDeleting}
                  className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                >
                  Editar
                </Button>
              )}
              {canDeactivate && user.activo && (
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
                        Esta acción desactivará al usuario{" "}
                        <strong>"{user.nombre}"</strong>. El usuario no podrá
                        acceder al sistema hasta que sea reactivado.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeactivate(user.id)}
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
              )}
            </div>
          );
        },
      },
    ],
    [canEdit, canDeactivate, isDeleting, onEdit, onDeactivate]
  );

  // Use React Table for sorting and filtering only (not pagination)
  const table = useReactTable({
    data: safeData,
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
    // Remove pagination from React Table since we're doing server-side
    manualPagination: true,
  });

  // Server-side pagination calculations
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  console.log("Users Table pagination state:", {
    currentPage,
    totalPages,
    pageSize,
    startItem,
    endItem,
    totalCount,
    dataLength: safeData.length,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#798283]">Cargando usuarios...</div>
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
                      No se encontraron usuarios
                    </div>
                    <div className="text-sm text-[#798283]/50">
                      {table.getState().columnFilters.length > 0
                        ? "Intenta ajustar los filtros de búsqueda."
                        : "Comienza agregando tu primer usuario."}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Server-side Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-[#798283]/10">
          <div className="text-sm text-[#798283]/70">
            Página {currentPage} de {totalPages} • Mostrando {startItem}-
            {endItem} de {totalCount} usuarios
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => onPageChange?.(currentPage - 1)}
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
                    onClick={() => onPageChange?.(page)}
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
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
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
