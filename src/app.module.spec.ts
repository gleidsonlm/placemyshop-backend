import { ConfigService } from '@nestjs/config'; // Ensure this is absolutely first
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

jest.mock('@nestjs/mongoose', () => {
  // Define the class inside the mock factory so it's in scope
  class MockedMongooseProviderModuleForMock {}

  const originalMongoose = jest.requireActual('@nestjs/mongoose');
  // ConfigService should be in scope here due to hoisting of jest.mock and import order
  return {
    ...originalMongoose,
    MongooseModule: {
      ...originalMongoose.MongooseModule,
      forRootAsync: jest.fn((options) => {
        let factoryResult = {};
        if (options && typeof options.useFactory === 'function') {
          const mockConfigServiceInstance = {
            get: jest.fn((key: string) => {
              if (key === 'MONGODB_URI') {
                return 'mongodb://mocked_uri_for_test';
              }
              return undefined;
            }),
          };
          if(options.inject && options.inject.includes(ConfigService)){
            factoryResult = options.useFactory(mockConfigServiceInstance);
          } else {
            factoryResult = options.useFactory();
          }
        }
        return {
          module: MockedMongooseProviderModuleForMock, // Use the class defined inside the factory
          imports: options && options.imports ? options.imports : [],
          providers: [
            { provide: 'MOCKED_MONGOOSE_CONNECTION_PROVIDER', useValue: 'mocked_connection' },
          ],
          exports: [],
        };
      }),
      forFeature: jest.fn().mockReturnValue({
        module: MockedMongooseProviderModuleForMock, // Use the class defined inside the factory
        providers: [{ provide: 'MOCKED_MODEL_PROVIDER', useValue: 'mocked_model' }],
        exports: [],
      }),
    },
  };
});

describe('AppModule', () => {
  let testingModule: TestingModule;

  beforeEach(async () => {
    // Reset mocks before each test if they are stateful (like call counts)
    // (MongooseModule.forRootAsync as jest.Mock).mockClear();
    // (MongooseModule.forFeature as jest.Mock).mockClear();

    testingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        // ConfigModule is globally imported by AppModule.
        // Explicitly importing it here again for the test's DI context might sometimes be necessary
        // if the global registration isn't picked up early enough by the test runner's DI resolution.
        // However, usually, if it's global, it should be fine.
        // For this test, we rely on AppModule's own import of ConfigModule.
      ],
      // If ConfigService is not being provided correctly to the factory in the mock,
      // we might need to provide a mock implementation here.
      // providers: [
      //   {
      //     provide: ConfigService,
      //     useValue: {
      //       get: jest.fn((key: string) => {
      //         if (key === 'MONGODB_URI') return 'mongodb://test-uri';
      //         return null;
      //       }),
      //     },
      //   },
      // ],
    }).compile();
  });

  it('should compile the module', () => {
    expect(testingModule).toBeDefined();
  });

  it('should call MongooseModule.forRootAsync with necessary options', () => {
    expect(MongooseModule.forRootAsync).toHaveBeenCalled();
    const options = (MongooseModule.forRootAsync as jest.Mock).mock.calls[0][0];
    expect(options.imports).toContain(ConfigModule); // or expect(options.imports).toEqual(expect.arrayContaining([ConfigModule]));
    expect(options.useFactory).toBeInstanceOf(Function);
    expect(options.inject).toEqual([ConfigService]);

    // Further test the factory execution (already done by the mock's implementation)
    // To verify line 15 in app.module.ts (uri: configService.get...)
    // we ensure the mock factory calls configService.get
    // The mock for MongooseModule.forRootAsync now internally calls the factory
    // with a mock ConfigService. We can check if that mock's get was called.
    // This requires the mock ConfigService within the MongooseModule mock to be accessible
    // or to check its effects (e.g. if the factoryResult was used).
    // The current mock for MongooseModule.forRootAsync calls useFactory.
    // The factory then calls configService.get('MONGODB_URI').
    // The mock for configService.get inside the MongooseModule mock should have been called.
    // This is an indirect way to confirm coverage for line 15.
  });
});
