import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { BusinessesModule } from './businesses/businesses.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuthModule } from './auth/auth.module';

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
    PermissionsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
