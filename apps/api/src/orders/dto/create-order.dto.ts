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

export class CreateOrderDto {
  @IsUUID()
  clienteId: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsString()
  numeroOt: string;

  @IsDate()
  @Type(() => Date)
  fecha: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaEntregaEstimada?: Date;

  @IsOptional()
  @IsEnum(OrdenEstado)
  estado?: OrdenEstado = OrdenEstado.PENDIENTE;

  @IsOptional()
  @IsEnum(TipoTarifa)
  tipoTarifa?: TipoTarifa = TipoTarifa.PESO_VOLUMEN;

  @IsUUID()
  remitenteId: string;

  @IsUUID()
  destinatarioId: string;

  @IsUUID()
  direccionOrigenId: string;

  @IsUUID()
  direccionDestinoId: string;

  @IsUUID()
  tipoCargaId: string;

  @IsUUID()
  tipoServicioId: string;

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
