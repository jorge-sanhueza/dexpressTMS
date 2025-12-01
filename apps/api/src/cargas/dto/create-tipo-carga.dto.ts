import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateTipoCargaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;

  @IsOptional()
  @IsBoolean()
  requiereEquipoEspecial?: boolean = false;

  @IsOptional()
  @IsBoolean()
  requiereTempControlada?: boolean = false;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  orden?: number = 3;

  @IsOptional()
  @IsBoolean()
  visible?: boolean = true;
}
