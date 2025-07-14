import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { RoleName } from '../schemas/role.schema';
import { createMock } from '@golevelup/ts-jest';

interface MockUser {
  userId: string;
  role: {
    roleName: RoleName;
    permissions: string[];
  };
}

interface MockRequest {
  user?: MockUser;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let mockReflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    // Create the mock outside the module
    mockReflector = createMock<Reflector>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector, // Use the pre-created mock
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    // Don't reassign mockReflector here - it's already properly typed
  });

  const createMockExecutionContext = (user?: MockUser): ExecutionContext => {
    const mockRequest: MockRequest = { user };

    return createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
    });
  };

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockExecutionContext();

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when empty roles array is returned', () => {
      mockReflector.getAllAndOverride.mockReturnValue([]);
      const context = createMockExecutionContext();

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user is not present', () => {
      mockReflector.getAllAndOverride.mockReturnValue([RoleName.ADMIN]);
      const context = createMockExecutionContext(); // No user

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should allow access when user has required role', () => {
      const mockUser: MockUser = {
        userId: 'user123',
        role: {
          roleName: RoleName.ADMIN,
          permissions: ['read', 'write'],
        },
      };

      mockReflector.getAllAndOverride.mockReturnValue([RoleName.ADMIN]);
      const context = createMockExecutionContext(mockUser);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      const mockUser: MockUser = {
        userId: 'user123',
        role: {
          roleName: RoleName.MANAGER,
          permissions: ['read'],
        },
      };

      mockReflector.getAllAndOverride.mockReturnValue([RoleName.ADMIN]);
      const context = createMockExecutionContext(mockUser);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
