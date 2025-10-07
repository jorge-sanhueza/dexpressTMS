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
import { Auth0Guard } from '../../auth/guards/auth0.guard';
import type {
  CreateClientDto,
  UpdateClientDto,
  Client,
  ClientsFilterDto,
} from '../interfaces/client.interface';

@Controller('api/clients')
@UseGuards(Auth0Guard)
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

  @Get()
  async findAll(
    @Query() filter: ClientsFilterDto,
    @Request() req,
  ): Promise<{
    clients: Client[];
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
  ): Promise<Client> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching client ${id} for tenant: ${tenantId}`);
    return this.clientsService.findOne(id, tenantId);
  }

  @Post()
  async create(
    @Body() createClientDto: CreateClientDto,
    @Request() req,
  ): Promise<Client> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Creating client for tenant: ${tenantId}`);
    return this.clientsService.create(createClientDto, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
    @Request() req,
  ): Promise<Client> {
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