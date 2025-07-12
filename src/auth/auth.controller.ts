import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDto, LoginDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login', description: 'Authenticate user with email and password' })
  @ApiBody({
    type: LoginDto,
    description: 'User credentials',
    examples: {
      example1: {
        summary: 'Example login',
        value: {
          email: 'admin@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successful authentication',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'JWT access token (expires in 15 minutes)',
        },
        refresh_token: {
          type: 'string',
          description: 'JWT refresh token (expires in 7 days)',
        },
        user: {
          type: 'object',
          properties: {
            '@id': { type: 'string', description: 'User unique identifier' },
            email: { type: 'string', description: 'User email address' },
            givenName: { type: 'string', description: 'User first name' },
            familyName: { type: 'string', description: 'User last name' },
            role: {
              type: 'object',
              properties: {
                '@id': { type: 'string', description: 'Role unique identifier' },
                roleName: { type: 'string', description: 'Role name' },
              },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token', description: 'Get a new access token using refresh token' })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token',
    examples: {
      example1: {
        summary: 'Example refresh',
        value: {
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'New JWT access token',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  async refresh(@Body(new ValidationPipe()) refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile', description: 'Get current authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile data',
    schema: {
      type: 'object',
      properties: {
        '@id': { type: 'string', description: 'User unique identifier' },
        email: { type: 'string', description: 'User email address' },
        givenName: { type: 'string', description: 'User first name' },
        familyName: { type: 'string', description: 'User last name' },
        role: {
          type: 'object',
          properties: {
            '@id': { type: 'string', description: 'Role unique identifier' },
            roleName: { type: 'string', description: 'Role name' },
            permissions: {
              type: 'array',
              items: { type: 'string' },
              description: 'User permissions',
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout', description: 'Logout user (client should discard tokens)' })
  @ApiResponse({
    status: 200,
    description: 'Successful logout',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Logged out successfully',
        },
      },
    },
  })
  logout() {
    // In a real application, you might want to invalidate the token
    // For now, we'll just return a success message
    return { message: 'Logged out successfully' };
  }
}