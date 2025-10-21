import type { FilterConfig } from "@/components/TableFilters";

export const profilesFilterConfig: FilterConfig[] = [
  {
    key: "search",
    type: "search",
    label: "Buscar",
    placeholder: "Buscar por nombre, descripción o tipo...",
  },
  {
    key: "tipo",
    type: "select",
    label: "Tipo",
    placeholder: "Todos",
    options: [
      { value: "básico", label: "Básico" },
      { value: "avanzado", label: "Avanzado" },
      { value: "administrador", label: "Administrador" },
    ],
    width: "w-full md:w-40",
  },
  {
    key: "estado",
    type: "select",
    label: "Estado",
    placeholder: "Todos",
    options: [
      { value: "activo", label: "Activo" },
      { value: "inactivo", label: "Inactivo" },
    ],
    width: "w-full md:w-40",
  },
];
