import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEmail,
  IsUUID,
  Matches,
} from 'class-validator';

export class UpdateContactoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{7,8}-[0-9kK]{1}$/, {
    message: 'RUT must be in format 12345678-9',
  })
  rut?: string;

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
  @IsUUID()
  comunaId?: string;

  @IsOptional()
  @IsUUID()
  entidadId?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsString()
  contacto?: string;

  @IsOptional()
  @IsBoolean()
  esPersonaNatural?: boolean;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}