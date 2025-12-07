import { TipoEntidad } from '@prisma/client';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsEnum,
  Matches,
} from 'class-validator';

export class CreateEntidadDto {
  @IsString()
  @Matches(/^\d{1,8}-?[\dKk]{1}$/, {
    message: 'RUT debe tener formato 12345678-9 o 123456789',
  })
  rut: string;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  razonSocial?: string;

  @IsEnum(TipoEntidad)
  tipoEntidad: TipoEntidad;

  @IsString()
  contacto: string;

  @IsEmail()
  email: string;

  @IsString()
  telefono: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  comunaId: string;

  @IsBoolean()
  @IsOptional()
  esPersona?: boolean = false;

  @IsBoolean()
  @IsOptional()
  activo?: boolean = true;
}
