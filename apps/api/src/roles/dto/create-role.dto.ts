import { TipoAccion } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  Length,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRoleDto {
  @IsString()
  @Length(3, 50)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Code can only contain letters, numbers, underscores and hyphens',
  })
  codigo: string;

  @IsString()
  @Length(2, 100)
  nombre: string;

  @IsString()
  @Length(2, 50)
  modulo: string;

  @IsEnum(TipoAccion, {
    message: `tipo_accion must be one of: ${Object.values(TipoAccion).join(', ')}`,
  })
  tipo_accion: TipoAccion;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  @Transform(({ value }) => (value ? parseInt(value) : 0))
  orden?: number = 0;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  activo?: boolean = true;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  visible?: boolean = true;

  @IsString()
  @IsNotEmpty()
  tenantId: string; // Made required
}
