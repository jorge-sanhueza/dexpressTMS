import { OrdenEstado, TipoTarifa } from '@prisma/client';

export class OrderResponseDto {
  id: string;
  codigo: string;
  numeroOt: string; // Changed from 'numero' to 'numeroOt'
  fecha: Date;
  fechaEntregaEstimada?: Date;
  estado: OrdenEstado;
  tipoTarifa: TipoTarifa;
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

  // Relations (same as before)
  cliente?: {
    id: string;
    nombre?: string;
    rut: string;
  };

  remitente?: {
    id: string;
    nombre: string;
    rut: string;
  };

  destinatario?: {
    id: string;
    nombre: string;
    rut: string;
  };

  direccionOrigen?: {
    id: string;
    direccionTexto: string;
    comuna?: {
      id: string;
      nombre: string;
      region?: {
        id: string;
        nombre: string;
      };
    };
  };

  direccionDestino?: {
    id: string;
    direccionTexto: string;
    comuna?: {
      id: string;
      nombre: string;
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
  };

  equipo?: {
    id: string;
    patente: string;
    nombre: string;
  };

  constructor(order: any) {
    // Basic order properties
    this.id = order.id;
    this.codigo = order.codigo;
    this.numeroOt = order.numeroOt; // Changed from 'numero' to 'numeroOt'
    this.fecha = order.fecha;
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

    // Relations (same as before)
    if (order.cliente) {
      this.cliente = {
        id: order.cliente.id,
        nombre: order.cliente.nombre,
        rut: order.cliente.rut,
      };
    }

    if (order.remitente) {
      this.remitente = {
        id: order.remitente.id,
        nombre: order.remitente.nombre,
        rut: order.remitente.rut,
      };
    }

    if (order.destinatario) {
      this.destinatario = {
        id: order.destinatario.id,
        nombre: order.destinatario.nombre,
        rut: order.destinatario.rut,
      };
    }

    if (order.direccionOrigen) {
      this.direccionOrigen = {
        id: order.direccionOrigen.id,
        direccionTexto: order.direccionOrigen.direccionTexto,
        ...(order.direccionOrigen.comuna && {
          comuna: {
            id: order.direccionOrigen.comuna.id,
            nombre: order.direccionOrigen.comuna.nombre,
            ...(order.direccionOrigen.comuna.region && {
              region: {
                id: order.direccionOrigen.comuna.region.id,
                nombre: order.direccionOrigen.comuna.region.nombre,
              },
            }),
          },
        }),
      };
    }

    if (order.direccionDestino) {
      this.direccionDestino = {
        id: order.direccionDestino.id,
        direccionTexto: order.direccionDestino.direccionTexto,
        ...(order.direccionDestino.comuna && {
          comuna: {
            id: order.direccionDestino.comuna.id,
            nombre: order.direccionDestino.comuna.nombre,
            ...(order.direccionDestino.comuna.region && {
              region: {
                id: order.direccionDestino.comuna.region.id,
                nombre: order.direccionDestino.comuna.region.nombre,
              },
            }),
          },
        }),
      };
    }

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

    if (order.equipo) {
      this.equipo = {
        id: order.equipo.id,
        patente: order.equipo.patente,
        nombre: order.equipo.nombre,
      };
    }
  }
}
