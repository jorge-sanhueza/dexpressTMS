import React, { useEffect, useState } from "react";
import type { CreateOrderDto } from "@/types/order";
import { ordersService } from "@/services/orderService";
import { clientsService } from "@/services/clientsService";
import { direccionesService } from "@/services/direccionesService";
import { tipoCargaService } from "@/services/tipoCargaService";
import { tipoServicioService } from "@/services/tipoServicioService";
import { EntidadSelect } from "../EntidadSelect";
import type { Entidad } from "@/services/entidadesService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface CreateOrderModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  clienteId: string;
  numeroOt: string;
  fecha: string;
  fechaEntregaEstimada: string;
  remitenteId: string;
  destinatarioId: string;
  direccionOrigenId: string;
  direccionDestinoId: string;
  tipoCargaId: string;
  tipoServicioId: string;
  tipoTarifa: string;
  pesoTotalKg: string;
  volumenTotalM3: string;
  altoCm: string;
  largoCm: string;
  anchoCm: string;
  observaciones: string;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dropdown data
  const [clients, setClients] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [cargaTypes, setCargaTypes] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);

  // State for selected entidades
  const [selectedRemitente, setSelectedRemitente] = useState<Entidad | null>(
    null
  );
  const [selectedDestinatario, setSelectedDestinatario] =
    useState<Entidad | null>(null);

  const [formData, setFormData] = useState<FormData>({
    clienteId: "",
    numeroOt: "",
    fecha: new Date().toISOString().split("T")[0],
    fechaEntregaEstimada: "",
    remitenteId: "",
    destinatarioId: "",
    direccionOrigenId: "",
    direccionDestinoId: "",
    tipoCargaId: "",
    tipoServicioId: "",
    tipoTarifa: "PESO_VOLUMEN",
    pesoTotalKg: "",
    volumenTotalM3: "",
    altoCm: "",
    largoCm: "",
    anchoCm: "",
    observaciones: "",
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setDataLoading(true);
        setError(null);

        const [clientsData, addressesData, cargaTypesData, serviceTypesData] =
          await Promise.all([
            clientsService.getClients(),
            direccionesService.getDirecciones({ activo: true }),
            tipoCargaService.getTiposCarga({ activo: true }),
            tipoServicioService.getTiposServicio({ activo: true }),
          ]);

        setClients(clientsData.clients || []);
        setAddresses(addressesData.direcciones || []);
        setCargaTypes(cargaTypesData.tiposCarga || []);
        setServiceTypes(serviceTypesData.tiposServicio || []);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        setError("Error loading form data. Please try again.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRemitenteSelect = (entidad: Entidad | null) => {
    setSelectedRemitente(entidad);
    setFormData((prev) => ({
      ...prev,
      remitenteId: entidad?.id || "",
    }));
  };

  const handleDestinatarioSelect = (entidad: Entidad | null) => {
    setSelectedDestinatario(entidad);
    setFormData((prev) => ({
      ...prev,
      destinatarioId: entidad?.id || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = [
        "clienteId",
        "numeroOt",
        "fecha",
        "remitenteId",
        "destinatarioId",
        "direccionOrigenId",
        "direccionDestinoId",
        "tipoCargaId",
        "tipoServicioId",
      ];

      const missingFields = requiredFields.filter(
        (field) => !formData[field as keyof FormData]
      );
      if (missingFields.length > 0) {
        throw new Error(
          `Por favor complete todos los campos requeridos: ${missingFields.join(
            ", "
          )}`
        );
      }

      // Prepare the order data
      const orderData: CreateOrderDto = {
        clienteId: formData.clienteId,
        numeroOt: formData.numeroOt,
        fecha: new Date(formData.fecha),
        fechaEntregaEstimada: formData.fechaEntregaEstimada
          ? new Date(formData.fechaEntregaEstimada)
          : undefined,
        estado: "PENDIENTE",
        tipoTarifa: formData.tipoTarifa as any,
        remitenteId: formData.remitenteId,
        destinatarioId: formData.destinatarioId,
        direccionOrigenId: formData.direccionOrigenId,
        direccionDestinoId: formData.direccionDestinoId,
        tipoCargaId: formData.tipoCargaId,
        tipoServicioId: formData.tipoServicioId,
        pesoTotalKg: formData.pesoTotalKg
          ? parseFloat(formData.pesoTotalKg)
          : undefined,
        volumenTotalM3: formData.volumenTotalM3
          ? parseFloat(formData.volumenTotalM3)
          : undefined,
        altoCm: formData.altoCm ? parseFloat(formData.altoCm) : undefined,
        largoCm: formData.largoCm ? parseFloat(formData.largoCm) : undefined,
        anchoCm: formData.anchoCm ? parseFloat(formData.anchoCm) : undefined,
        observaciones: formData.observaciones || undefined,
      };

      await ordersService.createOrder(orderData);
      toast.success("Orden creada exitosamente");
      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error creating order";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const rateTypes = [
    { id: "PESO_VOLUMEN", nombre: "Peso/Volumen" },
    { id: "EQUIPO", nombre: "Por Equipo" },
  ];

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="px-4 pt-5 pb-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#798283]">
              Crear Nueva Orden
            </h2>
            <p className="text-[#798283]/70 mt-1">
              Complete la información requerida para crear una nueva orden
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            ✕
          </Button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-red-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Básica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clienteId">Cliente *</Label>
                  <Select
                    value={formData.clienteId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, clienteId: value }))
                    }
                    disabled={clients.length === 0 || dataLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nombre} - {client.rut}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroOt">Número OT/Referencia *</Label>
                  <Input
                    type="text"
                    id="numeroOt"
                    name="numeroOt"
                    value={formData.numeroOt}
                    onChange={handleInputChange}
                    placeholder="Ej: OT-2024-001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha de Orden *</Label>
                  <Input
                    type="date"
                    id="fecha"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaEntregaEstimada">
                    Fecha Estimada de Entrega
                  </Label>
                  <Input
                    type="date"
                    id="fechaEntregaEstimada"
                    name="fechaEntregaEstimada"
                    value={formData.fechaEntregaEstimada}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parties Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Partes Involucradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Remitente *</Label>
                  <EntidadSelect
                    onEntidadSelect={handleRemitenteSelect}
                    selectedEntidad={selectedRemitente}
                    tipoEntidad="REMITENTE"
                    placeholder="Buscar remitente por nombre o RUT..."
                    required={true}
                    disabled={dataLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Destinatario *</Label>
                  <EntidadSelect
                    onEntidadSelect={handleDestinatarioSelect}
                    selectedEntidad={selectedDestinatario}
                    tipoEntidad="DESTINATARIO"
                    placeholder="Buscar destinatario por nombre o RUT..."
                    required={true}
                    disabled={dataLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccionOrigenId">
                    Dirección de Origen *
                  </Label>
                  <Select
                    value={formData.direccionOrigenId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        direccionOrigenId: value,
                      }))
                    }
                    disabled={addresses.length === 0 || dataLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar dirección origen" />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map((address) => (
                        <SelectItem key={address.id} value={address.id}>
                          {address.direccionTexto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccionDestinoId">
                    Dirección Destino *
                  </Label>
                  <Select
                    value={formData.direccionDestinoId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        direccionDestinoId: value,
                      }))
                    }
                    disabled={addresses.length === 0 || dataLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar dirección destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map((address) => (
                        <SelectItem key={address.id} value={address.id}>
                          {address.direccionTexto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles del Servicio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoCargaId">Tipo de Carga *</Label>
                  <Select
                    value={formData.tipoCargaId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, tipoCargaId: value }))
                    }
                    disabled={cargaTypes.length === 0 || dataLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de carga" />
                    </SelectTrigger>
                    <SelectContent>
                      {cargaTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoServicioId">Tipo de Servicio *</Label>
                  <Select
                    value={formData.tipoServicioId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        tipoServicioId: value,
                      }))
                    }
                    disabled={serviceTypes.length === 0 || dataLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoTarifa">Tipo de Tarifa *</Label>
                  <Select
                    value={formData.tipoTarifa}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, tipoTarifa: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de tarifa" />
                    </SelectTrigger>
                    <SelectContent>
                      {rateTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Measurements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medidas y Peso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pesoTotalKg">Peso Total (kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    id="pesoTotalKg"
                    name="pesoTotalKg"
                    value={formData.pesoTotalKg}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volumenTotalM3">Volumen (m³)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    id="volumenTotalM3"
                    name="volumenTotalM3"
                    value={formData.volumenTotalM3}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altoCm">Alto (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    id="altoCm"
                    name="altoCm"
                    value={formData.altoCm}
                    onChange={handleInputChange}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="largoCm">Largo (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    id="largoCm"
                    name="largoCm"
                    value={formData.largoCm}
                    onChange={handleInputChange}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anchoCm">Ancho (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    id="anchoCm"
                    name="anchoCm"
                    value={formData.anchoCm}
                    onChange={handleInputChange}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Adicional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  placeholder="Instrucciones especiales, comentarios, etc."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || dataLoading}
              className="bg-[#D42B22] hover:bg-[#B3251E] text-white"
            >
              {loading ? "Creando..." : "Crear Orden"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
