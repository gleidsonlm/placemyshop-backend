import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
// Import the bootstrap function we want to test
import { bootstrap } from '../src/main';

// Mock NestFactory and its methods
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe('main.ts - bootstrap function', () => {
  let mockApp: { listen: jest.Mock; getHttpAdapter: jest.Mock; [key: string]: any };

  beforeEach(() => {
    // Reset process.env.PORT
    delete process.env.PORT;

    // Mock the Nest application instance and its methods
    mockApp = {
      listen: jest.fn().mockResolvedValue(undefined),
      getHttpAdapter: jest.fn().mockReturnValue({}),
      // Mock other methods like useGlobalPipes, enableCors, enableShutdownHooks if they are used in main.ts
      // For example: enableShutdownHooks: jest.fn(),
    };

    // Reset and configure the mock for NestFactory.create
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  it('should create Nest application with AppModule', async () => {
    await bootstrap();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
  });

  it('should listen on default port 3000 if process.env.PORT is not set', async () => {
    await bootstrap();
    expect(mockApp.listen).toHaveBeenCalledWith(3000);
  });

  it('should listen on process.env.PORT if set', async () => {
    process.env.PORT = '3001';
    await bootstrap();
    expect(mockApp.listen).toHaveBeenCalledWith('3001');
  });
});
