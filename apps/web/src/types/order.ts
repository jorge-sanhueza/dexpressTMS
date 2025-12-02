export interface Order {
  id: string;
  codigo: string;
  numeroOt: string;
  fecha: Date;
  fechaEntregaEstimada?: Date;
  estado: string;
  tipoTarifa: string;
  pesoTotalKg?: number;
  volumenTotalM3?: number;
  altoCm?: number;
  largoCm?: number;
  anchoCm?: number;
  observaciones?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;

  // Foreign keys
  clienteId: string;
  remitenteId: string;
  destinatarioId: string;
  direccionOrigenId: string;
  direccionDestinoId: string;
  tipoCargaId: string;
  tipoServicioId: string;
  equipoId?: string;

  // Relations
  cliente?: {
    id: string;
    nombre?: string;
    razonSocial?: string;
    rut: string;
    contacto?: string;
  };
  remitente?: {
    id: string;
    nombre: string;
    rut: string;
    contacto?: string;
    telefono?: string;
  };
  destinatario?: {
    id: string;
    nombre: string;
    rut: string;
    contacto?: string;
    telefono?: string;
  };
  direccionOrigen?: {
    id: string;
    direccionTexto: string;
    calle?: string;
    numero?: string;
    comuna?: {
      id: string;
      nombre: string;
      provincia?: {
        id: string;
        nombre: string;
      };
      region?: {
        id: string;
        nombre: string;
      };
    };
  };
  direccionDestino?: {
    id: string;
    direccionTexto: string;
    calle?: string;
    numero?: string;
    comuna?: {
      id: string;
      nombre: string;
      provincia?: {
        id: string;
        nombre: string;
      };
      region?: {
        id: string;
        nombre: string;
      };
    };
  };
  tipoCarga?: {
    id: string;
    nombre: string;
  };
  tipoServicio?: {
    id: string;
    nombre: string;
    codigo: string;
  };
  equipo?: {
    id: string;
    patente: string;
    nombre: string;
    carrier?: {
      id: string;
      nombre: string;
    };
  };

  // New relations for planning
  slots?: Array<{
    id: string;
    codigo: string;
    fecha: Date;
    horaInicio: Date;
    horaFin: Date;
    tipoOperacion: string;
  }>;
  planificaciones?: Array<{
    id: string;
    codigo: string;
    estado: string;
    etapa: string;
    fecha: Date;
  }>;
  retiros?: Array<{
    id: string;
    estadoRetiro: string;
    fechaRetiroSolicitada: Date;
  }>;
}

export interface CreateOrderDto {
  // Basic information
  clienteId: string;
  codigo?: string;
  numeroOt: string;
  fecha: Date;
  fechaEntregaEstimada?: Date;

  // Status and type
  estado?: string;
  tipoTarifa?: string;

  // Parties
  remitenteId: string;
  destinatarioId: string;
  direccionOrigenId: string;
  direccionDestinoId: string;

  // Service details
  tipoCargaId: string;
  tipoServicioId: string;
  equipoId?: string;

  // Measurements
  pesoTotalKg?: number;
  volumenTotalM3?: number;
  altoCm?: number;
  largoCm?: number;
  anchoCm?: number;

  // Additional info
  observaciones?: string;
}

export interface UpdateOrderDto {
  clienteId?: string;
  codigo?: string;
  numeroOt?: string;
  fecha?: Date;
  fechaEntregaEstimada?: Date;
  estado?: string;
  tipoTarifa?: string;
  remitenteId?: string;
  destinatarioId?: string;
  direccionOrigenId?: string;
  direccionDestinoId?: string;
  tipoCargaId?: string;
  tipoServicioId?: string;
  equipoId?: string;
  pesoTotalKg?: number;
  volumenTotalM3?: number;
  altoCm?: number;
  largoCm?: number;
  anchoCm?: number;
  observaciones?: string;
}

export interface OrdersFilter {
  search?: string;
  estado?: string;
  clienteId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  tipoCargaId?: string;
  tipoServicioId?: string;
  remitenteId?: string;
  destinatarioId?: string;
  page?: number;
  limit?: number;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderStats {
  total: number;
  pendientes: number;
  planificadas: number;
  enTransporte: number;
  entregadas: number;
  canceladas: number;
}

export interface CreateOrderResponse {
  order: Order;
  message: string;
}

export interface UpdateOrderResponse {
  order: Order;
  message: string;
}

export interface OrderStatusUpdateDto {
  estado: string;
  observaciones?: string;
}
