import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Person, PersonSchema } from './schemas/person.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Person.name, schema: PersonSchema }])],
  // Add controllers and providers if/when they are created
  controllers: [],
  providers: [],
  exports: [], // Export services if they need to be used by other modules
})
export class UsersModule {}
