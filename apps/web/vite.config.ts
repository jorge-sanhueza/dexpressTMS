import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  
  const apiUrl = process.env.VITE_API_URL || 
    (isProduction 
      ? "https://dexpressapi-production.up.railway.app" 
      : "http://localhost:3000");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5174,
    },
    preview: {
      port: 4173,
      host: true,
      allowedHosts: [
        'dexpressweb-production.up.railway.app',
        'localhost'
      ],
    },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
    },
  };
});