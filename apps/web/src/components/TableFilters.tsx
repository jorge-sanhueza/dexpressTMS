import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterConfig {
  key: string;
  type: "search" | "select";
  label: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  width?: string;
}

interface TableFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  filterConfigs: FilterConfig[];
  resultsInfo?: {
    currentCount: number;
    totalCount: number;
    filteredCount?: number;
    singularLabel: string;
    pluralLabel: string;
  };
}

export const TableFilters: React.FC<TableFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  filterConfigs,
  resultsInfo,
}) => {
  Object.values(filters).some(
    (value) => value !== "" && value !== undefined && value !== null
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
        {filterConfigs.map((filter) => (
          <div
            key={filter.key}
            className={filter.width ? filter.width : "flex-1"}
          >
            <label className="block text-sm font-medium text-[#798283] mb-2">
              {filter.label}
            </label>
            {filter.type === "search" ? (
              <Input
                type="text"
                value={filters[filter.key] || ""}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="placeholder-[#798283]/60 text-[#798283]"
                placeholder={filter.placeholder}
              />
            ) : (
              <Select
                value={filters[filter.key]}
                onValueChange={(value) => onFilterChange(filter.key, value)}
              >
                <SelectTrigger
                  className={`text-[#798283] border-[#798283]/30 focus:ring-[#D42B22] ${
                    filter.width ? filter.width : "w-full"
                  }`}
                >
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}

        <Button
          onClick={onClearFilters}
          className="bg-[#798283]/10 hover:bg-[#798283]/20 text-[#798283] px-4 py-2 rounded-lg transition-all duration-200 font-semibold h-[42px]"
        >
          Limpiar
        </Button>
      </div>
      {resultsInfo && (
        <div className="text-sm text-[#798283]/70">
          {resultsInfo.currentCount}{" "}
          {resultsInfo.currentCount === 1
            ? resultsInfo.singularLabel
            : resultsInfo.pluralLabel}{" "}
          {resultsInfo.filteredCount &&
          resultsInfo.filteredCount !== resultsInfo.totalCount
            ? ` (filtrados de ${resultsInfo.totalCount} totales)`
            : ` de ${resultsInfo.totalCount} totales`}
        </div>
      )}
    </div>
  );
};
