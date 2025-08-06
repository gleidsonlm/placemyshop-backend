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

import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import { RoleSeedingService } from './role-seeding.service';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
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
