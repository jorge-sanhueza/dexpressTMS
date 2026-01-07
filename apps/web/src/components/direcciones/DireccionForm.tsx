import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { ComunaSelect } from "../ComunaSelect";
import type { Comuna } from "@/services/comunasService";
import type { CreateDireccionDto, Direccion } from "@/types/direccion";
import { toast } from "sonner";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { GoogleMap } from "../maps/GoogleMap";
import { useGeocodeAddress } from "@/hooks/useDirecciones";

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
  } = useForm<
    CreateDireccionDto & {
      comuna?: Comuna | null;
      latitud?: number;
      longitud?: number;
    }
  >({
    defaultValues: {
      frecuencia: 1,
      esPrincipal: false,
      origen: "MANUAL",
      latitud: undefined,
      longitud: undefined,
    },
  });

  const esPrincipal = watch("esPrincipal");
  const selectedComuna = watch("comuna");
  const latitud = watch("latitud");
  const longitud = watch("longitud");
  const [manualAddress, setManualAddress] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [_isMapLoading, setIsMapLoading] = useState(false);
  const geocodeMutation = useGeocodeAddress();

  useEffect(() => {
    if (isEditing && direccion) {
      const resetData = {
        nombre: direccion.nombre || "",
        direccionTexto: direccion.direccionTexto,
        calle: direccion.calle || "",
        numero: direccion.numero || "",
        contacto: direccion.contacto || "",
        telefono: direccion.telefono || "",
        email: direccion.email || "",
        referencia: direccion.referencia || "",
        frecuencia: direccion.frecuencia || 1,
        esPrincipal: direccion.esPrincipal || false,
        origen: direccion.origen || "MANUAL",
        latitud: direccion.latitud || undefined,
        longitud: direccion.longitud || undefined,
      };

      reset(resetData);
      setManualAddress(direccion.direccionTexto);

      // Pre-load map if coordinates exist
      if (direccion.latitud && direccion.longitud) {
        setIsMapLoading(true);
      }
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
      latitud: data.latitud || undefined,
      longitud: data.longitud || undefined,
    };

    // Validate coordinates if provided
    if (
      (submitData.latitud || submitData.longitud) &&
      (!submitData.latitud || !submitData.longitud)
    ) {
      toast.error("Debes proporcionar ambas coordenadas (latitud y longitud)");
      return;
    }

    if (submitData.latitud && submitData.longitud) {
      if (
        submitData.latitud < -90 ||
        submitData.latitud > 90 ||
        submitData.longitud < -180 ||
        submitData.longitud > 180
      ) {
        toast.error(
          "Coordenadas inválidas. Latitud (-90 a 90), Longitud (-180 a 180)"
        );
        return;
      }
    }

    onSubmit(submitData);
  };

  const handleGeocode = async () => {
    if (!manualAddress.trim()) {
      toast.error("Por favor, ingresa una dirección para geocodificar");
      return;
    }

    if (!selectedComuna?.id) {
      toast.warning(
        "Es recomendable seleccionar una comuna para mejor precisión"
      );
    }

    setIsGeocoding(true);
    try {
      const result = await geocodeMutation.mutateAsync({
        direccionTexto: manualAddress,
        comunaId: selectedComuna?.id,
      });

      setValue("latitud", result.latitud);
      setValue("longitud", result.longitud);

      // Update address with formatted version if available
      if (
        result.direccionFormateada &&
        result.direccionFormateada !== manualAddress
      ) {
        setManualAddress(result.direccionFormateada);
        setValue("direccionTexto", result.direccionFormateada);
      }

      setIsMapLoading(true);
      toast.success("Coordenadas obtenidas exitosamente");
    } catch (error) {
      toast.error(
        "No se pudieron obtener las coordenadas. Por favor, ingrésalas manualmente."
      );
    } finally {
      setIsGeocoding(false);
    }
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

  const handleCoordinateChange = (
    field: "latitud" | "longitud",
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (value === "" || !isNaN(numValue)) {
      setValue(field, value === "" ? undefined : numValue);

      // If both coordinates are set, load the map
      const currentLat = field === "latitud" ? numValue : latitud;
      const currentLng = field === "longitud" ? numValue : longitud;
      if (currentLat && currentLng) {
        setIsMapLoading(true);
      }
    }
  };

  const hasCoordinates = latitud && longitud;
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

  return (
    <div className="fixed inset-0 bg-zinc-500/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#798283]">{title}</h2>
              <p className="text-[#798283]/70">{description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0 text-[#798283]"
            >
              ×
            </Button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#798283]">
                    Información Básica
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  {/* Address Parts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  {/* Full Address */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="direccionTexto"
                      className="text-[#798283] flex items-center justify-between"
                    >
                      <span>
                        Dirección Completa{" "}
                        <span className="text-red-500">*</span>
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGeocode}
                        disabled={
                          isGeocoding || !manualAddress.trim() || isLoading
                        }
                        className="h-7 px-2 text-xs"
                      >
                        {isGeocoding ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Navigation className="h-3 w-3 mr-1" />
                        )}
                        Obtener coordenadas
                      </Button>
                    </Label>
                    <textarea
                      id="direccionTexto"
                      {...register("direccionTexto", {
                        required: "La dirección completa es requerida",
                      })}
                      value={manualAddress}
                      onChange={(e) =>
                        handleManualAddressChange(e.target.value)
                      }
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
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#798283]">
                    Información de Contacto
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="space-y-2">
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
                  </div>
                </div>

                {/* Coordinates Section */}
                <div className="space-y-4 p-4 border border-[#798283]/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#D42B22]" />
                      <h3 className="font-semibold text-[#798283]">
                        Coordenadas Geográficas
                      </h3>
                    </div>
                    {hasCoordinates && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = `https://www.google.com/maps?q=${latitud},${longitud}`;
                          window.open(url, "_blank");
                        }}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Ver en Google Maps
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitud" className="text-[#798283]">
                        Latitud
                      </Label>
                      <Input
                        id="latitud"
                        type="number"
                        step="any"
                        value={latitud || ""}
                        onChange={(e) =>
                          handleCoordinateChange("latitud", e.target.value)
                        }
                        placeholder="Ej: -33.45694"
                        disabled={isLoading}
                        className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                      />
                      <p className="text-xs text-[#798283]/50">
                        Entre -90 y 90 grados
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitud" className="text-[#798283]">
                        Longitud
                      </Label>
                      <Input
                        id="longitud"
                        type="number"
                        step="any"
                        value={longitud || ""}
                        onChange={(e) =>
                          handleCoordinateChange("longitud", e.target.value)
                        }
                        placeholder="Ej: -70.64827"
                        disabled={isLoading}
                        className="border-[#798283]/30 focus:ring-[#D42B22] focus:border-[#D42B22]"
                      />
                      <p className="text-xs text-[#798283]/50">
                        Entre -180 y 180 grados
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Map and Additional Fields */}
              <div className="space-y-6">
                {/* Map Preview */}
                <div className="space-y-2">
                  <Label className="text-[#798283]">
                    Vista Previa del Mapa
                  </Label>
                  <div className="border border-[#798283]/20 rounded-lg overflow-hidden">
                    {hasCoordinates ? (
                      <GoogleMap
                        latitud={latitud!}
                        longitud={longitud!}
                        direccionTexto={manualAddress}
                        height="300px"
                      />
                    ) : (
                      <div className="h-[300px] bg-gray-50 flex flex-col items-center justify-center text-[#798283]/70">
                        <MapPin className="h-12 w-12 mb-3 opacity-50" />
                        <p>Ingresa coordenadas para ver el mapa</p>
                        <p className="text-sm mt-1">
                          Usa el botón "Obtener coordenadas" o ingrésalas
                          manualmente
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comuna Selection */}
                <div className="space-y-2">
                  <Label htmlFor="comuna" className="text-[#798283]">
                    Comuna <span className="text-red-500">*</span>
                  </Label>
                  <ComunaSelect
                    onComunaSelect={handleComunaSelect}
                    selectedComuna={selectedComuna}
                    disabled={isLoading}
                  />
                  <div className="mt-2 space-y-1">
                    {selectedComuna ? (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                        Seleccionado: {selectedComuna.nombre}
                        {selectedComuna.provincia?.nombre &&
                          `, ${selectedComuna.provincia.nombre}`}
                        {selectedComuna.region?.nombre &&
                          `, ${selectedComuna.region.nombre}`}
                      </p>
                    ) : (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                        Debes seleccionar una comuna
                      </p>
                    )}
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4 p-4 border border-[#798283]/20 rounded-lg">
                  <h3 className="font-semibold text-[#798283]">
                    Configuración
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="esPrincipal" className="text-[#798283]">
                        Dirección Principal
                      </Label>
                      <p className="text-sm text-[#798283]/70">
                        {esPrincipal
                          ? "Esta será la dirección principal"
                          : "Dirección secundaria o de sucursal"}
                      </p>
                    </div>
                    <Checkbox
                      id="esPrincipal"
                      checked={esPrincipal}
                      onCheckedChange={(checked) =>
                        setValue("esPrincipal", !!checked)
                      }
                      disabled={isLoading}
                    />
                  </div>

                  {/* Hidden default values */}
                  <input type="hidden" {...register("frecuencia")} />
                  <input type="hidden" {...register("origen")} />

                  <div className="pt-4 border-t border-[#798283]/10 text-sm text-[#798283]/70">
                    <p>Valores por defecto configurados:</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Frecuencia: 1
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Origen: Manual
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || isGeocoding}
                className="border-[#798283]/30 text-[#798283]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isGeocoding || !selectedComuna?.id}
                className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {submitText}
                  </>
                ) : (
                  submitText
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
