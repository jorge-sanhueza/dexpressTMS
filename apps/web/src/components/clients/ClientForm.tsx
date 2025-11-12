import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  Client,
  CreateClientData,
  UpdateClientData,
} from "@/types/client";
import type { Comuna } from "@/services/comunasService";
import { ComunaSelect } from "../ComunaSelect";
import { useComuna } from "@/hooks/useComunas";

interface ClientFormProps {
  client?: Client | null;
  onSubmit: (data: CreateClientData | UpdateClientData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  client,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
}) => {
  const { data: comunaData } = useComuna(client?.comunaId || "", {
    enabled: isEditing && !!client?.comunaId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateClientData & { comuna?: Comuna | null }>({
    defaultValues: {
      esPersona: false,
    },
  });

  const isPersona = watch("esPersona");
  const selectedComuna = watch("comuna");

  useEffect(() => {
    if (isEditing && client) {
      reset({
        nombre: client.nombre || "",
        razonSocial: client.razonSocial || "",
        rut: client.rut,
        contacto: client.contacto,
        email: client.email,
        telefono: client.telefono,
        direccion: client.direccion,
        esPersona: client.esPersona,
        comuna: comunaData || null,
      });
    }
  }, [isEditing, client, comunaData, reset]);

  const handleFormSubmit = (data: any) => {
    const submitData: CreateClientData | UpdateClientData = {
      nombre: data.nombre || undefined,
      razonSocial: data.razonSocial || undefined,
      rut: data.rut || "",
      contacto: data.contacto || "",
      email: data.email || "",
      telefono: data.telefono || "",
      direccion: data.direccion || "",
      esPersona: data.esPersona || false,
    };

    if (data.comuna?.id) {
      submitData.comunaId = data.comuna.id;
    }

    onSubmit(submitData);
  };

  const handleComunaSelect = (comuna: Comuna | null) => {
    setValue("comuna", comuna);
  };

  const title = isEditing ? "Editar Cliente" : "Crear Nuevo Cliente";
  const description = isEditing
    ? "Modifica la información del cliente"
    : "Completa la información del nuevo cliente";
  const submitText = isLoading
    ? isEditing
      ? "Actualizando..."
      : "Creando..."
    : isEditing
    ? "Actualizar Cliente"
    : "Crear Cliente";

  return (
    <div className="fixed inset-0 bg-zinc-500/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground mb-6">{description}</p>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Person Type Toggle */}
              <div className="flex items-center space-x-2 md:col-span-2 p-4 bg-muted rounded-lg">
                <Checkbox
                  id="esPersona"
                  {...register("esPersona")}
                  onCheckedChange={(checked) =>
                    setValue("esPersona", !!checked)
                  }
                />
                <Label htmlFor="esPersona" className="text-sm font-medium">
                  ¿Es persona natural?
                </Label>
                <p className="text-xs text-muted-foreground ml-2">
                  {isPersona
                    ? "Cliente es persona natural (no requiere razón social)"
                    : "Cliente es empresa (puede incluir razón social)"}
                </p>
              </div>

              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre {!isPersona && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="nombre"
                  {...register("nombre", {
                    required: !isPersona
                      ? "El nombre es requerido para empresas"
                      : false,
                    minLength: {
                      value: 2,
                      message: "El nombre debe tener al menos 2 caracteres",
                    },
                  })}
                  placeholder={
                    isPersona ? "Nombre completo" : "Nombre de la empresa"
                  }
                  disabled={isLoading}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rut">
                  RUT <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="rut"
                  {...register("rut", {
                    required: "El RUT es requerido",
                    pattern: {
                      value: /^[0-9]{7,8}-[0-9kK]{1}$/,
                      message: "Formato de RUT inválido (ej: 12345678-9)",
                    },
                  })}
                  placeholder="12345678-9"
                  disabled={isLoading || isEditing}
                />
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    El RUT no se puede modificar
                  </p>
                )}
                {errors.rut && (
                  <p className="text-red-500 text-sm">{errors.rut.message}</p>
                )}
              </div>

              {/* Razón Social - Only show for companies */}
              {!isPersona && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="razonSocial">Razón Social</Label>
                  <Input
                    id="razonSocial"
                    {...register("razonSocial")}
                    placeholder="Razón social de la empresa (opcional)"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="contacto">
                  Contacto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contacto"
                  {...register("contacto", {
                    required: "El contacto es requerido",
                  })}
                  placeholder="Nombre del contacto principal"
                  disabled={isLoading}
                />
                {errors.contacto && (
                  <p className="text-red-500 text-sm">
                    {errors.contacto.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "El email es requerido",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email inválido",
                    },
                  })}
                  placeholder="cliente@ejemplo.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telefono"
                  {...register("telefono", {
                    required: "El teléfono es requerido",
                  })}
                  placeholder="+56 9 1234 5678"
                  disabled={isLoading}
                />
                {errors.telefono && (
                  <p className="text-red-500 text-sm">
                    {errors.telefono.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion">
                  Dirección <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="direccion"
                  {...register("direccion", {
                    required: "La dirección es requerida",
                  })}
                  placeholder="Dirección completa"
                  disabled={isLoading}
                />
                {errors.direccion && (
                  <p className="text-red-500 text-sm">
                    {errors.direccion.message}
                  </p>
                )}
              </div>

              {/* Comuna - Now required */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="comuna">
                  Comuna <span className="text-red-500">*</span>
                </Label>
                <ComunaSelect
                  onComunaSelect={handleComunaSelect}
                  selectedComuna={selectedComuna}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Busca y selecciona una comuna
                </p>
                {selectedComuna && (
                  <p className="text-xs text-green-600">
                    ✓ Seleccionado: {selectedComuna.nombre}
                    {selectedComuna.region &&
                      `, ${selectedComuna.region.nombre}`}
                  </p>
                )}
                {!selectedComuna && (
                  <p className="text-xs text-red-500">
                    ⚠ Debes seleccionar una comuna
                  </p>
                )}
              </div>
            </div>

            {/* Status field for editing */}
            {isEditing && client && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Estado:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      client.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {client.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Para cambiar el estado del cliente, utiliza los botones de
                  activar/desactivar en la lista.
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-brand hover:bg-brand/90 text-white"
                disabled={isLoading || !selectedComuna}
              >
                {submitText}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
