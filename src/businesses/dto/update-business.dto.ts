import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsUrl,
  IsArray,
  ValidateNested,
  IsEmail,
} from 'class-validator';
import { PostalAddressDto } from './create-business.dto'; // Re-use PostalAddressDto

export class UpdateBusinessDto {
  @IsString()
  @IsOptional()
  name?: string;

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

  // founderId is typically not updatable directly, or handled via a separate process
  // If it needs to be updatable, add:
  // @IsString()
  // @IsOptional()
  // founderId?: string;
}
