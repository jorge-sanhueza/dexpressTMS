import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { LoginForm } from "../components/LoginForm";
import { Dashboard } from "../components/Dashboard";
import { AdminDashboard } from "../components/AdminDashboard";
import { UserProfile } from "../components/UserProfile";
import { CreateOrder } from "../components/orders/CreateOrder";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public route with gradient background */}
      <Route
        path="/login"
        element={
          <div className="min-h-screen bg-gradient-to-br from-[#EFF4F9] to-blue-100">
            <LoginForm />
          </div>
        }
      />
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin_access">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      {/* Order routes - Spanish URLs */}
      <Route
        path="/ordenes/crear"
        element={
          <ProtectedRoute>
            <CreateOrder />
          </ProtectedRoute>
        }
      />
{/*       <Route
        path="/ordenes"
        element={
          <ProtectedRoute>
            <OrdersList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ordenes/:id"
        element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ordenes/:id/editar"
        element={
          <ProtectedRoute>
            <EditOrder />
          </ProtectedRoute>
        }
      /> */}
      {/* Fallback routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
