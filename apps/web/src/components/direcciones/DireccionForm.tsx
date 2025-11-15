import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { ComunaSelect } from "../ComunaSelect";
import type { Comuna } from "@/services/comunasService";
import type { CreateDireccionDto, Direccion } from "@/types/direccion";

interface DireccionFormProps {
  direccion?: Direccion | null;
  onSubmit: (data: CreateDireccionDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const DireccionForm: React.FC<DireccionFormProps> = ({
  direccion,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateDireccionDto & { comuna?: Comuna | null }>({
    defaultValues: {
      frecuencia: 1,
      esPrincipal: false,
      origen: "MANUAL",
    },
  });

  const esPrincipal = watch("esPrincipal");
  const selectedComuna = watch("comuna");
  const [manualAddress, setManualAddress] = useState("");

  useEffect(() => {
    if (isEditing && direccion) {
      reset({
        nombre: direccion.nombre || "",
        direccionTexto: direccion.direccionTexto,
        calle: direccion.calle || "",
        numero: direccion.numero || "",
        contacto: direccion.contacto || "",
        telefono: direccion.telefono || "",
        email: direccion.email || "",
        referencia: direccion.referencia || "",
        frecuencia: direccion.frecuencia,
        esPrincipal: direccion.esPrincipal,
        origen: direccion.origen,
        // comuna will be set by ComunaSelect
      });
      setManualAddress(direccion.direccionTexto);
    }
  }, [isEditing, direccion, reset]);

  const handleFormSubmit = (data: any) => {
    const submitData: CreateDireccionDto = {
      nombre: data.nombre || undefined,
      direccionTexto: data.direccionTexto || "",
      calle: data.calle || undefined,
      numero: data.numero || undefined,
      contacto: data.contacto || undefined,
      telefono: data.telefono || undefined,
      email: data.email || undefined,
      referencia: data.referencia || undefined,
      frecuencia: data.frecuencia || 1,
      esPrincipal: data.esPrincipal || false,
      origen: data.origen || "MANUAL",
      comunaId: data.comuna?.id || "",
    };

    onSubmit(submitData);
  };

  const handleComunaSelect = (comuna: Comuna | null) => {
    setValue("comuna", comuna);
  };

  const handleManualAddressChange = (value: string) => {
    setManualAddress(value);
    setValue("direccionTexto", value);
  };

  const buildAddressFromParts = () => {
    const calle = watch("calle");
    const numero = watch("numero");

    if (calle && numero) {
      const fullAddress = `${calle} ${numero}`;
      setManualAddress(fullAddress);
      setValue("direccionTexto", fullAddress);
    }
  };

  const title = isEditing ? "Editar Dirección" : "Crear Nueva Dirección";
  const description = isEditing
    ? "Modifica la información de la dirección"
    : "Completa la información de la nueva dirección";
  const submitText = isLoading
    ? isEditing
      ? "Actualizando..."
      : "Creando..."
    : isEditing
    ? "Actualizar Dirección"
    : "Crear Dirección";

  const origenes = [
    { id: "MANUAL", nombre: "Manual" },
    { id: "IMPORTACION", nombre: "Importación" },
    { id: "API", nombre: "API" },
  ];

  return (
    <div className="fixed inset-0 bg-zinc-500/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#798283] mb-2">{title}</h2>
          <p className="text-[#798283]/70 mb-6">{description}</p>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-[#798283]">
                  Nombre/Lugar
                </Label>
                <Input
                  id="nombre"
                  {...register("nombre")}
                  placeholder="Ej: Casa Central, Oficina Principal"
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
                <p className="text-xs text-[#798283]/70">
                  Nombre descriptivo para identificar la dirección
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contacto" className="text-[#798283]">
                  Contacto
                </Label>
                <Input
                  id="contacto"
                  {...register("contacto")}
                  placeholder="Nombre del contacto"
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
              </div>

              {/* Address Parts */}
              <div className="space-y-2">
                <Label htmlFor="calle" className="text-[#798283]">
                  Calle
                </Label>
                <Input
                  id="calle"
                  {...register("calle")}
                  placeholder="Nombre de la calle"
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                  onBlur={buildAddressFromParts}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero" className="text-[#798283]">
                  Número
                </Label>
                <Input
                  id="numero"
                  {...register("numero")}
                  placeholder="Número"
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                  onBlur={buildAddressFromParts}
                />
              </div>

              {/* Full Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccionTexto" className="text-[#798283]">
                  Dirección Completa <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="direccionTexto"
                  {...register("direccionTexto", {
                    required: "La dirección completa es requerida",
                  })}
                  value={manualAddress}
                  onChange={(e) => handleManualAddressChange(e.target.value)}
                  placeholder="Dirección completa incluyendo número, departamento, etc."
                  disabled={isLoading}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
                {errors.direccionTexto && (
                  <p className="text-red-500 text-sm">
                    {errors.direccionTexto.message}
                  </p>
                )}
                <p className="text-xs text-[#798283]/70">
                  Dirección completa que se mostrará en el sistema
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-[#798283]">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  {...register("telefono")}
                  placeholder="+56 9 1234 5678"
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#798283]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="contacto@empresa.com"
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
              </div>

              {/* Additional Information */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="referencia" className="text-[#798283]">
                  Referencia
                </Label>
                <Input
                  id="referencia"
                  {...register("referencia")}
                  placeholder="Ej: Entre calle A y B, edificio verde"
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
                <p className="text-xs text-[#798283]/70">
                  Puntos de referencia para facilitar la ubicación
                </p>
              </div>

              {/* Comuna Selection */}
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
                {!selectedComuna?.id && (
                  <p className="text-xs text-red-500">
                    ✗ Debes seleccionar una comuna
                  </p>
                )}
              </div>

              {/* Settings */}
              <div className="flex items-center space-x-2 md:col-span-2 p-4 bg-[#EFF4F9] rounded-lg">
                <Checkbox
                  id="esPrincipal"
                  {...register("esPrincipal")}
                  onCheckedChange={(checked) =>
                    setValue("esPrincipal", !!checked)
                  }
                />
                <Label
                  htmlFor="esPrincipal"
                  className="text-sm font-medium text-[#798283]"
                >
                  ¿Es dirección principal?
                </Label>
                <p className="text-xs text-[#798283]/70 ml-2">
                  {esPrincipal
                    ? "Esta será la dirección principal de la empresa"
                    : "Dirección secundaria o de sucursal"}
                </p>
              </div>

              {/* Origin */}
              <div className="space-y-2">
                <Label htmlFor="origen" className="text-[#798283]">
                  Origen
                </Label>
                <select
                  id="origen"
                  {...register("origen")}
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D42B22] focus:border-transparent"
                >
                  {origenes.map((origen) => (
                    <option key={origen.id} value={origen.id}>
                      {origen.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frecuencia" className="text-[#798283]">
                  Frecuencia de Uso
                </Label>
                <Input
                  id="frecuencia"
                  type="number"
                  {...register("frecuencia", {
                    valueAsNumber: true,
                    min: 0,
                    max: 1000,
                  })}
                  disabled={isLoading}
                  className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                />
                <p className="text-xs text-[#798283]/70">
                  Número de veces que se ha usado esta dirección
                </p>
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
                disabled={isLoading || !selectedComuna?.id}
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
