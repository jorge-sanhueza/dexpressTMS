import type { FilterConfig } from "@/components/TableFilters";

export const rolesFilterConfig: FilterConfig[] = [
  {
    key: "search",
    type: "search",
    label: "Buscar",
    placeholder: "Buscar por código, nombre o descripción...",
  },
  {
    key: "modulo",
    type: "select",
    label: "Módulo",
    placeholder: "Todos",
    options: [
      { value: "general", label: "General" },
      { value: "ordenes", label: "Órdenes" },
      { value: "usuarios", label: "Usuarios" },
      { value: "reportes", label: "Reportes" },
      { value: "sistema", label: "Sistema" },
    ],
    width: "w-full md:w-40",
  },
  {
    key: "tipo_accion",
    type: "select",
    label: "Acción",
    placeholder: "Todas",
    options: [
      { value: "ver", label: "Ver" },
      { value: "crear", label: "Crear" },
      { value: "editar", label: "Editar" },
      { value: "eliminar", label: "Eliminar" },
      { value: "activar", label: "Administrar" },
    ],
    width: "w-full md:w-40",
  },
  {
    key: "activo",
    type: "select",
    label: "Estado",
    placeholder: "Todos",
    options: [
      { value: "true", label: "Activo" },
      { value: "false", label: "Inactivo" },
    ],
    width: "w-full md:w-40",
  },
];
