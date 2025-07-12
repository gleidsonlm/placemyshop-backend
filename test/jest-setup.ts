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
  ApiProperty: jest.fn(() => () => {}),
  ApiPropertyOptional: jest.fn(() => () => {}),
  ApiTags: jest.fn(() => () => {}),
  ApiOperation: jest.fn(() => () => {}),
  ApiResponse: jest.fn(() => () => {}),
  ApiParam: jest.fn(() => () => {}),
  ApiQuery: jest.fn(() => () => {}),
  ApiBody: jest.fn(() => () => {}),
  ApiBearerAuth: jest.fn(() => () => {}),
  ApiUnauthorizedResponse: jest.fn(() => () => {}),
  ApiNotFoundResponse: jest.fn(() => () => {}),
  ApiConflictResponse: jest.fn(() => () => {}),
}));
