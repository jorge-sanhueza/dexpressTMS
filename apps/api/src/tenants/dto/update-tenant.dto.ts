import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUrl,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { TipoTenant } from '@prisma/client';

export class UpdateTenantDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El contacto debe ser un texto' })
  @MinLength(2, { message: 'El contacto debe tener al menos 2 caracteres' })
  @MaxLength(100, {
    message: 'El contacto no puede exceder los 100 caracteres',
  })
  contacto?: string;

  @IsOptional()
  @IsString({ message: 'El RUT debe ser un texto' })
  @Matches(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/, {
    message: 'El RUT debe tener formato 12.345.678-9',
  })
  rut?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  activo?: boolean;

  @IsOptional()
  @IsUrl({}, { message: 'El logo debe ser una URL válida' })
  logoUrl?: string;

  @IsOptional()
  @IsEnum(TipoTenant, { message: 'El tipo de tenant debe ser válido' })
  tipoTenant?: TipoTenant;
}
