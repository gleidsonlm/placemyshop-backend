import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MinLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PersonStatus } from '../schemas/person.schema';

// As per schema.org/Person and issue requirements
export class CreatePersonDto {
  @ApiPropertyOptional({
    description: 'Unique identifier for the person (UUID v4). If not provided, will be auto-generated.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid',
  })
  @IsUUID('4', { message: '@id must be a valid UUID v4' })
  @IsOptional() // If not provided, schema will generate it.
  '@id'?: string;

  @ApiProperty({
    description: "Person's given name (first name)",
    example: 'John',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  givenName: string;

  @ApiProperty({
    description: "Person's family name (last name)",
    example: 'Doe',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  familyName: string;

  @ApiProperty({
    description: "Person's email address (must be unique)",
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: "Person's telephone number",
    example: '+15551234567',
  })
  @IsString()
  @IsOptional()
  telephone?: string;

  @ApiProperty({
    description: 'Person password (minimum 8 characters)',
    example: 'securePassword123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string; // Plain password, will be hashed in the service/logic layer

  // Role will be an ID (string or ObjectId string representation)
  @ApiProperty({
    description: 'Role ID to assign to the person',
    example: 'role-uuid-456',
  })
  @IsString() // Assuming Role ID is a string (e.g., UUID or ObjectId string)
  @IsNotEmpty()
  roleId: string;

  @ApiPropertyOptional({
    description: 'Person status',
    example: PersonStatus.ACTIVE,
    enum: PersonStatus,
    default: PersonStatus.ACTIVE,
  })
  @IsEnum(PersonStatus)
  @IsOptional()
  status?: PersonStatus = PersonStatus.ACTIVE;
}
