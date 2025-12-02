// backend: controllers/tipo-servicio.controller.ts
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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TipoServicioService } from '../services/tipo-servicio.service';
import { CreateTipoServicioDto } from '../dto/create-tipo-servicio.dto';
import { UpdateTipoServicioDto } from '../dto/update-tipo-servicio.dto';
import { TipoServicioFilterDto } from '../dto/tipo-servicio-filter.dto';
import { TipoServicioResponseDto } from '../dto/tipo-servicio-response.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('api/tipo-servicio')
@UseGuards(JwtGuard)
export class TipoServicioController {
  private readonly logger = new Logger(TipoServicioController.name);

  constructor(private readonly tipoServicioService: TipoServicioService) {}

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
    @Query() filter: TipoServicioFilterDto,
    @Request() req,
  ): Promise<{
    tiposServicio: TipoServicioResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const tenantId = this.getTenantId(req);

    // ADD CONTROLLER DEBUGGING (SAME AS TIPO CARGA)
    this.logger.debug('=== CONTROLLER DEBUG ===');
    this.logger.debug(`Raw query params: ${JSON.stringify(req.query)}`);
    this.logger.debug(`Transformed filter: ${JSON.stringify(filter)}`);
    this.logger.debug(
      `activo value: ${filter.activo}, type: ${typeof filter.activo}`,
    );
    this.logger.debug('=== END CONTROLLER DEBUG ===');

    this.logger.log(`Fetching tipos de servicio for tenant: ${tenantId}`);

    const result = await this.tipoServicioService.findAll(filter, tenantId);

    return {
      ...result,
      page: filter.page || 1,
      limit: filter.limit || 10,
      totalPages: Math.ceil(result.total / (filter.limit || 10)),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<TipoServicioResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching tipo de servicio ${id} for tenant: ${tenantId}`);
    return this.tipoServicioService.findOne(id, tenantId);
  }

  @Get('codigo/:codigo')
  async findByCodigo(
    @Param('codigo') codigo: string,
    @Request() req,
  ): Promise<TipoServicioResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(
      `Fetching tipo de servicio by codigo ${codigo} for tenant: ${tenantId}`,
    );
    return this.tipoServicioService.findByCodigo(codigo, tenantId);
  }

  @Post()
  async create(
    @Body() createTipoServicioDto: CreateTipoServicioDto,
    @Request() req,
  ): Promise<TipoServicioResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Creating tipo de servicio for tenant: ${tenantId}`);
    return this.tipoServicioService.create(createTipoServicioDto, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTipoServicioDto: UpdateTipoServicioDto,
    @Request() req,
  ): Promise<TipoServicioResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Updating tipo de servicio ${id} for tenant: ${tenantId}`);
    return this.tipoServicioService.update(id, updateTipoServicioDto, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<void> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Deleting tipo de servicio ${id} for tenant: ${tenantId}`);
    await this.tipoServicioService.remove(id, tenantId);
  }

  @Put(':id/deactivate')
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<TipoServicioResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(
      `Deactivating tipo de servicio ${id} for tenant: ${tenantId}`,
    );
    return this.tipoServicioService.deactivate(id, tenantId);
  }
}
