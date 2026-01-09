import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { ClientsFilterDto } from '../dto/clients-filter.dto';
import { ClientResponseDto } from '../dto/client-response.dto';
import { ClientStatsDto } from '../dto/client-stats.dto';
import { TipoEntidad, Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Reusable include for consistent relations
  private readonly clienteInclude = {
    comuna: {
      include: {
        region: true,
        provincia: true,
      },
    },
    entidad: true,
  } satisfies Prisma.ClienteInclude;

  // Build dynamic WHERE clause
  private buildWhereClause(
    filter: ClientsFilterDto,
    tenantId: string,
  ): Prisma.ClienteWhereInput {
    const where: Prisma.ClienteWhereInput = { tenantId };

    if (filter.search) {
      const search = filter.search.trim();
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { razonSocial: { contains: search, mode: 'insensitive' } },
        { rut: { contains: search, mode: 'insensitive' } },
        { contacto: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filter.activo !== undefined) {
      where.activo = filter.activo;
    }

    return where;
  }

  // Shared fields to sync between Cliente and Entidad
  private getSyncFields(dto: CreateClientDto | UpdateClientDto) {
    const fields = {
      nombre: 'nombre' in dto ? dto.nombre : undefined,
      razonSocial: 'razonSocial' in dto ? dto.razonSocial : undefined,
      rut: 'rut' in dto ? dto.rut : undefined,
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

  private determineNombreField(
    dto: CreateClientDto | UpdateClientDto,
  ): string | undefined {
    // If esPersona is explicitly provided, use it
    const isPersona = 'esPersona' in dto ? dto.esPersona : undefined;

    if (isPersona === true) {
      return dto.nombre;
    } else if (isPersona === false) {
      return dto.razonSocial;
    }

    // If esPersona is not provided, infer from which field is present
    if (dto.nombre && !dto.razonSocial) {
      return dto.nombre;
    } else if (dto.razonSocial && !dto.nombre) {
      return dto.razonSocial;
    }

    // If both are present, we need additional logic based on your business rules
    // For now, default to nombre if present
    return dto.nombre || dto.razonSocial;
  }

  async findAll(
    filter: ClientsFilterDto,
    tenantId: string,
  ): Promise<{ clients: ClientResponseDto[]; total: number }> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filter, tenantId);

    const [clients, total] = await this.prisma.$transaction([
      this.prisma.cliente.findMany({
        where,
        include: this.clienteInclude,
        skip,
        take: limit,
        orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return {
      clients: clients.map((c) => new ClientResponseDto(c)),
      total,
    };
  }

  async findOne(id: string, tenantId: string): Promise<ClientResponseDto> {
    const client = await this.prisma.cliente.findFirst({
      where: { id, tenantId },
      include: this.clienteInclude,
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return new ClientResponseDto(client);
  }

  async create(
    dto: CreateClientDto,
    tenantId: string,
  ): Promise<ClientResponseDto> {
    // Validate RUT uniqueness in Cliente
    if (dto.rut) {
      const exists = await this.prisma.cliente.findFirst({
        where: { rut: dto.rut, tenantId },
      });
      if (exists) {
        throw new ConflictException('Ya existe un cliente con este RUT');
      }
    }

    // Validate comunaId
    if (dto.comunaId) {
      const comuna = await this.prisma.comuna.findUnique({
        where: { id: dto.comunaId },
      });
      if (!comuna) {
        throw new BadRequestException('comunaId no es válido');
      }
    }

    // Determine nombre/razonSocial based on esPersona
    const esPersona =
      dto.esPersona !== undefined ? dto.esPersona : !!dto.nombre;
    const nombreField = this.determineNombreField(dto);

    const syncData = {
      ...this.getSyncFields(dto),
      nombre: nombreField,
      esPersona,
    };

    return this.prisma.$transaction(async (tx) => {
      // Try to find existing Entidad by RUT
      const existingEntidad = dto.rut
        ? await tx.entidad.findFirst({
            where: { rut: dto.rut, tenantId },
          })
        : null;

      let entidadId: string;

      if (existingEntidad) {
        // Reuse and update existing Entidad
        await tx.entidad.update({
          where: { id: existingEntidad.id },
          data: {
            ...syncData,
            tipoEntidad: TipoEntidad.CLIENTE,
            activo: true,
          },
        });
        entidadId = existingEntidad.id;
        this.logger.log(
          `Reutilizando entidad existente: ${existingEntidad.id}`,
        );
      } else {
        // Create new Entidad
        const newEntidad = await tx.entidad.create({
          data: {
            nombre: nombreField,
            rut: dto.rut,
            contacto: dto.contacto,
            email: dto.email,
            telefono: dto.telefono,
            direccion: dto.direccion,
            comunaId: dto.comunaId,
            tipoEntidad: TipoEntidad.CLIENTE,
            activo: true,
            tenantId,
          },
        });
        entidadId = newEntidad.id;
      }

      // Create Cliente
      const client = await tx.cliente.create({
        data: {
          nombre: dto.nombre,
          razonSocial: dto.razonSocial,
          rut: dto.rut,
          contacto: dto.contacto,
          email: dto.email,
          telefono: dto.telefono,
          direccion: dto.direccion,
          comunaId: dto.comunaId,
          esPersona,
          activo: true,
          tenantId,
          entidadId,
          tipoEntidad: TipoEntidad.CLIENTE,
        },
        include: this.clienteInclude,
      });

      this.logger.log(`Cliente creado: ${client.rut} (Entidad: ${entidadId})`);
      return new ClientResponseDto(client);
    });
  }

  async update(
    id: string,
    dto: UpdateClientDto,
    tenantId: string,
  ): Promise<ClientResponseDto> {
    const client = await this.prisma.cliente.findFirst({
      where: { id, tenantId },
      include: { entidad: true },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // RUT uniqueness check (if changing)
    if (dto.rut && dto.rut !== client.rut) {
      const duplicate = await this.prisma.cliente.findFirst({
        where: { rut: dto.rut, tenantId, id: { not: id } },
      });
      if (duplicate) {
        throw new ConflictException('Ya existe otro cliente con este RUT');
      }
    }

    // Validate comunaId if provided
    if (dto.comunaId) {
      const comuna = await this.prisma.comuna.findUnique({
        where: { id: dto.comunaId },
      });
      if (!comuna) {
        throw new BadRequestException('comunaId no es válido');
      }
    }

    // Determine esPersona if not provided
    const esPersona =
      dto.esPersona !== undefined ? dto.esPersona : client.esPersona;

    const nombreField = this.determineNombreField(dto);

    const syncData = {
      ...this.getSyncFields(dto),
      nombre: nombreField,
      esPersona,
    };

    return this.prisma.$transaction(async (tx) => {
      const updatedClient = await tx.cliente.update({
        where: { id },
        data: {
          nombre: dto.nombre,
          razonSocial: dto.razonSocial,
          rut: dto.rut,
          contacto: dto.contacto,
          email: dto.email,
          telefono: dto.telefono,
          direccion: dto.direccion,
          comunaId: dto.comunaId,
          activo: dto.activo,
          esPersona,
        },
        include: this.clienteInclude,
      });

      // Update linked Entidad if exists
      if (client.entidadId) {
        await tx.entidad.update({
          where: { id: client.entidadId },
          data: {
            ...syncData,
            tipoEntidad: TipoEntidad.CLIENTE,
          },
        });
      }

      this.logger.log(`Cliente actualizado: ${updatedClient.rut}`);
      return new ClientResponseDto(updatedClient);
    });
  }

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    const client = await this.prisma.cliente.findFirst({
      where: { id, tenantId },
      select: { id: true, entidadId: true, rut: true },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.cliente.update({
        where: { id },
        data: { activo: false },
      });

      if (client.entidadId) {
        await tx.entidad.update({
          where: { id: client.entidadId },
          data: { activo: false },
        });
      }
    });

    this.logger.log(`Cliente y entidad desactivados: ${client.rut}`);
    return { message: 'Cliente desactivado exitosamente' };
  }

  async findByRut(
    rut: string,
    tenantId: string,
  ): Promise<ClientResponseDto | null> {
    const client = await this.prisma.cliente.findFirst({
      where: { rut, tenantId },
      include: this.clienteInclude,
    });

    return client ? new ClientResponseDto(client) : null;
  }

  async getStats(tenantId: string): Promise<ClientStatsDto> {
    const [total, activos, inactivos] = await this.prisma.$transaction([
      this.prisma.cliente.count({ where: { tenantId } }),
      this.prisma.cliente.count({ where: { tenantId, activo: true } }),
      this.prisma.cliente.count({ where: { tenantId, activo: false } }),
    ]);

    return new ClientStatsDto({ total, activos, inactivos });
  }
}
