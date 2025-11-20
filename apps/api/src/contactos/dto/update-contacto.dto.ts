import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';

export class UpdateContactoDto {
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{7,8}-[0-9kK]{1}$/, {
    message: 'Formato de RUT inválido (ej: 12345678-9)',
  })
  rut?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

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

  @IsOptional()
  @IsUUID()
  comunaId?: string;
}
