import React, { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useSearchEntidades } from "@/hooks/useEntidades";
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the search hook
  const {
    data: entidades = [],
    isLoading,
    isFetching,
    refetch,
  } = useSearchEntidades(searchTerm);

  useEffect(() => {
    console.log("EntidadSelect state:", {
      searchTerm,
      tipoEntidad,
      entidades,
      entidadesLength: entidades.length,
      isLoading,
      isFetching,
      isOpen,
      showDropdown: isOpen && searchTerm.length > 1,
    });
  }, [searchTerm, tipoEntidad, entidades, isLoading, isFetching, isOpen]);

  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset search when an entidad is selected
  useEffect(() => {
    if (selectedEntidad) {
      setSearchTerm(selectedEntidad.nombre || "");
    } else {
      setSearchTerm("");
    }
  }, [selectedEntidad]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 1) {
      setIsOpen(true);
      // Trigger refetch when user types
      refetch();
    } else {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.length > 1 && entidades.length > 0) {
      setIsOpen(true);
    }
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

  const showDropdown = isOpen && searchTerm.length > 1;

  return (
    <div className="relative" ref={containerRef}>
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
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10 border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
        />

        {/* Clear button */}
        {selectedEntidad && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            title="Clear selection"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
        {(isLoading || isFetching) && searchTerm.length > 1 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#D42B22]" />
          </div>
        )}
      </div>

      {/* Dropdown menu */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#798283]/20 rounded-lg shadow-lg max-h-60 overflow-auto">
          {isLoading || isFetching ? (
            <div className="p-4 text-center text-[#798283]/70">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D42B22] mx-auto" />
              <p className="mt-2 text-sm">Buscando...</p>
            </div>
          ) : entidades.length === 0 ? (
            <div className="p-4 text-center text-[#798283]/70">
              {searchTerm.length > 1
                ? "No se encontraron resultados"
                : "Escribe al menos 2 caracteres para buscar"}
            </div>
          ) : (
            <div className="py-1">
              {entidades.map((entidad) => (
                <button
                  key={entidad.id}
                  type="button"
                  onClick={() => handleEntidadSelect(entidad)}
                  className="w-full text-left px-4 py-3 hover:bg-[#EFF4F9] transition-colors border-b border-[#798283]/10 last:border-b-0"
                >
                  <div className="font-medium text-[#798283]">
                    {entidad.nombre}
                  </div>
                  <div className="text-sm text-[#798283]/70">
                    RUT: {entidad.rut}
                    {entidad.tipoEntidad && ` • ${entidad.tipoEntidad}`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected entidad display */}
      {selectedEntidad && !showDropdown && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-green-900">
                {selectedEntidad.nombre}
              </div>
              <div className="text-green-700">RUT: {selectedEntidad.rut}</div>
              {selectedEntidad.tipoEntidad && (
                <div className="text-green-700 text-xs mt-1">
                  Tipo: {selectedEntidad.tipoEntidad}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-green-600 hover:text-green-800 text-sm px-2 py-1"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
