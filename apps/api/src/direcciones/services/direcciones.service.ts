import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateDireccionDto } from '../dto/create-direccion.dto';
import { UpdateDireccionDto } from '../dto/update-direccion.dto';
import { DireccionesFilterDto } from '../dto/direcciones-filter.dto';
import { DireccionResponseDto } from '../dto/direccion-response.dto';
import { OrigenDireccion } from '@prisma/client';
import { AddressStatsDto } from '../dto/direcciones-stats.dto';

@Injectable()
export class DireccionesService {
  private readonly logger = new Logger(DireccionesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    filter: DireccionesFilterDto,
    tenantId: string,
  ): Promise<{ direcciones: DireccionResponseDto[]; total: number }> {
    try {
      const {
        search,
        activo,
        comunaId,
        esPrincipal,
        origen,
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
          { direccionTexto: { contains: search, mode: 'insensitive' } },
          { nombre: { contains: search, mode: 'insensitive' } },
          { contacto: { contains: search, mode: 'insensitive' } },
          { calle: { contains: search, mode: 'insensitive' } },
          { referencia: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Active filter
      if (activo !== undefined) {
        where.activo = typeof activo === 'string' ? activo === 'true' : activo;
      }

      // Comuna filter
      if (comunaId) {
        where.comunaId = comunaId;
      }

      // Principal address filter
      if (esPrincipal !== undefined) {
        where.esPrincipal =
          typeof esPrincipal === 'string'
            ? esPrincipal === 'true'
            : esPrincipal;
      }

      // Origin filter
      if (origen) {
        where.origen = origen;
      }

      const [direcciones, total] = await this.prisma.$transaction([
        this.prisma.direccion.findMany({
          where,
          include: {
            comuna: {
              include: {
                provincia: {
                  include: {
                    region: true,
                  },
                },
              },
            },
          },
          skip,
          take: limitNumber,
          orderBy: [
            { esPrincipal: 'desc' },
            { activo: 'desc' },
            { frecuencia: 'desc' },
            { ultimaVezUsada: 'desc' },
          ],
        }),
        this.prisma.direccion.count({ where }),
      ]);

      return {
        direcciones: direcciones.map(
          (direccion) => new DireccionResponseDto(direccion),
        ),
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching direcciones:', error);
      throw error;
    }
  }

  async findOne(id: string, tenantId: string): Promise<DireccionResponseDto> {
    try {
      const direccion = await this.prisma.direccion.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          comuna: {
            include: {
              provincia: {
                include: {
                  region: true,
                },
              },
            },
          },
        },
      });

      if (!direccion) {
        throw new NotFoundException('Direccion not found');
      }

      return new DireccionResponseDto(direccion);
    } catch (error) {
      this.logger.error(`Error fetching direccion ${id}:`, error);
      throw error;
    }
  }

  async create(
    createDireccionDto: CreateDireccionDto,
    tenantId: string,
  ): Promise<DireccionResponseDto> {
    try {
      // Verify comuna exists
      const comuna = await this.prisma.comuna.findUnique({
        where: { id: createDireccionDto.comunaId },
      });

      if (!comuna) {
        throw new BadRequestException('Invalid comunaId');
      }

      // If this is set as principal, unset other principales for this tenant
      if (createDireccionDto.esPrincipal) {
        await this.prisma.direccion.updateMany({
          where: {
            tenantId,
            esPrincipal: true,
          },
          data: {
            esPrincipal: false,
          },
        });
      }

      const direccion = await this.prisma.direccion.create({
        data: {
          calle: createDireccionDto.calle,
          comunaId: createDireccionDto.comunaId,
          contacto: createDireccionDto.contacto,
          direccionTexto: createDireccionDto.direccionTexto,
          frecuencia: createDireccionDto.frecuencia || 1,
          latitud: createDireccionDto.latitud,
          longitud: createDireccionDto.longitud,
          nombre: createDireccionDto.nombre,
          numero: createDireccionDto.numero,
          origen: createDireccionDto.origen || OrigenDireccion.MANUAL,
          esPrincipal: createDireccionDto.esPrincipal || false,
          email: createDireccionDto.email,
          referencia: createDireccionDto.referencia,
          telefono: createDireccionDto.telefono,
          activo: true,
          tenantId,
        },
        include: {
          comuna: {
            include: {
              provincia: {
                include: {
                  region: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(
        `Direccion created successfully: ${direccion.direccionTexto}`,
      );
      return new DireccionResponseDto(direccion);
    } catch (error) {
      this.logger.error('Error creating direccion:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateDireccionDto: UpdateDireccionDto,
    tenantId: string,
  ): Promise<DireccionResponseDto> {
    try {
      // Verify direccion exists and belongs to tenant
      const existingDireccion = await this.prisma.direccion.findFirst({
        where: { id, tenantId },
      });

      if (!existingDireccion) {
        throw new NotFoundException('Direccion not found');
      }

      // Verify comuna exists if comunaId is being updated
      if (updateDireccionDto.comunaId) {
        const comuna = await this.prisma.comuna.findUnique({
          where: { id: updateDireccionDto.comunaId },
        });

        if (!comuna) {
          throw new BadRequestException('Invalid comunaId');
        }
      }

      // If this is being set as principal, unset other principales for this tenant
      if (updateDireccionDto.esPrincipal) {
        await this.prisma.direccion.updateMany({
          where: {
            tenantId,
            esPrincipal: true,
            id: { not: id },
          },
          data: {
            esPrincipal: false,
          },
        });
      }

      const direccion = await this.prisma.direccion.update({
        where: { id },
        data: updateDireccionDto,
        include: {
          comuna: {
            include: {
              provincia: {
                include: {
                  region: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(
        `Direccion updated successfully: ${direccion.direccionTexto}`,
      );
      return new DireccionResponseDto(direccion);
    } catch (error) {
      this.logger.error(`Error updating direccion ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, tenantId: string): Promise<void> {
    try {
      // Verify direccion exists and belongs to tenant
      const existingDireccion = await this.prisma.direccion.findFirst({
        where: { id, tenantId },
      });

      if (!existingDireccion) {
        throw new NotFoundException('Direccion not found');
      }

      // Check if direccion is being used in orders
      const ordersUsingDireccion = await this.prisma.orden.findFirst({
        where: {
          OR: [{ direccionOrigenId: id }, { direccionDestinoId: id }],
          tenantId,
        },
      });

      if (ordersUsingDireccion) {
        throw new BadRequestException(
          'Cannot deactivate direccion that is being used in orders',
        );
      }

      // Soft delete by setting activo to false
      await this.prisma.direccion.update({
        where: { id },
        data: { activo: false },
      });

      this.logger.log(`Direccion ${id} deactivated`);
    } catch (error) {
      this.logger.error(`Error deactivating direccion ${id}:`, error);
      throw error;
    }
  }

  async findByComuna(
    comunaId: string,
    tenantId: string,
  ): Promise<DireccionResponseDto[]> {
    try {
      const direcciones = await this.prisma.direccion.findMany({
        where: {
          comunaId,
          tenantId,
          activo: true,
        },
        include: {
          comuna: {
            include: {
              provincia: {
                include: {
                  region: true,
                },
              },
            },
          },
        },
        orderBy: [{ esPrincipal: 'desc' }, { frecuencia: 'desc' }],
      });

      return direcciones.map(
        (direccion) => new DireccionResponseDto(direccion),
      );
    } catch (error) {
      this.logger.error(
        `Error fetching direcciones for comuna ${comunaId}:`,
        error,
      );
      throw error;
    }
  }

  async findActivePrincipales(
    tenantId: string,
  ): Promise<DireccionResponseDto[]> {
    try {
      const direcciones = await this.prisma.direccion.findMany({
        where: {
          tenantId,
          activo: true,
          esPrincipal: true,
        },
        include: {
          comuna: {
            include: {
              provincia: {
                include: {
                  region: true,
                },
              },
            },
          },
        },
        orderBy: { frecuencia: 'desc' },
      });

      return direcciones.map(
        (direccion) => new DireccionResponseDto(direccion),
      );
    } catch (error) {
      this.logger.error(
        'Error fetching active principales direcciones:',
        error,
      );
      throw error;
    }
  }

  async incrementFrequency(id: string, tenantId: string): Promise<void> {
    try {
      await this.prisma.direccion.update({
        where: { id },
        data: {
          frecuencia: { increment: 1 },
          ultimaVezUsada: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Error incrementing frequency for direccion ${id}:`,
        error,
      );
      throw error;
    }
  }
  async getStats(tenantId: string): Promise<AddressStatsDto> {
    try {
      const total = await this.prisma.direccion.count({
        where: { tenantId },
      });

      return { total };
    } catch (error) {
      this.logger.error('Error fetching address stats:', error);
      throw error;
    }
  }
}
