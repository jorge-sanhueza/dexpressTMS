import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
  Matches,
  IsPhoneNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { EstadoUsuario } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre: string;

  @IsUUID('4', { message: 'El ID del tenant debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El tenant es requerido' })
  tenantId: string;

  @IsUUID('4', { message: 'El ID del perfil debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El perfil es requerido' })
  perfilId: string;

  @IsOptional()
  @Matches(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/, {
    message: 'El RUT debe tener formato 12.345.678-9',
  })
  rut?: string;

  @IsOptional()
  @IsPhoneNumber('CL', { message: 'El teléfono debe ser válido para Chile' })
  telefono?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  activo?: boolean;

  @IsOptional()
  @IsEnum(EstadoUsuario, { message: 'El estado del usuario debe ser válido' })
  estado?: EstadoUsuario;
}
