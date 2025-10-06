export interface Order {
  id: string;
  codigo: string;
  numero: string;
  numeroOt?: string;
  fecha: Date;
  fechaCreacion: Date;
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

  // Foreign keys (optional in the response)
  clienteId?: string;
  remitenteId?: string;
  destinatarioId?: string;
  direccionOrigenId?: string;
  direccionDestinoId?: string;
  tipoCargaId?: string;
  tipoServicioId?: string;
  equipoId?: string;

  // Relations (optional)
  cliente?: any;
  remitente?: any;
  destinatario?: any;
  direccionOrigen?: any;
  direccionDestino?: any;
  tipoCarga?: any;
  tipoServicio?: any;
}

// Keep the other interfaces the same...
export interface CreateOrderDto {
  // Basic information
  clienteId: string;
  codigo: string;
  numero: string;
  numeroOt?: string;
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
  numero?: string;
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

export interface OrdersFilterDto {
  search?: string;
  estado?: string;
  clienteId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  page?: number;
  limit?: number;
}

export interface OrderWithDetails extends Order {
  cliente: {
    id: string;
    nombre: string;
    rut: string;
  };
  remitente: {
    id: string;
    nombre: string;
    rut: string;
  };
  destinatario: {
    id: string;
    nombre: string;
    rut: string;
  };
  direccionOrigen: {
    id: string;
    direccion: string;
    comuna?: {
      nombre: string;
      region?: {
        nombre: string;
      };
    };
  };
  direccionDestino: {
    id: string;
    direccion: string;
    comuna?: {
      nombre: string;
      region?: {
        nombre: string;
      };
    };
  };
  tipoCarga: {
    id: string;
    nombre: string;
  };
  tipoServicio: {
    id: string;
    nombre: string;
  };
}

export interface OrderWithFullDetails extends OrderWithDetails {
  tenant: {
    id: string;
    nombre: string;
  };
}