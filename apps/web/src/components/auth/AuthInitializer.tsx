import React, { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({
  children,
}) => {
  const { initializeAuth, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#EFF4F9] to-blue-100">
        <div className="text-lg text-[#798283]">Validando credenciales...</div>
      </div>
    );
  }

  return <>{children}</>;
};
