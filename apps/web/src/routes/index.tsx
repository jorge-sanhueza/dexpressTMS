import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { LoginForm } from "../components/LoginForm";
import { Dashboard } from "../components/Dashboard";
import { AdminDashboard } from "../components/AdminDashboard";
import { UserProfile } from "../components/UserProfile";
import { ClientsList } from "../components/clients/ClientsList";
import { EmbarcadoresList } from "../components/embarcadores/EmbarcadoresList";
import { CarriersList } from "@/components/carriers/CarriersList";
import { DireccionesList } from "@/components/direcciones/DireccionesList";
import { CreateOrderForm } from "@/components/orders/CreateOrder";
import { ContactosList } from "@/components/contactos/ContactosList";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
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
      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <ClientsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/embarcadores"
        element={
          <ProtectedRoute>
            <EmbarcadoresList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carriers"
        element={
          <ProtectedRoute>
            <CarriersList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/direcciones"
        element={
          <ProtectedRoute>
            <DireccionesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contactos"
        element={
          <ProtectedRoute>
            <ContactosList />
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
      /> */}
      <Route
        path="/ordenes/crear"
        element={
          <ProtectedRoute>
            <CreateOrderForm />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
