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
import type { Rol } from "@/types/role";

interface RolesTableProps {
  data: Rol[];
  onEdit: (role: Rol) => void;
  onDelete: (roleId: string) => void;
  isLoading?: boolean;
}

export const RolesTable: React.FC<RolesTableProps> = ({
  data,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-[#798283]">Cargando roles...</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[#798283]/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[#798283]">Código</TableHead>
            <TableHead className="text-[#798283]">Nombre</TableHead>
            <TableHead className="text-[#798283]">Módulo</TableHead>
            <TableHead className="text-[#798283]">Acción</TableHead>
            <TableHead className="text-[#798283]">Estado</TableHead>
            <TableHead className="text-[#798283]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((role) => (
              <TableRow key={role.id} className="hover:bg-[#EFF4F9]">
                <TableCell>
                  <code className="text-sm bg-[#798283]/10 px-2 py-1 rounded text-[#798283]">
                    {role.codigo}
                  </code>
                </TableCell>
                <TableCell className="font-medium text-[#798283]">
                  {role.nombre}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-[#798283]/10 text-[#798283]"
                  >
                    {role.modulo}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      role.tipo_accion === "activar"
                        ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                        : role.tipo_accion === "crear"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : role.tipo_accion === "editar"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        : role.tipo_accion === "eliminar"
                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {role.tipo_accion}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      role.activo
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                  >
                    {role.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {role.codigo !== "admin_access" && (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(role)}
                        className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(role.id)}
                        className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        Eliminar
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-[#798283]/70 text-lg mb-2">
                    No se encontraron roles
                  </div>
                  <div className="text-sm text-[#798283]/50">
                    Comienza agregando tu primer rol.
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
