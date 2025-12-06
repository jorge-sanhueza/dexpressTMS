import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ContactosFilterDto } from '../dto/contactos-filter.dto';
import { CreateContactoDto } from '../dto/create-contacto.dto';
import { UpdateContactoDto } from '../dto/update-contacto.dto';
import { ContactoResponseDto } from '../dto/contacto-response.dto';
import { TipoEntidad, Prisma } from '@prisma/client';

@Injectable()
export class ContactosService {
  private readonly logger = new Logger(ContactosService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Reusable include for consistent relations
  private readonly contactoInclude = {
    entidad: {
      select: {
        id: true,
        nombre: true,
        rut: true,
        tipoEntidad: true,
      },
    },
    comuna: {
      include: {
        provincia: {
          include: { region: true },
        },
      },
    },
  } satisfies Prisma.ContactoInclude;

  // Build dynamic WHERE clause
  private buildWhereClause(filter: ContactosFilterDto, tenantId: string) {
    const where: Prisma.ContactoWhereInput = { tenantId };

    if (filter.search) {
      const search = filter.search.trim();
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { rut: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cargo: { contains: search, mode: 'insensitive' } },
        { contacto: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filter.activo !== undefined) {
      where.activo = Boolean(filter.activo);
    }

    if (filter.esPersonaNatural !== undefined) {
      where.esPersonaNatural = Boolean(filter.esPersonaNatural);
    }

    if (filter.entidadId) {
      where.entidadId = filter.entidadId;
    }

    return where;
  }

  // Shared fields to sync between contacto and entidad
  private getSyncFields(dto: CreateContactoDto | UpdateContactoDto) {
    const fields = {
      nombre: 'nombre' in dto ? dto.nombre : undefined,
      rut: 'rut' in dto ? dto.rut : undefined,
      email: 'email' in dto ? (dto.email ?? '') : undefined,
      telefono: 'telefono' in dto ? (dto.telefono ?? '') : undefined,
      direccion: 'direccion' in dto ? dto.direccion : undefined,
      comunaId: 'comunaId' in dto ? dto.comunaId : undefined,
    };
    return Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );
  }

  async findAll(
    filter: ContactosFilterDto,
    tenantId: string,
  ): Promise<{ contactos: ContactoResponseDto[]; total: number }> {
    const page = Math.max(1, parseInt(String(filter.page ?? 1), 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(filter.limit ?? 10), 10)),
    );
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filter, tenantId);

    const [contactos, total] = await this.prisma.$transaction([
      this.prisma.contacto.findMany({
        where,
        include: this.contactoInclude,
        skip,
        take: limit,
        orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
      }),
      this.prisma.contacto.count({ where }),
    ]);

    return {
      contactos: contactos.map((c) => new ContactoResponseDto(c)),
      total,
    };
  }

  async findOne(id: string, tenantId: string): Promise<ContactoResponseDto> {
    const contacto = await this.prisma.contacto.findFirst({
      where: { id, tenantId },
      include: this.contactoInclude,
    });

    if (!contacto) throw new NotFoundException('No se encontró el contacto');

    return new ContactoResponseDto(contacto);
  }

  async create(
    dto: CreateContactoDto,
    tenantId: string,
  ): Promise<ContactoResponseDto> {
    if (dto.rut) {
      const exists = await this.prisma.contacto.findFirst({
        where: { rut: dto.rut, tenantId },
      });
      if (exists)
        throw new ConflictException('Ya existe un contacto con este RUT');
    }

    if (dto.comunaId) {
      const comuna = await this.prisma.comuna.findUnique({
        where: { id: dto.comunaId },
      });
      if (!comuna) throw new BadRequestException('ComunaId no es válido');
    }

    const syncData = this.getSyncFields(dto);

    return this.prisma.$transaction(async (tx) => {
      const entidad = await tx.entidad.create({
        data: {
          nombre: dto.nombre,
          rut: dto.rut ?? '',
          email: dto.email ?? '',
          telefono: dto.telefono ?? '',
          direccion: dto.direccion ?? '',
          comunaId: dto.comunaId ?? null,
          tipoEntidad: TipoEntidad.PERSONA,
          contacto: dto.contacto,
          esPersona: true,
          activo: true,
          tenantId,
        },
      });

      const contacto = await tx.contacto.create({
        data: {
          ...dto,
          email: dto.email ?? null,
          telefono: dto.telefono ?? null,
          direccion: dto.direccion ?? null,
          cargo: dto.cargo ?? null,
          esPersonaNatural: dto.esPersonaNatural ?? true,
          activo: true,
          entidadId: entidad.id,
          tenantId,
        },
        include: this.contactoInclude,
      });

      this.logger.log(
        `Contacto y entidad: ${contacto.id} / ${entidad.id} creados exitosamente`,
      );
      return new ContactoResponseDto(contacto);
    });
  }

  async update(
    id: string,
    dto: UpdateContactoDto,
    tenantId: string,
  ): Promise<ContactoResponseDto> {
    const contacto = await this.prisma.contacto.findFirst({
      where: { id, tenantId },
      include: { entidad: true },
    });

    if (!contacto) throw new NotFoundException('No se encontró el contacto');

    // RUT uniqueness check
    if (dto.rut && dto.rut !== contacto.rut) {
      const duplicate = await this.prisma.contacto.findFirst({
        where: { rut: dto.rut, tenantId, id: { not: id } },
      });
      if (duplicate)
        throw new ConflictException('Ya existe un contacto con este RUT');
    }

    // Validate comuna if provided
    if (dto.comunaId) {
      const comuna = await this.prisma.comuna.findUnique({
        where: { id: dto.comunaId },
      });
      if (!comuna) throw new BadRequestException('comunaId no es válido');
    }

    const syncData = this.getSyncFields(dto);

    return this.prisma.$transaction(async (tx) => {
      const [updatedContacto] = await Promise.all([
        tx.contacto.update({
          where: { id },
          data: {
            ...dto,
            email: dto.email ?? undefined,
            telefono: dto.telefono ?? undefined,
            direccion: dto.direccion ?? undefined,
            cargo: dto.cargo ?? undefined,
          },
          include: this.contactoInclude,
        }),
        tx.entidad.update({
          where: { id: contacto.entidadId },
          data: {
            ...syncData,
            // Only update these if explicitly provided
            contacto: dto.contacto,
          },
        }),
      ]);

      this.logger.log(`Contacto y entidad: ${id} actualizados exitosamente`);
      return new ContactoResponseDto(updatedContacto);
    });
  }

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    const contacto = await this.prisma.contacto.findFirst({
      where: { id, tenantId },
      select: { id: true, entidadId: true },
    });

    if (!contacto) throw new NotFoundException('No se encontró el contacto');

    const usedInRetiros = await this.prisma.retiro.count({
      where: { contactoRetiroId: id },
    });

    if (usedInRetiros > 0) {
      throw new BadRequestException(
        'No se puede desactivar el contacto dado que se encuentra asociado a un retiro. Debe actualizar el retiro primero.',
      );
    }

    await this.prisma.$transaction([
      this.prisma.contacto.update({
        where: { id },
        data: { activo: false },
      }),
      this.prisma.entidad.update({
        where: { id: contacto.entidadId },
        data: { activo: false },
      }),
    ]);

    this.logger.log(`Se ha desactivado el contacto y entidad: ${id}`);
    return { message: 'Contacto desactivado exitosamente' };
  }

  async findByRut(
    rut: string,
    tenantId: string,
  ): Promise<ContactoResponseDto | null> {
    const contacto = await this.prisma.contacto.findFirst({
      where: { rut, tenantId },
      include: this.contactoInclude,
    });

    return contacto ? new ContactoResponseDto(contacto) : null;
  }

  async findByEntidad(
    entidadId: string,
    tenantId: string,
  ): Promise<ContactoResponseDto[]> {
    const contactos = await this.prisma.contacto.findMany({
      where: { entidadId, tenantId, activo: true },
      include: this.contactoInclude,
      orderBy: { nombre: 'asc' },
    });

    return contactos.map((c) => new ContactoResponseDto(c));
  }
}
