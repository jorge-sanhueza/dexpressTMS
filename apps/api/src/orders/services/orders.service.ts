import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { OrderResponseDto } from '../dto/order-response.dto';
import {
  CreateOrderDto,
  UpdateOrderDto,
  Order,
  OrdersFilterDto,
  OrderWithDetails,
} from '../interfaces/order.interface';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    filter: OrdersFilterDto,
    tenantId: string,
  ): Promise<{ orders: Order[]; total: number }> {
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
          { numero: { contains: search, mode: 'insensitive' } },
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
          where.fecha.gte = new Date(fechaDesde);
        }
        if (fechaHasta) {
          where.fecha.lte = new Date(fechaHasta);
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
          },
          skip,
          take: limitNumber,
          orderBy: { fecha: 'desc' },
        }),
        this.prisma.orden.count({ where }),
      ]);

      // Convert to OrderResponseDto which implements Order interface
      const orderDtos: Order[] = orders.map(
        (order) => new OrderResponseDto(order),
      );

      return {
        orders: orderDtos,
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching orders:', error);
      throw error;
    }
  }

  async findOne(id: string, tenantId: string): Promise<Order> {
    try {
      const order = (await this.prisma.orden.findFirst({
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
        },
      })) as unknown as OrderWithDetails;

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
  ): Promise<Order> {
    try {
      // First, verify the tenant exists or get a fallback tenant
      let validTenantId = tenantId;

      const tenant = await this.prisma.tenant.findFirst({
        where: { id: tenantId },
      });

      if (!tenant) {
        this.logger.warn(
          `Tenant ${tenantId} not found, looking for fallback tenant`,
        );

        // Try to find the admin tenant as fallback
        const adminTenant = await this.prisma.tenant.findFirst({
          where: { nombre: 'Tenant Administrativo' },
        });

        if (!adminTenant) {
          // If no admin tenant, try to get any active tenant
          const anyTenant = await this.prisma.tenant.findFirst({
            where: { activo: true },
          });

          if (!anyTenant) {
            throw new BadRequestException(
              'No valid tenant found for order creation',
            );
          }

          validTenantId = anyTenant.id;
          this.logger.log(
            `Using fallback tenant: ${anyTenant.nombre} (${anyTenant.id})`,
          );
        } else {
          validTenantId = adminTenant.id;
          this.logger.log(
            `Using admin tenant: ${adminTenant.nombre} (${adminTenant.id})`,
          );
        }
      }

      // Verify that all related entities exist and belong to the tenant
      await this.verifyRelatedEntities(createOrderDto, validTenantId);

      // Generate order code if not provided
      const codigo = createOrderDto.codigo || (await this.generateOrderCode());

      const order = (await this.prisma.orden.create({
        data: {
          codigo,
          numero: createOrderDto.numero,
          numeroOt: createOrderDto.numeroOt,
          fecha: new Date(createOrderDto.fecha),
          fechaEntregaEstimada: createOrderDto.fechaEntregaEstimada
            ? new Date(createOrderDto.fechaEntregaEstimada)
            : null,
          estado: createOrderDto.estado || 'pendiente',
          tipoTarifa: createOrderDto.tipoTarifa || 'peso_volumen',
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
          tenantId: validTenantId,
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
        },
      })) as unknown as OrderWithDetails;

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
  ): Promise<Order> {
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

      const updateData: any = { ...updateOrderDto };

      // Convert dates if provided
      if (updateOrderDto.fecha) {
        updateData.fecha = new Date(updateOrderDto.fecha);
      }
      if (updateOrderDto.fechaEntregaEstimada) {
        updateData.fechaEntregaEstimada = new Date(
          updateOrderDto.fechaEntregaEstimada,
        );
      }

      const order = (await this.prisma.orden.update({
        where: { id },
        data: updateData,
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
        },
      })) as unknown as OrderWithDetails;

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

      // Soft delete by setting estado to 'cancelada'
      await this.prisma.orden.update({
        where: { id },
        data: { estado: 'cancelada' },
      });

      this.logger.log(`Order ${id} cancelled`);
    } catch (error) {
      this.logger.error(`Error cancelling order ${id}:`, error);
      throw error;
    }
  }

  private async verifyRelatedEntities(
    createOrderDto: CreateOrderDto,
    tenantId: string,
  ): Promise<void> {
    // Verify client exists
    if (createOrderDto.clienteId) {
      const client = await this.prisma.cliente.findFirst({
        where: { id: createOrderDto.clienteId, tenantId },
      });
      if (!client) {
        throw new BadRequestException('Client not found');
      }
    }

    // Verify sender exists
    if (createOrderDto.remitenteId) {
      const sender = await this.prisma.entidad.findFirst({
        where: { id: createOrderDto.remitenteId, tenantId },
      });
      if (!sender) {
        throw new BadRequestException('Sender not found');
      }
    }

    // Verify receiver exists
    if (createOrderDto.destinatarioId) {
      const receiver = await this.prisma.entidad.findFirst({
        where: { id: createOrderDto.destinatarioId, tenantId },
      });
      if (!receiver) {
        throw new BadRequestException('Receiver not found');
      }
    }

    // Verify addresses exist
    if (createOrderDto.direccionOrigenId) {
      const originAddress = await this.prisma.direccion.findFirst({
        where: { id: createOrderDto.direccionOrigenId, tenantId },
      });
      if (!originAddress) {
        throw new BadRequestException('Origin address not found');
      }
    }

    if (createOrderDto.direccionDestinoId) {
      const destinationAddress = await this.prisma.direccion.findFirst({
        where: { id: createOrderDto.direccionDestinoId, tenantId },
      });
      if (!destinationAddress) {
        throw new BadRequestException('Destination address not found');
      }
    }

    // Verify service types exist
    if (createOrderDto.tipoCargaId) {
      const cargaType = await this.prisma.tipoCarga.findFirst({
        where: { id: createOrderDto.tipoCargaId },
      });
      if (!cargaType) {
        throw new BadRequestException('Carga type not found');
      }
    }

    if (createOrderDto.tipoServicioId) {
      const serviceType = await this.prisma.tipoServicio.findFirst({
        where: { id: createOrderDto.tipoServicioId },
      });
      if (!serviceType) {
        throw new BadRequestException('Service type not found');
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
