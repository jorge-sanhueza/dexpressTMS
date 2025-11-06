import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(500, {
    message: 'La descripción no puede exceder los 500 caracteres',
  })
  descripcion?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  activo?: boolean;
}
