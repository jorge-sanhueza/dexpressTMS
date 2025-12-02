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
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrdersFilterDto } from '../dto/orders-filter.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('api/orders')
@UseGuards(JwtGuard)
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

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
    @Query() filter: OrdersFilterDto,
    @Request() req,
  ): Promise<{
    orders: OrderResponseDto[];
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

  @Get('stats')
  async getStats(@Request() req): Promise<{
    total: number;
    pendientes: number;
    planificadas: number;
    enTransporte: number;
    entregadas: number;
    canceladas: number;
  }> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching order stats for tenant: ${tenantId}`);
    return this.ordersService.getStats(tenantId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<OrderResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Fetching order ${id} for tenant: ${tenantId}`);
    return this.ordersService.findOne(id, tenantId);
  }

  // In orders.controller.ts, add this method:

  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req,
  ): Promise<OrderResponseDto> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`Creating order for tenant: ${tenantId}`);
    return this.ordersService.create(createOrderDto, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req,
  ): Promise<OrderResponseDto> {
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
