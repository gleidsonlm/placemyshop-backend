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
import { CreatePersonDto } from './create-person.dto';
import { PersonStatus } from '../schemas/person.schema';
import { v4 as uuidv4 } from 'uuid';

describe('CreatePersonDto', () => {
  it('should validate a correct DTO', async () => {
    const dto = new CreatePersonDto();
    dto['@id'] = uuidv4();
    dto.givenName = 'John';
    dto.familyName = 'Doe';
    dto.email = 'john.doe@example.com';
    dto.telephone = '1234567890';
    dto.password = 'password123';
    dto.roleId = uuidv4(); // Assuming roleId is a UUID string
    dto.status = PersonStatus.ACTIVE;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should default status to ACTIVE if not provided', async () => {
    const dto = new CreatePersonDto();
    dto.givenName = 'Jane';
    dto.familyName = 'Doe';
    dto.email = 'jane.doe@example.com';
    dto.password = 'password123';
    dto.roleId = uuidv4();
    // status is not provided

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.status).toEqual(PersonStatus.ACTIVE);
  });

  describe('@id', () => {
    it('should be optional', async () => {
      const dto = new CreatePersonDto();
      // dto['@id'] is not provided
      dto.givenName = 'Test';
      dto.familyName = 'User';
      dto.email = 'test.id@example.com';
      dto.password = 'password123';
      dto.roleId = uuidv4();
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if @id is not a valid UUID', async () => {
      const dto = new CreatePersonDto();
      dto['@id'] = 'not-a-uuid';
      dto.givenName = 'Test';
      dto.familyName = 'User';
      dto.email = 'test.id.fail@example.com';
      dto.password = 'password123';
      dto.roleId = uuidv4();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isUuid).toContain(
        '@id must be a valid UUID v4',
      );
    });
  });

  describe('givenName', () => {
    it('should fail if givenName is empty', async () => {
      const dto = new CreatePersonDto();
      dto.familyName = 'Doe';
      dto.email = 'test.givenname@example.com';
      dto.password = 'password123';
      dto.roleId = uuidv4();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'givenName')?.constraints?.isNotEmpty,
      ).toBeDefined();
    });
  });

  describe('familyName', () => {
    it('should fail if familyName is empty', async () => {
      const dto = new CreatePersonDto();
      dto.givenName = 'John';
      dto.email = 'test.familyname@example.com';
      dto.password = 'password123';
      dto.roleId = uuidv4();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'familyName')?.constraints
          ?.isNotEmpty,
      ).toBeDefined();
    });
  });

  describe('email', () => {
    it('should fail if email is empty', async () => {
      const dto = new CreatePersonDto();
      dto.givenName = 'John';
      dto.familyName = 'Doe';
      dto.password = 'password123';
      dto.roleId = uuidv4();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'email')?.constraints?.isNotEmpty,
      ).toBeDefined();
    });

    it('should fail if email is not a valid email format', async () => {
      const dto = new CreatePersonDto();
      dto.givenName = 'John';
      dto.familyName = 'Doe';
      dto.email = 'not-an-email';
      dto.password = 'password123';
      dto.roleId = uuidv4();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'email')?.constraints?.isEmail,
      ).toBeDefined();
    });
  });

  describe('telephone', () => {
    it('should be optional', async () => {
      const dto = new CreatePersonDto();
      dto.givenName = 'Test';
      dto.familyName = 'User';
      dto.email = 'test.telephone@example.com';
      dto.password = 'password123';
      dto.roleId = uuidv4();
      // telephone is not provided
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('password', () => {
    it('should fail if password is empty', async () => {
      const dto = new CreatePersonDto();
      dto.givenName = 'John';
      dto.familyName = 'Doe';
      dto.email = 'test.password@example.com';
      dto.roleId = uuidv4();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'password')?.constraints?.isNotEmpty,
      ).toBeDefined();
    });

    it('should fail if password is less than 8 characters', async () => {
      const dto = new CreatePersonDto();
      dto.givenName = 'John';
      dto.familyName = 'Doe';
      dto.email = 'test.password.short@example.com';
      dto.password = 'short';
      dto.roleId = uuidv4();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'password')?.constraints?.minLength,
      ).toContain('Password must be at least 8 characters long');
    });
  });

  describe('roleId', () => {
    it('should fail if roleId is empty', async () => {
      const dto = new CreatePersonDto();
      dto.givenName = 'John';
      dto.familyName = 'Doe';
      dto.email = 'test.roleid@example.com';
      dto.password = 'password123';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'roleId')?.constraints?.isNotEmpty,
      ).toBeDefined();
    });
  });

  describe('status', () => {
    it('should fail if status is an invalid enum value', async () => {
      const dto = new CreatePersonDto();
      dto.givenName = 'Test';
      dto.familyName = 'User';
      dto.email = 'test.status.fail@example.com';
      dto.password = 'password123';
      dto.roleId = uuidv4();
      dto.status = 'INVALID_STATUS' as PersonStatus;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'status')?.constraints?.isEnum,
      ).toBeDefined();
    });
  });
});
