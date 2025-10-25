import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const TIPO_OPTIONS = [
  { value: "empresa", label: "Empresa" },
  { value: "persona", label: "Persona Natural" },
  { value: "institucion", label: "Institución" },
];

export const ClientForm: React.FC<ClientFormProps> = ({
  client,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
}) => {
  // Fetch comuna data if we're in edit mode and have a comunaId
  const { data: comunaData } = useComuna(client?.comunaId || "", {
    enabled: isEditing && !!client?.comunaId,
  });

  // Fixed: Only one useForm declaration
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateClientData & { comuna?: Comuna | null }>({
    defaultValues: {
      tipo: "empresa",
    },
  });

  const selectedTipo = watch("tipo");
  const selectedComuna = watch("comuna");

  useEffect(() => {
    if (isEditing && client) {
      reset({
        nombre: client.nombre,
        razonSocial: client.razonSocial || "",
        rut: client.rut,
        contacto: client.contacto,
        email: client.email,
        telefono: client.telefono,
        direccion: client.direccion,
        tipo: client.tipo,
        comuna: comunaData || null,
      });
    }
  }, [isEditing, client, comunaData, reset]);

  const handleFormSubmit = (data: any) => {
    const submitData: any = {
      nombre: data.nombre || "",
      razonSocial: data.razonSocial,
      rut: data.rut || "",
      contacto: data.contacto || "",
      email: data.email || "",
      telefono: data.telefono || "",
      direccion: data.direccion || "",
      tipo: data.tipo || "empresa",
    };

    // Only include comunaId if a comuna is selected
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
              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  {...register("nombre", {
                    required: "El nombre es requerido",
                    minLength: {
                      value: 2,
                      message: "El nombre debe tener al menos 2 caracteres",
                    },
                  })}
                  placeholder="Nombre del cliente"
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
                      value: /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]{1}$/,
                      message: "Formato de RUT inválido (ej: 12.345.678-9)",
                    },
                  })}
                  placeholder="12.345.678-9"
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

              {/* Razón Social (conditionally shown for empresas) */}
              {selectedTipo === "empresa" && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="razonSocial">Razón Social</Label>
                  <Input
                    id="razonSocial"
                    {...register("razonSocial")}
                    placeholder="Razón social de la empresa"
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

              {/* Tipo and Comuna */}
              <div className="space-y-2">
                <Label htmlFor="tipo">
                  Tipo <span className="text-red-500">*</span>
                </Label>
                <select
                  id="tipo"
                  {...register("tipo", { required: "El tipo es requerido" })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                >
                  {TIPO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.tipo && (
                  <p className="text-red-500 text-sm">{errors.tipo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <ComunaSelect
                  onComunaSelect={handleComunaSelect}
                  selectedComuna={selectedComuna}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Opcional - Busca y selecciona una comuna
                </p>
                {selectedComuna && (
                  <p className="text-xs text-green-600">
                    ✓ Seleccionado: {selectedComuna.nombre}
                    {selectedComuna.region &&
                      `, ${selectedComuna.region.nombre}`}
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
                disabled={isLoading}
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
