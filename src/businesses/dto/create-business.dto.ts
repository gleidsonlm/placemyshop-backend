import { Type } from 'class-transformer';
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
