import React from "react";
import { useAuth } from "../hooks/useAuth";

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                TMS Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">
                Bienvenido, {user.name}
              </span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-black px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenido, {user.name}!
            </h2>
            <p className="text-gray-600">Estado de últimas órdenes.</p>
          </div>

          {/* Dashboard Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* User Info Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 text-gray-900">
                Información de usuario
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Contacto</p>
                  <p className="font-medium text-gray-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Permissions Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 text-gray-900">
                Permisos
              </h3>
              <ul className="space-y-2">
                {user.permissions.map((permission) => (
                  <li key={permission} className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span className="text-sm text-gray-700">{permission}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 text-gray-900">
                Acciones
              </h3>
              <div className="space-y-3">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-gray-800 px-4 py-3 rounded-lg w-full transition-colors duration-200 font-medium">
                  Ver Ordenes
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-gray-800 px-4 py-3 rounded-lg w-full transition-colors duration-200 font-medium">
                  Crear Orden
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg w-full transition-colors duration-200 font-medium">
                  Seguir Orden
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-lg mb-6 text-gray-900">
              Resumen
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-400">12</p>
                <p className="text-sm text-gray-500">Ordenes pendientes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-zinc-500">8</p>
                <p className="text-sm text-gray-500">En Transito</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">3</p>
                <p className="text-sm text-gray-500">Entregadas hoy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">1</p>
                <p className="text-sm text-gray-500">Problemas</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
