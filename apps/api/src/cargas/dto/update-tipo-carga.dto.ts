import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class UpdateTipoCargaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsBoolean()
  requiereEquipoEspecial?: boolean;

  @IsOptional()
  @IsBoolean()
  requiereTempControlada?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  orden?: number;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
