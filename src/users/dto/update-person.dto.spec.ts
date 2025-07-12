import { validate } from 'class-validator';
import { UpdatePersonDto } from './update-person.dto';
import { PersonStatus } from '../schemas/person.schema';
import { v4 as uuidv4 } from 'uuid';

describe('UpdatePersonDto', () => {
  it('should validate a DTO with all fields present and correct', async () => {
    const dto = new UpdatePersonDto();
    dto.givenName = 'John Updated';
    dto.familyName = 'Doe Updated';
    dto.email = 'john.doe.updated@example.com';
    dto.telephone = '0987654321';
    dto.password = 'newpassword123';
    dto.roleId = uuidv4();
    dto.status = PersonStatus.INACTIVE;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a DTO with only some fields present', async () => {
    const dto = new UpdatePersonDto();
    dto.givenName = 'JustNameUpdate';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate an empty DTO (all fields optional)', async () => {
    const dto = new UpdatePersonDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('email', () => {
    it('should fail if email is provided but not a valid email format', async () => {
      const dto = new UpdatePersonDto();
      dto.email = 'not-an-email';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'email')?.constraints?.isEmail,
      ).toBeDefined();
    });
  });

  describe('password', () => {
    it('should fail if password is provided but less than 8 characters', async () => {
      const dto = new UpdatePersonDto();
      dto.password = 'short';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'password')?.constraints?.minLength,
      ).toContain('Password must be at least 8 characters long');
    });
  });

  describe('status', () => {
    it('should fail if status is an invalid enum value', async () => {
      const dto = new UpdatePersonDto();
      dto.status = 'INVALID_STATUS_UPDATE' as PersonStatus;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'status')?.constraints?.isEnum,
      ).toBeDefined();
    });
  });

  // Test other specific field validations if they had unique constraints not covered by CreatePersonDto
  // For UpdatePersonDto, most fields are optional, so the main checks are for format if provided.
});
