import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { LoginForm } from "../components/LoginForm";
import { Dashboard } from "../components/Dashboard";
import { AdminDashboard } from "../components/AdminDashboard";
import { UserProfile } from "../components/UserProfile";

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

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Protected routes */}
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

      {/* Fallback routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
