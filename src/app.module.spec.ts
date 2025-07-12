import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Role } from './roles/schemas/role.schema';
import { RoleSeedingService } from './roles/role-seeding.service';
import { Person } from './users/schemas/person.schema';
import { Business } from './businesses/schemas/business.schema';

// Mock MongooseModule to avoid database connection
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@nestjs/mongoose', () => ({
  ...jest.requireActual('@nestjs/mongoose'),
  MongooseModule: {
    forRootAsync: jest.fn(() => ({
      module: jest.fn(),
      providers: [],
      exports: [],
    })),
    forFeature: jest.fn(() => ({
      module: jest.fn(),
      providers: [],
      exports: [],
    })),
  },
}));

describe('AppModule', () => {
  let testingModule: TestingModule;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'MONGODB_URI') {
          return 'mongodb://mock-uri/test_db';
        }
        return process.env[key];
      }),
    };

    testingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .useMocker((token) => {
        const roleModelToken = getModelToken(Role.name);
        const personModelToken = getModelToken(Person.name);
        const businessModelToken = getModelToken(Business.name);

        if (
          token === roleModelToken ||
          token === personModelToken ||
          token === businessModelToken
        ) {
          // Create a mock Mongoose model
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          const mockModel = jest.fn().mockImplementation((dto: unknown) => ({
            ...dto,
            save: jest.fn().mockResolvedValue(dto),
          }));

          // Add static methods that Mongoose models have
          mockModel.findOne = jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
          mockModel.findById = jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
          mockModel.find = jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
          mockModel.create = jest.fn().mockResolvedValue({});

          return mockModel;
        }

        // For any other dependencies, return a basic mock
        return {};
      })
      .compile();
  });

  // afterEach(async () => {
  //   if (app) {
  //     await app.close();
  //   }
  // });

  it('should compile the module', () => {
    expect(testingModule).toBeDefined();
    // Optionally, try to resolve the RoleSeedingService to ensure its dependencies were met
    // This requires RoleSeedingService to be exported from RolesModule or RolesModule to be the testing target.
    // Since we are testing AppModule, this might be an indirect check.
    // If RoleSeedingService is not exported, this get() will fail.
    // const roleSeedingService = testingModule.get<RoleSeedingService>(RoleSeedingService);
    // expect(roleSeedingService).toBeDefined();
  });

  it('should have RoleSeedingService available (indirect check of RoleModel mock)', () => {
    // This test assumes RoleSeedingService is part of a module (RolesModule) that AppModule imports,
    // and that RoleSeedingService is injectable.
    // If RoleSeedingService is correctly instantiated, it implies its RoleModel dependency was resolved.
    // Note: RoleSeedingService needs to be exported from RolesModule to be gettable from AppModule's testingModule.
    // If it's not exported, this test is not feasible this way.
    // For now, let's assume it might not be exported and focus on compilation.
    // A more robust check would be if the app initializes without error if we call app.init().
    expect(() => testingModule.get(RoleSeedingService)).not.toThrow();
  });
});
