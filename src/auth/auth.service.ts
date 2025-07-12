import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

export interface UserPayload {
  '@id': string;
  email: string;
  givenName: string;
  familyName: string;
  role: any;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: UserPayload;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserPayload | null> {
    this.logger.log(`Validating user credentials for email: ${email}`);
    
    const user = await this.usersService.validatePassword(email, password);
    if (user) {
      // Return user without password hash
      return {
        '@id': user['@id'],
        email: user.email,
        givenName: user.givenName,
        familyName: user.familyName,
        role: user.role,
      };
    }
    return null;
  }

  async login(user: any): Promise<LoginResponse> {
    this.logger.log(`Generating tokens for user: ${user.email}`);
    
    const payload = { 
      email: user.email, 
      sub: user['@id'],
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        '@id': user['@id'],
        email: user.email,
        givenName: user.givenName,
        familyName: user.familyName,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    this.logger.log('Processing refresh token request');
    
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = {
        email: user.email,
        sub: user['@id'],
        role: user.role,
      };

      const accessToken = await this.jwtService.signAsync(newPayload, { expiresIn: '15m' });

      return {
        access_token: accessToken,
      };
    } catch (error) {
      this.logger.error('Invalid refresh token', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUserById(userId: string): Promise<any> {
    this.logger.log(`Validating user by ID: ${userId}`);
    
    try {
      const user = await this.usersService.findOne(userId);
      return user;
    } catch (error) {
      this.logger.warn(`User not found: ${userId}`);
      return null;
    }
  }
}