/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { BusinessesModule } from './businesses/businesses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): MongooseModuleOptions => ({
        uri: configService.get<string>('MONGODB_URI'),
        // Consider adding other Mongoose options here if needed, e.g.,
        // autoIndex: process.env.NODE_ENV !== 'production', // good for development
        // useNewUrlParser: true, // Deprecated but sometimes needed for older setups
        // useUnifiedTopology: true, // Deprecated
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    RolesModule,
    BusinessesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
