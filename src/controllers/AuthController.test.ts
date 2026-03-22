// T-007: AuthController Unit Tests
// File: src/controllers/AuthController.test.ts

import { AuthController, LoginResponse } from './AuthController';
import { AuthService, LoginResult } from '../services/AuthService';
import { InvalidCredentialsException } from '../exceptions/AuthExceptions';

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: { login: jest.Mock };

  const mockLoginResult: LoginResult = {
    token: 'mock-jwt-token',
    user: {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['user']
    }
  };

  beforeEach(() => {
    mockAuthService = {
      login: jest.fn()
    };
    authController = new AuthController(mockAuthService as unknown as AuthService);
  });

  describe('login', () => {
    it('should return success response with token on valid login', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResult);

      const response: LoginResponse = await authController.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockLoginResult);
      expect(response.error).toBeUndefined();
    });

    it('should return 400 error when username is missing', async () => {
      const response: LoginResponse = await authController.login({
        username: '',
        password: 'password123'
      });

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('MISSING_PARAMETERS');
      expect(response.error?.message).toContain('username');
    });

    it('should return 400 error when password is missing', async () => {
      const response: LoginResponse = await authController.login({
        username: 'testuser',
        password: ''
      });

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('MISSING_PARAMETERS');
      expect(response.error?.message).toContain('password');
    });

    it('should return 400 error when both fields are missing', async () => {
      const response: LoginResponse = await authController.login({
        username: '',
        password: ''
      });

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('MISSING_PARAMETERS');
      expect(response.error?.message).toContain('username');
      expect(response.error?.message).toContain('password');
    });

    it('should return 401 error when credentials are invalid', async () => {
      mockAuthService.login.mockRejectedValue(new InvalidCredentialsException());

      const response: LoginResponse = await authController.login({
        username: 'testuser',
        password: 'wrongpassword'
      });

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('INVALID_CREDENTIALS');
      expect(response.error?.message).toBe('账号或密码错误');
    });

    it('should propagate unexpected errors', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Database connection failed'));

      await expect(authController.login({
        username: 'testuser',
        password: 'password123'
      })).rejects.toThrow('Database connection failed');
    });

    it('should call authService.login with correct parameters', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResult);

      await authController.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(mockAuthService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  describe('response format', () => {
    it('should return consistent success response format', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResult);

      const response: LoginResponse = await authController.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('data');
      expect(response).not.toHaveProperty('error');
    });

    it('should return consistent error response format', async () => {
      const response: LoginResponse = await authController.login({
        username: '',
        password: ''
      });

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('error');
      expect(response.error).toHaveProperty('code');
      expect(response.error).toHaveProperty('message');
      expect(response).not.toHaveProperty('data');
    });
  });
});
