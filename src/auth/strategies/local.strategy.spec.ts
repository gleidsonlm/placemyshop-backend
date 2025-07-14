import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
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
      (authService.validateUser as jest.Mock).mockResolvedValue(user);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await strategy.validate('test@example.com', 'password');
      expect(result).toEqual(user);
    });

    it('should throw an UnauthorizedException if validation fails', async () => {
      (authService.validateUser as jest.Mock).mockResolvedValue(null);

      await expect(
        strategy.validate('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
