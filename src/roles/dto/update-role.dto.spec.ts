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

import { validate } from 'class-validator';
import { UpdateRoleDto } from './update-role.dto';
import { RoleName, Permission } from '../schemas/role.schema';

describe('UpdateRoleDto', () => {
  it('should validate a DTO with all fields present and correct', async () => {
    const dto = new UpdateRoleDto();
    dto.roleName = RoleName.MANAGER;
    dto.permissions = [Permission.MANAGE_CUSTOMERS_MANAGER];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a DTO with only roleName present', async () => {
    const dto = new UpdateRoleDto();
    dto.roleName = RoleName.ASSISTANT;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a DTO with only permissions present', async () => {
    const dto = new UpdateRoleDto();
    dto.permissions = [Permission.ACCESS_CUSTOMER_CHAT_READ_WRITE];
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate an empty DTO (all fields optional)', async () => {
    const dto = new UpdateRoleDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('roleName', () => {
    it('should fail if roleName is provided but not a valid enum value', async () => {
      const dto = new UpdateRoleDto();
      dto.roleName = 'INVALID_ROLENAME_UPDATE' as RoleName;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'roleName')?.constraints?.isEnum,
      ).toBeDefined();
    });
  });

  describe('permissions', () => {
    it('should fail if permissions is provided and contains invalid enum values', async () => {
      const dto = new UpdateRoleDto();
      dto.permissions = [
        Permission.MANAGE_USER_ROLES,
        'INVALID_PERMISSION_UPDATE' as Permission,
      ];
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'permissions')?.constraints?.isEnum,
      ).toBeDefined();
    });

    it('should pass if permissions is an empty array', async () => {
      const dto = new UpdateRoleDto();
      dto.permissions = [];
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
