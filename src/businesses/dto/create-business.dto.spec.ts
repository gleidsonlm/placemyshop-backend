import 'reflect-metadata';
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
import { plainToClass } from 'class-transformer';
import { CreateBusinessDto, PostalAddressDto } from './create-business.dto';
import { v4 as uuidv4 } from 'uuid';

describe('CreateBusinessDto', () => {
  const validFounderId = uuidv4();

  it('should validate a correct DTO with all fields', async () => {
    const dto = new CreateBusinessDto();
    dto['@id'] = uuidv4();
    dto.name = 'Test Business';
    dto.description = 'A test business description.';
    dto.address = {
      streetAddress: '123 Test St',
      addressLocality: 'Testville',
      addressRegion: 'TS',
      postalCode: '12345',
      addressCountry: 'TC',
    };
    dto.telephone = '123-456-7890';
    dto.email = 'contact@testbusiness.com';
    dto.url = 'http://testbusiness.com';
    dto.sameAs = ['http://facebook.com/testbusiness'];
    dto.openingHours = ['Mon-Fri 9am-5pm'];
    dto.founderId = validFounderId;

    const transformedDto = plainToClass(CreateBusinessDto, dto);
    const errors = await validate(transformedDto);
    if (errors.length > 0) {
      console.log(
        'Validation errors for "correct DTO with all fields":',
        JSON.stringify(errors, null, 2),
      );
    }
    expect(errors.length).toBe(0);
  });

  it('should validate a correct DTO with minimal required fields (name, founderId)', async () => {
    const dto = new CreateBusinessDto();
    dto.name = 'Minimal Business';
    dto.founderId = validFounderId;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('@id', () => {
    it('should be optional', async () => {
      const dto = new CreateBusinessDto();
      dto.name = 'ID Optional Business';
      dto.founderId = validFounderId;
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if @id is not a valid UUID', async () => {
      const dto = new CreateBusinessDto();
      dto['@id'] = 'not-a-uuid';
      dto.name = 'ID Fail Business';
      dto.founderId = validFounderId;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isUuid).toContain(
        '@id must be a valid UUID v4',
      );
    });
  });

  describe('name', () => {
    it('should fail if name is empty', async () => {
      const dto = new CreateBusinessDto();
      dto.founderId = validFounderId;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'name')?.constraints?.isNotEmpty,
      ).toBeDefined();
    });
  });

  describe('founderId', () => {
    it('should fail if founderId is empty', async () => {
      const dto = new CreateBusinessDto();
      dto.name = 'No Founder Inc.';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'founderId')?.constraints?.isNotEmpty,
      ).toBeDefined();
    });
  });

  describe('email', () => {
    it('should fail if email is provided but invalid format', async () => {
      const dto = new CreateBusinessDto();
      dto.name = 'Email Test Biz';
      dto.founderId = validFounderId;
      dto.email = 'not-an-email';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'email')?.constraints?.isEmail,
      ).toBeDefined();
    });
  });

  describe('url', () => {
    it('should fail if url is provided but invalid format', async () => {
      const dto = new CreateBusinessDto();
      dto.name = 'URL Test Biz';
      dto.founderId = validFounderId;
      dto.url = 'not-a-url';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.find((e) => e.property === 'url')?.constraints?.isUrl,
      ).toBeDefined();
    });
  });

  describe('sameAs', () => {
    it('should fail if sameAs contains invalid URLs', async () => {
      const dto = new CreateBusinessDto();
      dto.name = 'SameAs Test Biz';
      dto.founderId = validFounderId;
      dto.sameAs = ['http://valid.com', 'not-a-url'];
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const sameAsError = errors.find((e) => e.property === 'sameAs');
      expect(sameAsError).toBeDefined();
      // This checks the nested error for the invalid URL in the array
      // For arrays of primitives, the constraint violation is usually directly on the property
      // if 'each: true' is used and one of them fails. The message indicates this.
      expect(sameAsError?.constraints?.isUrl).toContain(
        'each value in sameAs must be a URL address',
      );
    });
  });

  describe('address (PostalAddressDto)', () => {
    it('should validate nested PostalAddressDto correctly', async () => {
      const dto = new CreateBusinessDto();
      dto.name = 'Address Test Biz';
      dto.founderId = validFounderId;
      dto.address = {
        streetAddress: '1 Valid St',
        // other fields are optional in PostalAddressDto
      };
      const transformedDto = plainToClass(CreateBusinessDto, dto);
      const errors = await validate(transformedDto);
      if (errors.length > 0) {
        console.log(
          'Validation errors for "nested PostalAddressDto correctly":',
          JSON.stringify(errors, null, 2),
        );
      }
      expect(errors.length).toBe(0);
    });

    it('should allow PostalAddressDto with all fields empty (all optional)', async () => {
      const dto = new CreateBusinessDto();
      dto.name = 'Empty Address Test Biz';
      dto.founderId = validFounderId;
      dto.address = {}; // All fields in PostalAddressDto are optional
      const transformedDto = plainToClass(CreateBusinessDto, dto);
      const errors = await validate(transformedDto);
      if (errors.length > 0) {
        console.log(
          'Validation errors for "PostalAddressDto with all fields empty":',
          JSON.stringify(errors, null, 2),
        );
      }
      expect(errors.length).toBe(0);
    });
  });
});

describe('PostalAddressDto', () => {
  it('should validate with all fields present', async () => {
    const dto = new PostalAddressDto();
    dto.streetAddress = '123 Main St';
    dto.addressLocality = 'Anytown';
    dto.addressRegion = 'CA';
    dto.postalCode = '90210';
    dto.addressCountry = 'US';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with some fields present', async () => {
    const dto = new PostalAddressDto();
    dto.streetAddress = '456 Oak Ave';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with no fields present (all optional)', async () => {
    const dto = new PostalAddressDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
