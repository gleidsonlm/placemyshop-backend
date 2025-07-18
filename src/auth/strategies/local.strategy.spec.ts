import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';

const mockAuthService = {
  validateUser: jest.fn(),
  validateUserById: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
};

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: {
            validatePassword: jest.fn(),
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

    strategy = module.get<LocalStrategy>(LocalStrategy);
    // authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the user if validation is successful', async () => {
      const user: { userId: string; username: string } = {
        userId: '1',
        username: 'test',
      };
      mockAuthService.validateUser.mockResolvedValue(user);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await strategy.validate('test@example.com', 'password');
      expect(result).toEqual(user);
    });

    it('should throw an UnauthorizedException if validation fails', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(
        strategy.validate('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
