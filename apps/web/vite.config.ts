import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  
  // Use environment variable or fallback
  const apiUrl = process.env.VITE_API_URL || 
    (isProduction 
      ? "https://dexpressapi-production.up.railway.app" 
      : "http://localhost:3000");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5174,
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
    },
  };
});