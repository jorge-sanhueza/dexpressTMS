/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from "react";

interface GoogleMapProps {
  latitud: number;
  longitud: number;
  direccionTexto?: string;
  className?: string;
  zoom?: number;
  height?: string;
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
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<google.maps.Marker | null>(null);

  const loadGoogleMaps = (): Promise<void> => {
    // If already loaded, return resolved promise
    if (window.google?.maps) {
      return Promise.resolve();
    }

    // If loading in progress, return the existing promise
    if (googleMapsLoadPromise) {
      return googleMapsLoadPromise;
    }

    // Create new loading promise
    googleMapsLoadPromise = new Promise((resolve, reject) => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        reject(new Error("Google Maps API key no configurada"));
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      );

      if (existingScript) {
        // Script exists but not loaded yet, wait for it
        const checkLoaded = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(checkLoaded);
            resolve();
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkLoaded);
          reject(new Error("Timeout loading existing Google Maps script"));
        }, 10000);
        return;
      }

      // Create and load new script
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
  };

  const loadMap = () => {
    if (shouldLoad) return;
    setShouldLoad(true);
    setIsLoading(true);
    setError(null);
  };

  useEffect(() => {
    if (!shouldLoad || !isLoading) return;

    const initializeMap = async () => {
      if (!mapContainerRef.current) {
        setError("Map container not available");
        setIsLoading(false);
        return;
      }

      try {
        // Load Google Maps (only once globally)
        await loadGoogleMaps();

        if (!mapContainerRef.current || !window.google?.maps) {
          setError("Map container or Google Maps not available");
          setIsLoading(false);
          return;
        }

        // Create map instance
        mapInstanceRef.current = new google.maps.Map(mapContainerRef.current, {
          center: { lat: latitud, lng: longitud },
          zoom: zoom,
          mapTypeControl: false,
          streetViewControl: false,
        });

        // Use classic Marker (simpler and works fine)
        markerInstanceRef.current = new google.maps.Marker({
          map: mapInstanceRef.current,
          position: { lat: latitud, lng: longitud },
          title: direccionTexto || "Ubicación",
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing map:", err);
        setError(err instanceof Error ? err.message : "Error creating map");
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [shouldLoad, isLoading, latitud, longitud, direccionTexto, zoom]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setMap(null);
      }
    };
  }, []);

  const handleRetry = () => {
    setShouldLoad(false);
    setError(null);
    setTimeout(() => {
      setShouldLoad(true);
      setIsLoading(true);
    }, 100);
  };

  if (!shouldLoad) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg border border-[#798283]/20 ${className} cursor-pointer hover:bg-gray-200 transition-colors`}
        style={{ height }}
        onClick={loadMap}
      >
        <div className="text-center text-[#798283]/70">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-sm">Ver en mapa</p>
          <p className="text-xs mt-1">Haz clic para cargar</p>
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
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D42B22] mx-auto mb-2"></div>
            <p className="text-sm">Cargando mapa...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10 rounded-lg">
          <div className="text-center text-[#798283]/70">
            <p className="text-sm">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
