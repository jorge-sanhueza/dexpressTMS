import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useSearchEntidades } from "@/hooks/useEntidades";
import { useDebounce } from "@/hooks/useDebounce";
import type { Entidad } from "@/services/entidadesService";

interface EntidadSelectProps {
  onEntidadSelect: (entidad: Entidad | null) => void;
  selectedEntidad?: Entidad | null;
  tipoEntidad?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
}

export const EntidadSelect: React.FC<EntidadSelectProps> = ({
  onEntidadSelect,
  selectedEntidad,
  tipoEntidad,
  placeholder = "Buscar entidad...",
  disabled = false,
  required = false,
  label = "Entidad",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Use the new search hook
  const {
    data: entidades = [],
    isLoading,
    isFetching,
  } = useSearchEntidades(debouncedSearch, tipoEntidad);

  // Reset search when an entidad is selected
  useEffect(() => {
    if (selectedEntidad) {
      setSearchTerm(selectedEntidad.nombre || "");
    }
  }, [selectedEntidad]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleEntidadSelect = (entidad: Entidad) => {
    onEntidadSelect(entidad);
    setSearchTerm(entidad.nombre || "");
    setIsOpen(false);
  };

  const handleClear = () => {
    onEntidadSelect(null);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (entidades.length > 0 || debouncedSearch) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative">
      <Label className="text-[#798283] mb-2 block">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10 border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
        />

        {/* Clear button */}
        {selectedEntidad && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Loading indicator */}
        {(isLoading || isFetching) && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#D42B22]"></div>
          </div>
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && (debouncedSearch || entidades.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#798283]/20 rounded-lg shadow-lg max-h-60 overflow-auto">
          {isLoading || isFetching ? (
            <div className="p-4 text-center text-[#798283]/70">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D42B22] mx-auto"></div>
              <p className="mt-2 text-sm">Buscando entidades...</p>
            </div>
          ) : entidades.length === 0 ? (
            <div className="p-4 text-center text-[#798283]/70">
              {debouncedSearch
                ? "No se encontraron entidades"
                : "Escribe para buscar entidades"}
            </div>
          ) : (
            <div className="py-1">
              {entidades.map((entidad) => (
                <button
                  key={entidad.id}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-[#EFF4F9] focus:bg-[#EFF4F9] focus:outline-none transition-colors duration-150"
                  onClick={() => handleEntidadSelect(entidad)}
                >
                  <div className="font-medium text-[#798283]">
                    {entidad.nombre}
                  </div>
                  <div className="text-sm text-[#798283]/70">
                    RUT: {entidad.rut}
                    {entidad.tipoEntidad && (
                      <span className="ml-2 capitalize">
                        ({entidad.tipoEntidad.toLowerCase()})
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected entidad display */}
      {selectedEntidad && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-green-800">
                {selectedEntidad.nombre}
              </div>
              <div className="text-sm text-green-600">
                RUT: {selectedEntidad.rut}
                {selectedEntidad.tipoEntidad && (
                  <span className="ml-2 capitalize">
                    ({selectedEntidad.tipoEntidad.toLowerCase()})
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-green-600 hover:text-green-800"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
