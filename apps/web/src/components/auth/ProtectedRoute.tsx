import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
}) => {
  const { user, isLoading, hasPermission } = useAuthStore();

  const permissionToCheck = requiredRole || requiredPermission;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EFF4F9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D42B22] mx-auto"></div>
          <p className="mt-4 text-[#798283]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!permissionToCheck) {
    return <>{children}</>;
  }

  if (!hasPermission(permissionToCheck)) {
    return (
      <div className="min-h-screen bg-[#EFF4F9] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-[#798283]/20 max-w-md">
            <div className="h-16 w-16 bg-[#D42B22]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-[#D42B22]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#798283] mb-2">
              Acceso Denegado
            </h2>
            <p className="text-[#798283]/70 mb-6">
              No tienes permisos para acceder a esta página.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-[#D42B22] hover:bg-[#B3251E] text-white px-6 py-2 rounded-lg transition-colors duration-200 font-semibold"
            >
              Volver Atrás
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
