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
import { TipoEntidad } from '@prisma/client';

@Injectable()
export class EmbarcadoresService {
  private readonly logger = new Logger(EmbarcadoresService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    filter: EmbarcadoresFilterDto,
    tenantId: string,
  ): Promise<{ embarcadores: EmbarcadorResponseDto[]; total: number }> {
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

      const [embarcadores, total] = await this.prisma.$transaction([
        this.prisma.embarcador.findMany({
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
          },
          skip,
          take: limitNumber,
          orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
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

  async findOne(id: string, tenantId: string): Promise<EmbarcadorResponseDto> {
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
  ): Promise<EmbarcadorResponseDto> {
    try {
      // Check if RUT already exists for this tenant
      const existingEmbarcador = await this.prisma.embarcador.findFirst({
        where: {
          rut: createEmbarcadorDto.rut,
          tenantId,
        },
      });

      if (existingEmbarcador) {
        throw new ConflictException('Embarcador with this RUT already exists');
      }

      // Verify comuna exists
      const comuna = await this.prisma.comuna.findUnique({
        where: { id: createEmbarcadorDto.comunaId },
      });

      if (!comuna) {
        throw new BadRequestException('Invalid comunaId');
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
          esPersona: createEmbarcadorDto.esPersona ?? false,
          activo: true,
          tipoEntidad: TipoEntidad.EMBARCADOR,
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

      this.logger.log(`Embarcador created successfully: ${embarcador.rut}`);
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
  ): Promise<EmbarcadorResponseDto> {
    try {
      // Verify embarcador exists and belongs to tenant
      const existingEmbarcador = await this.prisma.embarcador.findFirst({
        where: { id, tenantId },
      });

      if (!existingEmbarcador) {
        throw new NotFoundException('Embarcador not found');
      }

      // Check for RUT conflict if RUT is being updated
      if (
        updateEmbarcadorDto.rut &&
        updateEmbarcadorDto.rut !== existingEmbarcador.rut
      ) {
        const duplicateEmbarcador = await this.prisma.embarcador.findFirst({
          where: {
            rut: updateEmbarcadorDto.rut,
            tenantId,
            id: { not: id },
          },
        });

        if (duplicateEmbarcador) {
          throw new ConflictException(
            'Another embarcador with this RUT already exists',
          );
        }
      }

      // Verify comuna exists if comunaId is being updated
      if (updateEmbarcadorDto.comunaId) {
        const comuna = await this.prisma.comuna.findUnique({
          where: { id: updateEmbarcadorDto.comunaId },
        });

        if (!comuna) {
          throw new BadRequestException('Invalid comunaId');
        }
      }

      const embarcador = await this.prisma.embarcador.update({
        where: { id },
        data: updateEmbarcadorDto,
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

      this.logger.log(`Embarcador updated successfully: ${embarcador.rut}`);
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

  async findByRut(
    rut: string,
    tenantId: string,
  ): Promise<EmbarcadorResponseDto | null> {
    try {
      const embarcador = await this.prisma.embarcador.findFirst({
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
        },
      });

      return embarcador ? new EmbarcadorResponseDto(embarcador) : null;
    } catch (error) {
      this.logger.error(`Error finding embarcador by RUT ${rut}:`, error);
      throw error;
    }
  }
}
