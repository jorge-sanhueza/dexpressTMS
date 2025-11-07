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
import { EmbarcadoresService } from '../services/embarcadores.service';
import { Auth0Guard } from '../../auth/guards/auth0.guard';
import { CreateEmbarcadorDto } from '../dto/create-embarcador.dto';
import { UpdateEmbarcadorDto } from '../dto/update-embarcador.dto';
import { EmbarcadoresFilterDto } from '../dto/embarcadores-filter.dto';
import { EmbarcadorResponseDto } from '../dto/embarcador-response.dto';

@Controller('api/embarcadores')
@UseGuards(Auth0Guard)
export class EmbarcadoresController {
  private readonly logger = new Logger(EmbarcadoresController.name);

  constructor(private readonly embarcadoresService: EmbarcadoresService) {}

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
    @Query() filter: EmbarcadoresFilterDto,
    @Request() req,
  ): Promise<{
    embarcadores: EmbarcadorResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const tenantId = this.getTenantId(req);

    this.logger.log(`Fetching embarcadores for tenant: ${tenantId}`);

    const result = await this.embarcadoresService.findAll(filter, tenantId);

    return {
      ...result,
      page: filter.page || 1,
      limit: filter.limit || 10,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<EmbarcadorResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching embarcador ${id} for tenant: ${tenantId}`);
    return this.embarcadoresService.findOne(id, tenantId);
  }

  @Get('rut/:rut')
  async findByRut(
    @Param('rut') rut: string,
    @Request() req,
  ): Promise<EmbarcadorResponseDto | null> {
    const tenantId = this.getTenantId(req);
    this.logger.log(
      `Finding embarcador by RUT: ${rut} for tenant: ${tenantId}`,
    );
    return this.embarcadoresService.findByRut(rut, tenantId);
  }

  @Post()
  async create(
    @Body() createEmbarcadorDto: CreateEmbarcadorDto,
    @Request() req,
  ): Promise<EmbarcadorResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Creating embarcador for tenant: ${tenantId}`);
    return this.embarcadoresService.create(createEmbarcadorDto, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmbarcadorDto: UpdateEmbarcadorDto,
    @Request() req,
  ): Promise<EmbarcadorResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Updating embarcador ${id} for tenant: ${tenantId}`);
    return this.embarcadoresService.update(id, updateEmbarcadorDto, tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Deactivating embarcador ${id} for tenant: ${tenantId}`);
    return this.embarcadoresService.remove(id, tenantId);
  }
}
