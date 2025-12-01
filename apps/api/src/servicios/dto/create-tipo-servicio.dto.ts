// backend: dto/create-tipo-servicio.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateTipoServicioDto {
  @IsString()
  nombre: string;

  @IsString()
  codigo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  orden?: number = 0;

  @IsOptional()
  @IsBoolean()
  visible?: boolean = true;
}
