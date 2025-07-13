import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreatePersonDto } from './dto/create-person.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.usersService.create(createPersonDto);
  }
}
