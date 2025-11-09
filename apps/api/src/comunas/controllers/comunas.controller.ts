import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('api/comunas')
@UseGuards(JwtGuard)
export class ComunasController {
  private readonly logger = new Logger(ComunasController.name);

  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('regionId') regionId?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const take = limit ? parseInt(limit) : 50;

      const where: any = {
        visible: true,
      };

      // Search filter
      if (search) {
        where.OR = [
          { nombre: { contains: search, mode: 'insensitive' } },
          {
            region: {
              nombre: { contains: search, mode: 'insensitive' },
            },
          },
          {
            provincia: {
              nombre: { contains: search, mode: 'insensitive' },
            },
          },
        ];
      }

      // Region filter
      if (regionId) {
        where.regionId = regionId;
      }

      const comunas = await this.prisma.comuna.findMany({
        where,
        include: {
          region: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
            },
          },
          provincia: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
        take,
        orderBy: [
          {
            region: {
              ordinal: 'asc',
            },
          },
          {
            provincia: {
              orden: 'asc',
            },
          },
          {
            orden: 'asc',
          },
          {
            nombre: 'asc',
          },
        ],
      });

      return comunas.map((comuna) => ({
        id: comuna.id,
        nombre: comuna.nombre,
        region: comuna.region
          ? {
              id: comuna.region.id,
              nombre: comuna.region.nombre,
              codigo: comuna.region.codigo,
            }
          : null,
        provincia: comuna.provincia
          ? {
              id: comuna.provincia.id,
              nombre: comuna.provincia.nombre,
            }
          : null,
      }));
    } catch (error) {
      this.logger.error('Error fetching comunas:', error);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log(`Fetching comuna with id: ${id}`);
    try {
      const comuna = await this.prisma.comuna.findFirst({
        where: {
          id,
          visible: true,
        },
        include: {
          region: {
            select: {
              id: true,
              nombre: true,
              codigo: true,
            },
          },
          provincia: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });

      if (!comuna) {
        return null;
      }

      return {
        id: comuna.id,
        nombre: comuna.nombre,
        region: comuna.region
          ? {
              id: comuna.region.id,
              nombre: comuna.region.nombre,
              codigo: comuna.region.codigo,
            }
          : null,
        provincia: comuna.provincia
          ? {
              id: comuna.provincia.id,
              nombre: comuna.provincia.nombre,
            }
          : null,
      };
    } catch (error) {
      this.logger.error(`Error fetching comuna ${id}:`, error);
      throw error;
    }
  }
}
