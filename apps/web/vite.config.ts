import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5174,
      proxy: {
        "/api": {
          target: isProduction ? "http://api:3000" : "http://localhost:3000",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(
        isProduction ? "" : "http://localhost:3000"
      ),
    },
  };
});
