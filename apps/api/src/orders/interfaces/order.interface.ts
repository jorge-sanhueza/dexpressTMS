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
  cliente?: any;
  remitente?: any;
  destinatario?: any;
  direccionOrigen?: any;
  direccionDestino?: any;
  tipoCarga?: any;
  tipoServicio?: any;
  equipo?: any;
}

export interface CreateOrderDto {
  // Basic information
  clienteId: string;
  codigo?: string; // Auto-generated if not provided
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
