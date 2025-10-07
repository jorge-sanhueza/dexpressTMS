import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showBackButton = false,
  onBackClick,
}) => {
  const { user, tenant, logout, hasPermission } = useAuthStore();
  const navigate = useNavigate();

  const handleNavigateToAdmin = () => {
    navigate("/admin");
  };

  const handleNavigateToProfile = () => {
    navigate("/perfil");
  };

  const handleNavigateToDashboard = () => {
    navigate("/dashboard");
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1); // Go back in history
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#EFF4F9]">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg border-b border-[#798283]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Left side - Logo and back button */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={handleBackClick}
                  className="h-10 w-10 bg-[#EFF4F9] rounded-lg flex items-center justify-center hover:bg-[#E0E8F0] transition-colors duration-200"
                >
                  <svg
                    className="h-5 w-5 text-[#798283]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
              )}
              <div
                className="flex items-center space-x-4 cursor-pointer"
                onClick={handleNavigateToDashboard}
              >
                <div className="h-12 w-12 bg-[#D42B22] rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-[#798283]">TMS Portal</h2>
                  <p className="text-sm text-[#798283]/70">
                    {tenant?.nombre || "Sistema de Gestión de Transporte"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - User info and actions */}
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-[#798283] font-semibold">
                  Bienvenido, {user.name}
                </p>
                <p className="text-sm text-[#798283]/70">{user.email}</p>
              </div>
              {hasPermission("admin_access") && (
                <button
                  onClick={handleNavigateToAdmin}
                  className="text-[#798283] hover:text-[#D42B22] transition-colors duration-200 font-medium"
                >
                  Administración
                </button>
              )}
              <button
                onClick={handleNavigateToProfile}
                className="text-[#798283] hover:text-[#D42B22] transition-colors duration-200 font-medium"
              >
                Perfil
              </button>
              <button
                onClick={logout}
                className="bg-[#D42B22] hover:bg-[#B3251E] text-[#D42B22] px-6 py-2 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};
