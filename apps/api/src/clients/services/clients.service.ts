import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { ClientsFilterDto } from '../dto/clients-filter.dto';
import { ClientResponseDto } from '../dto/client-response.dto';
import { TipoEntidad } from '@prisma/client';
import { ClientStatsDto } from '../dto/client-stats.dto';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    filter: ClientsFilterDto,
    tenantId: string,
  ): Promise<{ clients: ClientResponseDto[]; total: number }> {
    try {
      const { search, activo, page = 1, limit = 10 } = filter;

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

      const [clients, total] = await this.prisma.$transaction([
        this.prisma.cliente.findMany({
          where,
          include: {
            comuna: {
              include: {
                region: true,
                provincia: true,
              },
            },
            entidad: true,
          },
          skip,
          take: limitNumber,
          orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
        }),
        this.prisma.cliente.count({ where }),
      ]);

      return {
        clients: clients.map((client) => new ClientResponseDto(client)),
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching clients:', error);
      throw error;
    }
  }

  async findOne(id: string, tenantId: string): Promise<ClientResponseDto> {
    try {
      const client = await this.prisma.cliente.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          comuna: {
            include: {
              region: true,
              provincia: true,
            },
          },
          entidad: true,
        },
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }

      return new ClientResponseDto(client);
    } catch (error) {
      this.logger.error(`Error fetching client ${id}:`, error);
      throw error;
    }
  }

  async create(
    createClientDto: CreateClientDto,
    tenantId: string,
  ): Promise<ClientResponseDto> {
    try {
      // Check if RUT already exists for this tenant in Cliente
      const existingClient = await this.prisma.cliente.findFirst({
        where: {
          rut: createClientDto.rut,
          tenantId,
        },
      });

      if (existingClient) {
        throw new ConflictException('Client with this RUT already exists');
      }

      // Verify comuna exists
      const comuna = await this.prisma.comuna.findUnique({
        where: { id: createClientDto.comunaId },
      });

      if (!comuna) {
        throw new BadRequestException('Invalid comunaId');
      }

      // Check if Entidad already exists - but don't fail, just use it
      const existingEntidad = await this.prisma.entidad.findFirst({
        where: {
          rut: createClientDto.rut,
          tenantId,
        },
      });

      let entidadId: string;

      if (existingEntidad) {
        // Update existing Entidad to ensure data consistency
        await this.prisma.entidad.update({
          where: { id: existingEntidad.id },
          data: {
            nombre: createClientDto.nombre || createClientDto.razonSocial,
            razonSocial: createClientDto.razonSocial,
            contacto: createClientDto.contacto,
            email: createClientDto.email,
            telefono: createClientDto.telefono,
            direccion: createClientDto.direccion,
            comunaId: createClientDto.comunaId,
            esPersona: createClientDto.esPersona ?? false,
            tipoEntidad: TipoEntidad.CLIENTE,
            activo: true, // Reactivate if was inactive
          },
        });
        entidadId = existingEntidad.id;
        this.logger.log(`Linked to existing Entidad: ${existingEntidad.rut}`);
      } else {
        // Create new Entidad
        const newEntidad = await this.prisma.entidad.create({
          data: {
            nombre: createClientDto.nombre || createClientDto.razonSocial,
            razonSocial: createClientDto.razonSocial,
            rut: createClientDto.rut,
            contacto: createClientDto.contacto,
            email: createClientDto.email,
            telefono: createClientDto.telefono,
            direccion: createClientDto.direccion,
            comunaId: createClientDto.comunaId,
            esPersona: createClientDto.esPersona ?? false,
            activo: true,
            tipoEntidad: TipoEntidad.CLIENTE,
            tenantId,
          },
        });
        entidadId = newEntidad.id;
      }

      // Create Cliente with entidadId link
      const client = await this.prisma.cliente.create({
        data: {
          nombre: createClientDto.nombre,
          razonSocial: createClientDto.razonSocial,
          rut: createClientDto.rut,
          contacto: createClientDto.contacto,
          email: createClientDto.email,
          telefono: createClientDto.telefono,
          direccion: createClientDto.direccion,
          comunaId: createClientDto.comunaId,
          esPersona: createClientDto.esPersona ?? false,
          activo: true,
          tipoEntidad: TipoEntidad.CLIENTE,
          tenantId,
          entidadId: entidadId,
        },
        include: {
          comuna: {
            include: {
              region: true,
              provincia: true,
            },
          },
          entidad: true, // Include entidad to check if it exists
        },
      });

      this.logger.log(`Client created successfully: ${client.rut}`);
      return new ClientResponseDto(client);
    } catch (error) {
      this.logger.error('Error creating client:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
    tenantId: string,
  ): Promise<ClientResponseDto> {
    try {
      // Verify client exists and belongs to tenant
      const existingClient = await this.prisma.cliente.findFirst({
        where: { id, tenantId },
        include: {
          entidad: true, // Include entidad to check if it exists
        },
      });

      if (!existingClient) {
        throw new NotFoundException('Client not found');
      }

      // Check for RUT conflict if RUT is being updated
      if (updateClientDto.rut && updateClientDto.rut !== existingClient.rut) {
        const duplicateClient = await this.prisma.cliente.findFirst({
          where: {
            rut: updateClientDto.rut,
            tenantId,
            id: { not: id },
          },
        });

        if (duplicateClient) {
          throw new ConflictException(
            'Another client with this RUT already exists',
          );
        }
      }

      // Verify comuna exists if comunaId is being updated
      if (updateClientDto.comunaId) {
        const comuna = await this.prisma.comuna.findUnique({
          where: { id: updateClientDto.comunaId },
        });

        if (!comuna) {
          throw new BadRequestException('Invalid comunaId');
        }
      }

      // Also update the linked Entidad if it exists
      if (existingClient.entidadId) {
        await this.prisma.entidad.update({
          where: {
            id: existingClient.entidadId,
          },
          data: {
            ...(updateClientDto.nombre && { nombre: updateClientDto.nombre }),
            ...(updateClientDto.razonSocial && {
              razonSocial: updateClientDto.razonSocial,
            }),
            ...(updateClientDto.rut && { rut: updateClientDto.rut }),
            ...(updateClientDto.contacto && {
              contacto: updateClientDto.contacto,
            }),
            ...(updateClientDto.email && { email: updateClientDto.email }),
            ...(updateClientDto.telefono && {
              telefono: updateClientDto.telefono,
            }),
            ...(updateClientDto.direccion && {
              direccion: updateClientDto.direccion,
            }),
            ...(updateClientDto.comunaId && {
              comunaId: updateClientDto.comunaId,
            }),
            ...(updateClientDto.esPersona !== undefined && {
              esPersona: updateClientDto.esPersona,
            }),
          },
        });
      }

      const client = await this.prisma.cliente.update({
        where: { id },
        data: updateClientDto,
        include: {
          comuna: {
            include: {
              region: true,
              provincia: true,
            },
          },
          entidad: true, // Include entidad relation
        },
      });

      this.logger.log(`Client updated successfully: ${client.rut}`);
      return new ClientResponseDto(client);
    } catch (error) {
      this.logger.error(`Error updating client ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, tenantId: string): Promise<void> {
    try {
      // Verify client exists and belongs to tenant
      const existingClient = await this.prisma.cliente.findFirst({
        where: { id, tenantId },
      });

      if (!existingClient) {
        throw new NotFoundException('Client not found');
      }

      // Use transaction to deactivate both Cliente and Entidad
      await this.prisma.$transaction([
        // Soft delete cliente
        this.prisma.cliente.update({
          where: { id },
          data: { activo: false },
        }),
        // Soft delete corresponding entidad if it exists
        ...(existingClient.entidadId
          ? [
              this.prisma.entidad.update({
                where: { id: existingClient.entidadId },
                data: { activo: false },
              }),
            ]
          : []),
      ]);

      this.logger.log(`Client ${id} and corresponding Entity deactivated`);
    } catch (error) {
      this.logger.error(`Error deactivating client ${id}:`, error);
      throw error;
    }
  }

  async findByRut(
    rut: string,
    tenantId: string,
  ): Promise<ClientResponseDto | null> {
    try {
      const client = await this.prisma.cliente.findFirst({
        where: {
          rut,
          tenantId,
        },
        include: {
          comuna: {
            include: {
              region: true,
              provincia: true,
            },
          },
          entidad: true, // Include entidad relation
        },
      });

      return client ? new ClientResponseDto(client) : null;
    } catch (error) {
      this.logger.error(`Error finding client by RUT ${rut}:`, error);
      throw error;
    }
  }

  async getStats(tenantId: string): Promise<ClientStatsDto> {
    try {
      // Get total count
      const total = await this.prisma.cliente.count({
        where: { tenantId },
      });

      // Get active count
      const activos = await this.prisma.cliente.count({
        where: {
          tenantId,
          activo: true,
        },
      });

      // Get inactive count
      const inactivos = await this.prisma.cliente.count({
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
      this.logger.error('Error fetching client stats:', error);
      throw error;
    }
  }
}
