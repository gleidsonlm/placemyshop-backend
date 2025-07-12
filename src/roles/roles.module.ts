import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import { RoleSeedingService } from './role-seeding.service';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }])],
  controllers: [RolesController],
  providers: [RolesService, RoleSeedingService],
  exports: [RolesService, RoleSeedingService], // Export both services for use in other modules
})
export class RolesModule implements OnModuleInit {
  private readonly logger = new Logger(RolesModule.name);

  constructor(private readonly roleSeedingService: RoleSeedingService) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('RolesModule initialized. Triggering role seeding...');
    await this.roleSeedingService.seedDefaultRoles();
  }
}
