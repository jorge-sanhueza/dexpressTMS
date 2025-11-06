import { IsArray, IsUUID, ArrayMinSize, ArrayNotEmpty } from 'class-validator';

export class AssignRolesDto {
  @IsArray({ message: 'Los IDs de roles deben ser un array' })
  @ArrayNotEmpty({ message: 'Debe proporcionar al menos un rol' })
  @ArrayMinSize(1, { message: 'Debe asignar al menos un rol' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de rol debe ser un UUID válido',
  })
  roleIds: string[];
}
