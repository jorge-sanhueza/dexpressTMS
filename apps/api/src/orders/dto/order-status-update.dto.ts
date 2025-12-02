// dto/order-status-update.dto.ts
import { IsEnum } from 'class-validator';
import { OrdenEstado } from '@prisma/client';

export class OrderStatusUpdateDto {
  @IsEnum(OrdenEstado)
  estado: OrdenEstado;
}