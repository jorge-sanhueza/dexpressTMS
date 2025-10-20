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
import { useState } from "react";
import type { Client } from "@/types/client";

interface ClientsTableProps {
  data: Client[];
  onEdit: (client: Client) => void;
  onView: (client: Client) => void;
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
  canManageClients: boolean;
  isLoading?: boolean;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  data,
  onEdit,
  onView,
  onDeactivate,
  onActivate,
  canManageClients,
  isLoading = false,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "nombre",
      header: "Cliente",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="font-medium text-foreground">
            {row.getValue("nombre") || "Sin nombre"}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.rut}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "contacto",
      header: "Contacto",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="text-foreground">{row.getValue("contacto")}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "comuna.nombre",
      header: "Ubicación",
      cell: ({ row }) => (
        <div className="text-foreground">
          {row.original.comuna?.nombre || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("activo") ? "default" : "secondary"}
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
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row.original)}
            className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            Ver
          </Button>
          {canManageClients && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(row.original)}
                className="h-8 px-2 text-green-600 hover:text-green-800 hover:bg-green-50"
              >
                Editar
              </Button>
              {row.original.activo ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeactivate(row.original.id)}
                  className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  Desactivar
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onActivate(row.original.id)}
                  className="h-8 px-2 text-green-600 hover:text-green-800 hover:bg-green-50"
                >
                  Activar
                </Button>
              )}
            </>
          )}
        </div>
      ),
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
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                    <div className="text-muted-foreground text-lg mb-2">
                      No se encontraron clientes
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {table.getState().columnFilters.length > 0
                        ? "Intenta ajustar los filtros de búsqueda."
                        : "Comienza agregando tu primer cliente."}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} clientes
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};
