import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  Contacto,
  CreateContactoData,
  UpdateContactoData,
} from "@/types/contacto";
import type { Comuna } from "@/services/comunasService";
import { ComunaSelect } from "../ComunaSelect";
import { useComuna } from "@/hooks/useComunas";

interface ContactoFormProps {
  contacto?: Contacto | null;
  onSubmit: (data: CreateContactoData | UpdateContactoData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const ContactoForm: React.FC<ContactoFormProps> = ({
  contacto,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
}) => {
  const { data: comunaData } = useComuna(contacto?.comunaId || "", {
    enabled: isEditing && !!contacto?.comunaId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateContactoData & { comuna?: Comuna | null }>({
    defaultValues: {
      esPersonaNatural: true,
    },
  });

  const selectedComuna = watch("comuna");

  useEffect(() => {
    if (isEditing && contacto) {
      reset({
        nombre: contacto.nombre,
        rut: contacto.rut,
        email: contacto.email || "",
        telefono: contacto.telefono || "",
        direccion: contacto.direccion || "",
        cargo: contacto.cargo || "",
        contacto: contacto.contacto || "",
        esPersonaNatural: contacto.esPersonaNatural,
        comuna: comunaData || null,
        // Remove entidadId from reset since we're removing the field
      });
    }
  }, [isEditing, contacto, comunaData, reset]);

  const handleFormSubmit = (data: any) => {
    if (isEditing) {
      // For editing, use UpdateContactoData (all fields optional)
      const submitData: UpdateContactoData = {
        nombre: data.nombre,
        rut: data.rut,
        email: data.email || undefined,
        telefono: data.telefono || undefined,
        direccion: data.direccion || undefined,
        cargo: data.cargo || undefined,
        contacto: data.contacto,
        esPersonaNatural: data.esPersonaNatural,
      };

      if (data.comuna?.id) {
        submitData.comunaId = data.comuna.id;
      }

      // Remove entidadId from update data
      onSubmit(submitData);
    } else {
      // For creation, use CreateContactoData (required fields)
      const submitData: CreateContactoData = {
        nombre: data.nombre,
        rut: data.rut,
        email: data.email || undefined,
        telefono: data.telefono || undefined,
        direccion: data.direccion || undefined,
        cargo: data.cargo || undefined,
        contacto: data.contacto,
        esPersonaNatural: data.esPersonaNatural,
        comunaId: data.comuna?.id || "",
        // Remove entidadId from create data
      };

      onSubmit(submitData);
    }
  };

  const handleComunaSelect = (comuna: Comuna | null) => {
    setValue("comuna", comuna);
  };

  const title = isEditing ? "Editar Contacto" : "Crear Nuevo Contacto";
  const description = isEditing
    ? "Modifica la información del contacto"
    : "Completa la información del nuevo contacto";
  const submitText = isLoading
    ? isEditing
      ? "Actualizando..."
      : "Creando..."
    : isEditing
    ? "Actualizar Contacto"
    : "Crear Contacto";

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
                  id="esPersonaNatural"
                  {...register("esPersonaNatural")}
                  onCheckedChange={(checked) =>
                    setValue("esPersonaNatural", !!checked)
                  }
                />
                <Label
                  htmlFor="esPersonaNatural"
                  className="text-sm font-medium"
                >
                  ¿Es persona natural?
                </Label>
                <p className="text-xs text-muted-foreground ml-2">
                  Marca esta casilla si el contacto es una persona natural
                </p>
              </div>

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
                  placeholder="Nombre completo"
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
                  placeholder="Información de contacto"
                  disabled={isLoading}
                />
                {errors.contacto && (
                  <p className="text-red-500 text-sm">
                    {errors.contacto.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  {...register("cargo")}
                  placeholder="Cargo o posición"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email inválido",
                    },
                  })}
                  placeholder="contacto@ejemplo.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  {...register("telefono")}
                  placeholder="+56 9 1234 5678"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  {...register("direccion")}
                  placeholder="Dirección completa"
                  disabled={isLoading}
                />
              </div>

              {/* Comuna Selection */}
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
            {isEditing && contacto && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Estado:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      contacto.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {contacto.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Para cambiar el estado del contacto, utiliza los botones de
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
