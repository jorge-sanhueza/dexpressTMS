import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Contacto } from "@/types/contacto";

interface ContactosTableProps {
  data: Contacto[];
  onEdit: (contacto: Contacto) => void;
  onView: (contacto: Contacto) => void;
  onDeactivate: (contacto: Contacto) => void;
  onActivate: (id: string) => void;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canActivate: boolean;
  isLoading?: boolean;
}

export const ContactosTable: React.FC<ContactosTableProps> = ({
  data,
  onEdit,
  onView,
  onDeactivate,
  onActivate,
  canView,
  canEdit,
  canDelete,
  canActivate,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D42B22]"></div>
        <span className="ml-2 text-[#798283]/70">Cargando contactos...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-[#798283]/70 text-lg mb-2">
            No se encontraron contactos
          </div>
          <div className="text-sm text-[#798283]/50">
            Comienza agregando tu primer contacto o ajusta los filtros de
            búsqueda.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[#798283]/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[#798283] font-medium">Nombre</TableHead>
            <TableHead className="text-[#798283] font-medium">RUT</TableHead>
            <TableHead className="text-[#798283] font-medium">Cargo</TableHead>
            <TableHead className="text-[#798283] font-medium">Email</TableHead>
            <TableHead className="text-[#798283] font-medium">
              Teléfono
            </TableHead>
            <TableHead className="text-[#798283] font-medium">
              Entidad
            </TableHead>
            <TableHead className="text-[#798283] font-medium">Tipo</TableHead>
            <TableHead className="text-[#798283] font-medium">Estado</TableHead>
            <TableHead className="text-[#798283] font-medium">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((contacto) => (
            <TableRow
              key={contacto.id}
              className="hover:bg-[#798283]/5 transition-colors duration-150"
            >
              <TableCell>
                <div className="font-medium text-[#798283]">
                  {contacto.nombre}
                </div>
                {contacto.contacto && (
                  <div className="text-sm text-[#798283]/70">
                    Contacto: {contacto.contacto}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {contacto.rut}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {contacto.cargo || "-"}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {contacto.email || "-"}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {contacto.telefono || "-"}
              </TableCell>
              <TableCell className="text-sm text-[#798283]">
                {contacto.entidad?.nombre || "-"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                >
                  {contacto.esPersonaNatural ? "Persona Natural" : "Empresa"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={contacto.activo ? "default" : "secondary"}
                  className={
                    contacto.activo
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {contacto.activo ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {canView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(contacto)}
                      className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                    >
                      Ver
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(contacto)}
                      className="h-8 px-2 text-[#798283] hover:text-[#D42B22] hover:bg-[#D42B22]/10"
                    >
                      Editar
                    </Button>
                  )}
                  {canDelete && contacto.activo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeactivate(contacto)}
                      className="h-8 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      Desactivar
                    </Button>
                  )}
                  {canActivate && !contacto.activo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onActivate(contacto.id)}
                      className="h-8 px-2 text-green-600 hover:text-green-800 hover:bg-green-50"
                    >
                      Activar
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
