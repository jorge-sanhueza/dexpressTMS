import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  Client,
  CreateClientDto,
  UpdateClientDto,
  ClientsFilterDto,
} from '../interfaces/client.interface';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    filter: ClientsFilterDto,
    tenantId: string,
  ): Promise<{ clients: Client[]; total: number }> {
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
              },
            },
          },
          skip,
          take: limitNumber,
          orderBy: { nombre: 'asc' },
        }),
        this.prisma.cliente.count({ where }),
      ]);

      return {
        clients: clients as unknown as Client[],
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching clients:', error);
      throw error;
    }
  }

  async findOne(id: string, tenantId: string): Promise<Client> {
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
            },
          },
        },
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }

      return client as unknown as Client;
    } catch (error) {
      this.logger.error(`Error fetching client ${id}:`, error);
      throw error;
    }
  }

  async create(
    createClientDto: CreateClientDto,
    tenantId: string,
  ): Promise<Client> {
    try {
      // Check if RUT already exists
      const existingClient = await this.prisma.cliente.findFirst({
        where: {
          rut: createClientDto.rut,
          tenantId,
        },
      });

      if (existingClient) {
        throw new BadRequestException('Client with this RUT already exists');
      }

      const client = await this.prisma.cliente.create({
        data: {
          ...createClientDto,
          activo: true,
          estado: 'activo',
          tipoEntidad: 'cliente',
          tenantId,
        },
        include: {
          comuna: {
            include: {
              region: true,
            },
          },
        },
      });

      return client as unknown as Client;
    } catch (error) {
      this.logger.error('Error creating client:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
    tenantId: string,
  ): Promise<Client> {
    try {
      // Verify client exists and belongs to tenant
      const existingClient = await this.prisma.cliente.findFirst({
        where: { id, tenantId },
      });

      if (!existingClient) {
        throw new NotFoundException('Client not found');
      }

      const client = await this.prisma.cliente.update({
        where: { id },
        data: updateClientDto,
        include: {
          comuna: {
            include: {
              region: true,
            },
          },
        },
      });

      return client as unknown as Client;
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
}
