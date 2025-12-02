import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTipoServicioDto } from '../dto/create-tipo-servicio.dto';
import { UpdateTipoServicioDto } from '../dto/update-tipo-servicio.dto';
import { TipoServicioFilterDto } from '../dto/tipo-servicio-filter.dto';
import { TipoServicioResponseDto } from '../dto/tipo-servicio-response.dto';

@Injectable()
export class TipoServicioService {
  private readonly logger = new Logger(TipoServicioService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(
    filter: TipoServicioFilterDto,
    tenantId: string,
  ): Promise<{ tiposServicio: TipoServicioResponseDto[]; total: number }> {
    try {
      const { search, activo, visible, page = 1, limit = 10 } = filter;

      // ADD COMPREHENSIVE DEBUGGING (SAME AS TIPO CARGA)
      this.logger.debug('=== TIPO SERVICIO FILTER DEBUG ===');
      this.logger.debug(`Received filter object: ${JSON.stringify(filter)}`);
      this.logger.debug(
        `activo parameter type: ${typeof activo}, value: ${activo}`,
      );
      this.logger.debug(`tenantId: ${tenantId}`);

      const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
      const limitNumber =
        typeof limit === 'string' ? parseInt(limit, 10) : limit;
      const skip = (pageNumber - 1) * limitNumber;

      const where: any = {
        tenantId,
      };

      // Activo filter with detailed logging
      if (activo !== undefined) {
        this.logger.debug(
          `Applying activo filter: ${activo} (type: ${typeof activo})`,
        );
        where.activo = activo;
      } else {
        this.logger.debug('No activo filter applied');
      }

      // Search filter
      if (search) {
        where.OR = [
          { nombre: { contains: search, mode: 'insensitive' } },
          { codigo: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } },
        ];
        this.logger.debug(`Applied search filter: ${search}`);
      }

      // Visible filter
      if (visible !== undefined) {
        where.visible = visible;
        this.logger.debug(`Applied visible filter: ${visible}`);
      }

      this.logger.debug(`Final WHERE clause: ${JSON.stringify(where)}`);

      // Test query to see what's in the database
      const allRecords = await this.prisma.tipoServicio.findMany({
        where: { tenantId },
        select: { id: true, nombre: true, activo: true, codigo: true },
      });
      this.logger.debug(`All records in DB: ${JSON.stringify(allRecords)}`);

      const [tiposServicio, total] = await this.prisma.$transaction([
        this.prisma.tipoServicio.findMany({
          where,
          skip,
          take: limitNumber,
          orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
        }),
        this.prisma.tipoServicio.count({ where }),
      ]);

      this.logger.debug(
        `Query returned ${tiposServicio.length} tipos de servicio`,
      );
      this.logger.debug(`Total count: ${total}`);
      this.logger.debug('=== END DEBUG ===');

      return {
        tiposServicio: tiposServicio.map(
          (tipoServicio) => new TipoServicioResponseDto(tipoServicio),
        ),
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching tipos de servicio:', error);
      throw error;
    }
  }

  async findOne(
    id: string,
    tenantId: string,
  ): Promise<TipoServicioResponseDto> {
    try {
      const tipoServicio = await this.prisma.tipoServicio.findFirst({
        where: {
          id,
          tenantId,
        },
      });

      if (!tipoServicio) {
        throw new NotFoundException('Tipo de servicio not found');
      }

      return new TipoServicioResponseDto(tipoServicio);
    } catch (error) {
      this.logger.error(`Error fetching tipo de servicio ${id}:`, error);
      throw error;
    }
  }

  async findByCodigo(
    codigo: string,
    tenantId: string,
  ): Promise<TipoServicioResponseDto> {
    try {
      const tipoServicio = await this.prisma.tipoServicio.findFirst({
        where: {
          codigo,
          tenantId,
        },
      });

      if (!tipoServicio) {
        throw new NotFoundException('Tipo de servicio not found');
      }

      return new TipoServicioResponseDto(tipoServicio);
    } catch (error) {
      this.logger.error(
        `Error fetching tipo de servicio by codigo ${codigo}:`,
        error,
      );
      throw error;
    }
  }

  async create(
    createTipoServicioDto: CreateTipoServicioDto,
    tenantId: string,
  ): Promise<TipoServicioResponseDto> {
    try {
      // Check if codigo already exists (unique constraint)
      const existingByCodigo = await this.prisma.tipoServicio.findFirst({
        where: {
          codigo: createTipoServicioDto.codigo,
        },
      });

      if (existingByCodigo) {
        throw new ConflictException(
          'Ya existe un tipo de servicio con este código',
        );
      }

      // Check if nombre already exists for this tenant
      const existingByNombre = await this.prisma.tipoServicio.findFirst({
        where: {
          nombre: createTipoServicioDto.nombre,
          tenantId,
        },
      });

      if (existingByNombre) {
        throw new ConflictException(
          'Ya existe un tipo de servicio con este nombre',
        );
      }

      const tipoServicio = await this.prisma.tipoServicio.create({
        data: {
          ...createTipoServicioDto,
          tenantId,
        },
      });

      this.logger.log(
        `Tipo de servicio created successfully: ${tipoServicio.nombre}`,
      );
      return new TipoServicioResponseDto(tipoServicio);
    } catch (error) {
      this.logger.error('Error creating tipo de servicio:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateTipoServicioDto: UpdateTipoServicioDto,
    tenantId: string,
  ): Promise<TipoServicioResponseDto> {
    try {
      // Verify tipoServicio exists and belongs to tenant
      const existingTipoServicio = await this.prisma.tipoServicio.findFirst({
        where: { id, tenantId },
      });

      if (!existingTipoServicio) {
        throw new NotFoundException('Tipo de servicio not found');
      }

      // Check if codigo is being updated and if it conflicts
      if (
        updateTipoServicioDto.codigo &&
        updateTipoServicioDto.codigo !== existingTipoServicio.codigo
      ) {
        const duplicateByCodigo = await this.prisma.tipoServicio.findFirst({
          where: {
            codigo: updateTipoServicioDto.codigo,
            id: { not: id },
          },
        });

        if (duplicateByCodigo) {
          throw new ConflictException(
            'Another tipo de servicio with this code already exists',
          );
        }
      }

      // Check if nombre is being updated and if it conflicts
      if (
        updateTipoServicioDto.nombre &&
        updateTipoServicioDto.nombre !== existingTipoServicio.nombre
      ) {
        const duplicateByNombre = await this.prisma.tipoServicio.findFirst({
          where: {
            nombre: updateTipoServicioDto.nombre,
            tenantId,
            id: { not: id },
          },
        });

        if (duplicateByNombre) {
          throw new ConflictException(
            'Another tipo de servicio with this name already exists',
          );
        }
      }

      const tipoServicio = await this.prisma.tipoServicio.update({
        where: { id },
        data: updateTipoServicioDto,
      });

      this.logger.log(
        `Tipo de servicio updated successfully: ${tipoServicio.nombre}`,
      );
      return new TipoServicioResponseDto(tipoServicio);
    } catch (error) {
      this.logger.error(`Error updating tipo de servicio ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, tenantId: string): Promise<void> {
    try {
      // Verify tipoServicio exists and belongs to tenant
      const existingTipoServicio = await this.prisma.tipoServicio.findFirst({
        where: { id, tenantId },
      });

      if (!existingTipoServicio) {
        throw new NotFoundException('Tipo de servicio not found');
      }

      // Check if tipoServicio is being used in any orders
      const ordersUsingTipoServicio = await this.prisma.orden.count({
        where: {
          tipoServicioId: id,
          tenantId,
        },
      });

      if (ordersUsingTipoServicio > 0) {
        throw new BadRequestException(
          'No se puede eliminar el tipo de servicio porque está siendo utilizado en órdenes',
        );
      }

      // Check if tipoServicio is being used in any coberturas
      const coberturasUsingTipoServicio = await this.prisma.cobertura.count({
        where: {
          tipoServicioId: id,
          tenantId,
        },
      });

      if (coberturasUsingTipoServicio > 0) {
        throw new BadRequestException(
          'No se puede eliminar el tipo de servicio porque está siendo utilizado en coberturas',
        );
      }

      await this.prisma.tipoServicio.delete({
        where: { id },
      });

      this.logger.log(`Tipo de servicio ${id} deleted`);
    } catch (error) {
      this.logger.error(`Error deleting tipo de servicio ${id}:`, error);
      throw error;
    }
  }

  // Soft delete by setting activo to false
  async deactivate(
    id: string,
    tenantId: string,
  ): Promise<TipoServicioResponseDto> {
    try {
      const existingTipoServicio = await this.prisma.tipoServicio.findFirst({
        where: { id, tenantId },
      });

      if (!existingTipoServicio) {
        throw new NotFoundException('Tipo de servicio not found');
      }

      const tipoServicio = await this.prisma.tipoServicio.update({
        where: { id },
        data: { activo: false },
      });

      this.logger.log(`Tipo de servicio deactivated: ${tipoServicio.nombre}`);
      return new TipoServicioResponseDto(tipoServicio);
    } catch (error) {
      this.logger.error(`Error deactivating tipo de servicio ${id}:`, error);
      throw error;
    }
  }
}
