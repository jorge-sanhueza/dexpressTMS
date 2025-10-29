import { Button } from "@/components/ui/button";
import { useProfiles, useUpdateUser } from "@/hooks/useUsers";
import type { Profile } from "@/types/profile";
import type { User } from "@/types/user";
import React, { useState, useEffect } from "react";

interface UserEditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdated,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    contacto: "",
    rut: "",
    perfilId: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Use TanStack Query hooks
  const updateUserMutation = useUpdateUser();
  const { data: profiles, isLoading: profilesLoading } = useProfiles();

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        telefono: user.telefono || "",
        contacto: user.contacto || "",
        rut: user.rut || "",
        perfilId: user.perfilId || "",
      });
      setError(null);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.nombre || !formData.email) {
      setError("Nombre y email son campos requeridos");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("El email debe ser válido");
      return;
    }

    // Use the mutation
    updateUserMutation.mutate(
      { id: user.id, userData: formData },
      {
        onSuccess: () => {
          onUserUpdated();
          handleClose();
        },
        onError: (err: Error) => {
          setError(err.message || "Error al actualizar el usuario");
        },
      }
    );
  };

  const handleClose = () => {
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      contacto: "",
      rut: "",
      perfilId: "",
    });
    setError(null);
    updateUserMutation.reset();
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-700 bg-opacity-20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#798283]/20">
          <h2 className="text-xl font-bold text-[#798283]">Editar Usuario</h2>
          <button
            onClick={handleClose}
            className="text-[#798283] hover:text-[#D42B22] transition-colors duration-200"
            disabled={updateUserMutation.isPending}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {(error || updateUserMutation.error) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-red-800 text-sm">
                  {error || updateUserMutation.error?.message}
                </span>
              </div>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-[#798283] mb-1"
            >
              Nombre Completo *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              disabled={updateUserMutation.isPending}
              className="w-full px-3 py-2 border border-[#798283]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Juan Pérez"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#798283] mb-1"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={updateUserMutation.isPending}
              className="w-full px-3 py-2 border border-[#798283]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="usuario@empresa.com"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-[#798283] mb-1"
            >
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              disabled={updateUserMutation.isPending}
              className="w-full px-3 py-2 border border-[#798283]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="+56 9 1234 5678"
            />
          </div>

          {/* Contacto */}
          <div>
            <label
              htmlFor="contacto"
              className="block text-sm font-medium text-[#798283] mb-1"
            >
              Contacto
            </label>
            <input
              type="text"
              id="contacto"
              name="contacto"
              value={formData.contacto}
              onChange={handleChange}
              disabled={updateUserMutation.isPending}
              className="w-full px-3 py-2 border border-[#798283]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Información de contacto adicional"
            />
          </div>

          {/* RUT */}
          <div>
            <label
              htmlFor="rut"
              className="block text-sm font-medium text-[#798283] mb-1"
            >
              RUT
            </label>
            <input
              type="text"
              id="rut"
              name="rut"
              value={formData.rut}
              onChange={handleChange}
              disabled={updateUserMutation.isPending}
              className="w-full px-3 py-2 border border-[#798283]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="12.345.678-9"
            />
          </div>

          {/* Perfil */}
          <div>
            <label
              htmlFor="perfilId"
              className="block text-sm font-medium text-[#798283] mb-1"
            >
              Perfil
            </label>
            <select
              id="perfilId"
              name="perfilId"
              value={formData.perfilId}
              onChange={handleChange}
              disabled={updateUserMutation.isPending || profilesLoading}
              className="w-full px-3 py-2 border border-[#798283]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar perfil...</option>
              {profilesLoading ? (
                <option value="" disabled>
                  Cargando perfiles...
                </option>
              ) : (
                profiles?.map((profile: Profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.nombre}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              disabled={updateUserMutation.isPending}
              className="flex-1 px-4 py-2 border border-[#798283]/20 text-[#798283] rounded-lg hover:bg-[#EFF4F9] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateUserMutation.isPending || profilesLoading}
              className="flex-1 px-4 py-2 bg-[#D42B22] text-white rounded-lg hover:bg-[#B3251E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {updateUserMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </div>
              ) : (
                "Actualizar Usuario"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
