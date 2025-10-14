// components/auth/AuthDataLoader.tsx
import React from "react";
import { useAuthStore } from "../../store/authStore";

interface AuthDataLoaderProps {
  children: React.ReactNode;
}

export const AuthDataLoader: React.FC<AuthDataLoaderProps> = ({ children }) => {
  const { isInitialized, isLoading, user, tenant, rolesLoaded } =
    useAuthStore();

  console.log("🔄 AuthDataLoader state:", {
    isInitialized,
    isLoading,
    hasUser: !!user,
    hasTenant: !!tenant,
    rolesLoaded,
  });

  // If auth is initialized and there's no user, it means user is not logged in
  // In this case, we should render children so ProtectedRoute can handle redirect
  if (isInitialized && !user) {
    console.log("🔐 No user found - letting ProtectedRoute handle redirect");
    return <>{children}</>;
  }

  // Show loading if we're still waiting for tenant data
  const shouldShowLoading =
    !isInitialized || // Auth not initialized
    isLoading || // Still loading
    !tenant; // No tenant data (this is the main issue)

  if (shouldShowLoading) {
    console.log(
      "⏳ Showing loading state - Waiting for:",
      !isInitialized ? "initialization" : isLoading ? "loading" : "tenant data"
    );
    return (
      <div className="min-h-screen bg-[#EFF4F9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D42B22] mx-auto"></div>
          <p className="mt-4 text-[#798283]">
            {!isInitialized
              ? "Inicializando aplicación..."
              : isLoading
              ? "Cargando..."
              : "Cargando organización..."}
          </p>
          <p className="mt-2 text-sm text-[#798283]/60">
            Inicializado: {isInitialized ? "✅" : "❌"} | Usuario:{" "}
            {user ? "✅" : "❌"} | Organización: {tenant ? "✅" : "❌"} |
            Permisos: {rolesLoaded ? "✅" : "⏳"}
          </p>
        </div>
      </div>
    );
  }

  console.log("✅ AuthDataLoader - All data loaded, rendering children");
  return <>{children}</>;
};
