import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const UserProfile: React.FC = () => {
  const { user, tenant, roles, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const toTitleCase = (str: string): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const hasManyPermissions = user.permissions.length > 10;

  return (
    <div className="min-h-screen bg-[#EFF4F9]">
      <nav className="bg-white shadow-lg border-b border-[#798283]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="h-12 w-12 bg-[#D42B22] rounded-xl flex items-center justify-center shadow-md hover:bg-[#B3251E] transition-colors duration-200"
              >
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div>
                <h2 className="font-bold text-[#798283]">TMS Portal</h2>
                <p className="text-sm text-[#798283]/70">
                  {tenant?.nombre || "Sistema de Gestión de Transporte"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-[#798283] font-semibold">{user.nombre}</p>
                <p className="text-sm text-[#798283]/70">{user.email}</p>
              </div>
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

      {/* Top Back Button for Mobile */}
      <div className="lg:hidden bg-white border-b border-[#798283]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center text-[#798283] hover:text-[#D42B22] transition-colors duration-200 font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al Dashboard
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#798283] mb-2">
              Perfil de Usuario
            </h1>
            <p className="text-[#798283]/70 text-lg">
              Información detallada de tu cuenta y permisos en el sistema.
            </p>
          </div>

          <div
            className={`grid grid-cols-1 ${
              hasManyPermissions ? "lg:grid-cols-3" : "lg:grid-cols-2"
            } gap-6 mb-8`}
          >
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
                  Información Personal
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#798283]/10">
                  <span className="text-sm text-[#798283]/70">Nombre</span>
                  <span className="font-medium text-[#798283]">
                    {user.nombre}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-[#798283]/10">
                  <span className="text-sm text-[#798283]/70">Email</span>
                  <span className="font-medium text-[#798283]">
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-[#798283]/10">
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
            </div>

            {/* Permisos del Sistema Card */}
            <div
              className={`bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10 hover:shadow-md transition-shadow duration-200 ${
                hasManyPermissions ? "lg:col-span-2" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-[#798283]">
                    Permisos del Sistema
                  </h3>
                </div>
                <span className="text-sm text-[#798283]/70 bg-[#EFF4F9] px-3 py-1 rounded-full">
                  {roles.length} roles
                </span>
              </div>

              {hasManyPermissions ? (
                // Scrollable container for many permissions
                <div className="max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-2">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center p-3 bg-[#EFF4F9] rounded-lg border border-[#798283]/10"
                      >
                        <span className="w-2 h-2 bg-[#D42B22] rounded-full mr-3"></span>
                        <div>
                          <span className="font-medium text-[#798283] block">
                            {role.nombre}
                          </span>
                          <span className="text-xs text-[#798283]/70">
                            {role.codigo} • {role.modulo}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Simple list for few permissions
                <div className="space-y-3">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center p-3 bg-[#EFF4F9] rounded-lg border border-[#798283]/10"
                    >
                      <span className="w-2 h-2 bg-[#D42B22] rounded-full mr-3"></span>
                      <div>
                        <span className="font-medium text-[#798283] block">
                          {role.nombre}
                        </span>
                        <span className="text-xs text-[#798283]/70">
                          {role.codigo} • {role.modulo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Account Information - Now as a column on larger screens */}
            <div className="lg:block hidden">
              <div className="bg-white rounded-xl shadow-sm border border-[#798283]/10 p-6 h-full">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg text-[#798283]">
                    Información de la Cuenta
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#798283]/70 mb-1">
                      Miembro desde
                    </p>
                    <p className="font-medium text-[#798283]">
                      {new Date().toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#798283]/70 mb-1">
                      Estado de la cuenta
                    </p>
                    <p className="font-medium text-green-600">Activa</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#798283]/70 mb-1">
                      Tipo de cuenta
                    </p>
                    <p className="font-medium text-[#798283]">
                      {toTitleCase(user.profile_type)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information - At bottom for mobile */}
          <div className="lg:hidden bg-white rounded-xl shadow-sm border border-[#798283]/10 p-6 mb-8">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-[#798283]">
                Información de la Cuenta
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-[#798283]/70">Miembro desde</p>
                <p className="font-medium text-[#798283]">
                  {new Date().toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-[#798283]/70">Estado de la cuenta</p>
                <p className="font-medium text-green-600">Activa</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-[#798283]/70">Rol principal</p>
                <p className="font-medium text-[#798283]">
                  {user.profile_type}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Back Button */}
          <div className="text-center">
            <button
              onClick={handleBackToDashboard}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-[#798283] bg-white hover:bg-[#EFF4F9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#798283] transition-all duration-200 shadow-sm hover:shadow-md border border-[#798283]/20"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
