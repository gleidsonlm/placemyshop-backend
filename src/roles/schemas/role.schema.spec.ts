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

import {
  getModelToken,
  MongooseModule,
  getConnectionToken,
} from '@nestjs/mongoose'; // Import getConnectionToken
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import {
  Role,
  RoleSchema,
  RoleDocument,
  RoleName,
  Permission,
  getDefaultPermissionsForRole,
} from './role.schema';

describe('Role Schema (with NestJS Testing Module)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let roleModel: Model<RoleDocument>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
      ],
    }).compile();

    roleModel = module.get<Model<RoleDocument>>(getModelToken(Role.name));
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await roleModel.deleteMany({}).exec();
  });

  afterEach(async () => {
    // const collections = module.get(Connection).collections; // Old way
    const connection = module.get<Connection>(getConnectionToken());
    const collections = connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('Instance Methods', () => {
    it('should soft delete a role', async () => {
      const roleData = {
        roleName: RoleName.ADMIN,
        permissions: getDefaultPermissionsForRole(RoleName.ADMIN),
      };
      const role = new roleModel(roleData) as RoleDocument;
      await role.save();

      const saveSpy = jest.spyOn(role, 'save');
      await role.softDelete();

      expect(role.isDeleted).toBe(true);
      expect(role.deletedAt).toBeInstanceOf(Date);
      expect(saveSpy).toHaveBeenCalled();

      const foundWithDeleted = await roleModel
        .findOne({ _id: role._id, isDeleted: true })
        .exec();
      expect(foundWithDeleted).not.toBeNull();
      expect(foundWithDeleted?.isDeleted).toBe(true);

      const foundNonDeleted = await roleModel
        .findOne({ _id: role._id, isDeleted: false })
        .exec();
      expect(foundNonDeleted).toBeNull();
      saveSpy.mockRestore();
    });

    it('should restore a soft-deleted role', async () => {
      const roleData = {
        roleName: RoleName.MANAGER,
        permissions: getDefaultPermissionsForRole(RoleName.MANAGER),
        isDeleted: true,
        deletedAt: new Date(),
      };
      const role = new roleModel(roleData) as RoleDocument;
      await role.save();

      const saveSpy = jest.spyOn(role, 'save');
      await role.restore();

      expect(role.isDeleted).toBe(false);
      expect(role.deletedAt).toBeUndefined();
      expect(saveSpy).toHaveBeenCalled();

      const foundRole = await roleModel.findById(role._id).exec();
      expect(foundRole).not.toBeNull();
      expect(foundRole?.isDeleted).toBe(false);
      expect(foundRole?.deletedAt).toBeNull();
      saveSpy.mockRestore();
    });
  });

  describe('Virtual Properties', () => {
    it('should have dateCreated and dateModified virtuals', async () => {
      const roleData = {
        roleName: RoleName.ASSISTANT,
        permissions: getDefaultPermissionsForRole(RoleName.ASSISTANT),
      };
      const role = new roleModel(roleData) as RoleDocument;
      const savedRole = await role.save();

      await new Promise((resolve) => setTimeout(resolve, 20));
      savedRole.permissions = [
        ...savedRole.permissions,
        Permission.MANAGE_BUSINESS_DETAILS,
      ];
      const updatedRole = await savedRole.save();

      const roleObj = updatedRole.toObject({
        virtuals: true,
      }) as RoleDocument & { dateCreated: Date; dateModified: Date };

      expect(roleObj.dateCreated).toBeInstanceOf(Date);
      expect(roleObj.dateModified).toBeInstanceOf(Date);
      expect(new Date(roleObj.dateCreated).getTime()).toEqual(
        updatedRole.createdAt.getTime(),
      );
      expect(new Date(roleObj.dateModified).getTime()).toEqual(
        updatedRole.updatedAt.getTime(),
      );
      expect(updatedRole.updatedAt.getTime()).toBeGreaterThan(
        updatedRole.createdAt.getTime(),
      );
    });
  });

  describe('toJSON Transformation', () => {
    it('should include virtuals and @id in toJSON output', async () => {
      const roleData = {
        roleName: RoleName.ADMIN,
        permissions: getDefaultPermissionsForRole(RoleName.ADMIN),
      };
      const role = await new roleModel(roleData).save();
      const roleJSON = role.toJSON({ virtuals: true });

      expect(roleJSON.dateCreated).toBeDefined();
      expect(roleJSON.dateModified).toBeDefined();
      expect(roleJSON['@id']).toEqual(role['@id']);
    });
  });

  describe('getDefaultPermissionsForRole Helper', () => {
    it('should return correct permissions for ADMIN', () => {
      const permissions = getDefaultPermissionsForRole(RoleName.ADMIN);
      expect(permissions).toEqual(
        expect.arrayContaining([
          Permission.MANAGE_USER_ROLES,
          Permission.MANAGE_BUSINESS_DETAILS,
          Permission.MANAGE_CUSTOMERS_ADMIN,
          Permission.ACCESS_CUSTOMER_CHAT_FULL_ADMIN,
          Permission.MANAGE_EXTERNAL_INTEGRATIONS,
        ]),
      );
      expect(permissions.length).toBe(5);
    });

    it('should return correct permissions for MANAGER', () => {
      const permissions = getDefaultPermissionsForRole(RoleName.MANAGER);
      expect(permissions).toEqual(
        expect.arrayContaining([
          Permission.MANAGE_CUSTOMERS_MANAGER,
          Permission.ACCESS_CUSTOMER_CHAT_FULL_MANAGER,
        ]),
      );
      expect(permissions.length).toBe(2);
    });

    it('should return correct permissions for ASSISTANT', () => {
      const permissions = getDefaultPermissionsForRole(RoleName.ASSISTANT);
      expect(permissions).toEqual(
        expect.arrayContaining([Permission.ACCESS_CUSTOMER_CHAT_READ_WRITE]),
      );
      expect(permissions.length).toBe(1);
    });

    it('should return empty array for an unknown role name', () => {
      const permissions = getDefaultPermissionsForRole(
        'UnknownRole' as RoleName,
      );
      expect(permissions).toEqual([]);
    });
  });
});
