import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EntidadesService } from '../services/entidades.service';
import { EntidadesFilterDto } from '../dto/entidades-filter.dto';
import { EntidadResponseDto } from '../dto/entidad-response.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { TenantId } from 'src/common/decorators/tenant-id.decorator';

@Controller('api/entidades')
@UseGuards(JwtGuard)
export class EntidadesController {
  private readonly logger = new Logger(EntidadesController.name);

  constructor(private readonly entidadesService: EntidadesService) {}

  @Get()
  async findAll(
    @Query() filter: EntidadesFilterDto,
    @TenantId() tenantId: string,
  ): Promise<{
    entidades: EntidadResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    this.logger.log(`Fetching entidades for tenant: ${tenantId}`);

    const result = await this.entidadesService.findAll(filter, tenantId);

    return {
      ...result,
      totalPages: Math.ceil(result.total / result.limit),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @TenantId() tenantId: string,
  ): Promise<EntidadResponseDto> {
    this.logger.log(`Fetching entidad ${id} for tenant: ${tenantId}`);
    return this.entidadesService.findOne(id, tenantId);
  }

  @Get('rut/:rut')
  async findByRut(
    @Param('rut') rut: string,
    @TenantId() tenantId: string,
  ): Promise<EntidadResponseDto | null> {
    this.logger.log(`Finding entidad by RUT: ${rut} for tenant: ${tenantId}`);
    return this.entidadesService.findByRut(rut, tenantId);
  }

  @Get('stats/overview')
  async getStats(@TenantId() tenantId: string): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    porTipoEntidad: Record<string, number>;
  }> {
    this.logger.log(`Fetching entidad stats for tenant: ${tenantId}`);
    return this.entidadesService.getStats(tenantId);
  }
}
