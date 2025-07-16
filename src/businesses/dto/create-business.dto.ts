import { Type } from 'class-transformer';
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

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsArray,
  ValidateNested,
  IsEmail,
  IsUUID,
} from 'class-validator';

export class PostalAddressDto {
  @IsString()
  @IsOptional()
  streetAddress?: string;

  @IsString()
  @IsOptional()
  addressLocality?: string;

  @IsString()
  @IsOptional()
  addressRegion?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  addressCountry?: string;
}

export class CreateBusinessDto {
  @IsUUID('4', { message: '@id must be a valid UUID v4' })
  @IsOptional()
  '@id'?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PostalAddressDto)
  address?: PostalAddressDto;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  sameAs?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  openingHours?: string[];

  @IsString() // Assuming founderId is passed as a string (UUID or ObjectId string)
  @IsNotEmpty()
  founderId: string;
}
