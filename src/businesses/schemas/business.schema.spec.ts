/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
  getModelToken,
  MongooseModule,
  getConnectionToken,
} from '@nestjs/mongoose'; // Import getConnectionToken
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { Business, BusinessSchema, BusinessDocument } from './business.schema';
import {
  Person,
  PersonSchema,
  PersonDocument,
  PersonStatus,
} from '../../users/schemas/person.schema';
import {
  Role,
  RoleSchema,
  RoleDocument,
  RoleName,
} from '../../roles/schemas/role.schema';

describe('Business Schema (with NestJS Testing Module)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let businessModel: Model<BusinessDocument>;
  let personModel: Model<PersonDocument>;
  let roleModel: Model<RoleDocument>;
  let testFounder: PersonDocument;
  let testRole: RoleDocument;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Business.name, schema: BusinessSchema },
          { name: Person.name, schema: PersonSchema },
          { name: Role.name, schema: RoleSchema },
        ]),
      ],
    }).compile();

    businessModel = module.get<Model<BusinessDocument>>(
      getModelToken(Business.name),
    );
    personModel = module.get<Model<PersonDocument>>(getModelToken(Person.name));
    roleModel = module.get<Model<RoleDocument>>(getModelToken(Role.name));
  });

  afterAll(async () => {
    await module.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await roleModel.deleteMany({}).exec();
    testRole = await new roleModel({
      '@id': 'role-uuid-for-business-test',
      roleName: RoleName.ADMIN,
      permissions: [],
    }).save();

    await personModel.deleteMany({}).exec();
    testFounder = await new personModel({
      '@id': 'founder-uuid-for-business-test',
      givenName: 'Test',
      familyName: 'Founder',
      email: 'founder@businesstest.com',
      passwordHash: 'hashed',
      role: testRole._id, // Use ObjectId
      status: PersonStatus.ACTIVE,
    }).save();

    await businessModel.deleteMany({}).exec();
  });

  afterEach(async () => {
    const connection = module.get<Connection>(getConnectionToken());
    const collections = connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('Instance Methods', () => {
    it('should soft delete a business', async () => {
      const businessData = {
        name: 'SoftDelete Biz',
        founder: testFounder._id, // Use ObjectId
      };
      const business = new businessModel(businessData) as BusinessDocument;
      await business.save();

      const saveSpy = jest.spyOn(business, 'save');
      await business.softDelete();

      expect(business.isDeleted).toBe(true);
      expect(business.deletedAt).toBeInstanceOf(Date);
      expect(saveSpy).toHaveBeenCalled();

      const foundWithDeleted = await businessModel
        .findOne({ _id: business._id, isDeleted: true })
        .exec();
      expect(foundWithDeleted).not.toBeNull();
      expect(foundWithDeleted?.isDeleted).toBe(true);

      const foundNonDeleted = await businessModel
        .findOne({ _id: business._id, isDeleted: false })
        .exec();
      expect(foundNonDeleted).toBeNull();
      saveSpy.mockRestore();
    });

    it('should restore a soft-deleted business', async () => {
      const businessData = {
        name: 'Restore Biz',
        founder: testFounder._id, // Use ObjectId
        isDeleted: true,
        deletedAt: new Date(),
      };
      const business = new businessModel(businessData) as BusinessDocument;
      await business.save();

      const saveSpy = jest.spyOn(business, 'save');
      await business.restore();

      expect(business.isDeleted).toBe(false);
      expect(business.deletedAt).toBeUndefined();
      expect(saveSpy).toHaveBeenCalled();

      const foundBusiness = await businessModel.findById(business._id).exec();
      expect(foundBusiness).not.toBeNull();
      expect(foundBusiness?.isDeleted).toBe(false);
      expect(foundBusiness?.deletedAt).toBeNull();
      saveSpy.mockRestore();
    });
  });

  describe('Virtual Properties', () => {
    it('should have dateCreated and dateModified virtuals', async () => {
      const businessData = { name: 'Virtual Biz', founder: testFounder._id }; // Use ObjectId
      const business = new businessModel(businessData) as BusinessDocument;
      const savedBusiness = await business.save();

      await new Promise((resolve) => setTimeout(resolve, 20));
      savedBusiness.name = 'Virtual Biz Updated';
      const updatedBusiness = await savedBusiness.save();

      const businessObj = updatedBusiness.toObject({
        virtuals: true,
      }) as BusinessDocument & { dateCreated: Date; dateModified: Date };

      expect(businessObj.dateCreated).toBeInstanceOf(Date);
      expect(businessObj.dateModified).toBeInstanceOf(Date);
      expect(new Date(businessObj.dateCreated).getTime()).toEqual(
        updatedBusiness.createdAt.getTime(),
      );
      expect(new Date(businessObj.dateModified).getTime()).toEqual(
        updatedBusiness.updatedAt.getTime(),
      );
      expect(updatedBusiness.updatedAt.getTime()).toBeGreaterThan(
        updatedBusiness.createdAt.getTime(),
      );
    });
  });

  describe('toJSON Transformation', () => {
    it('should transform populated founder to JSON-LD like structure', async () => {
      const business = await new businessModel({
        name: 'BizWithPopulatedFounder',
        founder: testFounder._id, // Use ObjectId
      }).save();

      const populatedBusiness = await businessModel
        .findById(business._id)
        .populate<{ founder: PersonDocument }>('founder')
        .exec();
      expect(populatedBusiness).toBeDefined();
      if (!populatedBusiness) return;

      const businessJSON = populatedBusiness.toJSON({ virtuals: true });
      const founderAsAny = businessJSON.founder as any;

      expect(founderAsAny).toBeDefined();
      expect(founderAsAny['@type']).toEqual('Person');
      // console.log(`Business spec - Populated founderAsAny['@id'] type: ${typeof founderAsAny['@id']}, value: ${founderAsAny['@id']}`);
      // console.log(`Business spec - Expected testFounder['@id']: ${testFounder['@id']}, testFounder._id: ${testFounder._id!.toString()}`);
      expect(typeof founderAsAny['@id']).toBe('string');
      expect(founderAsAny['@id']).toEqual(
        testFounder['@id'] || String(testFounder._id),
      );
      expect(founderAsAny.passwordHash).toBeUndefined();
    });

    it('should transform unpopulated founder (ObjectId) to JSON-LD like reference', async () => {
      const business = await new businessModel({
        name: 'BizWithUnpopulatedFounder',
        founder: testFounder._id, // Use ObjectId
      }).save();

      const businessJSON = business.toJSON({ virtuals: true });
      const founderAsAny = businessJSON.founder as any;

      expect(founderAsAny).toBeDefined();
      expect(founderAsAny['@type']).toEqual('Person');
      expect(founderAsAny['@id']).toEqual(String(testFounder._id));
    });

    it('should correctly serialize PostalAddress if present', async () => {
      // PostalAddress is a class, not an interface for this test.
      // The DTO uses a plain object. Here we test the schema's PostalAddress.
      const addressData = {
        // This should match the structure defined in PostalAddress class
        '@type': 'PostalAddress',
        streetAddress: '123 Main St',
        addressLocality: 'Anytown',
      };
      const businessData = {
        name: 'BizWithAddress',
        founder: testFounder._id, // Use ObjectId
        address: addressData,
      };
      const business = await new businessModel(businessData).save();
      const businessJSON = business.toJSON({ virtuals: true });

      expect(businessJSON.address).toBeDefined();
      expect(businessJSON.address!.streetAddress).toEqual('123 Main St');
      expect(businessJSON.address!.addressLocality).toEqual('Anytown');
      expect(businessJSON.address!['@type']).toEqual('PostalAddress');
    });
  });

  describe('Schema Structure', () => {
    it('should save and retrieve a business with all fields', async () => {
      const addressInput = {
        streetAddress: '1 Test St',
        addressLocality: 'Testville',
        addressRegion: 'TS',
        postalCode: '12345',
        addressCountry: 'TC',
      };
      const fullBusinessData = {
        name: 'Full Biz',
        description: 'A complete business entity',
        address: addressInput,
        telephone: '123-456-7890',
        email: 'fullbiz@example.com',
        url: 'http://fullbiz.com',
        sameAs: ['http://facebook.com/fullbiz'],
        openingHours: ['Mon-Fri 9am-5pm'],
        founder: testFounder._id, // Use ObjectId
      };
      const business = new businessModel(fullBusinessData);
      const savedBusiness = await business.save();
      const foundBusiness = await businessModel
        .findById(savedBusiness._id)
        .exec();

      expect(foundBusiness).not.toBeNull();
      expect(foundBusiness?.name).toEqual(fullBusinessData.name);
      expect(foundBusiness?.description).toEqual(fullBusinessData.description);
      expect(foundBusiness?.address?.streetAddress).toEqual(
        addressInput.streetAddress,
      );
      expect(foundBusiness?.telephone).toEqual(fullBusinessData.telephone);
      expect(foundBusiness?.email).toEqual(fullBusinessData.email);
      expect(foundBusiness?.url).toEqual(fullBusinessData.url);
      expect(foundBusiness?.sameAs).toEqual(
        expect.arrayContaining(fullBusinessData.sameAs),
      );
      expect(foundBusiness?.openingHours).toEqual(
        expect.arrayContaining(fullBusinessData.openingHours),
      );
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      expect(foundBusiness?.founder?.toString()).toEqual(
        testFounder._id?.toString(),
      );
    });
  });
});
