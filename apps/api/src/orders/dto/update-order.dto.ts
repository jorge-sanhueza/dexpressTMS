import {
  IsString,
  IsOptional,
  IsDate,
  IsNumber,
  IsEnum,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { OrdenEstado, TipoTarifa } from '@prisma/client';

export class UpdateOrderDto {
  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  numeroOt?: string; // Changed from 'numero' to 'numeroOt'

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fecha?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaEntregaEstimada?: Date;

  @IsOptional()
  @IsEnum(OrdenEstado)
  estado?: OrdenEstado;

  @IsOptional()
  @IsEnum(TipoTarifa)
  tipoTarifa?: TipoTarifa;

  @IsOptional()
  @IsUUID()
  remitenteId?: string;

  @IsOptional()
  @IsUUID()
  destinatarioId?: string;

  @IsOptional()
  @IsUUID()
  direccionOrigenId?: string;

  @IsOptional()
  @IsUUID()
  direccionDestinoId?: string;

  @IsOptional()
  @IsUUID()
  tipoCargaId?: string;

  @IsOptional()
  @IsUUID()
  tipoServicioId?: string;

  @IsOptional()
  @IsUUID()
  equipoId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50000)
  pesoTotalKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  volumenTotalM3?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  altoCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  largoCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  anchoCm?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
