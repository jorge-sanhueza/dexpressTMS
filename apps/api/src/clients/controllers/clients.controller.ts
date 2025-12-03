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
import { ClientsService } from '../services/clients.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { ClientsFilterDto } from '../dto/clients-filter.dto';
import { ClientResponseDto } from '../dto/client-response.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ClientStatsDto } from '../dto/client-stats.dto';

@Controller('api/clients')
@UseGuards(JwtGuard)
export class ClientsController {
  private readonly logger = new Logger(ClientsController.name);

  constructor(private readonly clientsService: ClientsService) {}

  private getTenantId(req: any): string {
    const tenantId =
      req.user?.tenant_id || req.user?.tenantId || req.user?.tenant?.id;

    this.logger.debug(`Extracted tenantId: ${tenantId}`);

    if (!tenantId) {
      throw new Error('Tenant ID not found in user object');
    }

    return tenantId;
  }

  // In your ClientsController, add this method:
  @Get('stats')
  async getStats(@Request() req): Promise<ClientStatsDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching client stats for tenant: ${tenantId}`);
    return this.clientsService.getStats(tenantId);
  }

  @Get()
  async findAll(
    @Query() filter: ClientsFilterDto,
    @Request() req,
  ): Promise<{
    clients: ClientResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const tenantId = this.getTenantId(req);

    this.logger.log(`Fetching clients for tenant: ${tenantId}`);

    const result = await this.clientsService.findAll(filter, tenantId);

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
  ): Promise<ClientResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching client ${id} for tenant: ${tenantId}`);
    return this.clientsService.findOne(id, tenantId);
  }

  @Get('rut/:rut')
  async findByRut(
    @Param('rut') rut: string,
    @Request() req,
  ): Promise<ClientResponseDto | null> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Finding client by RUT: ${rut} for tenant: ${tenantId}`);
    return this.clientsService.findByRut(rut, tenantId);
  }

  @Post()
  async create(
    @Body() createClientDto: CreateClientDto,
    @Request() req,
  ): Promise<ClientResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Creating client for tenant: ${tenantId}`);
    return this.clientsService.create(createClientDto, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
    @Request() req,
  ): Promise<ClientResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Updating client ${id} for tenant: ${tenantId}`);
    return this.clientsService.update(id, updateClientDto, tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Deactivating client ${id} for tenant: ${tenantId}`);
    await this.clientsService.remove(id, tenantId);
    return { message: 'Client deactivated successfully' };
  }
}
