import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Layout } from "./layout/Layout";

export const Dashboard: React.FC = () => {
  const { user, tenant, hasPermission, roles } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("User permissions:", user?.permissions);
    console.log("User roles:", roles);
    console.log("Has admin_access:", hasPermission("admin_access"));
  }, [user, roles, hasPermission]);

  const handleNavigateToProfile = () => {
    navigate("/perfil");
  };
  const handleCreateOrder = () => {
    navigate("/ordenes/crear");
  };

  const handleNavigateToClients = () => {
    navigate("/clientes");
  };

  const handleNavigateToShippers = () => {
    navigate("/embarcadores");
  };

  const handleNavigateToCarriers = () => {
    navigate("/carriers");
  };

  const handleNavigateToOrders = () => {
    navigate("/ordenes");
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#798283] mb-2">
            Panel de Control
          </h2>
          <p className="text-[#798283]/70 text-lg">
            Bienvenido de vuelta, {user?.name}. Aquí tienes un resumen de tu
            actividad en {tenant?.nombre || "tu organización"}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Info Card */}
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
                <span className="font-medium text-[#798283]">{user?.name}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#798283]/10">
                <span className="text-sm text-[#798283]/70">Email</span>
                <span className="font-medium text-[#798283]">
                  {user?.email}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#798283]/70">Organización</span>
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

          {/* Quick Actions Card */}
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
              <button
                onClick={handleNavigateToOrders}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-semibold rounded-lg text-[#D42B22] bg-[#D42B22] hover:bg-[#B3251E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D42B22] transition-all duration-200 shadow-sm hover:shadow-md"
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-[#798283]">
                Lista de contactos
              </h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleNavigateToClients}
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Ver Clientes
              </button>
              <button
                onClick={handleNavigateToShippers}
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
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                Ver Embarcadores
              </button>
              <button
                onClick={handleNavigateToCarriers}
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Ver Carriers
              </button>
            </div>
          </div>
        </div>

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
              <p className="text-sm text-[#798283] mt-1">Órdenes Pendientes</p>
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

        <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10 p-6 hover:shadow-md transition-shadow duration-200 mt-6">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-lg text-[#798283]">
              Resumen de Entidades
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-[#EFF4F9] rounded-lg">
              <p className="text-2xl font-bold text-blue-600">15</p>
              <p className="text-sm text-[#798283] mt-1">Clientes Activos</p>
            </div>
            <div className="text-center p-4 bg-[#EFF4F9] rounded-lg">
              <p className="text-2xl font-bold text-purple-600">8</p>
              <p className="text-sm text-[#798283] mt-1">Embarcadores</p>
            </div>
            <div className="text-center p-4 bg-[#EFF4F9] rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">12</p>
              <p className="text-sm text-[#798283] mt-1">Carriers</p>
            </div>
            <div className="text-center p-4 bg-[#EFF4F9] rounded-lg">
              <p className="text-2xl font-bold text-teal-600">25</p>
              <p className="text-sm text-[#798283] mt-1">Total</p>
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
    </Layout>
  );
};
