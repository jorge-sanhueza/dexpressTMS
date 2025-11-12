import {
  IsBoolean,
  IsOptional,
  IsString,
  IsEmail,
  Matches,
} from 'class-validator';

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{7,8}-[0-9kK]{1}$/, {
    message: 'RUT must be in format 12345678-9',
  })
  rut?: string;

  @IsOptional()
  @IsString()
  contacto?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  comunaId?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsBoolean()
  esPersona?: boolean;
}
