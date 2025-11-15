import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsEmail,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { OrigenDireccion } from '@prisma/client';

export class UpdateDireccionDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  calle?: string;

  @IsOptional()
  @IsString()
  comunaId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  contacto?: string;

  @IsOptional()
  @IsString()
  direccionTexto?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @Type(() => Number)
  frecuencia?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitud?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitud?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || undefined)
  numero?: string;

  @IsOptional()
  @IsEnum(OrigenDireccion)
  origen?: OrigenDireccion;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  activo?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  esPrincipal?: boolean;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}
