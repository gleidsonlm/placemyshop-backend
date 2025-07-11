import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { Permission, RoleName } from '../schemas/role.schema';

export class UpdateRoleDto {
  @IsEnum(RoleName)
  @IsOptional()
  roleName?: RoleName;

  @IsArray()
  @IsEnum(Permission, { each: true })
  @IsOptional()
  permissions?: Permission[];
}
