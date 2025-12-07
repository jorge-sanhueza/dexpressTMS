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
import { CarriersService } from '../services/carriers.service';
import { CreateCarrierDto } from '../dto/create-carrier.dto';
import { UpdateCarrierDto } from '../dto/update-carrier.dto';
import { CarriersFilterDto } from '../dto/carriers-filter.dto';
import { CarrierResponseDto } from '../dto/carrier-response.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CarrierStatsDto } from '../dto/carrier-stats.dto';
import { TenantId } from 'src/common/decorators/tenant-id.decorator';

@Controller('api/carriers')
@UseGuards(JwtGuard)
export class CarriersController {
  private readonly logger = new Logger(CarriersController.name);

  constructor(private readonly carriersService: CarriersService) {}

  @Get()
  async findAll(
    @Query() filter: CarriersFilterDto,
    @TenantId() tenantId: string,
  ): Promise<{
    carriers: CarrierResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    this.logger.log(`Fetching carriers for tenant: ${tenantId}`);

    const result = await this.carriersService.findAll(filter, tenantId);

    // Calculate pagination metadata
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const totalPages = Math.ceil(result.total / limit);

    return {
      carriers: result.carriers,
      total: result.total,
      page,
      limit,
      totalPages,
    };
  }

  @Get('stats')
  async getStats(@TenantId() tenantId: string): Promise<CarrierStatsDto> {
    this.logger.log(`Fetching carrier stats for tenant: ${tenantId}`);
    return this.carriersService.getStats(tenantId);
  }

  @Get('stats/equipment')
  async getCarriersWithEquipmentStats(@TenantId() tenantId: string): Promise<
    Array<{
      id: string;
      nombre: string;
      rut: string;
      totalEquipos: number;
      equiposActivos: number;
      equiposInactivos: number;
    }>
  > {
    this.logger.log(
      `Fetching carriers with equipment stats for tenant: ${tenantId}`,
    );
    return this.carriersService.getCarriersWithEquipmentStats(tenantId);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @TenantId() tenantId: string,
  ): Promise<CarrierResponseDto> {
    this.logger.log(`Fetching carrier ${id} for tenant: ${tenantId}`);
    return this.carriersService.findOne(id, tenantId);
  }

  @Get('rut/:rut')
  async findByRut(
    @Param('rut') rut: string,
    @TenantId() tenantId: string,
  ): Promise<CarrierResponseDto | null> {
    this.logger.log(`Finding carrier by RUT: ${rut} for tenant: ${tenantId}`);
    return this.carriersService.findByRut(rut, tenantId);
  }

  @Post()
  async create(
    @Body() createCarrierDto: CreateCarrierDto,
    @TenantId() tenantId: string,
  ): Promise<CarrierResponseDto> {
    this.logger.log(
      `Creating carrier for tenant: ${tenantId} | RUT: ${createCarrierDto.rut}`,
    );
    return this.carriersService.create(createCarrierDto, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateCarrierDto: UpdateCarrierDto,
    @TenantId() tenantId: string,
  ): Promise<CarrierResponseDto> {
    this.logger.log(`Updating carrier ${id} for tenant: ${tenantId}`);
    return this.carriersService.update(id, updateCarrierDto, tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @TenantId() tenantId: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Deactivating carrier ${id} for tenant: ${tenantId}`);
    return this.carriersService.remove(id, tenantId);
  }
}
