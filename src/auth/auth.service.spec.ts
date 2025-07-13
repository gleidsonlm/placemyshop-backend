import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { RoleName, Permission } from '../roles/schemas/role.schema';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    '@id': 'user-uuid-123',
    givenName: 'John',
    familyName: 'Doe',
    email: 'john.doe@example.com',
    role: {
      '@id': 'role-uuid-456',
      roleName: RoleName.MANAGER,
      permissions: [
        Permission.MANAGE_CUSTOMERS_MANAGER,
        Permission.ACCESS_CUSTOMER_CHAT_FULL_MANAGER,
      ],
    },
    status: 'Active',
  };

  const mockUsersService = {
    validatePassword: jest.fn(),
    findByEmail: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data if credentials are valid', async () => {
      mockUsersService.validatePassword.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        'john.doe@example.com',
        'password123',
      );

      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(
        'john.doe@example.com',
        'password123',
      );
      expect(result).toEqual({
        '@id': mockUser['@id'],
        email: mockUser.email,
        givenName: mockUser.givenName,
        familyName: mockUser.familyName,
        role: mockUser.role,
      });
    });

    it('should return null if credentials are invalid', async () => {
      mockUsersService.validatePassword.mockResolvedValue(null);

      const result = await service.validateUser(
        'john.doe@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and refresh token', async () => {
      const mockTokens = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      };

      mockJwtService.signAsync
        .mockResolvedValueOnce(mockTokens.access_token)
        .mockResolvedValueOnce(mockTokens.refresh_token);

      const result = await service.login(mockUser);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        access_token: mockTokens.access_token,
        refresh_token: mockTokens.refresh_token,
        user: {
          '@id': mockUser['@id'],
          email: mockUser.email,
          givenName: mockUser.givenName,
          familyName: mockUser.familyName,
          role: mockUser.role,
        },
      });
    });
  });

  describe('refreshToken', () => {
    it('should return new access token if refresh token is valid', async () => {
      const refreshToken = 'valid-refresh-token';
      const newAccessToken = 'new-access-token';
      const payload = { sub: mockUser['@id'], email: mockUser.email };

      mockJwtService.verify.mockReturnValue(payload);
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(newAccessToken);

      const result = await service.refreshToken(refreshToken);

      expect(mockJwtService.verify).toHaveBeenCalledWith(refreshToken);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(payload.sub);
      expect(result).toEqual({
        access_token: newAccessToken,
      });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const refreshToken = 'invalid-refresh-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: 'nonexistent-user', email: 'test@example.com' };

      mockJwtService.verify.mockReturnValue(payload);
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUserById', () => {
    it('should return user if found', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUserById('user-uuid-123');

      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-uuid-123');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await service.validateUserById('nonexistent-user');

      expect(result).toBeNull();
    });
  });
});
