import React, { useState } from "react";
import { ProfilesManager } from "./admin/ProfilesManager";
import { RolesManager } from "./admin/Roles/RolesManager";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { UsersManager } from "./admin/UsersManager";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<string>("users");

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
                <p className="text-[#798283] font-semibold">{user.name}</p>
                <p className="text-sm text-[#798283]/70">Administrador</p>
              </div>

              <Button
                onClick={logout}
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white px-6 py-2 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="border-b border-[#798283]/20">
          <div className="flex items-center space-x-6 bg-white p-6 rounded-lg shadow-sm border border-border">
            {/* Back button */}
            <Button
              onClick={handleBackToDashboard}
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <svg
                className="w-4 h-4"
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
            </Button>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1"
            >
              <TabsList className="w-full justify-start space-x-8 bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="users"
                  className="group relative rounded-none border-b-2 border-transparent bg-transparent px-3 pb-3 pt-2 text-sm font-medium text-muted-foreground shadow-none transition-all duration-200 hover:text-foreground data-[state=active]:text-brand data-[state=active]:font-semibold data-[state=active]:bg-[#EFF4F9]"
                >
                  Gestión de Usuarios
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full data-[state=active]:w-full" />
                </TabsTrigger>

                <TabsTrigger
                  value="profiles"
                  className="group relative rounded-none border-b-2 border-transparent bg-transparent px-3 pb-3 pt-2 text-sm font-medium text-muted-foreground shadow-none transition-all duration-200 hover:text-foreground data-[state=active]:text-brand data-[state=active]:font-semibold data-[state=active]:bg-[#EFF4F9]"
                >
                  Gestión de Perfiles
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full data-[state=active]:w-full" />
                </TabsTrigger>

                <TabsTrigger
                  value="roles"
                  className="group relative rounded-none border-b-2 border-transparent bg-transparent px-3 pb-3 pt-2 text-sm font-medium text-muted-foreground shadow-none transition-all duration-200 hover:text-foreground data-[state=active]:text-brand data-[state=active]:font-semibold data-[state=active]:bg-[#EFF4F9]"
                >
                  Gestión de Roles
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full data-[state=active]:w-full" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
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
