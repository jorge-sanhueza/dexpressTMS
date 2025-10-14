// routes/index.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { AuthDataLoader } from "../components/auth/AuthDataLoader";
import { LoginForm } from "../components/LoginForm";
import { Dashboard } from "../components/Dashboard";
import { AdminDashboard } from "../components/AdminDashboard";
import { UserProfile } from "../components/UserProfile";
import { CreateOrder } from "../components/orders/CreateOrder";
import { ClientsList } from "../components/clients/ClientsList";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public route - No wrappers */}
      <Route
        path="/login"
        element={
          <div className="min-h-screen bg-gradient-to-br from-[#EFF4F9] to-blue-100">
            <LoginForm />
          </div>
        }
      />

      {/* Protected routes - Wrapped with data loading THEN route protection */}
      <Route
        path="/dashboard"
        element={
          <AuthDataLoader>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </AuthDataLoader>
        }
      />

      <Route
        path="/admin"
        element={
          <AuthDataLoader>
            <ProtectedRoute requiredRole="admin_access">
              <AdminDashboard />
            </ProtectedRoute>
          </AuthDataLoader>
        }
      />

      <Route
        path="/perfil"
        element={
          <AuthDataLoader>
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          </AuthDataLoader>
        }
      />

      <Route
        path="/clientes"
        element={
          <AuthDataLoader>
            <ProtectedRoute>
              <ClientsList />
            </ProtectedRoute>
          </AuthDataLoader>
        }
      />

      <Route
        path="/embarcadores"
        element={
          <AuthDataLoader>
            <ProtectedRoute>
              <div className="p-8">Gestión de Embarcadores - Próximamente</div>
            </ProtectedRoute>
          </AuthDataLoader>
        }
      />

      <Route
        path="/carriers"
        element={
          <AuthDataLoader>
            <ProtectedRoute>
              <div className="p-8">Gestión de Carriers - Próximamente</div>
            </ProtectedRoute>
          </AuthDataLoader>
        }
      />

      <Route
        path="/ordenes/crear"
        element={
          <AuthDataLoader>
            <ProtectedRoute>
              <CreateOrder />
            </ProtectedRoute>
          </AuthDataLoader>
        }
      />

      {/* Fallback routes - Also protected */}
      <Route
        path="/"
        element={
          <AuthDataLoader>
            <Navigate to="/dashboard" replace />
          </AuthDataLoader>
        }
      />

      <Route
        path="*"
        element={
          <AuthDataLoader>
            <Navigate to="/dashboard" replace />
          </AuthDataLoader>
        }
      />
    </Routes>
  );
};
