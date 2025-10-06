import { Order } from '../interfaces/order.interface';

export class OrderResponseDto implements Order {
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

  // Foreign keys
  clienteId?: string;
  remitenteId?: string;
  destinatarioId?: string;
  direccionOrigenId?: string;
  direccionDestinoId?: string;
  tipoCargaId?: string;
  tipoServicioId?: string;
  equipoId?: string;

  // Client information
  cliente?: {
    id: string;
    nombre: string;
    rut: string;
  };

  // Sender information
  remitente?: {
    id: string;
    nombre: string;
    rut: string;
  };

  // Receiver information
  destinatario?: {
    id: string;
    nombre: string;
    rut: string;
  };

  // Origin address
  direccionOrigen?: {
    id: string;
    direccion: string;
    comuna?: string;
    region?: string;
  };

  // Destination address
  direccionDestino?: {
    id: string;
    direccion: string;
    comuna?: string;
    region?: string;
  };

  // Service details
  tipoCarga?: {
    id: string;
    nombre: string;
  };

  tipoServicio?: {
    id: string;
    nombre: string;
  };

  constructor(order: any) {
    // Basic order properties
    this.id = order.id;
    this.codigo = order.codigo;
    this.numero = order.numero;
    this.numeroOt = order.numeroOt;
    this.fecha = order.fecha;
    this.fechaCreacion = order.fechaCreacion;
    this.fechaEntregaEstimada = order.fechaEntregaEstimada;
    this.estado = order.estado;
    this.tipoTarifa = order.tipoTarifa;
    this.pesoTotalKg = order.pesoTotalKg;
    this.volumenTotalM3 = order.volumenTotalM3;
    this.altoCm = order.altoCm;
    this.largoCm = order.largoCm;
    this.anchoCm = order.anchoCm;
    this.observaciones = order.observaciones;
    this.tenantId = order.tenantId;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;

    // Foreign keys
    this.clienteId = order.clienteId;
    this.remitenteId = order.remitenteId;
    this.destinatarioId = order.destinatarioId;
    this.direccionOrigenId = order.direccionOrigenId;
    this.direccionDestinoId = order.direccionDestinoId;
    this.tipoCargaId = order.tipoCargaId;
    this.tipoServicioId = order.tipoServicioId;
    this.equipoId = order.equipoId;

    // Client
    if (order.cliente) {
      this.cliente = {
        id: order.cliente.id,
        nombre: order.cliente.nombre,
        rut: order.cliente.rut,
      };
    }

    // Sender
    if (order.remitente) {
      this.remitente = {
        id: order.remitente.id,
        nombre: order.remitente.nombre,
        rut: order.remitente.rut,
      };
    }

    // Receiver
    if (order.destinatario) {
      this.destinatario = {
        id: order.destinatario.id,
        nombre: order.destinatario.nombre,
        rut: order.destinatario.rut,
      };
    }

    // Origin address
    if (order.direccionOrigen) {
      this.direccionOrigen = {
        id: order.direccionOrigen.id,
        direccion: order.direccionOrigen.direccion,
        comuna: order.direccionOrigen.comuna?.nombre,
        region: order.direccionOrigen.comuna?.region?.nombre,
      };
    }

    // Destination address
    if (order.direccionDestino) {
      this.direccionDestino = {
        id: order.direccionDestino.id,
        direccion: order.direccionDestino.direccion,
        comuna: order.direccionDestino.comuna?.nombre,
        region: order.direccionDestino.comuna?.region?.nombre,
      };
    }

    // Service types
    if (order.tipoCarga) {
      this.tipoCarga = {
        id: order.tipoCarga.id,
        nombre: order.tipoCarga.nombre,
      };
    }

    if (order.tipoServicio) {
      this.tipoServicio = {
        id: order.tipoServicio.id,
        nombre: order.tipoServicio.nombre,
      };
    }
  }
}
