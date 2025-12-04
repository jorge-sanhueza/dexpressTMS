import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import type { UpdateOrderDto } from "../../types/order";
import { ordersService } from "@/services/orderService";
import { clientsService } from "@/services/clientsService";
import { direccionesService } from "@/services/direccionesService";
import { tipoCargaService } from "@/services/tipoCargaService";
import { tipoServicioService } from "@/services/tipoServicioService";
import { EntidadSelect } from "../EntidadSelect";
import type { Entidad } from "@/services/entidadesService";
import { useEntidad } from "@/hooks/useEntidades";
import { useOrder, useUpdateOrder } from "@/hooks/useOrders";
import { DatePicker } from "../DatePicker";

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

export const EditOrderForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use the existing order hook
  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
  } = useOrder(id || "");

  const updateOrderMutation = useUpdateOrder();

  // State for OT number availability (skip check for same number)
  const [originalNumeroOt, setOriginalNumeroOt] = useState<string>("");
  const [otNumberAvailable, setOtNumberAvailable] = useState<boolean | null>(
    null
  );
  const [checkingOtNumber, setCheckingOtNumber] = useState(false);

  // State for dropdown data
  const [clients, setClients] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [cargaTypes, setCargaTypes] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);

  // State for selected entidades (searchable selects)
  const [selectedRemitente, setSelectedRemitente] = useState<Entidad | null>(
    null
  );
  const [selectedDestinatario, setSelectedDestinatario] =
    useState<Entidad | null>(null);

  // Date states for DatePicker
  const [fechaDate, setFechaDate] = useState<Date | undefined>(undefined);
  const [fechaEntregaEstimadaDate, setFechaEntregaEstimadaDate] = useState<
    Date | undefined
  >(undefined);

  const [formData, setFormData] = useState<FormData>({
    clienteId: "",
    numeroOt: "",
    fecha: "",
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

  const { data: remitenteFullData } = useEntidad(formData.remitenteId);
  const { data: destinatarioFullData } = useEntidad(formData.destinatarioId);

  // Load order data when it's available
  useEffect(() => {
    if (orderData) {
      console.log("Loading order data:", orderData);

      // Store original OT number for validation
      setOriginalNumeroOt(orderData.numeroOt);

      // Set form data from order
      setFormData({
        clienteId: orderData.clienteId || "",
        numeroOt: orderData.numeroOt || "",
        fecha: orderData.fecha
          ? new Date(orderData.fecha).toISOString().split("T")[0]
          : "",
        fechaEntregaEstimada: orderData.fechaEntregaEstimada
          ? new Date(orderData.fechaEntregaEstimada).toISOString().split("T")[0]
          : "",
        remitenteId: orderData.remitenteId || "",
        destinatarioId: orderData.destinatarioId || "",
        direccionOrigenId: orderData.direccionOrigenId || "",
        direccionDestinoId: orderData.direccionDestinoId || "",
        tipoCargaId: orderData.tipoCargaId || "",
        tipoServicioId: orderData.tipoServicioId || "",
        tipoTarifa: orderData.tipoTarifa || "PESO_VOLUMEN",
        pesoTotalKg: orderData.pesoTotalKg?.toString() || "",
        volumenTotalM3: orderData.volumenTotalM3?.toString() || "",
        altoCm: orderData.altoCm?.toString() || "",
        largoCm: orderData.largoCm?.toString() || "",
        anchoCm: orderData.anchoCm?.toString() || "",
        observaciones: orderData.observaciones || "",
      });

      // Set dates for DatePicker
      setFechaDate(orderData.fecha ? new Date(orderData.fecha) : undefined);
      setFechaEntregaEstimadaDate(
        orderData.fechaEntregaEstimada
          ? new Date(orderData.fechaEntregaEstimada)
          : undefined
      );

      // Set entidad selections if data is available
      if (orderData.remitente) {
        setSelectedRemitente({
          id: orderData.remitente.id,
          nombre: orderData.remitente.nombre,
          rut: orderData.remitente.rut,
          tipoEntidad: "REMITENTE",
          contacto: orderData.remitente.contacto || "",
          telefono: orderData.remitente.telefono || "",
          email: "",
          direccion: "",
          activo: true,
          tenantId: tenant?.id || "unknown-tenant",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      if (orderData.destinatario) {
        setSelectedDestinatario({
          id: orderData.destinatario.id,
          nombre: orderData.destinatario.nombre,
          rut: orderData.destinatario.rut,
          tipoEntidad: "DESTINATARIO",
          contacto: orderData.destinatario.contacto || "",
          telefono: orderData.destinatario.telefono || "",
          email: "",
          direccion: "",
          activo: true,
          tenantId: tenant?.id || "unknown-tenant",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }, [orderData]);

  useEffect(() => {
    if (remitenteFullData) {
      setSelectedRemitente(remitenteFullData);
    }
  }, [remitenteFullData]);

  useEffect(() => {
    if (destinatarioFullData) {
      setSelectedDestinatario(destinatarioFullData);
    }
  }, [destinatarioFullData]);

  // Load dropdown data
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

  // Check OT number availability when it changes (only if different from original)
  useEffect(() => {
    const checkOtNumber = async () => {
      if (!formData.numeroOt || formData.numeroOt.length < 3) {
        setOtNumberAvailable(null);
        return;
      }

      // Skip check if it's the same as original
      if (formData.numeroOt === originalNumeroOt) {
        setOtNumberAvailable(true);
        return;
      }

      // Debounce the check
      const timer = setTimeout(async () => {
        setCheckingOtNumber(true);
        try {
          const response = await ordersService.checkOtNumberAvailability(
            formData.numeroOt
          );
          setOtNumberAvailable(response.available);
        } catch (error) {
          console.error("Error checking OT number:", error);
          setOtNumberAvailable(null);
        } finally {
          setCheckingOtNumber(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    };

    checkOtNumber();
  }, [formData.numeroOt, originalNumeroOt]);

  // Update formData when date pickers change
  useEffect(() => {
    if (fechaDate) {
      setFormData((prev) => ({
        ...prev,
        fecha: fechaDate.toISOString().split("T")[0],
      }));
    }
  }, [fechaDate]);

  useEffect(() => {
    if (fechaEntregaEstimadaDate) {
      setFormData((prev) => ({
        ...prev,
        fechaEntregaEstimada: fechaEntregaEstimadaDate
          .toISOString()
          .split("T")[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        fechaEntregaEstimada: "",
      }));
    }
  }, [fechaEntregaEstimadaDate]);

  useEffect(() => {
    validateMeasurements();
  }, [
    formData.pesoTotalKg,
    formData.volumenTotalM3,
    formData.altoCm,
    formData.largoCm,
    formData.anchoCm,
    formData.tipoTarifa,
    formData.direccionOrigenId,
    formData.direccionDestinoId,
    formData.fecha,
    formData.fechaEntregaEstimada,
  ]);

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

  // Handler for remitente selection
  const handleRemitenteSelect = (entidad: Entidad | null) => {
    setSelectedRemitente(entidad);
    setFormData((prev) => ({
      ...prev,
      remitenteId: entidad?.id || "",
    }));
  };

  // Handler for destinatario selection
  const handleDestinatarioSelect = (entidad: Entidad | null) => {
    setSelectedDestinatario(entidad);
    setFormData((prev) => ({
      ...prev,
      destinatarioId: entidad?.id || "",
    }));
  };

  // Handler for fecha date selection
  const handleFechaSelect = (date: Date | undefined) => {
    setFechaDate(date);
    // If fechaEntregaEstimada is before the new fecha, clear it
    if (fechaEntregaEstimadaDate && date && fechaEntregaEstimadaDate < date) {
      setFechaEntregaEstimadaDate(undefined);
    }
  };

  // Handler for fechaEntregaEstimada date selection
  const handleFechaEntregaEstimadaSelect = (date: Date | undefined) => {
    setFechaEntregaEstimadaDate(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Validate required fields
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

      // 2. Validate OT number availability (if changed)
      if (
        formData.numeroOt !== originalNumeroOt &&
        otNumberAvailable === false
      ) {
        throw new Error(
          "El número de OT ya está en uso. Por favor use un número diferente."
        );
      }

      // 3. Validate origin and destination are different
      if (formData.direccionOrigenId === formData.direccionDestinoId) {
        throw new Error(
          "La dirección de origen y destino no pueden ser la misma"
        );
      }

      // 4. Validate that remitente and destinatario are different (optional but recommended)
      if (formData.remitenteId === formData.destinatarioId) {
        const confirmed = window.confirm(
          "El remitente y destinatario son la misma entidad. ¿Está seguro de continuar?"
        );
        if (!confirmed) {
          setLoading(false);
          return;
        }
      }

      // 5. Validate fechaEntregaEstimada if provided
      if (formData.fechaEntregaEstimada) {
        const fecha = new Date(formData.fecha);
        const fechaEntregaEstimada = new Date(formData.fechaEntregaEstimada);

        fecha.setHours(0, 0, 0, 0);
        fechaEntregaEstimada.setHours(0, 0, 0, 0);

        if (fechaEntregaEstimada < fecha) {
          throw new Error(
            "La fecha estimada de entrega no puede ser anterior a la fecha de la orden"
          );
        }

        const maxDate = new Date(fecha);
        maxDate.setFullYear(maxDate.getFullYear() + 1);

        if (fechaEntregaEstimada > maxDate) {
          const confirmed = window.confirm(
            "La fecha estimada de entrega es más de un año en el futuro. ¿Está seguro de continuar?"
          );
          if (!confirmed) {
            setLoading(false);
            return;
          }
        }
      }

      // 6. Validate measurements based on rate type
      const pesoTotalKg = parseFloat(formData.pesoTotalKg) || 0;
      const volumenTotalM3 = parseFloat(formData.volumenTotalM3) || 0;
      const altoCm = parseFloat(formData.altoCm) || 0;
      const largoCm = parseFloat(formData.largoCm) || 0;
      const anchoCm = parseFloat(formData.anchoCm) || 0;

      // 7. For "PESO_VOLUMEN" rate type, require at least weight or volume
      if (formData.tipoTarifa === "PESO_VOLUMEN") {
        if (pesoTotalKg <= 0 && volumenTotalM3 <= 0) {
          throw new Error(
            "Para tarifa Peso/Volumen, debe especificar al menos Peso Total (kg) o Volumen (m³)"
          );
        }
      }

      // 8. Validate that if any dimension is provided, all should be valid
      const dimensionsProvided = altoCm > 0 || largoCm > 0 || anchoCm > 0;
      if (dimensionsProvided) {
        if (altoCm <= 0)
          throw new Error(
            "Si proporciona dimensiones, el Alto (cm) debe ser mayor a 0"
          );
        if (largoCm <= 0)
          throw new Error(
            "Si proporciona dimensiones, el Largo (cm) debe ser mayor a 0"
          );
        if (anchoCm <= 0)
          throw new Error(
            "Si proporciona dimensiones, el Ancho (cm) debe ser mayor a 0"
          );
      }

      // 9. Validate weight and volume are positive if provided
      if (pesoTotalKg < 0)
        throw new Error("El Peso Total (kg) debe ser un valor positivo");
      if (volumenTotalM3 < 0)
        throw new Error("El Volumen (m³) debe ser un valor positivo");

      // 10. Auto-calculate volume from dimensions if not provided but dimensions are
      let finalVolumenTotalM3 = volumenTotalM3;
      if (volumenTotalM3 <= 0 && dimensionsProvided) {
        finalVolumenTotalM3 = (altoCm * largoCm * anchoCm) / 1000000; // cm³ to m³
      }

      // Prepare the update data
      const updateData: UpdateOrderDto = {
        clienteId: formData.clienteId,
        numeroOt: formData.numeroOt,
        fecha: new Date(formData.fecha),
        fechaEntregaEstimada: formData.fechaEntregaEstimada
          ? new Date(formData.fechaEntregaEstimada)
          : undefined,
        remitenteId: formData.remitenteId,
        destinatarioId: formData.destinatarioId,
        direccionOrigenId: formData.direccionOrigenId,
        direccionDestinoId: formData.direccionDestinoId,
        tipoCargaId: formData.tipoCargaId,
        tipoServicioId: formData.tipoServicioId,
        tipoTarifa: formData.tipoTarifa as any,
        pesoTotalKg: pesoTotalKg > 0 ? pesoTotalKg : undefined,
        volumenTotalM3:
          finalVolumenTotalM3 > 0 ? finalVolumenTotalM3 : undefined,
        altoCm: altoCm > 0 ? altoCm : undefined,
        largoCm: largoCm > 0 ? largoCm : undefined,
        anchoCm: anchoCm > 0 ? anchoCm : undefined,
        observaciones: formData.observaciones || undefined,
      };

      // Call the update mutation
      if (id) {
        await updateOrderMutation.mutateAsync({ id, orderData: updateData });
        navigate("/ordenes");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error updating order");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/ordenes");
  };

  const validateMeasurements = () => {
    const warnings: string[] = [];
    const pesoTotalKg = parseFloat(formData.pesoTotalKg) || 0;
    const volumenTotalM3 = parseFloat(formData.volumenTotalM3) || 0;
    const altoCm = parseFloat(formData.altoCm) || 0;
    const largoCm = parseFloat(formData.largoCm) || 0;
    const anchoCm = parseFloat(formData.anchoCm) || 0;

    // Check if any dimension is partially filled
    const partialDimensions =
      (altoCm > 0 && (largoCm <= 0 || anchoCm <= 0)) ||
      (largoCm > 0 && (altoCm <= 0 || anchoCm <= 0)) ||
      (anchoCm > 0 && (altoCm <= 0 || largoCm <= 0));

    if (partialDimensions) {
      warnings.push(
        "Complete todas las dimensiones (Alto, Largo, Ancho) para cálculos precisos"
      );
    }

    // Weight/Volume warning for PESO_VOLUMEN
    if (
      formData.tipoTarifa === "PESO_VOLUMEN" &&
      pesoTotalKg <= 0 &&
      volumenTotalM3 <= 0
    ) {
      warnings.push("Para tarifa Peso/Volumen, ingrese Peso o Volumen");
    }

    // Check if origin and destination are the same
    if (
      formData.direccionOrigenId &&
      formData.direccionDestinoId &&
      formData.direccionOrigenId === formData.direccionDestinoId
    ) {
      warnings.push("La dirección de origen y destino son iguales");
    }

    // Check if fechaEntregaEstimada is before fecha
    if (formData.fecha && formData.fechaEntregaEstimada) {
      const fecha = new Date(formData.fecha);
      const fechaEntregaEstimada = new Date(formData.fechaEntregaEstimada);

      fecha.setHours(0, 0, 0, 0);
      fechaEntregaEstimada.setHours(0, 0, 0, 0);

      if (fechaEntregaEstimada < fecha) {
        warnings.push(
          "La fecha estimada de entrega es anterior a la fecha de orden"
        );
      }
    }

    setValidationWarnings(warnings);
  };

  const rateTypes = [
    { id: "PESO_VOLUMEN", nombre: "Peso/Volumen" },
    { id: "EQUIPO", nombre: "Por Equipo" },
  ];

  // Loading states
  if (orderLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-[#EFF4F9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D42B22] mx-auto"></div>
          <p className="mt-4 text-[#798283]">Cargando datos de la orden...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (orderError) {
    return (
      <div className="min-h-screen bg-[#EFF4F9]">
        <nav className="bg-white shadow-lg border-b border-[#798283]/20">
          {/* Same nav as CreateOrderForm */}
        </nav>
        <main className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">
              No se pudo cargar la orden: {orderError.message}
            </p>
            <button
              onClick={() => navigate("/ordenes")}
              className="mt-4 px-4 py-2 bg-[#798283] text-white rounded-lg hover:bg-[#5a6b6c] transition-colors"
            >
              Volver a la lista
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFF4F9]">
      <nav className="bg-white shadow-lg border-b border-[#798283]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-[#D42B22] rounded-xl flex items-center justify-center shadow-md">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-[#798283]">TMS Portal</h2>
                <p className="text-sm text-[#798283]/70">
                  {tenant?.nombre || "Sistema de Gestión de Transporte"}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="bg-[#798283] hover:bg-[#5a6b6c] text-white px-6 py-2 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#798283] mb-2">
              Editar Orden: {orderData?.codigo || orderData?.numeroOt}
            </h2>
            <p className="text-[#798283]/70 text-lg">
              Modifique la información de la orden de transporte.
            </p>
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
              <h3 className="text-lg font-semibold text-[#798283] mb-4">
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Cliente *
                  </label>
                  <select
                    name="clienteId"
                    value={formData.clienteId}
                    onChange={handleInputChange}
                    required
                    disabled={clients.length === 0 || dataLoading}
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">
                      {clients.length === 0
                        ? "No hay clientes disponibles"
                        : "Seleccionar cliente"}
                    </option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.nombre} - {client.rut}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Número OT/Referencia *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="numeroOt"
                      value={formData.numeroOt}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border ${
                        otNumberAvailable === false
                          ? "border-red-300"
                          : otNumberAvailable === true
                          ? "border-green-300"
                          : "border-[#798283]/30"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent`}
                      placeholder="Ej: OT-2024-001"
                    />
                    {checkingOtNumber && (
                      <div className="absolute right-3 top-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#798283]"></div>
                      </div>
                    )}
                    {otNumberAvailable === false && (
                      <p className="mt-1 text-sm text-red-600">
                        Este número de OT ya está en uso. Por favor use otro.
                      </p>
                    )}
                    {otNumberAvailable === true &&
                      formData.numeroOt === originalNumeroOt && (
                        <p className="mt-1 text-sm text-green-600">
                          ✓ Número de OT original
                        </p>
                      )}
                    {otNumberAvailable === true &&
                      formData.numeroOt !== originalNumeroOt && (
                        <p className="mt-1 text-sm text-green-600">
                          ✓ Número de OT disponible
                        </p>
                      )}
                  </div>
                </div>

                {/* Fecha de Orden with DatePicker */}
                <div>
                  <DatePicker
                    label="Fecha de Orden *"
                    date={fechaDate}
                    onSelect={handleFechaSelect}
                    placeholder="Seleccionar fecha"
                  />
                </div>

                {/* Fecha Estimada de Entrega with DatePicker */}
                <div className="space-y-2">
                  <DatePicker
                    label="Fecha Estimada de Entrega"
                    date={fechaEntregaEstimadaDate}
                    onSelect={handleFechaEntregaEstimadaSelect}
                    placeholder="Seleccionar fecha estimada"
                  />

                  {/* Validation message for fechaEntregaEstimada */}
                  {formData.fecha && formData.fechaEntregaEstimada && (
                    <div className="mt-1">
                      {new Date(formData.fechaEntregaEstimada) <
                      new Date(formData.fecha) ? (
                        <p className="text-sm text-red-600">
                          ⚠️ La fecha estimada no puede ser anterior a la fecha
                          de orden
                        </p>
                      ) : (
                        <p className="text-sm text-green-600">✓ Fecha válida</p>
                      )}
                    </div>
                  )}

                  {formData.fecha && !formData.fechaEntregaEstimada && (
                    <p className="text-sm text-[#798283]/70 mt-1">
                      Si no se especifica, se calculará según el tipo de
                      servicio
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Parties Information */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
              <h3 className="text-lg font-semibold text-[#798283] mb-4">
                Partes Involucradas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Remitente - Searchable Select */}
                <div>
                  <EntidadSelect
                    onEntidadSelect={handleRemitenteSelect}
                    selectedEntidad={selectedRemitente}
                    tipoEntidad="REMITENTE"
                    placeholder="Buscar remitente por nombre o RUT..."
                    label="Remitente *"
                    required={true}
                    disabled={dataLoading}
                  />
                </div>

                {/* Destinatario - Searchable Select */}
                <div>
                  <EntidadSelect
                    onEntidadSelect={handleDestinatarioSelect}
                    selectedEntidad={selectedDestinatario}
                    tipoEntidad="DESTINATARIO"
                    placeholder="Buscar destinatario por nombre o RUT..."
                    label="Destinatario *"
                    required={true}
                    disabled={dataLoading}
                  />
                </div>

                {/* Addresses */}
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Dirección de Origen *
                  </label>
                  <select
                    name="direccionOrigenId"
                    value={formData.direccionOrigenId}
                    onChange={handleInputChange}
                    required
                    disabled={addresses.length === 0 || dataLoading}
                    className={`w-full px-3 py-2 border ${
                      formData.direccionOrigenId &&
                      formData.direccionDestinoId &&
                      formData.direccionOrigenId === formData.direccionDestinoId
                        ? "border-red-300 bg-red-50"
                        : "border-[#798283]/30"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500`}
                  >
                    <option value="">
                      {addresses.length === 0
                        ? "No hay direcciones disponibles"
                        : "Seleccionar dirección origen"}
                    </option>
                    {addresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.direccionTexto}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Dirección Destino *
                  </label>
                  <select
                    name="direccionDestinoId"
                    value={formData.direccionDestinoId}
                    onChange={handleInputChange}
                    required
                    disabled={addresses.length === 0 || dataLoading}
                    className={`w-full px-3 py-2 border ${
                      formData.direccionOrigenId &&
                      formData.direccionDestinoId &&
                      formData.direccionOrigenId === formData.direccionDestinoId
                        ? "border-red-300 bg-red-50"
                        : "border-[#798283]/30"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500`}
                  >
                    <option value="">
                      {addresses.length === 0
                        ? "No hay direcciones disponibles"
                        : "Seleccionar dirección destino"}
                    </option>
                    {addresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.direccionTexto}
                      </option>
                    ))}
                  </select>
                  {formData.direccionOrigenId &&
                    formData.direccionDestinoId &&
                    formData.direccionOrigenId ===
                      formData.direccionDestinoId && (
                      <p className="mt-1 text-sm text-red-600">
                        ⚠️ La dirección de destino no puede ser igual a la de
                        origen
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
              <h3 className="text-lg font-semibold text-[#798283] mb-4">
                Detalles del Servicio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Tipo de Carga *
                  </label>
                  <select
                    name="tipoCargaId"
                    value={formData.tipoCargaId}
                    onChange={handleInputChange}
                    required
                    disabled={cargaTypes.length === 0 || dataLoading}
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">
                      {cargaTypes.length === 0
                        ? "No hay tipos de carga disponibles"
                        : "Seleccionar tipo de carga"}
                    </option>
                    {cargaTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Tipo de Servicio *
                  </label>
                  <select
                    name="tipoServicioId"
                    value={formData.tipoServicioId}
                    onChange={handleInputChange}
                    required
                    disabled={serviceTypes.length === 0 || dataLoading}
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">
                      {serviceTypes.length === 0
                        ? "No hay tipos de servicio disponibles"
                        : "Seleccionar tipo de servicio"}
                    </option>
                    {serviceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Tipo de Tarifa *
                  </label>
                  <select
                    name="tipoTarifa"
                    value={formData.tipoTarifa}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                  >
                    {rateTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Measurements */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
              <h3 className="text-lg font-semibold text-[#798283] mb-4">
                Medidas y Peso
              </h3>

              {validationWarnings.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-yellow-400 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.286 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span className="text-yellow-800 text-sm">
                      {validationWarnings[0]}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Peso Total (kg){" "}
                    {formData.tipoTarifa === "PESO_VOLUMEN" && " *"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="pesoTotalKg"
                    value={formData.pesoTotalKg}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                    placeholder="0.00"
                  />
                  {formData.tipoTarifa === "PESO_VOLUMEN" && (
                    <p className="mt-1 text-sm text-[#798283]/70">
                      Requerido para tarifa Peso/Volumen
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Volumen (m³)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="volumenTotalM3"
                    value={formData.volumenTotalM3}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Alto (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="altoCm"
                    value={formData.altoCm}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Largo (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="largoCm"
                    value={formData.largoCm}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Ancho (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="anchoCm"
                    value={formData.anchoCm}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
              <h3 className="text-lg font-semibold text-[#798283] mb-4">
                Información Adicional
              </h3>
              <div>
                <label className="block text-sm font-medium text-[#798283] mb-2">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                  placeholder="Instrucciones especiales, comentarios, etc."
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-[#798283]/30 text-sm font-semibold rounded-lg text-[#798283] bg-white hover:bg-[#EFF4F9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#798283] transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  loading || dataLoading || updateOrderMutation.isPending
                }
                className="px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#D42B22] hover:bg-[#B3251E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D42B22] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading || updateOrderMutation.isPending
                  ? "Guardando..."
                  : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
