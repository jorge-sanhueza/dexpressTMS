import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EntidadesFilterDto } from '../dto/entidades-filter.dto';
import { EntidadResponseDto } from '../dto/entidad-response.dto';

@Injectable()
export class EntidadesService {
  private readonly logger = new Logger(EntidadesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    filter: EntidadesFilterDto,
    tenantId: string,
  ): Promise<{ entidades: EntidadResponseDto[]; total: number }> {
    try {
      const { search, tipoEntidad, activo, page = 1, limit = 10 } = filter;

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
        ];
      }

      // TipoEntidad filter
      if (tipoEntidad) {
        where.tipoEntidad = tipoEntidad;
      }

      // Activo filter
      if (activo !== undefined) {
        where.activo = activo;
      }

      const [entidades, total] = await this.prisma.$transaction([
        this.prisma.entidad.findMany({
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
        this.prisma.entidad.count({ where }),
      ]);

      return {
        entidades: entidades.map((entidad) => new EntidadResponseDto(entidad)),
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching entidades:', error);
      throw error;
    }
  }

  async findOne(id: string, tenantId: string): Promise<EntidadResponseDto> {
    try {
      const entidad = await this.prisma.entidad.findFirst({
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

      if (!entidad) {
        throw new NotFoundException('Entidad not found');
      }

      return new EntidadResponseDto(entidad);
    } catch (error) {
      this.logger.error(`Error fetching entidad ${id}:`, error);
      throw error;
    }
  }
}
