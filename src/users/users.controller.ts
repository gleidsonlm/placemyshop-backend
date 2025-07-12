import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Create a new user with the provided information',
  })
  @ApiBody({
    type: CreatePersonDto,
    description: 'User creation data',
    examples: {
      example1: {
        summary: 'Create manager user',
        value: {
          givenName: 'John',
          familyName: 'Doe',
          email: 'john.doe@example.com',
          telephone: '+1234567890',
          password: 'securePassword123',
          roleId: 'role-uuid-456',
          status: 'Active',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        '@id': { type: 'string', description: 'User unique identifier' },
        givenName: { type: 'string', description: 'User first name' },
        familyName: { type: 'string', description: 'User last name' },
        email: { type: 'string', description: 'User email address' },
        telephone: { type: 'string', description: 'User phone number' },
        role: {
          type: 'object',
          properties: {
            '@id': { type: 'string' },
            roleName: { type: 'string' },
          },
        },
        status: { type: 'string', description: 'User status' },
        dateCreated: { type: 'string', format: 'date-time' },
        dateModified: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiConflictResponse({ description: 'Email already exists' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async create(@Body(new ValidationPipe()) createPersonDto: CreatePersonDto) {
    return await this.usersService.create(createPersonDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a paginated list of users',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          '@id': { type: 'string' },
          givenName: { type: 'string' },
          familyName: { type: 'string' },
          email: { type: 'string' },
          telephone: { type: 'string' },
          role: { type: 'object' },
          status: { type: 'string' },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return await this.usersService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User unique identifier',
    example: 'user-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    schema: {
      type: 'object',
      properties: {
        '@id': { type: 'string' },
        givenName: { type: 'string' },
        familyName: { type: 'string' },
        email: { type: 'string' },
        telephone: { type: 'string' },
        role: {
          type: 'object',
          properties: {
            '@id': { type: 'string' },
            roleName: { type: 'string' },
            permissions: { type: 'array', items: { type: 'string' } },
          },
        },
        status: { type: 'string' },
        dateCreated: { type: 'string', format: 'date-time' },
        dateModified: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User unique identifier',
    example: 'user-uuid-123',
  })
  @ApiBody({
    type: UpdatePersonDto,
    description: 'User update data',
    examples: {
      example1: {
        summary: 'Update user name',
        value: {
          givenName: 'Jane',
          familyName: 'Smith',
        },
      },
      example2: {
        summary: 'Update user password',
        value: {
          password: 'newSecurePassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        '@id': { type: 'string' },
        givenName: { type: 'string' },
        familyName: { type: 'string' },
        email: { type: 'string' },
        telephone: { type: 'string' },
        role: { type: 'object' },
        status: { type: 'string' },
        dateCreated: { type: 'string', format: 'date-time' },
        dateModified: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updatePersonDto: UpdatePersonDto,
  ) {
    return await this.usersService.update(id, updatePersonDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user', description: 'Soft delete a user' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User unique identifier',
    example: 'user-uuid-123',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore user',
    description: 'Restore a soft-deleted user',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User unique identifier',
    example: 'user-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'User restored successfully',
    schema: {
      type: 'object',
      properties: {
        '@id': { type: 'string' },
        givenName: { type: 'string' },
        familyName: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'object' },
        status: { type: 'string' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async restore(@Param('id') id: string) {
    return await this.usersService.restore(id);
  }
}
