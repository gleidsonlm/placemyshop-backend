import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Person, PersonSchema } from './schemas/person.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Person.name, schema: PersonSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
