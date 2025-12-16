import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateEmbarcadorDto } from '../dto/create-embarcador.dto';
import { UpdateEmbarcadorDto } from '../dto/update-embarcador.dto';
import { EmbarcadoresFilterDto } from '../dto/embarcadores-filter.dto';
import { EmbarcadorResponseDto } from '../dto/embarcador-response.dto';
import { TipoEntidad, Prisma } from '@prisma/client';
import { ShipperStatsDto } from '../dto/embarcadores-stats.dto';

@Injectable()
export class EmbarcadoresService {
  private readonly logger = new Logger(EmbarcadoresService.name);

  constructor(private readonly prisma: PrismaService) {}

  private readonly embarcadorInclude = {
    comuna: {
      include: {
        provincia: {
          include: {
            region: true,
          },
        },
      },
    },
    entidad: true,
  } satisfies Prisma.EmbarcadorInclude;

  // Format RUT consistently (e.g., 12345678-9)
  private formatRut(rut: string): string {
    const cleanRut = rut.replace(/[^0-9Kk]/g, '').toUpperCase();

    if (cleanRut.length >= 2) {
      const body = cleanRut.slice(0, -1);
      const verifier = cleanRut.slice(-1);
      return `${body}-${verifier}`;
    }

    return cleanRut;
  }

  // dynamic WHERE clause
  private buildWhereClause(
    filter: EmbarcadoresFilterDto,
    tenantId: string,
  ): Prisma.EmbarcadorWhereInput {
    const where: Prisma.EmbarcadorWhereInput = { tenantId };

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

  // Shared fields to sync between Embarcador and Entidad
  private getSyncFields(
    dto: CreateEmbarcadorDto | UpdateEmbarcadorDto,
    isPersona: boolean = false,
  ) {
    const nombre = dto.nombre || dto.razonSocial || '';
    const razonSocial = !isPersona ? dto.razonSocial || nombre : null;

    const fields: Record<string, any> = {
      nombre,
      razonSocial,
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
    filter: EmbarcadoresFilterDto,
    tenantId: string,
  ): Promise<{ embarcadores: EmbarcadorResponseDto[]; total: number }> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filter, tenantId);

    const [embarcadores, total] = await this.prisma.$transaction([
      this.prisma.embarcador.findMany({
        where,
        include: this.embarcadorInclude,
        skip,
        take: limit,
        orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
      }),
      this.prisma.embarcador.count({ where }),
    ]);

    return {
      embarcadores: embarcadores.map((e) => new EmbarcadorResponseDto(e)),
      total,
    };
  }

  async findOne(id: string, tenantId: string): Promise<EmbarcadorResponseDto> {
    const embarcador = await this.prisma.embarcador.findFirst({
      where: { id, tenantId },
      include: this.embarcadorInclude,
    });

    if (!embarcador) {
      throw new NotFoundException('Embarcador no encontrado');
    }

    return new EmbarcadorResponseDto(embarcador);
  }

  async create(
    createEmbarcadorDto: CreateEmbarcadorDto,
    tenantId: string,
  ): Promise<EmbarcadorResponseDto> {
    const formattedRut = this.formatRut(createEmbarcadorDto.rut);

    // Check uniqueness in Embarcador
    const existingEmbarcador = await this.prisma.embarcador.findFirst({
      where: { rut: formattedRut, tenantId },
    });

    if (existingEmbarcador) {
      throw new ConflictException('Ya existe un embarcador con este RUT');
    }

    // Validate comuna
    const comuna = await this.prisma.comuna.findUnique({
      where: { id: createEmbarcadorDto.comunaId },
    });

    if (!comuna) {
      throw new BadRequestException('comunaId no es válido');
    }

    const esPersona = createEmbarcadorDto.esPersona ?? false;
    const syncData = this.getSyncFields(createEmbarcadorDto, esPersona);

    return this.prisma.$transaction(async (tx) => {
      // Find or create/reuse Entidad
      const existingEntidad = await tx.entidad.findFirst({
        where: { rut: formattedRut, tenantId },
      });

      let entidadId: string;

      if (existingEntidad) {
        await tx.entidad.update({
          where: { id: existingEntidad.id },
          data: {
            ...syncData,
            tipoEntidad: TipoEntidad.EMBARCADOR,
            activo: true,
          },
        });
        entidadId = existingEntidad.id;
        this.logger.log(
          `Reutilizando entidad existente: ${existingEntidad.id}`,
        );
      } else {
        const newEntidad = await tx.entidad.create({
          data: {
            rut: formattedRut,
            contacto: createEmbarcadorDto.contacto,
            email: createEmbarcadorDto.email,
            telefono: createEmbarcadorDto.telefono,
            comunaId: createEmbarcadorDto.comunaId,
            tenantId,
            tipoEntidad: TipoEntidad.EMBARCADOR,
            activo: true,
            nombre: syncData.nombre,
            razonSocial: syncData.razonSocial,
            direccion: syncData.direccion,
            esPersona,
          },
        });
        entidadId = newEntidad.id;
      }

      // Create Embarcador
      const embarcador = await tx.embarcador.create({
        data: {
          nombre: createEmbarcadorDto.nombre,
          razonSocial: createEmbarcadorDto.razonSocial,
          rut: formattedRut,
          contacto: createEmbarcadorDto.contacto,
          email: createEmbarcadorDto.email,
          telefono: createEmbarcadorDto.telefono,
          direccion: createEmbarcadorDto.direccion,
          comunaId: createEmbarcadorDto.comunaId,
          esPersona,
          activo: true,
          tipoEntidad: TipoEntidad.EMBARCADOR,
          tenantId,
          entidadId,
        },
        include: this.embarcadorInclude,
      });

      this.logger.log(
        `Embarcador creado: ${formattedRut} (Entidad: ${entidadId})`,
      );
      return new EmbarcadorResponseDto(embarcador);
    });
  }

  async update(
    id: string,
    updateEmbarcadorDto: UpdateEmbarcadorDto,
    tenantId: string,
  ): Promise<EmbarcadorResponseDto> {
    const embarcador = await this.prisma.embarcador.findFirst({
      where: { id, tenantId },
      include: { entidad: true },
    });

    if (!embarcador) {
      throw new NotFoundException('Embarcador no encontrado');
    }

    // RUT uniqueness check if changing
    if (updateEmbarcadorDto.rut && updateEmbarcadorDto.rut !== embarcador.rut) {
      const formattedRut = this.formatRut(updateEmbarcadorDto.rut);
      const duplicate = await this.prisma.embarcador.findFirst({
        where: { rut: formattedRut, tenantId, id: { not: id } },
      });

      if (duplicate) {
        throw new ConflictException('Ya existe otro embarcador con este RUT');
      }
    }

    // Validate comuna if provided
    if (updateEmbarcadorDto.comunaId) {
      const comuna = await this.prisma.comuna.findUnique({
        where: { id: updateEmbarcadorDto.comunaId },
      });

      if (!comuna) {
        throw new BadRequestException('comunaId no es válido');
      }
    }

    const esPersona =
      updateEmbarcadorDto.esPersona !== undefined
        ? updateEmbarcadorDto.esPersona
        : embarcador.esPersona;

    const syncData = this.getSyncFields(updateEmbarcadorDto, esPersona);

    return this.prisma.$transaction(async (tx) => {
      const embarcadorUpdateData: Prisma.EmbarcadorUpdateInput = {};

      if (updateEmbarcadorDto.nombre !== undefined) {
        embarcadorUpdateData.nombre = updateEmbarcadorDto.nombre;
      }
      if (updateEmbarcadorDto.razonSocial !== undefined) {
        embarcadorUpdateData.razonSocial = updateEmbarcadorDto.razonSocial;
      }
      if (updateEmbarcadorDto.rut !== undefined) {
        embarcadorUpdateData.rut = this.formatRut(updateEmbarcadorDto.rut);
      }
      if (updateEmbarcadorDto.contacto !== undefined) {
        embarcadorUpdateData.contacto = updateEmbarcadorDto.contacto;
      }
      if (updateEmbarcadorDto.email !== undefined) {
        embarcadorUpdateData.email = updateEmbarcadorDto.email;
      }
      if (updateEmbarcadorDto.telefono !== undefined) {
        embarcadorUpdateData.telefono = updateEmbarcadorDto.telefono;
      }
      if (updateEmbarcadorDto.direccion !== undefined) {
        embarcadorUpdateData.direccion = updateEmbarcadorDto.direccion;
      }
      if (updateEmbarcadorDto.comunaId !== undefined) {
        embarcadorUpdateData.comuna = {
          connect: { id: updateEmbarcadorDto.comunaId },
        };
      }
      if (updateEmbarcadorDto.activo !== undefined) {
        embarcadorUpdateData.activo = updateEmbarcadorDto.activo;
      }
      if (updateEmbarcadorDto.esPersona !== undefined) {
        embarcadorUpdateData.esPersona = updateEmbarcadorDto.esPersona;
      }

      const [updatedEmbarcador] = await Promise.all([
        tx.embarcador.update({
          where: { id },
          data: embarcadorUpdateData,
          include: this.embarcadorInclude,
        }),
        // Update linked Entidad if exists and has sync fields
        embarcador.entidadId && Object.keys(syncData).length > 0
          ? tx.entidad.update({
              where: { id: embarcador.entidadId },
              data: {
                ...syncData,
                tipoEntidad: TipoEntidad.EMBARCADOR,
              },
            })
          : Promise.resolve(),
      ]);

      this.logger.log(`Embarcador actualizado: ${updatedEmbarcador.rut}`);
      return new EmbarcadorResponseDto(updatedEmbarcador);
    });
  }

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    const embarcador = await this.prisma.embarcador.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        entidadId: true,
        rut: true,
        nombre: true,
        razonSocial: true,
      },
    });

    if (!embarcador) {
      throw new NotFoundException('Embarcador no encontrado');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.embarcador.update({
        where: { id },
        data: { activo: false },
      });

      if (embarcador.entidadId) {
        await tx.entidad.update({
          where: { id: embarcador.entidadId },
          data: { activo: false },
        });
      }
    });

    const displayName =
      embarcador.razonSocial || embarcador.nombre || embarcador.rut;
    this.logger.log(
      `Embarcador desactivado: ${embarcador.rut} (${displayName})`,
    );
    return { message: 'Embarcador desactivado exitosamente' };
  }

  async findByRut(
    rut: string,
    tenantId: string,
  ): Promise<EmbarcadorResponseDto | null> {
    const formattedRut = this.formatRut(rut);

    const embarcador = await this.prisma.embarcador.findFirst({
      where: { rut: formattedRut, tenantId },
      include: this.embarcadorInclude,
    });

    return embarcador ? new EmbarcadorResponseDto(embarcador) : null;
  }

  async getStats(tenantId: string): Promise<ShipperStatsDto> {
    const [total, activos, inactivos] = await this.prisma.$transaction([
      this.prisma.embarcador.count({ where: { tenantId } }),
      this.prisma.embarcador.count({ where: { tenantId, activo: true } }),
      this.prisma.embarcador.count({ where: { tenantId, activo: false } }),
    ]);

    return { total, activos, inactivos };
  }
}
