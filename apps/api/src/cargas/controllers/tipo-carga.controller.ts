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
import { TipoCargaService } from '../services/tipo-carga.service';
import { CreateTipoCargaDto } from '../dto/create-tipo-carga.dto';
import { UpdateTipoCargaDto } from '../dto/update-tipo-carga.dto';
import { TipoCargaFilterDto } from '../dto/tipo-carga-filter.dto';
import { TipoCargaResponseDto } from '../dto/tipo-carga-response.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('api/tipo-carga')
@UseGuards(JwtGuard)
export class TipoCargaController {
  private readonly logger = new Logger(TipoCargaController.name);

  constructor(private readonly tipoCargaService: TipoCargaService) {}

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
    @Query() filter: TipoCargaFilterDto,
    @Request() req,
  ): Promise<{
    tiposCarga: TipoCargaResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const tenantId = this.getTenantId(req);

    // ADD CONTROLLER DEBUGGING
    this.logger.debug('=== CONTROLLER DEBUG ===');
    this.logger.debug(`Raw query params: ${JSON.stringify(req.query)}`);
    this.logger.debug(`Transformed filter: ${JSON.stringify(filter)}`);
    this.logger.debug(
      `activo value: ${filter.activo}, type: ${typeof filter.activo}`,
    );
    this.logger.debug('=== END CONTROLLER DEBUG ===');

    this.logger.log(`Fetching tipos de carga for tenant: ${tenantId}`);

    const result = await this.tipoCargaService.findAll(filter, tenantId);

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
  ): Promise<TipoCargaResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching tipo de carga ${id} for tenant: ${tenantId}`);
    return this.tipoCargaService.findOne(id, tenantId);
  }

  @Post()
  async create(
    @Body() createTipoCargaDto: CreateTipoCargaDto,
    @Request() req,
  ): Promise<TipoCargaResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Creating tipo de carga for tenant: ${tenantId}`);
    return this.tipoCargaService.create(createTipoCargaDto, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTipoCargaDto: UpdateTipoCargaDto,
    @Request() req,
  ): Promise<TipoCargaResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Updating tipo de carga ${id} for tenant: ${tenantId}`);
    return this.tipoCargaService.update(id, updateTipoCargaDto, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<void> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Deleting tipo de carga ${id} for tenant: ${tenantId}`);
    await this.tipoCargaService.remove(id, tenantId);
  }

  @Put(':id/deactivate')
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<TipoCargaResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Deactivating tipo de carga ${id} for tenant: ${tenantId}`);
    return this.tipoCargaService.deactivate(id, tenantId);
  }
}
