import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  MaxLength, 
  MinLength 
} from 'class-validator';

export class CreateProfileDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder los 500 caracteres' })
  descripcion?: string;
}