import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import type { TipoCarga } from "@/services/tipoCargaService";

interface TipoCargaFormData {
  nombre: string;
  observaciones?: string;
  requiereEquipoEspecial: boolean;
  requiereTempControlada: boolean;
}

interface TipoCargaFormProps {
  tipoCarga?: TipoCarga | null;
  onSubmit: (data: TipoCargaFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const TipoCargaForm: React.FC<TipoCargaFormProps> = ({
  tipoCarga,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TipoCargaFormData>({
    defaultValues: {
      requiereEquipoEspecial: false,
      requiereTempControlada: false,
    },
  });

  useEffect(() => {
    if (isEditing && tipoCarga) {
      reset({
        nombre: tipoCarga.nombre,
        observaciones: tipoCarga.observaciones || "",
        requiereEquipoEspecial: tipoCarga.requiereEquipoEspecial,
        requiereTempControlada: tipoCarga.requiereTempControlada,
      });
    }
  }, [isEditing, tipoCarga, reset]);

  const handleFormSubmit = (data: TipoCargaFormData) => {
    const submitData = {
      ...data,
      orden: 3,
      activo: true,
      visible: true,
    };
    onSubmit(submitData);
  };

  const title = isEditing
    ? "Editar Tipo de Carga"
    : "Crear Nuevo Tipo de Carga";
  const description = isEditing
    ? "Modifica la información del tipo de carga"
    : "Completa la información del nuevo tipo de carga";
  const submitText = isLoading
    ? isEditing
      ? "Actualizando..."
      : "Creando..."
    : isEditing
    ? "Actualizar Tipo de Carga"
    : "Crear Tipo de Carga";

  return (
    <div className="fixed inset-0 bg-zinc-500/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#798283] mb-2">{title}</h2>
          <p className="text-[#798283]/70 mb-6">{description}</p>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Nombre */}
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
                  placeholder="Ej: Carga General, Carga Frágil, etc."
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="observaciones" className="text-[#798283]">
                  Observaciones
                </Label>
                <Textarea
                  id="observaciones"
                  {...register("observaciones")}
                  placeholder="Descripción o notas adicionales sobre este tipo de carga"
                  disabled={isLoading}
                  rows={3}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
              </div>

              {/* Características Especiales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#EFF4F9] rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiereEquipoEspecial"
                    {...register("requiereEquipoEspecial")}
                    onCheckedChange={(checked) =>
                      setValue("requiereEquipoEspecial", !!checked)
                    }
                  />
                  <Label
                    htmlFor="requiereEquipoEspecial"
                    className="text-sm font-medium text-[#798283]"
                  >
                    Requiere equipo especial
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiereTempControlada"
                    {...register("requiereTempControlada")}
                    onCheckedChange={(checked) =>
                      setValue("requiereTempControlada", !!checked)
                    }
                  />
                  <Label
                    htmlFor="requiereTempControlada"
                    className="text-sm font-medium text-[#798283]"
                  >
                    Requiere temperatura controlada
                  </Label>
                </div>
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
