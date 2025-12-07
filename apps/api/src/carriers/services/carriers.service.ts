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
import { TipoEntidad, Prisma } from '@prisma/client';
import { CarrierStatsDto } from '../dto/carrier-stats.dto';

@Injectable()
export class CarriersService {
  private readonly logger = new Logger(CarriersService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Reusable include for consistent relations
  private readonly carrierInclude = {
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
  } satisfies Prisma.CarrierInclude;

  // Format RUT for consistency
  private formatRut(rut: string): string {
    const cleanRut = rut.replace(/[^0-9Kk]/g, '').toUpperCase();

    if (cleanRut.length >= 2) {
      const body = cleanRut.slice(0, -1);
      const verifier = cleanRut.slice(-1);
      return `${body}-${verifier}`;
    }

    return cleanRut;
  }

  // Build dynamic WHERE clause
  private buildWhereClause(
    filter: CarriersFilterDto,
    tenantId: string,
  ): Prisma.CarrierWhereInput {
    const where: Prisma.CarrierWhereInput = { tenantId };

    if (filter.search) {
      const searchTerm = filter.search.trim();
      where.OR = [
        { nombre: { contains: searchTerm, mode: 'insensitive' } },
        { razonSocial: { contains: searchTerm, mode: 'insensitive' } },
        { rut: { contains: searchTerm, mode: 'insensitive' } },
        { contacto: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (filter.activo !== undefined) {
      where.activo = filter.activo;
    }

    if (filter.esPersona !== undefined) {
      where.esPersona = filter.esPersona;
    }

    return where;
  }

  // Shared fields to sync between Carrier and Entidad
  private getSyncFields(
    dto: CreateCarrierDto | UpdateCarrierDto,
    isPersona: boolean = false,
  ) {
    // Determine the correct name field based on esPersona
    const nombre = dto.nombre || dto.razonSocial || '';
    const razonSocial = !isPersona ? dto.razonSocial || nombre : null;

    const fields: Record<string, any> = {
      nombre: nombre,
      razonSocial: razonSocial,
      rut: 'rut' in dto && dto.rut ? this.formatRut(dto.rut) : undefined,
      contacto: 'contacto' in dto ? dto.contacto : undefined,
      email: 'email' in dto ? dto.email : undefined,
      telefono: 'telefono' in dto ? dto.telefono : undefined,
      direccion: 'direccion' in dto ? dto.direccion : undefined,
      comunaId: 'comunaId' in dto ? dto.comunaId : undefined,
      esPersona: 'esPersona' in dto ? dto.esPersona : undefined,
      activo: 'activo' in dto ? dto.activo : undefined,
    };

    return Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );
  }

  async findAll(
    filter: CarriersFilterDto,
    tenantId: string,
  ): Promise<{ carriers: CarrierResponseDto[]; total: number }> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filter, tenantId);

    const [carriers, total] = await this.prisma.$transaction([
      this.prisma.carrier.findMany({
        where,
        include: this.carrierInclude,
        skip,
        take: limit,
        orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
      }),
      this.prisma.carrier.count({ where }),
    ]);

    return {
      carriers: carriers.map((carrier) => new CarrierResponseDto(carrier)),
      total,
    };
  }

  async findOne(id: string, tenantId: string): Promise<CarrierResponseDto> {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id, tenantId },
      include: this.carrierInclude,
    });

    if (!carrier) {
      throw new NotFoundException('Carrier no encontrado');
    }

    return new CarrierResponseDto(carrier);
  }

  async create(
    createCarrierDto: CreateCarrierDto,
    tenantId: string,
  ): Promise<CarrierResponseDto> {
    // Format RUT
    const formattedRut = this.formatRut(createCarrierDto.rut);

    // Check RUT uniqueness in Carrier
    const existingCarrier = await this.prisma.carrier.findFirst({
      where: { rut: formattedRut, tenantId },
    });

    if (existingCarrier) {
      throw new ConflictException('Ya existe un carrier con este RUT');
    }

    // Validate comuna
    const comuna = await this.prisma.comuna.findUnique({
      where: { id: createCarrierDto.comunaId },
    });

    if (!comuna) {
      throw new BadRequestException('comunaId no es válido');
    }

    const esPersona = createCarrierDto.esPersona ?? false;
    const syncData = this.getSyncFields(createCarrierDto, esPersona);

    return this.prisma.$transaction(async (tx) => {
      // Try to find existing Entidad
      const existingEntidad = await tx.entidad.findFirst({
        where: { rut: formattedRut, tenantId },
      });

      let entidadId: string;

      if (existingEntidad) {
        // Update existing Entidad with sync data
        await tx.entidad.update({
          where: { id: existingEntidad.id },
          data: {
            ...syncData,
            tipoEntidad: TipoEntidad.CARRIER,
            activo: true,
          },
        });
        entidadId = existingEntidad.id;
        this.logger.log(
          `Reutilizando entidad existente: ${existingEntidad.id}`,
        );
      } else {
        // Create new Entidad - only provide fields that are present
        const newEntidad = await tx.entidad.create({
          data: {
            // Required fields
            rut: formattedRut,
            contacto: createCarrierDto.contacto,
            email: createCarrierDto.email,
            telefono: createCarrierDto.telefono,
            comunaId: createCarrierDto.comunaId,
            tenantId,
            tipoEntidad: TipoEntidad.CARRIER,
            activo: true,
            // Optional fields (from syncData)
            nombre: syncData.nombre,
            razonSocial: syncData.razonSocial,
            direccion: syncData.direccion,
            esPersona,
          },
        });
        entidadId = newEntidad.id;
      }

      // Create Carrier
      const carrier = await tx.carrier.create({
        data: {
          nombre: createCarrierDto.nombre,
          razonSocial: createCarrierDto.razonSocial,
          rut: formattedRut,
          contacto: createCarrierDto.contacto,
          email: createCarrierDto.email,
          telefono: createCarrierDto.telefono,
          direccion: createCarrierDto.direccion,
          comunaId: createCarrierDto.comunaId,
          esPersona,
          activo: true,
          tipoEntidad: TipoEntidad.CARRIER,
          tenantId,
          entidadId,
        },
        include: this.carrierInclude,
      });

      this.logger.log(
        `Carrier creado: ${formattedRut} (Entidad: ${entidadId})`,
      );
      return new CarrierResponseDto(carrier);
    });
  }

  async update(
    id: string,
    updateCarrierDto: UpdateCarrierDto,
    tenantId: string,
  ): Promise<CarrierResponseDto> {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id, tenantId },
      include: { entidad: true },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier no encontrado');
    }

    // RUT uniqueness check
    if (updateCarrierDto.rut && updateCarrierDto.rut !== carrier.rut) {
      const formattedRut = this.formatRut(updateCarrierDto.rut);
      const duplicate = await this.prisma.carrier.findFirst({
        where: { rut: formattedRut, tenantId, id: { not: id } },
      });

      if (duplicate) {
        throw new ConflictException('Ya existe otro carrier con este RUT');
      }
    }

    // Validate comuna if provided
    if (updateCarrierDto.comunaId) {
      const comuna = await this.prisma.comuna.findUnique({
        where: { id: updateCarrierDto.comunaId },
      });

      if (!comuna) {
        throw new BadRequestException('comunaId no es válido');
      }
    }

    const esPersona =
      updateCarrierDto.esPersona !== undefined
        ? updateCarrierDto.esPersona
        : carrier.esPersona;

    const syncData = this.getSyncFields(updateCarrierDto, esPersona);

    return this.prisma.$transaction(async (tx) => {
      // Prepare carrier update data - handle undefined vs null for optional fields
      const carrierUpdateData: Prisma.CarrierUpdateInput = {};

      // Handle optional string fields (nombre, razonSocial, direccion)
      if (updateCarrierDto.nombre !== undefined) {
        carrierUpdateData.nombre = updateCarrierDto.nombre;
      }
      if (updateCarrierDto.razonSocial !== undefined) {
        carrierUpdateData.razonSocial = updateCarrierDto.razonSocial;
      }
      if (updateCarrierDto.rut !== undefined) {
        carrierUpdateData.rut = this.formatRut(updateCarrierDto.rut);
      }
      if (updateCarrierDto.contacto !== undefined) {
        carrierUpdateData.contacto = updateCarrierDto.contacto;
      }
      if (updateCarrierDto.email !== undefined) {
        carrierUpdateData.email = updateCarrierDto.email;
      }
      if (updateCarrierDto.telefono !== undefined) {
        carrierUpdateData.telefono = updateCarrierDto.telefono;
      }
      if (updateCarrierDto.direccion !== undefined) {
        carrierUpdateData.direccion = updateCarrierDto.direccion;
      }
      if (updateCarrierDto.comunaId !== undefined) {
        carrierUpdateData.comuna = {
          connect: { id: updateCarrierDto.comunaId },
        };
      }
      if (updateCarrierDto.activo !== undefined) {
        carrierUpdateData.activo = updateCarrierDto.activo;
      }
      if (updateCarrierDto.esPersona !== undefined) {
        carrierUpdateData.esPersona = updateCarrierDto.esPersona;
      }

      const [updatedCarrier] = await Promise.all([
        tx.carrier.update({
          where: { id },
          data: carrierUpdateData,
          include: this.carrierInclude,
        }),
        // Update linked Entidad if exists and there are fields to sync
        carrier.entidadId && Object.keys(syncData).length > 0
          ? tx.entidad.update({
              where: { id: carrier.entidadId },
              data: {
                ...syncData,
                tipoEntidad: TipoEntidad.CARRIER,
              },
            })
          : Promise.resolve(),
      ]);

      this.logger.log(`Carrier actualizado: ${updatedCarrier.rut}`);
      return new CarrierResponseDto(updatedCarrier);
    });
  }

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        entidadId: true,
        rut: true,
        nombre: true,
      },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier no encontrado');
    }

    // Check for active equipment
    const activeEquipment = await this.prisma.equipo.findFirst({
      where: { carrierId: id, activo: true },
    });

    if (activeEquipment) {
      throw new BadRequestException(
        'No se puede desactivar un carrier con equipos activos. Desactive los equipos primero.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.carrier.update({
        where: { id },
        data: { activo: false },
      });

      if (carrier.entidadId) {
        await tx.entidad.update({
          where: { id: carrier.entidadId },
          data: { activo: false },
        });
      }
    });

    this.logger.log(`Carrier desactivado: ${carrier.rut} (${carrier.nombre})`);
    return { message: 'Carrier desactivado exitosamente' };
  }

  async findByRut(
    rut: string,
    tenantId: string,
  ): Promise<CarrierResponseDto | null> {
    const formattedRut = this.formatRut(rut);

    const carrier = await this.prisma.carrier.findFirst({
      where: { rut: formattedRut, tenantId },
      include: this.carrierInclude,
    });

    return carrier ? new CarrierResponseDto(carrier) : null;
  }

  async getStats(tenantId: string): Promise<CarrierStatsDto> {
    const [total, activos, inactivos] = await this.prisma.$transaction([
      this.prisma.carrier.count({ where: { tenantId } }),
      this.prisma.carrier.count({ where: { tenantId, activo: true } }),
      this.prisma.carrier.count({ where: { tenantId, activo: false } }),
    ]);

    return { total, activos, inactivos };
  }

  // Get carriers with active equipment stats
  async getCarriersWithEquipmentStats(tenantId: string): Promise<
    Array<{
      id: string;
      nombre: string;
      rut: string;
      totalEquipos: number;
      equiposActivos: number;
      equiposInactivos: number;
    }>
  > {
    const carriers = await this.prisma.carrier.findMany({
      where: { tenantId, activo: true },
      select: {
        id: true,
        nombre: true,
        rut: true,
      },
      orderBy: { nombre: 'asc' },
    });

    const carriersWithStats = await Promise.all(
      carriers.map(async (carrier) => {
        const [totalEquipos, equiposActivos, equiposInactivos] =
          await Promise.all([
            this.prisma.equipo.count({ where: { carrierId: carrier.id } }),
            this.prisma.equipo.count({
              where: { carrierId: carrier.id, activo: true },
            }),
            this.prisma.equipo.count({
              where: { carrierId: carrier.id, activo: false },
            }),
          ]);

        return {
          ...carrier,
          totalEquipos,
          equiposActivos,
          equiposInactivos,
        };
      }),
    );

    return carriersWithStats;
  }
}
