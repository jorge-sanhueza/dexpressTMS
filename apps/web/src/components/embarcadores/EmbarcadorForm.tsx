import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { useComuna } from "@/hooks/useComunas";
import { ComunaSelect } from "../ComunaSelect";
import type { Comuna } from "@/services/comunasService";
import type { CreateEmbarcadorDto, Embarcador } from "@/types/shipper";

interface EmbarcadorFormProps {
  embarcador?: Embarcador | null;
  onSubmit: (data: CreateEmbarcadorDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const EmbarcadorForm: React.FC<EmbarcadorFormProps> = ({
  embarcador,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
}) => {
  const { data: comunaData } = useComuna(embarcador?.comunaId || "", {
    enabled: isEditing && !!embarcador?.comunaId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateEmbarcadorDto & { comuna?: Comuna | null }>({
    defaultValues: {
      esPersona: false,
    },
  });

  const isPersona = watch("esPersona");
  const selectedComuna = watch("comuna");

  useEffect(() => {
    if (isEditing && embarcador) {
      reset({
        nombre: embarcador.nombre,
        razonSocial: embarcador.razonSocial || "",
        rut: embarcador.rut,
        contacto: embarcador.contacto,
        email: embarcador.email,
        telefono: embarcador.telefono,
        direccion: embarcador.direccion,
        esPersona: embarcador.esPersona,
        comuna: comunaData || null,
      });
    }
  }, [isEditing, embarcador, comunaData, reset]);

  const handleFormSubmit = (data: any) => {
    const submitData: CreateEmbarcadorDto = {
      nombre: data.nombre || "",
      razonSocial: data.razonSocial || undefined,
      rut: data.rut || "",
      contacto: data.contacto || "",
      email: data.email || "",
      telefono: data.telefono || "",
      direccion: data.direccion || "",
      comunaId: data.comuna?.id || "",
      esPersona: data.esPersona || false,
    };

    onSubmit(submitData);
  };

  const handleComunaSelect = (comuna: Comuna | null) => {
    setValue("comuna", comuna);
  };

  const title = isEditing ? "Editar Embarcador" : "Crear Nuevo Embarcador";
  const description = isEditing
    ? "Modifica la información del embarcador"
    : "Completa la información del nuevo embarcador";
  const submitText = isLoading
    ? isEditing
      ? "Actualizando..."
      : "Creando..."
    : isEditing
    ? "Actualizar Embarcador"
    : "Crear Embarcador";

  return (
    <div className="fixed inset-0 bg-zinc-500/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#798283] mb-2">{title}</h2>
          <p className="text-[#798283]/70 mb-6">{description}</p>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Person Type Toggle */}
              <div className="flex items-center space-x-2 md:col-span-2 p-4 bg-[#EFF4F9] rounded-lg">
                <Checkbox
                  id="esPersona"
                  {...register("esPersona")}
                  onCheckedChange={(checked) =>
                    setValue("esPersona", !!checked)
                  }
                />
                <Label
                  htmlFor="esPersona"
                  className="text-sm font-medium text-[#798283]"
                >
                  ¿Es persona natural?
                </Label>
                <p className="text-xs text-[#798283]/70 ml-2">
                  {isPersona
                    ? "Embarcador es persona natural (no requiere razón social)"
                    : "Embarcador es empresa (puede incluir razón social)"}
                </p>
              </div>

              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-[#798283]">
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
                  placeholder="Nombre del embarcador"
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              {/* Razón Social - Only show for companies */}
              {!isPersona && (
                <div className="space-y-2">
                  <Label htmlFor="razonSocial" className="text-[#798283]">
                    Razón Social
                  </Label>
                  <Input
                    id="razonSocial"
                    {...register("razonSocial")}
                    placeholder="Razón social (opcional)"
                    disabled={isLoading}
                    className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="rut" className="text-[#798283]">
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
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
                {isEditing && (
                  <p className="text-xs text-[#798283]/70">
                    El RUT no se puede modificar
                  </p>
                )}
                {errors.rut && (
                  <p className="text-red-500 text-sm">{errors.rut.message}</p>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="contacto" className="text-[#798283]">
                  Contacto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contacto"
                  {...register("contacto", {
                    required: "El contacto es requerido",
                  })}
                  placeholder="Nombre del contacto principal"
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
                {errors.contacto && (
                  <p className="text-red-500 text-sm">
                    {errors.contacto.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#798283]">
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
                  placeholder="embarcador@ejemplo.com"
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-[#798283]">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telefono"
                  {...register("telefono", {
                    required: "El teléfono es requerido",
                  })}
                  placeholder="+56 9 1234 5678"
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
                {errors.telefono && (
                  <p className="text-red-500 text-sm">
                    {errors.telefono.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion" className="text-[#798283]">
                  Dirección <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="direccion"
                  {...register("direccion", {
                    required: "La dirección es requerida",
                  })}
                  placeholder="Dirección completa"
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
                {errors.direccion && (
                  <p className="text-red-500 text-sm">
                    {errors.direccion.message}
                  </p>
                )}
              </div>

              {/* Comuna */}
              <div className="space-y-2 md:col-span-2">
                <ComunaSelect
                  onComunaSelect={handleComunaSelect}
                  selectedComuna={selectedComuna}
                  disabled={isLoading}
                />
                <p className="text-xs text-[#798283]/70">
                  Busca y selecciona una comuna
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
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
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
