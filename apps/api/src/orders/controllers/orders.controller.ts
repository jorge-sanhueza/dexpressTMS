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
import { OrdersService } from '../services/orders.service';
import { Auth0Guard } from '../../auth/guards/auth0.guard';
import type {
  CreateOrderDto,
  UpdateOrderDto,
  Order,
  OrdersFilterDto,
} from '../interfaces/order.interface';

@Controller('api/orders')
@UseGuards(Auth0Guard)
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  private getTenantId(req: any): string {
    // Try different possible locations for tenant_id
    const tenantId =
      req.user?.tenant_id || req.user?.tenantId || req.user?.tenant?.id;

    this.logger.debug(`Extracted tenantId: ${tenantId}`);
    this.logger.debug(`Full user object: ${JSON.stringify(req.user)}`);

    if (!tenantId) {
      throw new Error('Tenant ID not found in user object');
    }

    return tenantId;
  }

  @Get()
  async findAll(
    @Query() filter: OrdersFilterDto,
    @Request() req,
  ): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }> {
    const tenantId = this.getTenantId(req);

    this.logger.log(`Fetching orders for tenant: ${tenantId}`);

    const result = await this.ordersService.findAll(filter, tenantId);

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
  ): Promise<Order> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching order ${id} for tenant: ${tenantId}`);
    return this.ordersService.findOne(id, tenantId);
  }

  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req,
  ): Promise<Order> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Creating order for tenant: ${tenantId}`);

    // Pass both the DTO and tenantId to the service
    return this.ordersService.create(createOrderDto, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req,
  ): Promise<Order> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Updating order ${id} for tenant: ${tenantId}`);
    return this.ordersService.update(id, updateOrderDto, tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Cancelling order ${id} for tenant: ${tenantId}`);
    await this.ordersService.remove(id, tenantId);
    return { message: 'Order cancelled successfully' };
  }
}