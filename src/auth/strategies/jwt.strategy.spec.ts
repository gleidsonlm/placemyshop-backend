import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Role, RoleName } from '../../roles/schemas/role.schema';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUserById: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('testSecret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the user if found', async () => {
      const user = { userId: '1', username: 'test' };
      (authService.validateUserById as jest.Mock).mockResolvedValue(user);

      const result = await strategy.validate({
        sub: '1',
        email: 'test@example.com',
        role: { roleName: RoleName.ADMIN } as Role,
      });

      expect(result).toEqual(user);
    });

    it('should throw an UnauthorizedException if user is not found', async () => {
      (authService.validateUserById as jest.Mock).mockResolvedValue(null);

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
