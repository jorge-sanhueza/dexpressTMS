import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const Dashboard: React.FC = () => {
  const { user, tenant, logout, hasPermission, roles } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("User permissions:", user?.permissions);
    console.log("User roles:", roles);
    console.log("Has admin_access:", hasPermission("admin_access"));
  }, [user, roles, hasPermission]);

  if (!user) return null;

    const handleCreateOrder = () => {
    navigate("/ordenes/crear");
  };

  const handleNavigateToAdmin = () => {
    navigate("/admin");
  };

  const handleNavigateToProfile = () => {
    navigate("/perfil");
  };

  return (
    <div className="min-h-screen bg-[#EFF4F9]">
      <nav className="bg-white shadow-lg border-b border-[#798283]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-4">
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
                onClick={logout}
                className="bg-[#D42B22] hover:bg-[#B3251E] text-[#798283] px-6 py-2 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#798283] mb-2">
              Panel de Control
            </h2>
            <p className="text-[#798283]/70 text-lg">
              Bienvenido de vuelta, {user.name}. Aquí tienes un resumen de tu
              actividad en {tenant?.nombre || "tu organización"}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            {/* User Info Card - Updated with profile button */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-[#EFF4F9] rounded-lg flex items-center justify-center mr-3">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-[#798283]">
                  Información de Usuario
                </h3>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-[#798283]/10">
                  <span className="text-sm text-[#798283]/70">Nombre</span>
                  <span className="font-medium text-[#798283]">
                    {user.name}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-[#798283]/10">
                  <span className="text-sm text-[#798283]/70">Email</span>
                  <span className="font-medium text-[#798283]">
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#798283]/70">
                    Organización
                  </span>
                  <span className="font-medium text-[#798283] text-right">
                    {tenant?.nombre || "Cargando..."}
                  </span>
                </div>
                {tenant?.contacto && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#798283]/70">Contacto</span>
                    <span className="font-medium text-[#798283]">
                      {tenant.contacto}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleNavigateToProfile}
                className="w-full flex items-center justify-center px-4 py-2 border border-[#798283]/30 text-sm font-semibold rounded-lg text-[#798283] bg-white hover:bg-[#EFF4F9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#798283] transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Ver Perfil Completo
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-[#EFF4F9] rounded-lg flex items-center justify-center mr-3">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg text-[#798283]">
                  Acciones Rápidas
                </h3>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-semibold rounded-lg text-[#798283] bg-[#D42B22] hover:bg-[#B3251E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D42B22] transition-all duration-200 shadow-sm hover:shadow-md">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Ver Órdenes
                </button>
                <button
                  onClick={handleCreateOrder}
                  className="w-full flex items-center justify-center px-4 py-3 border border-[#798283]/30 text-sm font-semibold rounded-lg text-[#798283] bg-white hover:bg-[#EFF4F9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#798283] transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Crear Orden
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 border border-[#798283]/30 text-sm font-semibold rounded-lg text-[#798283] bg-white hover:bg-[#EFF4F9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#798283] transition-all duration-200">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Seguir Orden
                </button>
              </div>
            </div>
          </div>

          {/* Activity Summary and other content remains the same */}
          <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-[#EFF4F9] rounded-lg flex items-center justify-center mr-3">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-[#798283]">
                Resumen de Actividad
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-[#EFF4F9] rounded-lg">
                <p className="text-2xl font-bold text-[#D42B22]">12</p>
                <p className="text-sm text-[#798283] mt-1">
                  Órdenes Pendientes
                </p>
              </div>
              <div className="text-center p-4 bg-[#EFF4F9] rounded-lg">
                <p className="text-2xl font-bold text-[#798283]">8</p>
                <p className="text-sm text-[#798283] mt-1">En Tránsito</p>
              </div>
              <div className="text-center p-4 bg-[#EFF4F9] rounded-lg">
                <p className="text-2xl font-bold text-green-600">3</p>
                <p className="text-sm text-[#798283] mt-1">Entregadas Hoy</p>
              </div>
              <div className="text-center p-4 bg-[#EFF4F9] rounded-lg">
                <p className="text-2xl font-bold text-orange-500">1</p>
                <p className="text-sm text-[#798283] mt-1">Con Problemas</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#798283]/60">
              Sistema de Gestión de Transporte • Versión de demostración •{" "}
              {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
