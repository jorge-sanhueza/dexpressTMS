import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EmbarcadorResponseDto } from '../dto/embarcador-response.dto';
import {
  CreateEmbarcadorDto,
  UpdateEmbarcadorDto,
  Embarcador,
  EmbarcadoresFilterDto,
} from '../interfaces/embarcador.interface';

@Injectable()
export class EmbarcadoresService {
  private readonly logger = new Logger(EmbarcadoresService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    filter: EmbarcadoresFilterDto,
    tenantId: string,
  ): Promise<{ embarcadores: Embarcador[]; total: number }> {
    try {
      const { search, activo, tipo, page = 1, limit = 10 } = filter;

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

      // Type filter
      if (tipo) {
        where.tipo = tipo;
      }

      const [embarcadores, total] = await this.prisma.$transaction([
        this.prisma.embarcador.findMany({
          where,
          include: {
            comuna: true,
          },
          skip,
          take: limitNumber,
          orderBy: { nombre: 'asc' },
        }),
        this.prisma.embarcador.count({ where }),
      ]);

      return {
        embarcadores: embarcadores.map(
          (embarcador) => new EmbarcadorResponseDto(embarcador),
        ),
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching embarcadores:', error);
      throw error;
    }
  }

  async findOne(id: string, tenantId: string): Promise<Embarcador> {
    try {
      const embarcador = await this.prisma.embarcador.findFirst({
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

      if (!embarcador) {
        throw new NotFoundException('Embarcador not found');
      }

      return new EmbarcadorResponseDto(embarcador);
    } catch (error) {
      this.logger.error(`Error fetching embarcador ${id}:`, error);
      throw error;
    }
  }

  async create(
    createEmbarcadorDto: CreateEmbarcadorDto,
    tenantId: string,
  ): Promise<Embarcador> {
    try {
      // Check if RUT already exists
      const existingEmbarcador = await this.prisma.embarcador.findFirst({
        where: {
          rut: createEmbarcadorDto.rut,
          tenantId,
        },
      });

      if (existingEmbarcador) {
        throw new BadRequestException('RUT already exists');
      }

      // Get active status
      const activeStatus = await this.prisma.estadoRegistro.findFirst({
        where: { estado: 'activo' },
      });

      if (!activeStatus) {
        throw new NotFoundException('Active status not found');
      }

      const embarcador = await this.prisma.embarcador.create({
        data: {
          nombre: createEmbarcadorDto.nombre,
          razonSocial: createEmbarcadorDto.razonSocial,
          rut: createEmbarcadorDto.rut,
          contacto: createEmbarcadorDto.contacto,
          email: createEmbarcadorDto.email,
          telefono: createEmbarcadorDto.telefono,
          direccion: createEmbarcadorDto.direccion,
          comunaId: createEmbarcadorDto.comunaId,
          tipo: createEmbarcadorDto.tipo,
          activo: true,
          estado: 'activo',
          tenantId: tenantId,
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

      return new EmbarcadorResponseDto(embarcador);
    } catch (error) {
      this.logger.error('Error creating embarcador:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateEmbarcadorDto: UpdateEmbarcadorDto,
    tenantId: string,
  ): Promise<Embarcador> {
    try {
      // Verify embarcador exists and belongs to tenant
      const existingEmbarcador = await this.prisma.embarcador.findFirst({
        where: { id, tenantId },
      });

      if (!existingEmbarcador) {
        throw new NotFoundException('Embarcador not found');
      }

      // Check if RUT is being updated and if it already exists
      if (
        updateEmbarcadorDto.rut &&
        updateEmbarcadorDto.rut !== existingEmbarcador.rut
      ) {
        const rutExists = await this.prisma.embarcador.findFirst({
          where: {
            rut: updateEmbarcadorDto.rut,
            tenantId,
            NOT: { id },
          },
        });

        if (rutExists) {
          throw new BadRequestException('RUT already exists');
        }
      }

      const embarcador = await this.prisma.embarcador.update({
        where: { id },
        data: {
          nombre: updateEmbarcadorDto.nombre,
          razonSocial: updateEmbarcadorDto.razonSocial,
          rut: updateEmbarcadorDto.rut,
          contacto: updateEmbarcadorDto.contacto,
          email: updateEmbarcadorDto.email,
          telefono: updateEmbarcadorDto.telefono,
          direccion: updateEmbarcadorDto.direccion,
          comunaId: updateEmbarcadorDto.comunaId,
          tipo: updateEmbarcadorDto.tipo,
          activo: updateEmbarcadorDto.activo,
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

      return new EmbarcadorResponseDto(embarcador);
    } catch (error) {
      this.logger.error(`Error updating embarcador ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    try {
      // Verify embarcador exists and belongs to tenant
      const existingEmbarcador = await this.prisma.embarcador.findFirst({
        where: { id, tenantId },
      });

      if (!existingEmbarcador) {
        throw new NotFoundException('Embarcador not found');
      }

      // Soft delete by setting activo to false
      await this.prisma.embarcador.update({
        where: { id },
        data: { activo: false },
      });

      this.logger.log(`Embarcador ${id} deactivated`);
      return { message: 'Embarcador deactivated successfully' };
    } catch (error) {
      this.logger.error(`Error deactivating embarcador ${id}:`, error);
      throw error;
    }
  }
}
