import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './schemas/business.schema';
// Import PersonModule if BusinessService needs to interact with Person/User entities directly
// import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
    ]),
    // UsersModule, // If population or direct interaction is needed from BusinessService
  ],
  controllers: [], // To be added
  providers: [], // To be added
  exports: [], // To be added
})
export class BusinessesModule {}
