import React, { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useComunas } from "@/hooks/useComunas";
import type { Comuna } from "@/services/comunasService";

interface ComunaSelectProps {
  onComunaSelect: (comuna: Comuna | null) => void;
  selectedComuna?: Comuna | null;
  disabled?: boolean;
}

export const ComunaSelect: React.FC<ComunaSelectProps> = ({
  onComunaSelect,
  selectedComuna,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: comunas, isLoading } = useComunas({
    search: searchTerm || undefined,
  });

  const filteredComunas = useMemo(() => {
    return comunas || [];
  }, [comunas]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (!isOpen) setIsOpen(true);
  };

  const handleComunaSelect = (comuna: Comuna) => {
    onComunaSelect(comuna);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onComunaSelect(null);
    setSearchTerm("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const displayValue = selectedComuna
    ? `${selectedComuna.nombre}${
        selectedComuna.region ? `, ${selectedComuna.region.nombre}` : ""
      }`
    : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Label htmlFor="comuna-search">Comuna</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="comuna-search"
          type="text"
          placeholder="Buscar comuna..."
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          className="pr-10"
        />
        {selectedComuna && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
          >
            ×
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand mx-auto mb-2"></div>
              Buscando comunas...
            </div>
          ) : filteredComunas.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {searchTerm
                ? "No se encontraron comunas"
                : "Escribe para buscar comunas"}
            </div>
          ) : (
            filteredComunas.map((comuna) => (
              <button
                key={comuna.id}
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-muted focus:bg-muted focus:outline-none border-b border-border last:border-b-0"
                onClick={() => handleComunaSelect(comuna)}
              >
                <div className="font-medium text-foreground">
                  {comuna.nombre}
                </div>
                <div className="text-sm text-muted-foreground">
                  {comuna.region?.nombre}
                  {comuna.provincia && ` • ${comuna.provincia.nombre}`}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
