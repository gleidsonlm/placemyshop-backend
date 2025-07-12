import 'reflect-metadata';

// Mock Swagger decorators globally for unit tests
jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  })),
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue({}),
    setup: jest.fn(),
  },
  ApiProperty: jest.fn(() => (target: any, key: string) => {}),
  ApiPropertyOptional: jest.fn(() => (target: any, key: string) => {}),
  ApiTags: jest.fn(() => (target: any) => {}),
  ApiOperation: jest.fn(() => (target: any, key: string, descriptor: PropertyDescriptor) => {}),
  ApiResponse: jest.fn(() => (target: any, key: string, descriptor: PropertyDescriptor) => {}),
  ApiParam: jest.fn(() => (target: any, key: string, descriptor: PropertyDescriptor) => {}),
  ApiQuery: jest.fn(() => (target: any, key: string, descriptor: PropertyDescriptor) => {}),
  ApiBody: jest.fn(() => (target: any, key: string, descriptor: PropertyDescriptor) => {}),
  ApiBearerAuth: jest.fn(() => (target: any, key?: string, descriptor?: PropertyDescriptor) => {}),
  ApiUnauthorizedResponse: jest.fn(() => (target: any, key: string, descriptor: PropertyDescriptor) => {}),
  ApiNotFoundResponse: jest.fn(() => (target: any, key: string, descriptor: PropertyDescriptor) => {}),
  ApiConflictResponse: jest.fn(() => (target: any, key: string, descriptor: PropertyDescriptor) => {}),
}));
