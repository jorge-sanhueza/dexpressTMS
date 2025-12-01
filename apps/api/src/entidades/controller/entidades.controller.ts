import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EntidadesService } from '../services/entidades.service';
import { EntidadesFilterDto } from '../dto/entidades-filter.dto';
import { EntidadResponseDto } from '../dto/entidad-response.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('api/entidades')
@UseGuards(JwtGuard)
export class EntidadesController {
  private readonly logger = new Logger(EntidadesController.name);

  constructor(private readonly entidadesService: EntidadesService) {}

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
    @Query() filter: EntidadesFilterDto,
    @Request() req,
  ): Promise<{
    entidades: EntidadResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching entidades for tenant: ${tenantId}`);

    const result = await this.entidadesService.findAll(filter, tenantId);

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
  ): Promise<EntidadResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching entidad ${id} for tenant: ${tenantId}`);
    return this.entidadesService.findOne(id, tenantId);
  }
}
