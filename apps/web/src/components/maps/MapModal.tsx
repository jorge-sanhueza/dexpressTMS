// components/maps/MapModal.tsx
import React from "react";
import { Button } from "../ui/button";
import { GoogleMap } from "./GoogleMap";

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitud: number;
  longitud: number;
  direccionTexto?: string;
  title?: string;
}

export const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  onClose,
  latitud,
  longitud,
  direccionTexto,
  title = "Ubicación en el mapa",
}) => {
  if (!isOpen) return null;

  const handleOpenInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${latitud},${longitud}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-zinc-500/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-[#798283]/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#798283]">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-[#798283] hover:text-[#D42B22]"
            >
              ×
            </Button>
          </div>
          {direccionTexto && (
            <p className="text-[#798283]/70 text-sm mt-2">{direccionTexto}</p>
          )}
        </div>

        <div className="p-6">
          <GoogleMap
            latitud={latitud}
            longitud={longitud}
            direccionTexto={direccionTexto}
            height="400px"
          />
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-[#798283]/10">
          <Button
            variant="outline"
            onClick={handleOpenInGoogleMaps}
            className="border-[#798283]/30 text-[#798283] hover:bg-[#798283]/10"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Abrir en Google Maps
          </Button>
          <Button
            onClick={onClose}
            className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
