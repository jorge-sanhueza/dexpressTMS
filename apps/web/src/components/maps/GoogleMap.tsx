/// <reference types="google.maps" />
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, MapPin } from "lucide-react";

interface GoogleMapProps {
  latitud: number;
  longitud: number;
  direccionTexto?: string;
  className?: string;
  zoom?: number;
  height?: string;
  mapTypeControl?: boolean;
  streetViewControl?: boolean;
}

// Global script loading state
let googleMapsScript: HTMLScriptElement | null = null;
let googleMapsLoadPromise: Promise<void> | null = null;

export const GoogleMap: React.FC<GoogleMapProps> = ({
  latitud,
  longitud,
  direccionTexto,
  className = "",
  zoom = 15,
  height = "300px",
  mapTypeControl = false,
  streetViewControl = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const loadGoogleMaps = useCallback((): Promise<void> => {
    if (window.google?.maps) {
      return Promise.resolve();
    }

    if (googleMapsLoadPromise) {
      return googleMapsLoadPromise;
    }

    googleMapsLoadPromise = new Promise((resolve, reject) => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        reject(new Error("Google Maps API key no configurada"));
        return;
      }

      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      );

      if (existingScript) {
        const checkLoaded = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(checkLoaded);
            resolve();
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkLoaded);
          reject(new Error("Timeout loading Google Maps"));
        }, 10000);
        return;
      }

      googleMapsScript = document.createElement("script");
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      googleMapsScript.async = true;
      googleMapsScript.defer = true;

      googleMapsScript.onload = () => {
        if (window.google?.maps) {
          resolve();
        } else {
          reject(new Error("Google Maps not available after script load"));
        }
      };

      googleMapsScript.onerror = () => {
        reject(new Error("Failed to load Google Maps script"));
      };

      document.head.appendChild(googleMapsScript);
    });

    return googleMapsLoadPromise;
  }, []);

  const initializeMap = useCallback(async () => {
    if (!mapContainerRef.current || !window.google?.maps) {
      setError("Map container or Google Maps not available");
      setIsLoading(false);
      return;
    }

    try {
      // Create map instance with optimized options
      mapInstanceRef.current = new google.maps.Map(mapContainerRef.current, {
        center: { lat: latitud, lng: longitud },
        zoom: zoom,
        mapTypeControl: mapTypeControl,
        streetViewControl: streetViewControl,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: "cooperative",
        styles: [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      // Create marker with custom icon
      markerInstanceRef.current = new google.maps.Marker({
        map: mapInstanceRef.current,
        position: { lat: latitud, lng: longitud },
        title: direccionTexto || "Ubicación",
        animation: google.maps.Animation.DROP,
      });

      // Add info window if address provided
      if (direccionTexto) {
        infoWindowRef.current = new google.maps.InfoWindow({
          content: `<div class="p-2"><strong>Ubicación</strong><br/>${direccionTexto}</div>`,
        });

        markerInstanceRef.current.addListener("click", () => {
          infoWindowRef.current?.open(
            mapInstanceRef.current!,
            markerInstanceRef.current!
          );
        });
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error initializing map:", err);
      setError(err instanceof Error ? err.message : "Error creating map");
      setIsLoading(false);
    }
  }, [
    latitud,
    longitud,
    direccionTexto,
    zoom,
    mapTypeControl,
    streetViewControl,
  ]);

  const loadMap = useCallback(async () => {
    if (shouldLoad) return;

    setShouldLoad(true);
    setIsLoading(true);
    setError(null);

    try {
      await loadGoogleMaps();
      await initializeMap();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading map");
      setIsLoading(false);
    }
  }, [shouldLoad, loadGoogleMaps, initializeMap]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setMap(null);
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, []);

  const handleRetry = () => {
    setError(null);
    loadMap();
  };

  if (!shouldLoad) {
    return (
      <div
        className={`relative bg-gray-50 rounded-lg border border-[#798283]/20 ${className} cursor-pointer hover:bg-gray-100 transition-colors`}
        style={{ height }}
        onClick={loadMap}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[#798283]/70">
          <div className="relative">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 border-2 border-[#798283]/30 border-t-[#D42B22] rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-sm font-medium">Ver en mapa</p>
          <p className="text-xs mt-1 px-4 text-center">
            Haz clic para cargar la ubicación
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div
        ref={mapContainerRef}
        className="rounded-lg border border-[#798283]/20 w-full h-full"
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10 rounded-lg">
          <div className="text-center text-[#798283]/70">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-[#D42B22]" />
            </div>
            <p className="text-sm font-medium">Cargando mapa...</p>
            <p className="text-xs mt-1">Por favor espera</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-80 z-10 rounded-lg">
          <div className="text-center text-[#798283]/70">
            <div className="w-12 h-12 mx-auto mb-3 text-red-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.218 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium mb-2">Error al cargar el mapa</p>
            <p className="text-xs mb-4 max-w-xs">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-[#D42B22] text-white rounded hover:bg-[#B3251E] text-sm transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
