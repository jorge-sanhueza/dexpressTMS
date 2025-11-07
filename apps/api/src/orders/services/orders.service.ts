import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrdersFilterDto } from '../dto/orders-filter.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrdenEstado, TipoTarifa } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    filter: OrdersFilterDto,
    tenantId: string,
  ): Promise<{ orders: OrderResponseDto[]; total: number }> {
    try {
      const {
        search,
        estado,
        clienteId,
        fechaDesde,
        fechaHasta,
        page = 1,
        limit = 10,
      } = filter;

      const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
      const limitNumber =
        typeof limit === 'string' ? parseInt(limit, 10) : limit;
      const skip = (pageNumber - 1) * limitNumber;

      const where: any = {
        tenantId,
      };

      // Search filter
      if (search) {
        where.OR = [
          { codigo: { contains: search, mode: 'insensitive' } },
          { numeroOt: { contains: search, mode: 'insensitive' } },
          { observaciones: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Status filter
      if (estado) {
        where.estado = estado;
      }

      // Client filter
      if (clienteId) {
        where.clienteId = clienteId;
      }

      // Date range filter
      if (fechaDesde || fechaHasta) {
        where.fecha = {};
        if (fechaDesde) {
          where.fecha.gte = fechaDesde;
        }
        if (fechaHasta) {
          where.fecha.lte = fechaHasta;
        }
      }

      const [orders, total] = await this.prisma.$transaction([
        this.prisma.orden.findMany({
          where,
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true,
                rut: true,
              },
            },
            remitente: {
              select: {
                id: true,
                nombre: true,
                rut: true,
              },
            },
            destinatario: {
              select: {
                id: true,
                nombre: true,
                rut: true,
              },
            },
            direccionOrigen: {
              include: {
                comuna: {
                  include: {
                    region: true,
                  },
                },
              },
            },
            direccionDestino: {
              include: {
                comuna: {
                  include: {
                    region: true,
                  },
                },
              },
            },
            tipoCarga: true,
            tipoServicio: true,
            equipo: {
              select: {
                id: true,
                patente: true,
                nombre: true,
              },
            },
          },
          skip,
          take: limitNumber,
          orderBy: { fecha: 'desc' },
        }),
        this.prisma.orden.count({ where }),
      ]);

      return {
        orders: orders.map((order) => new OrderResponseDto(order)),
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching orders:', error);
      throw error;
    }
  }

  async findOne(id: string, tenantId: string): Promise<OrderResponseDto> {
    try {
      const order = await this.prisma.orden.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              rut: true,
            },
          },
          remitente: {
            select: {
              id: true,
              nombre: true,
              rut: true,
            },
          },
          destinatario: {
            select: {
              id: true,
              nombre: true,
              rut: true,
            },
          },
          direccionOrigen: {
            include: {
              comuna: {
                include: {
                  region: true,
                },
              },
            },
          },
          direccionDestino: {
            include: {
              comuna: {
                include: {
                  region: true,
                },
              },
            },
          },
          tipoCarga: true,
          tipoServicio: true,
          equipo: {
            select: {
              id: true,
              patente: true,
              nombre: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      return new OrderResponseDto(order);
    } catch (error) {
      this.logger.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  }

  async create(
  createOrderDto: CreateOrderDto,
  tenantId: string,
): Promise<OrderResponseDto> {
  try {
    // Verify that all related entities exist and belong to the tenant
    await this.verifyRelatedEntities(createOrderDto, tenantId);

    // Generate order code if not provided
    const codigo = createOrderDto.codigo || await this.generateOrderCode();

    // Check if order number (numeroOt) already exists for this tenant
    const existingOrder = await this.prisma.orden.findFirst({
      where: {
        numeroOt: createOrderDto.numeroOt,
        tenantId,
      },
    });

    if (existingOrder) {
      throw new ConflictException('Order with this OT number already exists');
    }

    const order = await this.prisma.orden.create({
      data: {
        codigo,
        numeroOt: createOrderDto.numeroOt, // Fixed: removed 'numero' field
        fecha: createOrderDto.fecha,
        fechaEntregaEstimada: createOrderDto.fechaEntregaEstimada,
        estado: createOrderDto.estado,
        tipoTarifa: createOrderDto.tipoTarifa,
        clienteId: createOrderDto.clienteId,
        remitenteId: createOrderDto.remitenteId,
        destinatarioId: createOrderDto.destinatarioId,
        direccionOrigenId: createOrderDto.direccionOrigenId,
        direccionDestinoId: createOrderDto.direccionDestinoId,
        tipoCargaId: createOrderDto.tipoCargaId,
        tipoServicioId: createOrderDto.tipoServicioId,
        equipoId: createOrderDto.equipoId,
        pesoTotalKg: createOrderDto.pesoTotalKg,
        volumenTotalM3: createOrderDto.volumenTotalM3,
        altoCm: createOrderDto.altoCm,
        largoCm: createOrderDto.largoCm,
        anchoCm: createOrderDto.anchoCm,
        observaciones: createOrderDto.observaciones,
        tenantId,
      },
      include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              rut: true,
            },
          },
          remitente: {
            select: {
              id: true,
              nombre: true,
              rut: true,
            },
          },
          destinatario: {
            select: {
              id: true,
              nombre: true,
              rut: true,
            },
          },
          direccionOrigen: {
            include: {
              comuna: {
                include: {
                  region: true,
                },
              },
            },
          },
          direccionDestino: {
            include: {
              comuna: {
                include: {
                  region: true,
                },
              },
            },
          },
          tipoCarga: true,
          tipoServicio: true,
          equipo: {
            select: {
              id: true,
              patente: true,
              nombre: true,
            },
          },
        },
      });

      this.logger.log(`Order created successfully: ${order.codigo}`);
      return new OrderResponseDto(order);
    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    tenantId: string,
  ): Promise<OrderResponseDto> {
    try {
      // Verify order exists and belongs to tenant
      const existingOrder = await this.prisma.orden.findFirst({
        where: { id, tenantId },
      });

      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }

      // Verify that all related entities exist and belong to the tenant
      await this.verifyRelatedEntities(
        updateOrderDto as CreateOrderDto,
        tenantId,
      );

      // Check if OT number is being updated and if it conflicts
      if (
        updateOrderDto.numeroOt &&
        updateOrderDto.numeroOt !== existingOrder.numeroOt
      ) {
        const duplicateOrder = await this.prisma.orden.findFirst({
          where: {
            numeroOt: updateOrderDto.numeroOt,
            tenantId,
            id: { not: id },
          },
        });

        if (duplicateOrder) {
          throw new ConflictException(
            'Another order with this OT number already exists',
          );
        }
      }

      const order = await this.prisma.orden.update({
        where: { id },
        data: updateOrderDto,
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              rut: true,
            },
          },
          remitente: {
            select: {
              id: true,
              nombre: true,
              rut: true,
            },
          },
          destinatario: {
            select: {
              id: true,
              nombre: true,
              rut: true,
            },
          },
          direccionOrigen: {
            include: {
              comuna: {
                include: {
                  region: true,
                },
              },
            },
          },
          direccionDestino: {
            include: {
              comuna: {
                include: {
                  region: true,
                },
              },
            },
          },
          tipoCarga: true,
          tipoServicio: true,
          equipo: {
            select: {
              id: true,
              patente: true,
              nombre: true,
            },
          },
        },
      });

      this.logger.log(`Order updated successfully: ${order.codigo}`);
      return new OrderResponseDto(order);
    } catch (error) {
      this.logger.error(`Error updating order ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, tenantId: string): Promise<void> {
    try {
      // Verify order exists and belongs to tenant
      const existingOrder = await this.prisma.orden.findFirst({
        where: { id, tenantId },
      });

      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }

      // Soft delete by setting estado to 'CANCELADA'
      await this.prisma.orden.update({
        where: { id },
        data: { estado: OrdenEstado.CANCELADA },
      });

      this.logger.log(`Order ${id} cancelled`);
    } catch (error) {
      this.logger.error(`Error cancelling order ${id}:`, error);
      throw error;
    }
  }

  private async verifyRelatedEntities(
    orderDto: CreateOrderDto,
    tenantId: string,
  ): Promise<void> {
    // Verify client exists
    if (orderDto.clienteId) {
      const client = await this.prisma.cliente.findFirst({
        where: { id: orderDto.clienteId, tenantId },
      });
      if (!client) {
        throw new BadRequestException('Client not found');
      }
    }

    // Verify sender exists
    if (orderDto.remitenteId) {
      const sender = await this.prisma.entidad.findFirst({
        where: { id: orderDto.remitenteId, tenantId },
      });
      if (!sender) {
        throw new BadRequestException('Sender not found');
      }
    }

    // Verify receiver exists
    if (orderDto.destinatarioId) {
      const receiver = await this.prisma.entidad.findFirst({
        where: { id: orderDto.destinatarioId, tenantId },
      });
      if (!receiver) {
        throw new BadRequestException('Receiver not found');
      }
    }

    // Verify addresses exist
    if (orderDto.direccionOrigenId) {
      const originAddress = await this.prisma.direccion.findFirst({
        where: { id: orderDto.direccionOrigenId, tenantId },
      });
      if (!originAddress) {
        throw new BadRequestException('Origin address not found');
      }
    }

    if (orderDto.direccionDestinoId) {
      const destinationAddress = await this.prisma.direccion.findFirst({
        where: { id: orderDto.direccionDestinoId, tenantId },
      });
      if (!destinationAddress) {
        throw new BadRequestException('Destination address not found');
      }
    }

    // Verify service types exist
    if (orderDto.tipoCargaId) {
      const cargaType = await this.prisma.tipoCarga.findFirst({
        where: { id: orderDto.tipoCargaId, tenantId },
      });
      if (!cargaType) {
        throw new BadRequestException('Carga type not found');
      }
    }

    if (orderDto.tipoServicioId) {
      const serviceType = await this.prisma.tipoServicio.findFirst({
        where: { id: orderDto.tipoServicioId, tenantId },
      });
      if (!serviceType) {
        throw new BadRequestException('Service type not found');
      }
    }

    // Verify equipment exists if provided
    if (orderDto.equipoId) {
      const equipment = await this.prisma.equipo.findFirst({
        where: { id: orderDto.equipoId, tenantId },
      });
      if (!equipment) {
        throw new BadRequestException('Equipment not found');
      }
    }
  }

  private async generateOrderCode(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const baseCode = `ORD-${year}${month}${day}`;

    // Find the last order with similar code today
    const lastOrder = await this.prisma.orden.findFirst({
      where: {
        codigo: {
          startsWith: baseCode,
        },
      },
      orderBy: {
        codigo: 'desc',
      },
    });

    if (!lastOrder) {
      return `${baseCode}-001`;
    }

    const lastNumber = parseInt(lastOrder.codigo.split('-').pop() || '0');
    const nextNumber = String(lastNumber + 1).padStart(3, '0');

    return `${baseCode}-${nextNumber}`;
  }
}
