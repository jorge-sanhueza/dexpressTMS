import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCarrierDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  razonSocial?: string;

  @IsOptional()
  @IsString()
  @Length(8, 12)
  @Matches(/^[0-9]{7,8}-[0-9Kk]$/, {
    message: 'RUT must be in format 12345678-9',
  })
  rut?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  contacto?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  telefono?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  direccion?: string;

  @IsOptional()
  @IsString()
  comunaId?: string;

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
  esPersona?: boolean;
}
