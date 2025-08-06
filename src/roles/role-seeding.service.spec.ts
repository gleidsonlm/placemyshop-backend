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

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RoleSeedingService } from './role-seeding.service';
import {
  Role,
  RoleName,
  getDefaultPermissionsForRole,
} from './schemas/role.schema';
import { Logger } from '@nestjs/common';

// Mock the Logger
jest.mock('@nestjs/common/services/logger.service');

// Define a base mock for save outside, so we can track its calls across instances
const mockSave = jest.fn();
const mockRoleInstance = (dto: Partial<Role>) => ({
  ...dto,
  save: mockSave, // All instances will share this mockSave
});

// This is the mock constructor for the Role model
const MockRoleModelCtor = jest.fn().mockImplementation(mockRoleInstance);

// Static methods like findOne, find, etc., are attached to the constructor itself
(MockRoleModelCtor as unknown as Record<string, unknown>).findOne = jest
  .fn()
  .mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  });

describe('RoleSeedingService', () => {
  let service: RoleSeedingService;

  beforeEach(async () => {
    // Clear all previous mock calls and implementations for all mocks
    jest.clearAllMocks();

    // Reset/re-configure mocks for each test to ensure isolation
    // Static findOne method
    ((MockRoleModelCtor as any).findOne as jest.Mock)
      .mockClear()
      .mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

    // Instance save method (via mockSave shared by all instances)
    mockSave.mockClear().mockResolvedValue({
      /* some resolved value */
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleSeedingService,
        {
          provide: getModelToken(Role.name),
          useValue: MockRoleModelCtor, // Provide the mock constructor
        },
      ],
    }).compile();

    service = module.get<RoleSeedingService>(RoleSeedingService);
    // MockRoleModelCtor is used by the service via dependency injection
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedDefaultRoles', () => {
    it('should create all default roles if none exist', async () => {
      // findOne().exec() will return null by default setup in beforeEach

      await service.seedDefaultRoles();

      // Check that findOne was called for each role
      expect((MockRoleModelCtor as any).findOne).toHaveBeenCalledTimes(3);
      expect((MockRoleModelCtor as any).findOne).toHaveBeenCalledWith({
        roleName: RoleName.ADMIN,
        isDeleted: false,
      });
      expect((MockRoleModelCtor as any).findOne).toHaveBeenCalledWith({
        roleName: RoleName.MANAGER,
        isDeleted: false,
      });
      expect((MockRoleModelCtor as any).findOne).toHaveBeenCalledWith({
        roleName: RoleName.ASSISTANT,
        isDeleted: false,
      });

      // Check that the constructor was called for each role
      expect(MockRoleModelCtor).toHaveBeenCalledTimes(3);

      const adminPermissions = getDefaultPermissionsForRole(RoleName.ADMIN);
      const managerPermissions = getDefaultPermissionsForRole(RoleName.MANAGER);
      const assistantPermissions = getDefaultPermissionsForRole(
        RoleName.ASSISTANT,
      );

      expect(MockRoleModelCtor).toHaveBeenCalledWith(
        expect.objectContaining({
          roleName: RoleName.ADMIN,
          permissions: adminPermissions,
          '@id': expect.any(String),
        }),
      );
      expect(MockRoleModelCtor).toHaveBeenCalledWith(
        expect.objectContaining({
          roleName: RoleName.MANAGER,
          permissions: managerPermissions,
          '@id': expect.any(String),
        }),
      );
      expect(MockRoleModelCtor).toHaveBeenCalledWith(
        expect.objectContaining({
          roleName: RoleName.ASSISTANT,
          permissions: assistantPermissions,
          '@id': expect.any(String),
        }),
      );

      // Check that save was called 3 times (once for each new role instance)
      expect(mockSave).toHaveBeenCalledTimes(3);
    });

    it('should not create any roles if all default roles already exist', async () => {
      // Override findOne to return existing roles
      ((MockRoleModelCtor as any).findOne as jest.Mock).mockImplementation(
        (query: any) => {
          if (query.roleName === RoleName.ADMIN)
            return {
              exec: jest.fn().mockResolvedValue({ roleName: RoleName.ADMIN }),
            };
          if (query.roleName === RoleName.MANAGER)
            return {
              exec: jest.fn().mockResolvedValue({ roleName: RoleName.MANAGER }),
            };
          if (query.roleName === RoleName.ASSISTANT)
            return {
              exec: jest
                .fn()
                .mockResolvedValue({ roleName: RoleName.ASSISTANT }),
            };
          return { exec: jest.fn().mockResolvedValue(null) };
        },
      );

      await service.seedDefaultRoles();

      expect((MockRoleModelCtor as any).findOne).toHaveBeenCalledTimes(3);
      expect(MockRoleModelCtor).not.toHaveBeenCalled(); // Constructor should not be called
      expect(mockSave).not.toHaveBeenCalled(); // Save should not be called
    });

    it('should create missing roles if some default roles already exist', async () => {
      ((MockRoleModelCtor as any).findOne as jest.Mock).mockImplementation(
        (query: any) => {
          if (query.roleName === RoleName.ADMIN)
            return {
              exec: jest.fn().mockResolvedValue({
                roleName: RoleName.ADMIN,
                isDeleted: false,
              }),
            }; // Admin exists
          if (query.roleName === RoleName.MANAGER)
            return { exec: jest.fn().mockResolvedValue(null) }; // Manager does NOT exist
          if (query.roleName === RoleName.ASSISTANT)
            return {
              exec: jest.fn().mockResolvedValue({
                roleName: RoleName.ASSISTANT,
                isDeleted: false,
              }),
            }; // Assistant exists
          return { exec: jest.fn().mockResolvedValue(null) };
        },
      );

      await service.seedDefaultRoles();

      expect((MockRoleModelCtor as any).findOne).toHaveBeenCalledTimes(3);
      expect(MockRoleModelCtor).toHaveBeenCalledTimes(1); // Only for Manager

      const managerPermissions = getDefaultPermissionsForRole(RoleName.MANAGER);
      expect(MockRoleModelCtor).toHaveBeenCalledWith(
        expect.objectContaining({
          roleName: RoleName.MANAGER,
          permissions: managerPermissions,
          '@id': expect.any(String),
        }),
      );

      expect(mockSave).toHaveBeenCalledTimes(1); // Only manager's instance should save
    });

    it('should log an error and continue if saving a role fails', async () => {
      const error = new Error('DB save failed');

      // All roles initially appear not to exist
      ((MockRoleModelCtor as any).findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock save to fail for Manager, succeed for others
      mockSave
        .mockResolvedValueOnce({ roleName: RoleName.ADMIN }) // Successful save for Admin
        .mockRejectedValueOnce(error) // Failed save for Manager
        .mockResolvedValueOnce({ roleName: RoleName.ASSISTANT }); // Successful save for Assistant

      await service.seedDefaultRoles();

      expect(MockRoleModelCtor).toHaveBeenCalledTimes(3); // Attempt to create all three
      expect(mockSave).toHaveBeenCalledTimes(3); // Save attempted for all three

      // Check Logger.error was called.
      // Since Logger is auto-mocked, its methods on the prototype are jest.fn()
      // and instances created will also have these methods as jest.fn().
      // We need to ensure the specific instance's method was called or
      // that the generic prototype method was called.
      // The service creates its own instance: private readonly logger = new Logger(...)
      // So, we expect Logger constructor to be called, and then error on its instance.

      // Verify that an instance of Logger had its 'error' method called.
      // This relies on the auto-mocking behavior of jest.mock('@nestjs/common').
      // All instances of Logger will have their methods as jest.fn().
      // We can check the mock calls on Logger itself if it's a static method, or on its prototype for instance methods.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `Error seeding role "${RoleName.MANAGER}": ${error.message}`,
        error.stack,
      );
    });
  });
});
