import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockUser = {
    '@id': 'user-uuid-123',
    email: 'john.doe@example.com',
    givenName: 'John',
    familyName: 'Doe',
    role: {
      '@id': 'role-uuid-456',
      roleName: 'Manager',
    },
  };

  const mockLoginResponse = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: mockUser,
  };

  const mockAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return login response with tokens', async () => {
      const request = { user: mockUser };
      
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(request);

      expect(service.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('refresh', () => {
    it('should return new access token', async () => {
      const refreshTokenDto = { refresh_token: 'valid-refresh-token' };
      const refreshResponse = { access_token: 'new-access-token' };

      mockAuthService.refreshToken.mockResolvedValue(refreshResponse);

      const result = await controller.refresh(refreshTokenDto);

      expect(service.refreshToken).toHaveBeenCalledWith(refreshTokenDto.refresh_token);
      expect(result).toEqual(refreshResponse);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshTokenDto = { refresh_token: 'invalid-refresh-token' };

      mockAuthService.refreshToken.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const request = { user: mockUser };

      const result = controller.getProfile(request);

      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should return logout message', () => {
      const result = controller.logout();

      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});