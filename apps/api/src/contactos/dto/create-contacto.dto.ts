import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateContactoDto {
  @IsString()
  @Matches(/^[0-9]{7,8}-[0-9kK]{1}$/, {
    message: 'Formato de RUT inválido (ej: 12345678-9)',
  })
  rut: string;

  @IsString()
  nombre: string;

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

  @IsString()
  contacto: string;

  @IsOptional()
  @IsBoolean()
  esPersonaNatural?: boolean;

  @IsUUID()
  comunaId: string;
}
