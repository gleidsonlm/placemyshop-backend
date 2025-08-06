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
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('roles')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new role',
    description: 'Create a new role with specified permissions',
  })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiConflictResponse({ description: 'Role name already exists' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async create(@Body(new ValidationPipe()) createRoleDto: CreateRoleDto) {
    return await this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all roles',
    description: 'Retrieve a paginated list of roles',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({ status: 200, description: 'List of roles' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return await this.rolesService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get role by ID',
    description: 'Retrieve a specific role by ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Role unique identifier',
  })
  @ApiResponse({ status: 200, description: 'Role found' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async findOne(@Param('id') id: string) {
    return await this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update role',
    description: 'Update role information',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Role unique identifier',
  })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateRoleDto: UpdateRoleDto,
  ) {
    return await this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete role', description: 'Soft delete a role' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Role unique identifier',
  })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async remove(@Param('id') id: string) {
    return await this.rolesService.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore role',
    description: 'Restore a soft-deleted role',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Role unique identifier',
  })
  @ApiResponse({ status: 200, description: 'Role restored successfully' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async restore(@Param('id') id: string) {
    return await this.rolesService.restore(id);
  }
}
