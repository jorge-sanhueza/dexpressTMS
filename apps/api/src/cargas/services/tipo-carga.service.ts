import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateTipoCargaDto } from '../dto/create-tipo-carga.dto';
import { UpdateTipoCargaDto } from '../dto/update-tipo-carga.dto';
import { TipoCargaFilterDto } from '../dto/tipo-carga-filter.dto';
import { TipoCargaResponseDto } from '../dto/tipo-carga-response.dto';

@Injectable()
export class TipoCargaService {
  private readonly logger = new Logger(TipoCargaService.name);

  constructor(private prisma: PrismaService) {}

async findAll(
  filter: TipoCargaFilterDto,
  tenantId: string,
): Promise<{ tiposCarga: TipoCargaResponseDto[]; total: number }> {
  try {
    const {
      search,
      activo,
      visible,
      page = 1,
      limit = 10,
    } = filter;

    // ADD COMPREHENSIVE DEBUGGING
    this.logger.debug('=== TIPO CARGA FILTER DEBUG ===');
    this.logger.debug(`Received filter object: ${JSON.stringify(filter)}`);
    this.logger.debug(`activo parameter type: ${typeof activo}, value: ${activo}`);
    this.logger.debug(`tenantId: ${tenantId}`);

    const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNumber = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {
      tenantId,
    };

    // Activo filter with detailed logging
    if (activo !== undefined) {
      this.logger.debug(`Applying activo filter: ${activo} (type: ${typeof activo})`);
      where.activo = activo;
    } else {
      this.logger.debug('No activo filter applied');
    }

    // Search filter
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { observaciones: { contains: search, mode: 'insensitive' } },
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
    const allRecords = await this.prisma.tipoCarga.findMany({
      where: { tenantId },
      select: { id: true, nombre: true, activo: true }
    });
    this.logger.debug(`All records in DB: ${JSON.stringify(allRecords)}`);

    const [tiposCarga, total] = await this.prisma.$transaction([
      this.prisma.tipoCarga.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      }),
      this.prisma.tipoCarga.count({ where }),
    ]);

    this.logger.debug(`Query returned ${tiposCarga.length} tipos de carga`);
    this.logger.debug(`Total count: ${total}`);
    this.logger.debug('=== END DEBUG ===');

    return {
      tiposCarga: tiposCarga.map((tipoCarga) => new TipoCargaResponseDto(tipoCarga)),
      total,
    };
  } catch (error) {
    this.logger.error('Error fetching tipos de carga:', error);
    throw error;
  }
}

  async findOne(id: string, tenantId: string): Promise<TipoCargaResponseDto> {
    try {
      const tipoCarga = await this.prisma.tipoCarga.findFirst({
        where: {
          id,
          tenantId,
        },
      });

      if (!tipoCarga) {
        throw new NotFoundException('Tipo de carga not found');
      }

      return new TipoCargaResponseDto(tipoCarga);
    } catch (error) {
      this.logger.error(`Error fetching tipo de carga ${id}:`, error);
      throw error;
    }
  }

  async create(
    createTipoCargaDto: CreateTipoCargaDto,
    tenantId: string,
  ): Promise<TipoCargaResponseDto> {
    try {
      // Check if nombre already exists for this tenant
      const existingTipoCarga = await this.prisma.tipoCarga.findFirst({
        where: {
          nombre: createTipoCargaDto.nombre,
          tenantId,
        },
      });

      if (existingTipoCarga) {
        throw new ConflictException(
          'Ya existe un tipo de carga con este nombre',
        );
      }

      const tipoCarga = await this.prisma.tipoCarga.create({
        data: {
          ...createTipoCargaDto,
          tenantId,
        },
      });

      this.logger.log(
        `Tipo de carga created successfully: ${tipoCarga.nombre}`,
      );
      return new TipoCargaResponseDto(tipoCarga);
    } catch (error) {
      this.logger.error('Error creating tipo de carga:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateTipoCargaDto: UpdateTipoCargaDto,
    tenantId: string,
  ): Promise<TipoCargaResponseDto> {
    try {
      // Verify tipoCarga exists and belongs to tenant
      const existingTipoCarga = await this.prisma.tipoCarga.findFirst({
        where: { id, tenantId },
      });

      if (!existingTipoCarga) {
        throw new NotFoundException('Tipo de carga not found');
      }

      // Check if nombre is being updated and if it conflicts
      if (
        updateTipoCargaDto.nombre &&
        updateTipoCargaDto.nombre !== existingTipoCarga.nombre
      ) {
        const duplicateTipoCarga = await this.prisma.tipoCarga.findFirst({
          where: {
            nombre: updateTipoCargaDto.nombre,
            tenantId,
            id: { not: id },
          },
        });

        if (duplicateTipoCarga) {
          throw new ConflictException(
            'Another tipo de carga with this name already exists',
          );
        }
      }

      const tipoCarga = await this.prisma.tipoCarga.update({
        where: { id },
        data: updateTipoCargaDto,
      });

      this.logger.log(
        `Tipo de carga updated successfully: ${tipoCarga.nombre}`,
      );
      return new TipoCargaResponseDto(tipoCarga);
    } catch (error) {
      this.logger.error(`Error updating tipo de carga ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string, tenantId: string): Promise<void> {
    try {
      // Verify tipoCarga exists and belongs to tenant
      const existingTipoCarga = await this.prisma.tipoCarga.findFirst({
        where: { id, tenantId },
      });

      if (!existingTipoCarga) {
        throw new NotFoundException('Tipo de carga not found');
      }

      // Check if tipoCarga is being used in any orders
      const ordersUsingTipoCarga = await this.prisma.orden.count({
        where: {
          tipoCargaId: id,
          tenantId,
        },
      });

      if (ordersUsingTipoCarga > 0) {
        throw new BadRequestException(
          'No se puede eliminar el tipo de carga porque está siendo utilizado en órdenes',
        );
      }

      await this.prisma.tipoCarga.delete({
        where: { id },
      });

      this.logger.log(`Tipo de carga ${id} deleted`);
    } catch (error) {
      this.logger.error(`Error deleting tipo de carga ${id}:`, error);
      throw error;
    }
  }

  // Soft delete by setting activo to false
  async deactivate(
    id: string,
    tenantId: string,
  ): Promise<TipoCargaResponseDto> {
    try {
      const existingTipoCarga = await this.prisma.tipoCarga.findFirst({
        where: { id, tenantId },
      });

      if (!existingTipoCarga) {
        throw new NotFoundException('Tipo de carga not found');
      }

      const tipoCarga = await this.prisma.tipoCarga.update({
        where: { id },
        data: { activo: false },
      });

      this.logger.log(`Tipo de carga deactivated: ${tipoCarga.nombre}`);
      return new TipoCargaResponseDto(tipoCarga);
    } catch (error) {
      this.logger.error(`Error deactivating tipo de carga ${id}:`, error);
      throw error;
    }
  }
}
