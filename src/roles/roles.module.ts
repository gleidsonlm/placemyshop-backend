import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import { RoleSeedingService } from './role-seeding.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  controllers: [],
  providers: [RoleSeedingService], // Add RoleSeedingService to providers
  exports: [RoleSeedingService], // Export RoleSeedingService if it needs to be called from AppModule or other modules
})
export class RolesModule implements OnModuleInit {
  private readonly logger = new Logger(RolesModule.name);

  constructor(private readonly roleSeedingService: RoleSeedingService) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('RolesModule initialized. Triggering role seeding...');
    await this.roleSeedingService.seedDefaultRoles();
  }
}
