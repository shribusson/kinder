import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    phone: '+77001234567',
    locale: 'ru',
    role: UserRole.manager,
    accountId: 'account-123',
    avatarUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRefreshToken = {
    id: 'token-123',
    userId: 'user-123',
    token: 'refresh-token-value',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdAt: new Date(),
    user: mockUser,
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user when email and password are valid', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    });

    it('should return null when user is not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      prismaService.user.findUnique.mockResolvedValue(inactiveUser);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong-password');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token, refresh token, and user data', async () => {
      prismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);

      const result = await service.login(mockUser);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.firstName).toBe(mockUser.firstName);
      expect(result.user.lastName).toBe(mockUser.lastName);
      expect(result.user.role).toBe(mockUser.role);
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should create refresh token in database', async () => {
      prismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);

      await service.login(mockUser);

      expect(prismaService.refreshToken.create).toHaveBeenCalled();
      const createCall = prismaService.refreshToken.create.mock.calls[0][0];
      expect(createCall.data.userId).toBe(mockUser.id);
      expect(createCall.data.token).toBeDefined();
    });
  });

  describe('register', () => {
    const registerData = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      phone: '+77009876543',
    };

    it('should create a new user and return auth response', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-password');
      const newUser = {
        ...mockUser,
        id: 'new-user-123',
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        role: UserRole.client,
      };
      prismaService.user.create.mockResolvedValue(newUser);
      prismaService.refreshToken.create.mockResolvedValue({
        ...mockRefreshToken,
        userId: newUser.id,
      });

      const result = await service.register(registerData);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(registerData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prismaService.user.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when email already exists', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerData)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.register(registerData)).rejects.toThrow(
        'User with this email already exists',
      );
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should use default role and locale when not provided', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prismaService.user.create.mockImplementation(({ data }: { data: any }) => ({
        id: 'new-id',
        ...data,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      prismaService.refreshToken.create.mockResolvedValue(mockRefreshToken);

      await service.register({
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      });

      const createCall = prismaService.user.create.mock.calls[0][0];
      expect(createCall.data.role).toBe(UserRole.client);
      expect(createCall.data.locale).toBe('ru');
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token when refresh token is valid', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);

      const result = await service.refreshAccessToken('refresh-token-value');

      expect(result).toHaveProperty('accessToken');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when refresh token is not found', async () => {
      prismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        service.refreshAccessToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when refresh token is expired', async () => {
      const expiredToken = {
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      };
      prismaService.refreshToken.findUnique.mockResolvedValue(expiredToken);

      await expect(
        service.refreshAccessToken('expired-token'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.refreshAccessToken('expired-token'),
      ).rejects.toThrow('Invalid or expired refresh token');
    });
  });

  describe('logout', () => {
    it('should delete specific refresh token when provided', async () => {
      prismaService.refreshToken.delete.mockResolvedValue(mockRefreshToken);

      await service.logout('user-123', 'refresh-token-value');

      expect(prismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: 'refresh-token-value' },
      });
      expect(prismaService.refreshToken.deleteMany).not.toHaveBeenCalled();
    });

    it('should delete all refresh tokens when no specific token provided', async () => {
      prismaService.refreshToken.deleteMany.mockResolvedValue({ count: 3 });

      await service.logout('user-123');

      expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(prismaService.refreshToken.delete).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserById('user-123');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should return null when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserById('nonexistent-user');

      expect(result).toBeNull();
    });
  });
});
