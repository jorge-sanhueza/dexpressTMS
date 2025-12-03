import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCarrierDto } from '../dto/create-carrier.dto';
import { UpdateCarrierDto } from '../dto/update-carrier.dto';
import { CarriersFilterDto } from '../dto/carriers-filter.dto';
import { CarrierResponseDto } from '../dto/carrier-response.dto';
import { TipoEntidad } from '@prisma/client';
import { CarrierStatsDto } from '../dto/carrier-stats.dto';

@Injectable()
export class CarriersService {
  private readonly logger = new Logger(CarriersService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    filter: CarriersFilterDto,
    tenantId: string,
  ): Promise<{ carriers: CarrierResponseDto[]; total: number }> {
    try {
      const { search, activo, esPersona, page = 1, limit = 10 } = filter;

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
          { nombre: { contains: search, mode: 'insensitive' } },
          { razonSocial: { contains: search, mode: 'insensitive' } },
          { rut: { contains: search, mode: 'insensitive' } },
          { contacto: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Active filter
      if (activo !== undefined) {
        where.activo = typeof activo === 'string' ? activo === 'true' : activo;
      }

      // Person type filter
      if (esPersona !== undefined) {
        where.esPersona =
          typeof esPersona === 'string' ? esPersona === 'true' : esPersona;
      }

      const [carriers, total] = await this.prisma.$transaction([
        this.prisma.carrier.findMany({
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
            equipos: {
              where: { activo: true },
              include: {
                tipoEquipo: {
                  select: { id: true, nombre: true },
                },
                modeloTransporte: {
                  select: { id: true, nombre: true, tipoModelo: true },
                },
              },
              orderBy: { nombre: 'asc' },
            },
            entidad: true,
          },
          skip,
          take: limitNumber,
          orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
        }),
        this.prisma.carrier.count({ where }),
      ]);

      return {
        carriers: carriers.map((carrier) => new CarrierResponseDto(carrier)),
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching carriers:', error);
      throw error;
    }
  }

  async findOne(id: string, tenantId: string): Promise<CarrierResponseDto> {
    try {
      const carrier = await this.prisma.carrier.findFirst({
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
          equipos: {
            where: { activo: true },
            include: {
              tipoEquipo: {
                select: { id: true, nombre: true },
              },
              modeloTransporte: {
                select: { id: true, nombre: true, tipoModelo: true },
              },
            },
            orderBy: { nombre: 'asc' },
          },
          entidad: true,
        },
      });

      if (!carrier) {
        throw new NotFoundException('Carrier not found');
      }

      return new CarrierResponseDto(carrier);
    } catch (error) {
      this.logger.error(`Error fetching carrier ${id}:`, error);
      throw error;
    }
  }

  async create(
    createCarrierDto: CreateCarrierDto,
    tenantId: string,
  ): Promise<CarrierResponseDto> {
    try {
      // Check if RUT already exists for this tenant in Carrier
      const existingCarrier = await this.prisma.carrier.findFirst({
        where: {
          rut: createCarrierDto.rut,
          tenantId,
        },
      });

      if (existingCarrier) {
        throw new ConflictException('Carrier with this RUT already exists');
      }

      // Verify comuna exists
      const comuna = await this.prisma.comuna.findUnique({
        where: { id: createCarrierDto.comunaId },
      });

      if (!comuna) {
        throw new BadRequestException('Invalid comunaId');
      }

      // NEW: Check if Entidad already exists
      const existingEntidad = await this.prisma.entidad.findFirst({
        where: {
          rut: createCarrierDto.rut,
          tenantId,
        },
      });

      let entidadId: string;

      if (existingEntidad) {
        // Update existing Entidad to ensure data consistency
        await this.prisma.entidad.update({
          where: { id: existingEntidad.id },
          data: {
            nombre: createCarrierDto.nombre || createCarrierDto.razonSocial,
            razonSocial: createCarrierDto.razonSocial,
            contacto: createCarrierDto.contacto,
            email: createCarrierDto.email,
            telefono: createCarrierDto.telefono,
            direccion: createCarrierDto.direccion,
            comunaId: createCarrierDto.comunaId,
            esPersona: createCarrierDto.esPersona ?? false,
            tipoEntidad: TipoEntidad.CARRIER,
            activo: true,
          },
        });
        entidadId = existingEntidad.id;
        this.logger.log(`Linked to existing Entidad: ${existingEntidad.rut}`);
      } else {
        // Create new Entidad
        const newEntidad = await this.prisma.entidad.create({
          data: {
            nombre: createCarrierDto.nombre || createCarrierDto.razonSocial,
            razonSocial: createCarrierDto.razonSocial,
            rut: createCarrierDto.rut,
            contacto: createCarrierDto.contacto,
            email: createCarrierDto.email,
            telefono: createCarrierDto.telefono,
            direccion: createCarrierDto.direccion,
            comunaId: createCarrierDto.comunaId,
            esPersona: createCarrierDto.esPersona ?? false,
            activo: true,
            tipoEntidad: TipoEntidad.CARRIER,
            tenantId,
          },
        });
        entidadId = newEntidad.id;
      }

      // Create Carrier with entidadId link
      const carrier = await this.prisma.carrier.create({
        data: {
          nombre: createCarrierDto.nombre,
          razonSocial: createCarrierDto.razonSocial,
          rut: createCarrierDto.rut,
          contacto: createCarrierDto.contacto,
          email: createCarrierDto.email,
          telefono: createCarrierDto.telefono,
          direccion: createCarrierDto.direccion,
          comunaId: createCarrierDto.comunaId,
          esPersona: createCarrierDto.esPersona ?? false,
          activo: true,
          tipoEntidad: TipoEntidad.CARRIER,
          tenantId,
          entidadId: entidadId,
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
          equipos: {
            where: { activo: true },
            include: {
              tipoEquipo: {
                select: { id: true, nombre: true },
              },
              modeloTransporte: {
                select: { id: true, nombre: true, tipoModelo: true },
              },
            },
          },
          entidad: true,
        },
      });

      this.logger.log(`Carrier created successfully: ${carrier.rut}`);
      return new CarrierResponseDto(carrier);
    } catch (error) {
      this.logger.error('Error creating carrier:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateCarrierDto: UpdateCarrierDto,
    tenantId: string,
  ): Promise<CarrierResponseDto> {
    try {
      // Verify carrier exists and belongs to tenant
      const existingCarrier = await this.prisma.carrier.findFirst({
        where: { id, tenantId },
      });

      if (!existingCarrier) {
        throw new NotFoundException('Carrier not found');
      }

      // Check for RUT conflict if RUT is being updated
      if (
        updateCarrierDto.rut &&
        updateCarrierDto.rut !== existingCarrier.rut
      ) {
        const duplicateCarrier = await this.prisma.carrier.findFirst({
          where: {
            rut: updateCarrierDto.rut,
            tenantId,
            id: { not: id },
          },
        });

        if (duplicateCarrier) {
          throw new ConflictException(
            'Another carrier with this RUT already exists',
          );
        }
      }

      // Verify comuna exists if comunaId is being updated
      if (updateCarrierDto.comunaId) {
        const comuna = await this.prisma.comuna.findUnique({
          where: { id: updateCarrierDto.comunaId },
        });

        if (!comuna) {
          throw new BadRequestException('Invalid comunaId');
        }
      }

      //Also update the linked Entidad if it exists
      if (existingCarrier.entidadId) {
        await this.prisma.entidad.updateMany({
          where: {
            id: existingCarrier.entidadId,
            tenantId,
          },
          data: {
            ...(updateCarrierDto.nombre && { nombre: updateCarrierDto.nombre }),
            ...(updateCarrierDto.razonSocial && {
              razonSocial: updateCarrierDto.razonSocial,
            }),
            ...(updateCarrierDto.rut && { rut: updateCarrierDto.rut }),
            ...(updateCarrierDto.contacto && {
              contacto: updateCarrierDto.contacto,
            }),
            ...(updateCarrierDto.email && { email: updateCarrierDto.email }),
            ...(updateCarrierDto.telefono && {
              telefono: updateCarrierDto.telefono,
            }),
            ...(updateCarrierDto.direccion && {
              direccion: updateCarrierDto.direccion,
            }),
            ...(updateCarrierDto.comunaId && {
              comunaId: updateCarrierDto.comunaId,
            }),
            ...(updateCarrierDto.esPersona !== undefined && {
              esPersona: updateCarrierDto.esPersona,
            }),
          },
        });
      }

      const carrier = await this.prisma.carrier.update({
        where: { id },
        data: updateCarrierDto,
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
          equipos: {
            where: { activo: true },
            include: {
              tipoEquipo: {
                select: { id: true, nombre: true },
              },
              modeloTransporte: {
                select: { id: true, nombre: true, tipoModelo: true },
              },
            },
          },
          entidad: true,
        },
      });

      this.logger.log(`Carrier updated successfully: ${carrier.rut}`);
      return new CarrierResponseDto(carrier);
    } catch (error) {
      this.logger.error(`Error updating carrier ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    try {
      // Verify carrier exists and belongs to tenant
      const existingCarrier = await this.prisma.carrier.findFirst({
        where: { id, tenantId },
      });

      if (!existingCarrier) {
        throw new NotFoundException('Carrier not found');
      }

      // Check if carrier has active equipment
      const activeEquipment = await this.prisma.equipo.findFirst({
        where: {
          carrierId: id,
          activo: true,
        },
      });

      if (activeEquipment) {
        throw new BadRequestException(
          'Cannot deactivate carrier with active equipment. Please deactivate all equipment first.',
        );
      }

      // Use transaction to deactivate both Carrier and Entidad
      await this.prisma.$transaction([
        // Soft delete carrier
        this.prisma.carrier.update({
          where: { id },
          data: { activo: false },
        }),
        // Soft delete corresponding entidad if it exists
        ...(existingCarrier.entidadId
          ? [
              this.prisma.entidad.update({
                where: { id: existingCarrier.entidadId },
                data: { activo: false },
              }),
            ]
          : []),
      ]);

      this.logger.log(`Carrier ${id} and corresponding Entity deactivated`);
      return { message: 'Carrier deactivated successfully' };
    } catch (error) {
      this.logger.error(`Error deactivating carrier ${id}:`, error);
      throw error;
    }
  }

  async findByRut(
    rut: string,
    tenantId: string,
  ): Promise<CarrierResponseDto | null> {
    try {
      const carrier = await this.prisma.carrier.findFirst({
        where: {
          rut,
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
          equipos: {
            where: { activo: true },
            include: {
              tipoEquipo: {
                select: { id: true, nombre: true },
              },
              modeloTransporte: {
                select: { id: true, nombre: true, tipoModelo: true },
              },
            },
          },
          entidad: true,
        },
      });

      return carrier ? new CarrierResponseDto(carrier) : null;
    } catch (error) {
      this.logger.error(`Error finding carrier by RUT ${rut}:`, error);
      throw error;
    }
  }
  async getStats(tenantId: string): Promise<CarrierStatsDto> {
    try {
      const total = await this.prisma.carrier.count({
        where: { tenantId },
      });

      const activos = await this.prisma.carrier.count({
        where: {
          tenantId,
          activo: true,
        },
      });

      const inactivos = await this.prisma.carrier.count({
        where: {
          tenantId,
          activo: false,
        },
      });

      return {
        total,
        activos,
        inactivos,
      };
    } catch (error) {
      this.logger.error('Error fetching carrier stats:', error);
      throw error;
    }
  }
}
