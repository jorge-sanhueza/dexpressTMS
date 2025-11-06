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
      // Check if RUT already exists for this tenant
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
        },
        include: {
          comuna: {
            include: {
              region: true,
              provincia: true,
            },
          },
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

      // Soft delete by setting activo to false
      await this.prisma.cliente.update({
        where: { id },
        data: { activo: false },
      });

      this.logger.log(`Client ${id} deactivated`);
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
        },
      });

      return client ? new ClientResponseDto(client) : null;
    } catch (error) {
      this.logger.error(`Error finding client by RUT ${rut}:`, error);
      throw error;
    }
  }
}
