import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EntidadesFilterDto } from '../dto/entidades-filter.dto';
import { EntidadResponseDto } from '../dto/entidad-response.dto';
import { CreateEntidadDto } from '../dto/create-entidad.dto';
import { Prisma, TipoEntidad } from '@prisma/client';

@Injectable()
export class EntidadesService {
  private readonly logger = new Logger(EntidadesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Reusable include for consistent relations
  private readonly entidadInclude = {
    comuna: {
      include: {
        region: true,
      },
    },
  } satisfies Prisma.EntidadInclude;

  private formatRut(rut: string): string {
    // Remove all non-alphanumeric characters except K/k
    const cleanRut = rut.replace(/[^0-9Kk]/g, '').toUpperCase();

    // Format as XXXXXXXX-K (8 digits + dash + verifier digit)
    if (cleanRut.length >= 2) {
      const body = cleanRut.slice(0, -1);
      const verifier = cleanRut.slice(-1);
      return `${body}-${verifier}`;
    }

    return cleanRut;
  }

  private buildWhereClause(
    filter: EntidadesFilterDto,
    tenantId: string,
  ): Prisma.EntidadWhereInput {
    const where: Prisma.EntidadWhereInput = { tenantId };

    if (filter.activo !== undefined) {
      where.activo = filter.activo;
    }

    if (filter.search) {
      const searchTerm = filter.search.trim();
      where.OR = [
        { rut: { contains: searchTerm, mode: 'insensitive' } },
        { nombre: { contains: searchTerm, mode: 'insensitive' } },
        { razonSocial: { contains: searchTerm, mode: 'insensitive' } },
        { contacto: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { telefono: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (filter.tipoEntidad) {
      // Validate it's a valid TipoEntidad
      const tipoEntidad = Object.values(TipoEntidad).find(
        (value) => value === filter.tipoEntidad,
      );

      if (tipoEntidad) {
        where.tipoEntidad = tipoEntidad;
      } else {
        this.logger.warn(
          `Invalid tipoEntidad filter value: ${filter.tipoEntidad}`,
        );
      }
    }

    return where;
  }

  async findAll(
    filter: EntidadesFilterDto,
    tenantId: string,
  ): Promise<{
    entidades: EntidadResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filter, tenantId);

    const [entidades, total] = await this.prisma.$transaction([
      this.prisma.entidad.findMany({
        where,
        include: this.entidadInclude,
        skip,
        take: limit,
        orderBy: [{ activo: 'desc' }, { nombre: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.entidad.count({ where }),
    ]);

    return {
      entidades: entidades.map((e) => new EntidadResponseDto(e)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, tenantId: string): Promise<EntidadResponseDto> {
    if (!id?.trim()) {
      throw new BadRequestException('ID es requerido');
    }

    const entidad = await this.prisma.entidad.findFirst({
      where: { id, tenantId },
      include: this.entidadInclude,
    });

    if (!entidad) {
      throw new NotFoundException(`Entidad con ID ${id} no encontrada`);
    }

    return new EntidadResponseDto(entidad);
  }

  async findByRut(
    rut: string,
    tenantId: string,
  ): Promise<EntidadResponseDto | null> {
    const formattedRut = this.formatRut(rut);

    const entidad = await this.prisma.entidad.findFirst({
      where: {
        rut: { equals: formattedRut, mode: 'insensitive' },
        tenantId,
      },
      include: this.entidadInclude,
    });

    return entidad ? new EntidadResponseDto(entidad) : null;
  }

  async create(
    dto: CreateEntidadDto,
    tenantId: string,
  ): Promise<EntidadResponseDto> {
    // Format and validate RUT
    const formattedRut = this.formatRut(dto.rut);

    if (!formattedRut || formattedRut.length < 9) {
      // Min length for formatted RUT (8-1-K)
      throw new BadRequestException('RUT inválido');
    }

    // Check RUT uniqueness
    const existing = await this.prisma.entidad.findFirst({
      where: {
        rut: { equals: formattedRut, mode: 'insensitive' },
        tenantId,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una entidad con el RUT ${formattedRut}`,
      );
    }

    // Validate comuna exists
    if (dto.comunaId) {
      const comuna = await this.prisma.comuna.findUnique({
        where: { id: dto.comunaId },
      });

      if (!comuna) {
        throw new BadRequestException('comunaId no es válido');
      }
    }

    try {
      const nuevaEntidad = await this.prisma.entidad.create({
        data: {
          rut: formattedRut,
          nombre: dto.nombre?.trim() || null,
          razonSocial: dto.razonSocial?.trim() || null,
          tipoEntidad: dto.tipoEntidad,
          contacto: dto.contacto.trim(),
          email: dto.email.trim().toLowerCase(),
          telefono: dto.telefono.trim(),
          direccion: dto.direccion?.trim() || null,
          comunaId: dto.comunaId,
          esPersona: dto.esPersona ?? false,
          activo: dto.activo ?? true,
          tenantId,
        },
        include: this.entidadInclude,
      });

      this.logger.log(
        `Entidad creada → RUT: ${formattedRut} | ID: ${nuevaEntidad.id}`,
      );

      return new EntidadResponseDto(nuevaEntidad);
    } catch (error) {
      this.logger.error('Error creando entidad', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('La entidad ya existe con este RUT');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Referencia inválida (comunaId no existe)',
          );
        }
      }

      throw error;
    }
  }

  // IDEMPOTENT CREATE - Returns existing if found
  async createOrGetExisting(
    dto: CreateEntidadDto,
    tenantId: string,
  ): Promise<{
    message: string;
    entidad: EntidadResponseDto;
    created: boolean;
  }> {
    try {
      // Try to create first
      const nuevaEntidad = await this.create(dto, tenantId);

      return {
        message: 'Entidad creada exitosamente',
        entidad: nuevaEntidad,
        created: true,
      };
    } catch (error) {
      // If conflict, find and return existing
      if (error instanceof ConflictException) {
        const formattedRut = this.formatRut(dto.rut);
        const existing = await this.prisma.entidad.findFirst({
          where: {
            rut: { equals: formattedRut, mode: 'insensitive' },
            tenantId,
          },
          include: this.entidadInclude,
        });

        if (!existing) {
          throw error; // Shouldn't happen, but just in case
        }

        this.logger.log(
          `Entidad ya existe → RUT: ${formattedRut} | ID: ${existing.id}`,
        );

        return {
          message: 'La entidad ya existe con este RUT',
          entidad: new EntidadResponseDto(existing),
          created: false,
        };
      }

      // Re-throw other errors
      throw error;
    }
  }

  async update(
    id: string,
    dto: Partial<CreateEntidadDto> & { activo?: boolean },
    tenantId: string,
  ): Promise<EntidadResponseDto> {
    const entidad = await this.prisma.entidad.findFirst({
      where: { id, tenantId },
    });

    if (!entidad) {
      throw new NotFoundException('Entidad no encontrada');
    }

    // If updating RUT, check uniqueness
    if (dto.rut && dto.rut !== entidad.rut) {
      const formattedRut = this.formatRut(dto.rut);
      const duplicate = await this.prisma.entidad.findFirst({
        where: {
          rut: { equals: formattedRut, mode: 'insensitive' },
          tenantId,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new ConflictException('Ya existe otra entidad con este RUT');
      }
    }

    // Validate comuna if being updated
    if (dto.comunaId) {
      const comuna = await this.prisma.comuna.findUnique({
        where: { id: dto.comunaId },
      });

      if (!comuna) {
        throw new BadRequestException('comunaId no es válido');
      }
    }

    try {
      const updateData: Prisma.EntidadUpdateInput = {
        nombre:
          dto.nombre !== undefined ? dto.nombre?.trim() || null : undefined,
        razonSocial:
          dto.razonSocial !== undefined
            ? dto.razonSocial?.trim() || null
            : undefined,
        tipoEntidad: dto.tipoEntidad,
        contacto: dto.contacto !== undefined ? dto.contacto.trim() : undefined,
        email:
          dto.email !== undefined ? dto.email.trim().toLowerCase() : undefined,
        telefono: dto.telefono !== undefined ? dto.telefono.trim() : undefined,
        direccion:
          dto.direccion !== undefined
            ? dto.direccion?.trim() || null
            : undefined,
        ...(dto.comunaId !== undefined && { comunaId: dto.comunaId }),
        esPersona: dto.esPersona,
        activo: dto.activo,
      };

      // Format RUT if being updated
      if (dto.rut) {
        updateData.rut = this.formatRut(dto.rut);
      }

      const updatedEntidad = await this.prisma.entidad.update({
        where: { id },
        data: updateData,
        include: this.entidadInclude,
      });

      this.logger.log(`Entidad actualizada → ID: ${id}`);

      return new EntidadResponseDto(updatedEntidad);
    } catch (error) {
      this.logger.error('Error actualizando entidad', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Conflicto de datos únicos');
        }
      }

      throw error;
    }
  }

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    const entidad = await this.prisma.entidad.findFirst({
      where: { id, tenantId },
      select: { id: true, rut: true },
    });

    if (!entidad) {
      throw new NotFoundException('Entidad no encontrada');
    }

    await this.prisma.entidad.update({
      where: { id },
      data: { activo: false },
    });

    this.logger.log(`Entidad desactivada → ID: ${id} | RUT: ${entidad.rut}`);

    return { message: 'Entidad desactivada exitosamente' };
  }

  async getStats(tenantId: string): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    porTipoEntidad: Record<string, number>;
  }> {
    const [total, activos, inactivos, tipos] = await this.prisma.$transaction([
      this.prisma.entidad.count({ where: { tenantId } }),
      this.prisma.entidad.count({ where: { tenantId, activo: true } }),
      this.prisma.entidad.count({ where: { tenantId, activo: false } }),
      this.prisma.entidad.groupBy({
        by: ['tipoEntidad'],
        where: { tenantId },
        orderBy: { tipoEntidad: 'asc' },
        _count: true,
      }),
    ]);

    const porTipoEntidad = tipos.reduce(
      (acc, curr) => {
        acc[curr.tipoEntidad] = curr._count as number;
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, activos, inactivos, porTipoEntidad };
  }
}
