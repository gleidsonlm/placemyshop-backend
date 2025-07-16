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

import { IsEmail, IsString, IsNotEmpty, IsOptional, IsEnum, MinLength, IsUUID } from 'class-validator';
import { PersonStatus } from '../schemas/person.schema';

// As per schema.org/Person and issue requirements
export class CreatePersonDto {
  @IsUUID('4', { message: '@id must be a valid UUID v4' })
  @IsOptional() // If not provided, schema will generate it.
  '@id'?: string;

  @IsString()
  @IsNotEmpty()
  givenName: string;

  @IsString()
  @IsNotEmpty()
  familyName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string; // Plain password, will be hashed in the service/logic layer

  // Role will be an ID (string or ObjectId string representation)
  @IsString() // Assuming Role ID is a string (e.g., UUID or ObjectId string)
  @IsNotEmpty()
  roleId: string;

  @IsEnum(PersonStatus)
  @IsOptional()
  status?: PersonStatus = PersonStatus.ACTIVE;
}
