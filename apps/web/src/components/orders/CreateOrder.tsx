import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import type { CreateOrderDto } from "../../types/order";
import { ordersService } from "@/services/orderServices";

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

export const CreateOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { tenant } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for dropdown data
  const [clients, setClients] = useState<any[]>([]);
  const [senders, setSenders] = useState<any[]>([]);
  const [receivers, setReceivers] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [cargaTypes, setCargaTypes] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);

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

  /*   
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch clients
        const clientsData = await clientsService.getClients();
        setClients(clientsData.clients);

        // Fetch senders and receivers (entidades)
        const sendersData = await entidadesService.getEntidades({
          tipoEntidad: "REMITENTE",
        });
        setSenders(sendersData.entidades);

        const receiversData = await entidadesService.getEntidades({
          tipoEntidad: "DESTINATARIO",
        });
        setReceivers(receiversData.entidades);

        // Fetch addresses
        const addressesData = await direccionesService.getDirecciones();
        setAddresses(addressesData.direcciones);

        // Fetch service types
        const cargaTypesData = await tipoCargaService.getTiposCarga();
        setCargaTypes(cargaTypesData.tiposCarga);

        const serviceTypesData = await tipoServicioService.getTiposServicio();
        setServiceTypes(serviceTypesData.tiposServicio);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        setError("Error loading form data");
      }
    };

    fetchDropdownData();
  }, []); */

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare the order data
      const orderData: CreateOrderDto = {
        // Basic information
        clienteId: formData.clienteId,
        numeroOt: formData.numeroOt,
        fecha: new Date(formData.fecha),
        fechaEntregaEstimada: formData.fechaEntregaEstimada
          ? new Date(formData.fechaEntregaEstimada)
          : undefined,

        // Status and type
        estado: "PENDIENTE",
        tipoTarifa: formData.tipoTarifa,

        // Parties
        remitenteId: formData.remitenteId,
        destinatarioId: formData.destinatarioId,
        direccionOrigenId: formData.direccionOrigenId,
        direccionDestinoId: formData.direccionDestinoId,

        // Service details
        tipoCargaId: formData.tipoCargaId,
        tipoServicioId: formData.tipoServicioId,

        // Measurements
        pesoTotalKg: formData.pesoTotalKg
          ? parseFloat(formData.pesoTotalKg)
          : undefined,
        volumenTotalM3: formData.volumenTotalM3
          ? parseFloat(formData.volumenTotalM3)
          : undefined,
        altoCm: formData.altoCm ? parseFloat(formData.altoCm) : undefined,
        largoCm: formData.largoCm ? parseFloat(formData.largoCm) : undefined,
        anchoCm: formData.anchoCm ? parseFloat(formData.anchoCm) : undefined,

        // Additional info
        observaciones: formData.observaciones || undefined,
      };

      await ordersService.createOrder(orderData);
      navigate("/orders"); // Redirect to orders list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating order");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/orders");
  };

  const rateTypes = [
    { id: "PESO_VOLUMEN", nombre: "Peso/Volumen" },
    { id: "EQUIPO", nombre: "Por Equipo" },
  ];

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
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
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
              Crear Nueva Orden
            </h2>
            <p className="text-[#798283]/70 text-lg">
              Complete la información requerida para crear una nueva orden de
              transporte.
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
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                  >
                    <option value="">Seleccionar cliente</option>
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
                  <input
                    type="text"
                    name="numeroOt"
                    value={formData.numeroOt}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                    placeholder="Ej: OT-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Fecha de Orden *
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Fecha Estimada de Entrega
                  </label>
                  <input
                    type="date"
                    name="fechaEntregaEstimada"
                    value={formData.fechaEntregaEstimada}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Parties Information */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#798283]/10">
              <h3 className="text-lg font-semibold text-[#798283] mb-4">
                Partes Involucradas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Remitente *
                  </label>
                  <select
                    name="remitenteId"
                    value={formData.remitenteId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                  >
                    <option value="">Seleccionar remitente</option>
                    {senders.map((sender) => (
                      <option key={sender.id} value={sender.id}>
                        {sender.nombre} - {sender.rut}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Destinatario *
                  </label>
                  <select
                    name="destinatarioId"
                    value={formData.destinatarioId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                  >
                    <option value="">Seleccionar destinatario</option>
                    {receivers.map((receiver) => (
                      <option key={receiver.id} value={receiver.id}>
                        {receiver.nombre} - {receiver.rut}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Dirección de Origen *
                  </label>
                  <select
                    name="direccionOrigenId"
                    value={formData.direccionOrigenId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                  >
                    <option value="">Seleccionar dirección origen</option>
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
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                  >
                    <option value="">Seleccionar dirección destino</option>
                    {addresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.direccionTexto}
                      </option>
                    ))}
                  </select>
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
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                  >
                    <option value="">Seleccionar tipo de carga</option>
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
                    className="w-full px-3 py-2 border border-[#798283]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#798283] focus:border-transparent"
                  >
                    <option value="">Seleccionar tipo de servicio</option>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#798283] mb-2">
                    Peso Total (kg)
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
                disabled={loading}
                className="px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#D42B22] hover:bg-[#B3251E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D42B22] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? "Creando..." : "Crear Orden"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
