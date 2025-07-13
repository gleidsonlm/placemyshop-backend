import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateBusinessDto } from './update-business.dto';
// PostalAddressDto is implicitly tested via CreateBusinessDto, but can be re-tested if needed

describe('UpdateBusinessDto', () => {
  it('should validate a DTO with all fields present and correct', async () => {
    const dto = new UpdateBusinessDto();
    dto.name = 'Updated Test Business';
    dto.description = 'An updated test business description.';
    dto.address = {
      streetAddress: '456 Updated St',
      addressLocality: 'Newville',
    };
    dto.telephone = '987-654-3210';
    dto.email = 'updated.contact@testbusiness.com';
    dto.url = 'http://updated.testbusiness.com';
    dto.sameAs = ['http://twitter.com/testbusiness'];
    dto.openingHours = ['Sat-Sun 10am-4pm'];

    const transformedDto = plainToClass(UpdateBusinessDto, dto);
    const errors = await validate(transformedDto);
    if (errors.length > 0) {
      console.log(
        'Validation errors for "UpdateBusinessDto all fields":',
        JSON.stringify(errors, null, 2),
      );
    }
    expect(errors.length).toBe(0);
  });

  it('should validate a DTO with only some fields present', async () => {
    const dto = new UpdateBusinessDto();
    dto.name = 'Just Name Update Biz';
    dto.email = 'partial.update@example.com';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate an empty DTO (all fields optional)', async () => {
    const dto = new UpdateBusinessDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('email', () => {
    it('should fail if email is provided but invalid format', async () => {
      const dto = new UpdateBusinessDto();
      dto.email = 'not-an-email-update';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'email')?.constraints?.isEmail,
      ).toBeDefined();
    });
  });

  describe('url', () => {
    it('should fail if url is provided but invalid format', async () => {
      const dto = new UpdateBusinessDto();
      dto.url = 'not-a-url-update';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'url')?.constraints?.isUrl,
      ).toBeDefined();
    });
  });

  describe('sameAs', () => {
    it('should fail if sameAs contains invalid URLs', async () => {
      const dto = new UpdateBusinessDto();
      dto.sameAs = ['http://validupdate.com', 'not-a-url-for-update'];
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const sameAsError = errors.find((e) => e.property === 'sameAs');
      expect(sameAsError).toBeDefined();
      expect(sameAsError?.constraints?.isUrl).toContain(
        'each value in sameAs must be a URL address',
      );
    });
  });

  describe('address (PostalAddressDto)', () => {
    it('should validate nested PostalAddressDto correctly when provided', async () => {
      const dto = new UpdateBusinessDto();
      dto.address = {
        streetAddress: '789 Another St',
        // other fields are optional
      };
      const transformedDto = plainToClass(UpdateBusinessDto, dto);
      const errors = await validate(transformedDto);
      if (errors.length > 0) {
        console.log(
          'Validation errors for "UpdateBusinessDto nested PostalAddressDto":',
          JSON.stringify(errors, null, 2),
        );
      }
      expect(errors.length).toBe(0);
    });
  });
});
