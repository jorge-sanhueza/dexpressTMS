import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import type { Embarcador } from "../../services/embarcadoresService";
import { Button } from "../ui/button";

interface EmbarcadoresTableProps {
  data: Embarcador[];
  onView: (id: string) => void;
  onEdit: (embarcador: Embarcador) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const EmbarcadoresTable: React.FC<EmbarcadoresTableProps> = ({
  data,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  // Define columns
  const columns: ColumnDef<Embarcador>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div
          className="font-medium max-w-[150px] truncate"
          title={row.getValue("nombre")}
        >
          {row.getValue("nombre")}
        </div>
      ),
    },
    {
      accessorKey: "razonSocial",
      header: "Razón Social",
      cell: ({ row }) => (
        <div
          className="max-w-[180px] truncate"
          title={row.getValue("razonSocial")}
        >
          {row.getValue("razonSocial")}
        </div>
      ),
    },
    {
      accessorKey: "comuna.nombre",
      header: "Comuna",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.comuna?.nombre || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "contacto",
      header: "Contacto",
      cell: ({ row }) => <div>{row.getValue("contacto")}</div>,
    },
    {
      accessorKey: "direccion",
      header: "Dirección",
      cell: ({ row }) => (
        <div
          className="max-w-[200px] truncate"
          title={row.getValue("direccion")}
        >
          {row.getValue("direccion")}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="max-w-[180px] truncate" title={row.getValue("email")}>
          {row.getValue("email")}
        </div>
      ),
    },
    {
      accessorKey: "rut",
      header: "RUT",
      cell: ({ row }) => (
        <code className="bg-muted px-2 py-1 rounded text-sm">
          {row.getValue("rut")}
        </code>
      ),
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ row }) => <div>{row.getValue("telefono")}</div>,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="link"
            onClick={() => onView(row.original.id)}
            className="h-auto p-0 text-zinc-500 hover:text-blue-800"
          >
            Ver
          </Button>
          <Button
            variant="link"
            onClick={() => onEdit(row.original)}
            className="h-auto p-0 text-zinc-500 hover:text-blue-800"
          >
            Editar
          </Button>
          <Button
            variant="link"
            onClick={() => onDelete(row.original.id)}
            className="h-auto p-0 text-red-600 hover:text-red-800"
          >
            Eliminar
          </Button>
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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Cargando embarcadores...</div>
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
                  No se encontraron embarcadores.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {table.getFilteredRowModel().rows.length} embarcadores
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="border rounded p-4"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            className="border rounded p-4"
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
