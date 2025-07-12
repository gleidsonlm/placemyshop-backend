/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Role,
  RoleDocument,
  RoleName,
  getDefaultPermissionsForRole,
} from './schemas/role.schema';
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
        const existingRole = await this.roleModel
          .findOne({ roleName, isDeleted: false })
          .exec();
        if (existingRole) {
          this.logger.log(
            `Role "${roleName}" already exists. Skipping creation.`,
          );
        } else {
          const permissions = getDefaultPermissionsForRole(roleName);
          const newRole = new this.roleModel({
            '@id': uuidv4(),
            roleName,
            permissions,
            isDeleted: false, // Explicitly set, though default
            deletedAt: null, // Explicitly set, though default
          });
          await newRole.save();
          this.logger.log(
            `Role "${roleName}" created successfully with @id: ${newRole['@id']}.`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error seeding role "${roleName}": ${error.message}`,
          error.stack,
        );
      }
    }
    this.logger.log('Role seeding process finished.');
  }
}
