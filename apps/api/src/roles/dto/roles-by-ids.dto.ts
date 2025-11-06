import { IsArray, IsUUID, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class RolesByIdsDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one role ID is required' })
  @ArrayMaxSize(100, { message: 'Cannot request more than 100 roles at once' })
  @IsUUID('4', { each: true, message: 'Each role ID must be a valid UUID' })
  roleIds: string[];
}
