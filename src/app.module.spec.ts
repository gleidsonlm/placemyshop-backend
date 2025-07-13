import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Role } from './roles/schemas/role.schema';
import { RoleSeedingService } from './roles/role-seeding.service';
import { Person } from './users/schemas/person.schema'; // Added
import { Business } from './businesses/schemas/business.schema'; // Added

// No more global jest.mock('@nestjs/mongoose')

describe('AppModule', () => {
  let testingModule: TestingModule;
  let app: any; // For potential e2e-like checks if needed, or just for compilation

  beforeEach(async () => {
    jest.setTimeout(30000); // Increase timeout for this describe block
    testingModule = await Test.createTestingModule({
      imports: [AppModule], // AppModule imports RolesModule, UsersModule, etc.
    })
    .overrideProvider(ConfigService)
    .useValue({
      get: jest.fn((key: string) => {
        if (key === 'MONGODB_URI') {
          return 'mongodb://localhost/test_db_app_module_spec'; // Mock URI
        }
        // Add other env variables if your app module depends on them during init
        return process.env[key];
      }),
    })
    .useMocker((token) => {
      const roleModelToken = getModelToken(Role.name);
      const personModelToken = getModelToken(Person.name);
      const businessModelToken = getModelToken(Business.name);

      if (token === roleModelToken || token === personModelToken || token === businessModelToken) {
        // Generic Mongoose Model Mock (Constructor with static methods like findOne, and instance save)
        const mockSaveInstanceFn = jest.fn().mockResolvedValue({});
        const mockInstance = (dto: any) => ({ ...dto, save: mockSaveInstanceFn });
        const MockCtor = jest.fn().mockImplementation(mockInstance);

        (MockCtor as any).findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
        (MockCtor as any).findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
        (MockCtor as any).find = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
        (MockCtor as any).create = jest.fn().mockImplementation(dto => Promise.resolve(dto));
        // Add other common static model methods if needed by any service during init

        return MockCtor;
      }

      // Generic fallback for other unmocked dependencies
      // This is a very basic generic mock. Consider using a library like jest-mock-extended if needed.
      if (typeof token === 'function' && token.prototype) {
        const mockPrototype: { [key: string]: any } = {};
        Object.getOwnPropertyNames(token.prototype).forEach(key => {
          if (typeof token.prototype[key] === 'function') {
            mockPrototype[key] = jest.fn();
          }
        });
        const ctorMock = jest.fn().mockImplementation(() => mockPrototype);
        return ctorMock; // Return a mock constructor
      }
      return jest.fn(); // Fallback for non-constructor tokens
    })
    .compile();

    // Create an application instance if you need to test lifecycle hooks like OnModuleInit properly
    // or simulate requests for e2e-like checks within this test.
    // For just checking module compilation and basic DI, compile() might be enough.
    // app = testingModule.createNestApplication();
    // await app.init(); // This would trigger OnModuleInit for RolesModule
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
