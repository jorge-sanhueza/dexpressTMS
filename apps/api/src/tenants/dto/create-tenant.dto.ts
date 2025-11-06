import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUrl,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { TipoTenant } from '@prisma/client';

export class CreateTenantDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(5, { message: 'El nombre debe tener al menos 5 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre: string;

  @IsString({ message: 'El contacto debe ser un texto' })
  @IsNotEmpty({ message: 'El contacto es requerido' })
  @MinLength(2, { message: 'El contacto debe tener al menos 2 caracteres' })
  @MaxLength(100, {
    message: 'El contacto no puede exceder los 100 caracteres',
  })
  contacto: string;

  @IsString({ message: 'El RUT debe ser un texto' })
  @IsNotEmpty({ message: 'El RUT es requerido' })
  @Matches(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/, {
    message: 'El RUT debe tener formato 12.345.678-9',
  })
  rut: string;

  @IsEnum(TipoTenant, { message: 'El tipo de tenant debe ser válido' })
  tipoTenant: TipoTenant;

  @IsOptional()
  @IsUrl({}, { message: 'El logo debe ser una URL válida' })
  logoUrl?: string;
}
