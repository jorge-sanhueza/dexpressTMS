import type { FilterConfig } from "@/components/TableFilters";

export const profilesFilterConfig: FilterConfig[] = [
  {
    key: "search",
    type: "search",
    label: "Buscar",
    placeholder: "Buscar por nombre o descripción...",
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
