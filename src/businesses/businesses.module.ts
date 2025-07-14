import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './schemas/business.schema';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { Person, PersonSchema } from '../users/schemas/person.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
      { name: Person.name, schema: PersonSchema },
    ]),
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService], // Export service for use in other modules
})
export class BusinessesModule {}
