import { IsEmail, IsString, IsOptional, IsEnum, MinLength, IsUUID } from 'class-validator';
import { PersonStatus } from '../schemas/person.schema';

export class UpdatePersonDto {
  @IsString()
  @IsOptional()
  givenName?: string;

  @IsString()
  @IsOptional()
  familyName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string; // For password changes

  @IsString()
  @IsOptional()
  roleId?: string;

  @IsEnum(PersonStatus)
  @IsOptional()
  status?: PersonStatus;
}
