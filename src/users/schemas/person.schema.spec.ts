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
  Person,
  PersonSchema,
  PersonDocument,
  PersonStatus,
} from './person.schema';
import {
  Role,
  RoleSchema,
  RoleDocument,
  RoleName,
} from '../../roles/schemas/role.schema';

// Helper to connect Mongoose and get a connection for testing purposes
// This is simplified; for full NestJS module testing, MongooseModule.forRootAsync is better
// but for direct model testing, this can work if models are registered.
// However, the NestJS testing module approach is preferred.

describe('Person Schema (with NestJS Testing Module)', () => {
  let mongod: MongoMemoryServer;
  let module: TestingModule;
  let personModel: Model<PersonDocument>;
  let roleModel: Model<RoleDocument>;
  let testRole: RoleDocument;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Person.name, schema: PersonSchema },
          { name: Role.name, schema: RoleSchema },
        ]),
      ],
    }).compile();

    personModel = module.get<Model<PersonDocument>>(getModelToken(Person.name));
    roleModel = module.get<Model<RoleDocument>>(getModelToken(Role.name));
  });

  afterAll(async () => {
    await module.close(); // Closes the Mongoose connection managed by NestJS
    await mongod.stop();
  });

  beforeEach(async () => {
    await roleModel.deleteMany({});
    testRole = await new roleModel({
      '@id': 'role-uuid-for-person-test',
      roleName: RoleName.ASSISTANT,
      permissions: [],
    }).save();

    await personModel.deleteMany({});
  });

  afterEach(async () => {
    // Clean up collections after each test
    const connection = module.get<Connection>(getConnectionToken());
    const collections = connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('Instance Methods', () => {
    it('should soft delete a person', async () => {
      const personData = {
        givenName: 'John',
        familyName: 'Doe',
        email: 'john.doe.softdelete@example.com',
        passwordHash: 'hashedpassword',
        role: testRole._id,
        status: PersonStatus.ACTIVE,
      };
      // When creating an instance with methods, ensure it's cast to the Document type
      const person = new personModel(personData) as PersonDocument;
      await person.save();

      const saveSpy = jest.spyOn(person, 'save');
      await person.softDelete(); // This should now be recognized

      expect(person.isDeleted).toBe(true);
      expect(person.deletedAt).toBeInstanceOf(Date);
      expect(saveSpy).toHaveBeenCalled();

      const foundWithDeleted = await personModel
        .findOne({ _id: person._id, isDeleted: true })
        .exec();
      expect(foundWithDeleted).not.toBeNull();
      expect(foundWithDeleted?.isDeleted).toBe(true);

      const foundNonDeleted = await personModel
        .findOne({ _id: person._id, isDeleted: false })
        .exec();
      expect(foundNonDeleted).toBeNull();

      saveSpy.mockRestore();
    });

    it('should restore a soft-deleted person', async () => {
      const personData = {
        givenName: 'Jane',
        familyName: 'Doe',
        email: 'jane.doe.restore@example.com',
        passwordHash: 'hashedpassword',
        role: testRole._id,
        status: PersonStatus.ACTIVE,
        isDeleted: true,
        deletedAt: new Date(),
      };
      const person = new personModel(personData) as PersonDocument;
      await person.save();

      const saveSpy = jest.spyOn(person, 'save');
      await person.restore(); // This should now be recognized

      expect(person.isDeleted).toBe(false);
      expect(person.deletedAt).toBeUndefined();
      expect(saveSpy).toHaveBeenCalled();

      const foundPerson = await personModel.findById(person._id).exec();
      expect(foundPerson).not.toBeNull();
      expect(foundPerson?.isDeleted).toBe(false);
      expect(foundPerson?.deletedAt).toBeNull();
      saveSpy.mockRestore();
    });
  });

  describe('Virtual Properties', () => {
    it('should have dateCreated and dateModified virtuals reflecting createdAt and updatedAt', async () => {
      const personData = {
        givenName: 'Jim',
        familyName: 'Beam',
        email: 'jim.beam.virtuals@example.com',
        passwordHash: 'hashedpassword',
        role: testRole._id,
      };
      const person = new personModel(personData) as PersonDocument;
      const savedPerson = await person.save();

      await new Promise((resolve) => setTimeout(resolve, 20));
      savedPerson.givenName = 'James';
      const updatedPerson = await savedPerson.save();

      // Use toObject({ virtuals: true }) explicitly if default is not set project-wide
      const personObj = updatedPerson.toObject({
        virtuals: true,
      }) as PersonDocument & { dateCreated: Date; dateModified: Date };

      expect(personObj.dateCreated).toBeInstanceOf(Date);
      expect(personObj.dateModified).toBeInstanceOf(Date);
      // Mongoose might return string from toObject if not properly typed, ensure Date
      expect(new Date(personObj.dateCreated).getTime()).toEqual(
        updatedPerson.createdAt.getTime(),
      );
      expect(new Date(personObj.dateModified).getTime()).toEqual(
        updatedPerson.updatedAt.getTime(),
      );
      expect(updatedPerson.updatedAt.getTime()).toBeGreaterThan(
        updatedPerson.createdAt.getTime(),
      );
    });
  });

  describe('toJSON Transformation', () => {
    it('should remove passwordHash from JSON output', async () => {
      const personData = {
        givenName: 'Slim',
        familyName: 'Pickens',
        email: 'slim.pickens.tojson@example.com',
        passwordHash: 'supersecret',
        role: testRole._id,
      };
      const person = await new personModel(personData).save();
      const personJSON = person.toJSON({ virtuals: true }); // Ensure virtuals for consistency

      expect(personJSON.passwordHash).toBeUndefined();
      expect(personJSON.givenName).toEqual('Slim');
      expect(personJSON.dateCreated).toBeDefined(); // Check if virtual is present
    });

    it('should transform populated role to JSON-LD like structure', async () => {
      const person = await new personModel({
        givenName: 'Populated',
        familyName: 'RolePerson',
        email: 'populated.role.person@example.com',
        passwordHash: 'hashed',
        role: testRole._id,
      }).save();

      const populatedPersonDoc = await personModel
        .findById(person._id)
        .populate<{ role: RoleDocument }>('role')
        .exec();
      expect(populatedPersonDoc).toBeDefined();
      if (!populatedPersonDoc) return;

      const personJSON = populatedPersonDoc.toJSON({ virtuals: true });
      const roleAsAny = personJSON.role as any;

      expect(roleAsAny).toBeDefined();
      expect(roleAsAny['@type']).toEqual('Role');
      // console.log(`Person spec - Populated roleAsAny['@id'] type: ${typeof roleAsAny['@id']}, value: ${roleAsAny['@id']}`);
      // console.log(`Person spec - Expected testRole['@id']: ${testRole['@id']}, testRole._id: ${testRole._id!.toString()}`);
      expect(typeof roleAsAny['@id']).toBe('string'); // Assert it's a string first
      expect(roleAsAny['@id']).toEqual(
        testRole['@id'] || testRole._id!.toString(),
      ); // Compare strings
      expect(roleAsAny.roleName).toEqual(testRole.roleName);
    });

    it('should transform unpopulated role (ObjectId) to JSON-LD like reference', async () => {
      const person = await new personModel({
        givenName: 'Unpopulated',
        familyName: 'RolePerson2',
        email: 'unpopulated.role.person@example.com',
        passwordHash: 'hashed',
        role: testRole._id,
      }).save();

      const personJSON = person.toJSON({ virtuals: true });
      const roleAsAny = personJSON.role as any;

      expect(roleAsAny).toBeDefined();
      expect(roleAsAny['@type']).toEqual('Role');
      expect(roleAsAny['@id']).toEqual(testRole._id!.toString());
      expect(roleAsAny.roleName).toBeUndefined();
    });
  });
});
