import React, { useState } from "react";
import { ProfilesManager } from "./admin/ProfilesManager";
import { RolesManager } from "./admin/RolesManager";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { UsersManager } from "./admin/UsersManager";

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profiles" | "roles" | "users">(
    "users"
  );
  const navigate = useNavigate();

  if (!user) return null;

  const handleBackToDashboard = () => {
    navigate("/dashboard");
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-[#798283]">
                  Panel de Administración
                </h2>
                <p className="text-sm text-[#798283]/70">
                  Gestión de Usuarios, Perfiles y Roles
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-[#798283] font-semibold">{user.nombre}</p>
                <p className="text-sm text-[#798283]/70">Administrador</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="border-b border-[#798283]/20">
          <nav className="mb-2 px-2 flex space-x-8">
            <button
              onClick={handleBackToDashboard}
              className="text-[#798283] hover:text-[#D42B22] transition-colors duration-200 font-medium"
            >
              ← Volver al Dashboard
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-[#D42B22] text-[#D42B22]"
                  : "border-transparent text-[#798283] hover:text-[#798283]/70 hover:border-[#798283]/30"
              }`}
            >
              Gestión de Usuarios
            </button>
            <button
              onClick={() => setActiveTab("profiles")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profiles"
                  ? "border-[#D42B22] text-[#D42B22]"
                  : "border-transparent text-[#798283] hover:text-[#798283]/70 hover:border-[#798283]/30"
              }`}
            >
              Gestión de Perfiles
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "roles"
                  ? "border-[#D42B22] text-[#D42B22]"
                  : "border-transparent text-[#798283] hover:text-[#798283]/70 hover:border-[#798283]/30"
              }`}
            >
              Gestión de Roles
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {activeTab === "users" && <UsersManager />}
          {activeTab === "profiles" && <ProfilesManager />}
          {activeTab === "roles" && <RolesManager />}
        </div>
      </main>
    </div>
  );
};
