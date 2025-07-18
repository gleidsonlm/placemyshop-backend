import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Role, RoleName } from '../../roles/schemas/role.schema';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';

const mockAuthService = {
  validateUser: jest.fn(),
  validateUserById: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  // let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService, // Use the mock instead of the real service
        },
        {
          provide: UsersService,
          useValue: {
            validateUserById: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('testSecret'),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            signAsync: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    // authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the user if found', async () => {
      const user = { userId: '1', username: 'test' };
      mockAuthService.validateUserById.mockResolvedValue(user);

      const result = await strategy.validate({
        sub: '1',
        email: 'test@example.com',
        role: { roleName: RoleName.ADMIN } as Role,
      });

      expect(result).toEqual(user);
    });

    it('should throw an UnauthorizedException if user is not found', async () => {
      mockAuthService.validateUserById.mockResolvedValue(null);

      await expect(
        strategy.validate({
          sub: '1',
          email: 'test@example.com',
          role: { roleName: RoleName.ADMIN } as Role,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
