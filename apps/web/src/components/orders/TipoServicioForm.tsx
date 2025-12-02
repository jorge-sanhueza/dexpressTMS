import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import type { TipoServicio } from "@/services/tipoServicioService";

interface TipoServicioFormData {
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
  visible: boolean;
}

interface TipoServicioFormProps {
  tipoServicio?: TipoServicio | null;
  onSubmit: (data: TipoServicioFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const TipoServicioForm: React.FC<TipoServicioFormProps> = ({
  tipoServicio,
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
  } = useForm<TipoServicioFormData>({
    defaultValues: {
      activo: true,
      visible: true,
    },
  });

  useEffect(() => {
    if (isEditing && tipoServicio) {
      reset({
        nombre: tipoServicio.nombre,
        codigo: tipoServicio.codigo,
        descripcion: tipoServicio.descripcion || "",
        activo: tipoServicio.activo,
        visible: tipoServicio.visible,
      });
    }
  }, [isEditing, tipoServicio, reset]);

  const handleFormSubmit = (data: TipoServicioFormData) => {
    const submitData = {
      ...data,
      orden: 3,
    };
    onSubmit(submitData);
  };

  const title = isEditing
    ? "Editar Tipo de Servicio"
    : "Crear Nuevo Tipo de Servicio";
  const description = isEditing
    ? "Modifica la información del tipo de servicio"
    : "Completa la información del nuevo tipo de servicio";
  const submitText = isLoading
    ? isEditing
      ? "Actualizando..."
      : "Creando..."
    : isEditing
    ? "Actualizar Tipo de Servicio"
    : "Crear Tipo de Servicio";

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
                  placeholder="Ej: Express, Estándar, Urgente, etc."
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              {/* Código */}
              <div className="space-y-2">
                <Label htmlFor="codigo" className="text-[#798283]">
                  Código <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="codigo"
                  {...register("codigo", {
                    required: "El código es requerido",
                    pattern: {
                      value: /^[A-Z0-9_]+$/,
                      message:
                        "Solo se permiten letras mayúsculas, números y guiones bajos",
                    },
                    minLength: {
                      value: 2,
                      message: "El código debe tener al menos 2 caracteres",
                    },
                  })}
                  placeholder="Ej: EXP, STD, URG"
                  disabled={isLoading || isEditing}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22] uppercase"
                />
                {errors.codigo && (
                  <p className="text-red-500 text-sm">
                    {errors.codigo.message}
                  </p>
                )}
                {isEditing && (
                  <p className="text-xs text-[#798283]/70">
                    El código no se puede modificar una vez creado
                  </p>
                )}
                <p className="text-xs text-[#798283]/70">
                  Código único para identificar el tipo de servicio (solo
                  mayúsculas, números y _)
                </p>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-[#798283]">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  {...register("descripcion")}
                  placeholder="Descripción detallada del tipo de servicio, tiempos de entrega, características, etc."
                  disabled={isLoading}
                  rows={3}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
              </div>

              {/* Estados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#EFF4F9] rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="activo"
                    {...register("activo")}
                    onCheckedChange={(checked) => setValue("activo", !!checked)}
                  />
                  <Label
                    htmlFor="activo"
                    className="text-sm font-medium text-[#798283]"
                  >
                    Activo
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="visible"
                    {...register("visible")}
                    onCheckedChange={(checked) =>
                      setValue("visible", !!checked)
                    }
                  />
                  <Label
                    htmlFor="visible"
                    className="text-sm font-medium text-[#798283]"
                  >
                    Visible
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
