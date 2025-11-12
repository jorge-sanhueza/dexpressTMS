import {
  IsBoolean,
  IsOptional,
  IsString,
  IsEmail,
  Matches,
} from 'class-validator';

export class CreateClientDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsString()
  @Matches(/^[0-9]{7,8}-[0-9kK]{1}$/, {
    message: 'RUT must be in format 12345678-9',
  })
  rut: string;

  @IsString()
  contacto: string;

  @IsEmail()
  email: string;

  @IsString()
  telefono: string;

  @IsString()
  direccion: string;

  @IsString()
  comunaId: string;

  @IsOptional()
  @IsBoolean()
  esPersona?: boolean;
}
