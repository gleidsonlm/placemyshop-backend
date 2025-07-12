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
  ApiProperty: jest.fn(() => (_target: any, _key: string) => {}),
  ApiPropertyOptional: jest.fn(() => (_target: any, _key: string) => {}),
  ApiTags: jest.fn(() => (_target: any) => {}),
  ApiOperation: jest.fn(
    () => (_target: any, _key: string, _descriptor: PropertyDescriptor) => {},
  ),
  ApiResponse: jest.fn(
    () => (_target: any, _key: string, _descriptor: PropertyDescriptor) => {},
  ),
  ApiParam: jest.fn(
    () => (_target: any, _key: string, _descriptor: PropertyDescriptor) => {},
  ),
  ApiQuery: jest.fn(
    () => (_target: any, _key: string, _descriptor: PropertyDescriptor) => {},
  ),
  ApiBody: jest.fn(
    () => (_target: any, _key: string, _descriptor: PropertyDescriptor) => {},
  ),
  ApiBearerAuth: jest.fn(
    () => (_target: any, _key?: string, _descriptor?: PropertyDescriptor) => {},
  ),
  ApiUnauthorizedResponse: jest.fn(
    () => (_target: any, _key: string, _descriptor: PropertyDescriptor) => {},
  ),
  ApiNotFoundResponse: jest.fn(
    () => (_target: any, _key: string, _descriptor: PropertyDescriptor) => {},
  ),
  ApiConflictResponse: jest.fn(
    () => (_target: any, _key: string, _descriptor: PropertyDescriptor) => {},
  ),
}));
