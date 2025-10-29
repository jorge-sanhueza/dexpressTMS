import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateUser } from "@/hooks/useUsers";
import type { Profile } from "@/types/profile";
import type { CreateUserData, User } from "@/types/user";
import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { ProfileSelect } from "@/components/ProfileSelect";

interface UserCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: any) => void;
}

export const UserCreationModal: React.FC<UserCreationModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    nombre: "",
    contacto: "",
    rut: "",
    telefono: "",
    perfilId: "",
  });
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createUserMutation = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.email || !formData.nombre || !selectedProfile) {
      setError("Email, nombre y perfil son campos requeridos");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("El email debe ser válido");
      return;
    }

    // Use the mutation with selected profile
    createUserMutation.mutate(
      { ...formData, perfilId: selectedProfile.id },
      {
        onSuccess: (newUser: User) => {
          onUserCreated(newUser);
          handleClose();
        },
        onError: (err: Error) => {
          setError(err.message || "Error al crear el usuario");
        },
      }
    );
  };

  const handleClose = () => {
    setFormData({
      email: "",
      nombre: "",
      contacto: "",
      rut: "",
      telefono: "",
      perfilId: "",
    });
    setSelectedProfile(null);
    setError(null);
    createUserMutation.reset();
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSelect = (profile: Profile | null) => {
    setSelectedProfile(profile);
    setFormData((prev) => ({
      ...prev,
      perfilId: profile?.id || "",
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#798283] text-xl font-bold">
            Crear Nuevo Usuario
          </DialogTitle>
          <DialogDescription className="text-[#798283]/70">
            Complete la información del nuevo usuario del sistema.
          </DialogDescription>
        </DialogHeader>

        {/* Error Message */}
        {(error || createUserMutation.error) && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error || createUserMutation.error?.message}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#798283]">
              Email *
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              disabled={createUserMutation.isPending}
              placeholder="usuario@empresa.com"
              className="border-[#798283]/20 focus:ring-[#D42B22] focus:border-[#D42B22]"
            />
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-[#798283]">
              Nombre Completo *
            </Label>
            <Input
              type="text"
              id="nombre"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleInputChange}
              disabled={createUserMutation.isPending}
              placeholder="Juan Pérez"
              className="border-[#798283]/20 focus:ring-[#D42B22] focus:border-[#D42B22]"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-[#798283]">
              Teléfono
            </Label>
            <Input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              disabled={createUserMutation.isPending}
              placeholder="+56 9 1234 5678"
              className="border-[#798283]/20 focus:ring-[#D42B22] focus:border-[#D42B22]"
            />
          </div>

          {/* Contacto */}
          <div className="space-y-2">
            <Label htmlFor="contacto" className="text-[#798283]">
              Contacto
            </Label>
            <Input
              type="text"
              id="contacto"
              name="contacto"
              value={formData.contacto}
              onChange={handleInputChange}
              disabled={createUserMutation.isPending}
              placeholder="Información de contacto adicional"
              className="border-[#798283]/20 focus:ring-[#D42B22] focus:border-[#D42B22]"
            />
          </div>

          {/* RUT */}
          <div className="space-y-2">
            <Label htmlFor="rut" className="text-[#798283]">
              RUT
            </Label>
            <Input
              type="text"
              id="rut"
              name="rut"
              value={formData.rut}
              onChange={handleInputChange}
              disabled={createUserMutation.isPending}
              placeholder="12.345.678-9"
              className="border-[#798283]/20 focus:ring-[#D42B22] focus:border-[#D42B22]"
            />
          </div>

          {/* Profile Select */}
          <ProfileSelect
            onProfileSelect={handleProfileSelect}
            selectedProfile={selectedProfile}
            disabled={createUserMutation.isPending}
            required={true}
          />

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createUserMutation.isPending}
              className="flex-1 sm:flex-none border-[#798283]/20 text-[#798283] hover:bg-[#EFF4F9] hover:text-[#798283]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending || !selectedProfile}
              className="flex-1 sm:flex-none bg-[#D42B22] hover:bg-[#B3251E] text-white"
            >
              {createUserMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </div>
              ) : (
                "Crear Usuario"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
