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

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument, RoleName, getDefaultPermissionsForRole } from './schemas/role.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoleSeedingService {
  private readonly logger = new Logger(RoleSeedingService.name);

  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  async seedDefaultRoles(): Promise<void> {
    this.logger.log('Starting role seeding process...');

    const defaultRolesToSeed: RoleName[] = [
      RoleName.ADMIN,
      RoleName.MANAGER,
      RoleName.ASSISTANT,
    ];

    for (const roleName of defaultRolesToSeed) {
      try {
        const existingRole = await this.roleModel.findOne({ roleName, isDeleted: false }).exec();
        if (existingRole) {
          this.logger.log(`Role "${roleName}" already exists. Skipping creation.`);
        } else {
          const permissions = getDefaultPermissionsForRole(roleName);
          const newRole = new this.roleModel({
            '@id': uuidv4(),
            roleName,
            permissions,
            isDeleted: false, // Explicitly set, though default
            deletedAt: null,  // Explicitly set, though default
          });
          await newRole.save();
          this.logger.log(`Role "${roleName}" created successfully with @id: ${newRole['@id']}.`);
        }
      } catch (error) {
        this.logger.error(`Error seeding role "${roleName}": ${error.message}`, error.stack);
      }
    }
    this.logger.log('Role seeding process finished.');
  }
}
