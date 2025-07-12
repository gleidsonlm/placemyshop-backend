import {
  IsNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Permission, RoleName } from '../schemas/role.schema';

export class CreateRoleDto {
  @IsUUID('4', { message: '@id must be a valid UUID v4' })
  @IsOptional()
  '@id'?: string;

  @IsEnum(RoleName)
  @IsNotEmpty()
  roleName: RoleName;

  // Permissions can be optional during creation if we decide to assign them based on roleName by default
  @IsArray()
  @IsEnum(Permission, { each: true })
  @IsOptional() // Or make it required if manual permission assignment is always needed
  permissions?: Permission[];
}
