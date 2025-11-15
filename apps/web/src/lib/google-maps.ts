// lib/google-maps.ts

// Global declaration for Google Maps callback
declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

class GoogleMapsService {
  private apiKey: string;
  private isLoaded = false;
  private loadPromise: Promise<typeof google> | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

    if (!this.apiKey) {
      console.warn(
        "Google Maps API key is not set. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables."
      );
    }
  }

  async load(): Promise<typeof google> {
    if (this.isLoaded && window.google) {
      return window.google;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Check if already loaded by another script
      if (window.google) {
        this.isLoaded = true;
        resolve(window.google);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      // Define the callback function
      window.initGoogleMaps = () => {
        this.isLoaded = true;
        if (window.google) {
          resolve(window.google);
        } else {
          reject(new Error("Google Maps loaded but google object not found"));
        }
      };

      script.onerror = () => {
        reject(new Error("Failed to load Google Maps script"));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  // Helper method to check if maps are loaded
  isMapsLoaded(): boolean {
    return this.isLoaded && !!window.google;
  }
}

// Create a singleton instance
export const googleMapsService = new GoogleMapsService();

// Helper function for easy usage
export const loadGoogleMaps = () => googleMapsService.load();
