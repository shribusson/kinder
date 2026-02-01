import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.manager,
    accountId: 'account-123',
  };

  const mockAuthResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: mockUser,
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn().mockResolvedValue(mockAuthResponse),
      register: jest.fn().mockResolvedValue(mockAuthResponse),
      refreshAccessToken: jest.fn().mockResolvedValue({ accessToken: 'new-access-token' }),
      logout: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return auth response on successful login', async () => {
      const req = { user: mockUser } as any;
      const loginDto = { email: 'test@example.com', password: 'password123' };

      const result = await controller.login(req, loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('register', () => {
    it('should create new user and return auth response', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phone: '+77001234567',
      };

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith({
        ...registerDto,
        role: UserRole.client,
      });
    });

    it('should pass optional locale to service', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        locale: 'kk',
      };

      await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          locale: 'kk',
        }),
      );
    });
  });

  describe('refresh', () => {
    it('should return new access token', async () => {
      const body = { refreshToken: 'valid-refresh-token' };

      const result = await controller.refresh(body);

      expect(result).toEqual({ accessToken: 'new-access-token' });
      expect(authService.refreshAccessToken).toHaveBeenCalledWith('valid-refresh-token');
    });
  });

  describe('logout', () => {
    it('should call logout with user id and refresh token', async () => {
      const req = { user: { sub: 'user-123' } } as any;
      const body = { refreshToken: 'token-to-revoke' };

      await controller.logout(req, body);

      expect(authService.logout).toHaveBeenCalledWith('user-123', 'token-to-revoke');
    });

    it('should call logout with user id only when no refresh token provided', async () => {
      const req = { user: { sub: 'user-123' } } as any;
      const body = {};

      await controller.logout(req, body);

      expect(authService.logout).toHaveBeenCalledWith('user-123', undefined);
    });
  });

  describe('getProfile', () => {
    it('should return current user from request', async () => {
      const req = { user: mockUser } as any;

      const result = await controller.getProfile(req);

      expect(result).toEqual(mockUser);
    });
  });
});
