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
import { ClientsService } from '../services/clients.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { ClientsFilterDto } from '../dto/clients-filter.dto';
import { ClientResponseDto } from '../dto/client-response.dto';
import { ClientStatsDto } from '../dto/client-stats.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { TenantId } from 'src/common/decorators/tenant-id.decorator';

@Controller('api/clients')
@UseGuards(JwtGuard)
export class ClientsController {
  private readonly logger = new Logger(ClientsController.name);

  constructor(private readonly clientsService: ClientsService) {}

  @Get('stats')
  async getStats(@TenantId() tenantId: string): Promise<ClientStatsDto> {
    this.logger.log(`Fetching client stats for tenant: ${tenantId}`);
    return this.clientsService.getStats(tenantId);
  }

  @Get()
  async findAll(
    @Query() filter: ClientsFilterDto,
    @TenantId() tenantId: string,
  ): Promise<{
    clients: ClientResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.log(
      `Fetching clients - Tenant: ${tenantId} | Page: ${filter.page || 1} | Limit: ${filter.limit || 10}`,
    );

    const result = await this.clientsService.findAll(filter, tenantId);

    return {
      ...result,
      page: filter.page || 1,
      limit: filter.limit || 10,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @TenantId() tenantId: string,
  ): Promise<ClientResponseDto> {
    this.logger.log(`Fetching client ${id} for tenant: ${tenantId}`);
    return this.clientsService.findOne(id, tenantId);
  }

  @Get('rut/:rut')
  async findByRut(
    @Param('rut') rut: string,
    @TenantId() tenantId: string,
  ): Promise<ClientResponseDto | null> {
    this.logger.log(`Finding client by RUT: ${rut} for tenant: ${tenantId}`);
    return this.clientsService.findByRut(rut.trim(), tenantId);
  }

  @Post()
  async create(
    @Body() createClientDto: CreateClientDto,
    @TenantId() tenantId: string,
  ): Promise<ClientResponseDto> {
    this.logger.log(
      `Creating client - Tenant: ${tenantId} | RUT: ${createClientDto.rut}`,
    );
    return this.clientsService.create(createClientDto, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateClientDto: UpdateClientDto,
    @TenantId() tenantId: string,
  ): Promise<ClientResponseDto> {
    this.logger.log(`Updating client ${id} for tenant: ${tenantId}`);
    return this.clientsService.update(id, updateClientDto, tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @TenantId() tenantId: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Deactivating client ${id} for tenant: ${tenantId}`);
    return this.clientsService.remove(id, tenantId);
  }
}
