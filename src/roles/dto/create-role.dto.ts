/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { IsString, IsNotEmpty, IsArray, IsEnum, IsOptional, IsUUID } from 'class-validator';
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
