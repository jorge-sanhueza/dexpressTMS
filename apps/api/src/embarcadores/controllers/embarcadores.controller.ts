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
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EmbarcadoresService } from '../services/embarcadores.service';
import { CreateEmbarcadorDto } from '../dto/create-embarcador.dto';
import { UpdateEmbarcadorDto } from '../dto/update-embarcador.dto';
import { EmbarcadoresFilterDto } from '../dto/embarcadores-filter.dto';
import { EmbarcadorResponseDto } from '../dto/embarcador-response.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ShipperStatsDto } from '../dto/embarcadores-stats.dto';
import { TenantId } from 'src/common/decorators/tenant-id.decorator';

@Controller('api/embarcadores')
@UseGuards(JwtGuard)
export class EmbarcadoresController {
  private readonly logger = new Logger(EmbarcadoresController.name);

  constructor(private readonly embarcadoresService: EmbarcadoresService) {}

  @Get()
  async findAll(
    @Query() filter: EmbarcadoresFilterDto,
    @TenantId() tenantId: string,
  ): Promise<{
    embarcadores: EmbarcadorResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    this.logger.log(`Fetching embarcadores for tenant: ${tenantId}`);

    const result = await this.embarcadoresService.findAll(filter, tenantId);

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const totalPages = Math.ceil(result.total / limit);

    return {
      embarcadores: result.embarcadores,
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }

  @Get('stats')
  async getStats(@TenantId() tenantId: string): Promise<ShipperStatsDto> {
    this.logger.log(`Fetching shipper stats for tenant: ${tenantId}`);
    return this.embarcadoresService.getStats(tenantId);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @TenantId() tenantId: string,
  ): Promise<EmbarcadorResponseDto> {
    this.logger.log(`Fetching embarcador ${id} for tenant: ${tenantId}`);
    return this.embarcadoresService.findOne(id, tenantId);
  }

  @Get('rut/:rut')
  async findByRut(
    @Param('rut') rut: string,
    @TenantId() tenantId: string,
  ): Promise<EmbarcadorResponseDto | null> {
    this.logger.log(
      `Finding embarcador by RUT: ${rut} for tenant: ${tenantId}`,
    );
    return this.embarcadoresService.findByRut(rut, tenantId);
  }

  @Post()
  async create(
    @Body() createEmbarcadorDto: CreateEmbarcadorDto,
    @TenantId() tenantId: string,
  ): Promise<EmbarcadorResponseDto> {
    this.logger.log(
      `Creating embarcador for tenant: ${tenantId} | RUT: ${createEmbarcadorDto.rut}`,
    );
    return this.embarcadoresService.create(createEmbarcadorDto, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateEmbarcadorDto: UpdateEmbarcadorDto,
    @TenantId() tenantId: string,
  ): Promise<EmbarcadorResponseDto> {
    this.logger.log(`Updating embarcador ${id} for tenant: ${tenantId}`);
    return this.embarcadoresService.update(id, updateEmbarcadorDto, tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @TenantId() tenantId: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Deactivating embarcador ${id} for tenant: ${tenantId}`);
    return this.embarcadoresService.remove(id, tenantId);
  }
}
