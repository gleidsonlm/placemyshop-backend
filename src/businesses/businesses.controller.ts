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
} from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(new ValidationPipe()) createBusinessDto: CreateBusinessDto) {
    return await this.businessesService.create(createBusinessDto);
  }

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return await this.businessesService.findAll(page, limit);
  }

  @Get('by-founder/:founderId')
  async findByFounder(@Param('founderId') founderId: string) {
    return await this.businessesService.findByFounder(founderId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.businessesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateBusinessDto: UpdateBusinessDto,
  ) {
    return await this.businessesService.update(id, updateBusinessDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.businessesService.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id') id: string) {
    return await this.businessesService.restore(id);
  }
}