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
import { CarriersService } from '../services/carriers.service';
import { CreateCarrierDto } from '../dto/create-carrier.dto';
import { UpdateCarrierDto } from '../dto/update-carrier.dto';
import { CarriersFilterDto } from '../dto/carriers-filter.dto';
import { CarrierResponseDto } from '../dto/carrier-response.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('api/carriers')
@UseGuards(JwtGuard)
export class CarriersController {
  private readonly logger = new Logger(CarriersController.name);

  constructor(private readonly carriersService: CarriersService) {}

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
    @Query() filter: CarriersFilterDto,
    @Request() req,
  ): Promise<{
    carriers: CarrierResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const tenantId = this.getTenantId(req);

    this.logger.log(`Fetching carriers for tenant: ${tenantId}`);

    const result = await this.carriersService.findAll(filter, tenantId);
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const totalPages = Math.ceil(result.total / limit);

    return {
      ...result,
      page,
      limit,
      totalPages,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<CarrierResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching carrier ${id} for tenant: ${tenantId}`);
    return this.carriersService.findOne(id, tenantId);
  }

  @Get('rut/:rut')
  async findByRut(
    @Param('rut') rut: string,
    @Request() req,
  ): Promise<CarrierResponseDto | null> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Finding carrier by RUT: ${rut} for tenant: ${tenantId}`);
    return this.carriersService.findByRut(rut, tenantId);
  }

  @Post()
  async create(
    @Body() createCarrierDto: CreateCarrierDto,
    @Request() req,
  ): Promise<CarrierResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Creating carrier for tenant: ${tenantId}`);
    return this.carriersService.create(createCarrierDto, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCarrierDto: UpdateCarrierDto,
    @Request() req,
  ): Promise<CarrierResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Updating carrier ${id} for tenant: ${tenantId}`);
    return this.carriersService.update(id, updateCarrierDto, tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Deactivating carrier ${id} for tenant: ${tenantId}`);
    return this.carriersService.remove(id, tenantId);
  }
}
