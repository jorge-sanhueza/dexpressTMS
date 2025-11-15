import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEmail,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateContactoDto {
  @IsString()
  nombre: string;

  @IsString()
  @Matches(/^[0-9]{7,8}-[0-9kK]{1}$/, {
    message: 'RUT must be in format 12345678-9',
  })
  rut: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsUUID()
  comunaId: string;

  @IsUUID()
  entidadId: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsString()
  contacto: string;

  @IsOptional()
  @IsBoolean()
  esPersonaNatural?: boolean;
}
