import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DireccionesService } from '../services/direcciones.service';
import { CreateDireccionDto } from '../dto/create-direccion.dto';
import { UpdateDireccionDto } from '../dto/update-direccion.dto';
import { DireccionesFilterDto } from '../dto/direcciones-filter.dto';
import { DireccionResponseDto } from '../dto/direccion-response.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { AddressStatsDto } from '../dto/direcciones-stats.dto';

@Controller('api/direcciones')
@UseGuards(JwtGuard)
export class DireccionesController {
  private readonly logger = new Logger(DireccionesController.name);

  constructor(private readonly direccionesService: DireccionesService) {}

  private getTenantId(req: any): string {
    const tenantId =
      req.user?.tenant_id || req.user?.tenantId || req.user?.tenant?.id;

    this.logger.debug(`Extracted tenantId: ${tenantId}`);

    if (!tenantId) {
      throw new Error('Tenant ID not found in user object');
    }

    return tenantId;
  }

  @Get()
  async findAll(
    @Query() filter: DireccionesFilterDto,
    @Request() req,
  ): Promise<{
    direcciones: DireccionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const tenantId = this.getTenantId(req);

    this.logger.log(`Fetching direcciones for tenant: ${tenantId}`);

    const result = await this.direccionesService.findAll(filter, tenantId);

    return {
      ...result,
      page: filter.page || 1,
      limit: filter.limit || 10,
    };
  }

  @Get('stats')
  async getStats(@Request() req): Promise<AddressStatsDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching address stats for tenant: ${tenantId}`);
    return this.direccionesService.getStats(tenantId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<DireccionResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching direccion ${id} for tenant: ${tenantId}`);
    return this.direccionesService.findOne(id, tenantId);
  }

  @Post()
  async create(
    @Body() createDireccionDto: CreateDireccionDto,
    @Request() req,
  ): Promise<DireccionResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Creating direccion for tenant: ${tenantId}`);
    return this.direccionesService.create(createDireccionDto, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDireccionDto: UpdateDireccionDto,
    @Request() req,
  ): Promise<DireccionResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Updating direccion ${id} for tenant: ${tenantId}`);
    return this.direccionesService.update(id, updateDireccionDto, tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Deactivating direccion ${id} for tenant: ${tenantId}`);
    await this.direccionesService.remove(id, tenantId);
    return { message: 'Direccion deactivated successfully' };
  }

  @Get('comuna/:comunaId')
  async findByComuna(
    @Param('comunaId', ParseUUIDPipe) comunaId: string,
    @Request() req,
  ): Promise<DireccionResponseDto[]> {
    const tenantId = this.getTenantId(req);
    this.logger.log(
      `Fetching direcciones for comuna ${comunaId} and tenant: ${tenantId}`,
    );
    return this.direccionesService.findByComuna(comunaId, tenantId);
  }

  @Get('principales/activas')
  async findActivePrincipales(@Request() req): Promise<DireccionResponseDto[]> {
    const tenantId = this.getTenantId(req);
    this.logger.log(
      `Fetching active principales direcciones for tenant: ${tenantId}`,
    );
    return this.direccionesService.findActivePrincipales(tenantId);
  }
}
