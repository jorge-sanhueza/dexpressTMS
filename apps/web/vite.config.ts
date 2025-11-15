import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  const apiUrl =
    process.env.VITE_API_URL ||
    (isProduction
      ? "https://dexpressapi-production.up.railway.app"
      : "http://localhost:3000");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5174,
      host: "127.0.0.1", // Use explicit IP
      cors: true,
      headers: {
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    },
    preview: {
      port: 4173,
      host: true,
      allowedHosts: ["dexpressweb-production.up.railway.app", "localhost"],
    },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
    },
  };
});
