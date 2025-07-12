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
} from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('businesses')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new business', description: 'Create a new business with the provided information' })
  @ApiResponse({ status: 201, description: 'Business created successfully' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async create(@Body(new ValidationPipe()) createBusinessDto: CreateBusinessDto) {
    return await this.businessesService.create(createBusinessDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all businesses', description: 'Retrieve a paginated list of businesses' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'List of businesses' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return await this.businessesService.findAll(page, limit);
  }

  @Get('by-founder/:founderId')
  @ApiOperation({ summary: 'Get businesses by founder', description: 'Retrieve all businesses founded by a specific user' })
  @ApiParam({ name: 'founderId', type: 'string', description: 'Founder (User) unique identifier' })
  @ApiResponse({ status: 200, description: 'List of businesses by founder' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async findByFounder(@Param('founderId') founderId: string) {
    return await this.businessesService.findByFounder(founderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get business by ID', description: 'Retrieve a specific business by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Business unique identifier' })
  @ApiResponse({ status: 200, description: 'Business found' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async findOne(@Param('id') id: string) {
    return await this.businessesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update business', description: 'Update business information' })
  @ApiParam({ name: 'id', type: 'string', description: 'Business unique identifier' })
  @ApiResponse({ status: 200, description: 'Business updated successfully' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateBusinessDto: UpdateBusinessDto,
  ) {
    return await this.businessesService.update(id, updateBusinessDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete business', description: 'Soft delete a business' })
  @ApiParam({ name: 'id', type: 'string', description: 'Business unique identifier' })
  @ApiResponse({ status: 204, description: 'Business deleted successfully' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async remove(@Param('id') id: string) {
    return await this.businessesService.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore business', description: 'Restore a soft-deleted business' })
  @ApiParam({ name: 'id', type: 'string', description: 'Business unique identifier' })
  @ApiResponse({ status: 200, description: 'Business restored successfully' })
  @ApiNotFoundResponse({ description: 'Business not found' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  async restore(@Param('id') id: string) {
    return await this.businessesService.restore(id);
  }
}