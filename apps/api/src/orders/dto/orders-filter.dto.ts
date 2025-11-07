import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { OrdenEstado } from '@prisma/client';

export class OrdersFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(OrdenEstado)
  estado?: OrdenEstado;

  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaDesde?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaHasta?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}
