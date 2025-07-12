import { validate } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';
import { RoleName, Permission } from '../schemas/role.schema';
import { v4 as uuidv4 } from 'uuid';

describe('CreateRoleDto', () => {
  it('should validate a correct DTO with all fields', async () => {
    const dto = new CreateRoleDto();
    dto['@id'] = uuidv4();
    dto.roleName = RoleName.ADMIN;
    dto.permissions = [
      Permission.MANAGE_USER_ROLES,
      Permission.MANAGE_BUSINESS_DETAILS,
    ];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a correct DTO with minimal fields (permissions optional)', async () => {
    const dto = new CreateRoleDto();
    dto.roleName = RoleName.MANAGER;
    // permissions is optional

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('@id', () => {
    it('should be optional', async () => {
      const dto = new CreateRoleDto();
      dto.roleName = RoleName.ASSISTANT;
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if @id is not a valid UUID', async () => {
      const dto = new CreateRoleDto();
      dto['@id'] = 'not-a-uuid';
      dto.roleName = RoleName.ADMIN;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isUuid).toContain(
        '@id must be a valid UUID v4',
      );
    });
  });

  describe('roleName', () => {
    it('should fail if roleName is empty', async () => {
      const dto = new CreateRoleDto();
      // dto.roleName is not set
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'roleName')?.constraints?.isNotEmpty,
      ).toBeDefined();
    });

    it('should fail if roleName is not a valid enum value', async () => {
      const dto = new CreateRoleDto();
      dto.roleName = 'INVALID_ROLENAME' as RoleName;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'roleName')?.constraints?.isEnum,
      ).toBeDefined();
    });
  });

  describe('permissions', () => {
    it('should be optional', async () => {
      const dto = new CreateRoleDto();
      dto.roleName = RoleName.ASSISTANT;
      // permissions is not provided
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if permissions contains invalid enum values', async () => {
      const dto = new CreateRoleDto();
      dto.roleName = RoleName.ADMIN;
      dto.permissions = [
        Permission.MANAGE_USER_ROLES,
        'INVALID_PERMISSION' as Permission,
      ];
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      // console.log(JSON.stringify(errors, null, 2)); // For debugging
      expect(
        errors.find((e) => e.property === 'permissions')?.constraints?.isEnum,
      ).toBeDefined();
    });

    it('should pass if permissions is an empty array', async () => {
      const dto = new CreateRoleDto();
      dto.roleName = RoleName.ADMIN;
      dto.permissions = [];
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
