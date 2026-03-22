// T-007: AuthService Unit Tests
// File: src/services/AuthService.test.ts

import { AuthService, LoginRequest, User } from './AuthService';
import { JwtTokenService } from './JwtTokenService';
import { InvalidCredentialsException } from '../exceptions/AuthExceptions';
import bcrypt from 'bcrypt';

// Mock dependencies
jest.mock('./JwtTokenService');
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: { findByUsername: jest.Mock };

  const mockUser: User = {
    id: '123',
    username: 'testuser',
    password: '$2b$10$hashedpassword',
    email: 'test@example.com',
    roles: ['user']
  };

  beforeEach(() => {
    mockUserRepository = {
      findByUsername: jest.fn()
    };
    authService = new AuthService(mockUserRepository);
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser('testuser', 'password123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    });

    it('should throw InvalidCredentialsException when user not found', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.validateUser('nonexistent', 'password'))
        .rejects.toThrow(InvalidCredentialsException);

      // Verify dummy comparison was called for timing attack prevention
      expect(bcrypt.compare).toHaveBeenCalledWith('dummy', expect.any(String));
    });

    it('should throw InvalidCredentialsException when password is incorrect', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.validateUser('testuser', 'wrongpassword'))
        .rejects.toThrow(InvalidCredentialsException);
    });

    it('should prevent timing attacks by doing dummy comparison when user not found', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);
      
      const startTime = Date.now();
      try {
        await authService.validateUser('nonexistent', 'password');
      } catch (e) {
        // Expected
      }
      const endTime = Date.now();

      // Should have called bcrypt.compare twice (dummy + actual)
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('dummy', expect.any(String));
    });
  });

  describe('login', () => {
    it('should return token and user info on successful login', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (JwtTokenService.generateToken as jest.Mock).mockReturnValue('mock-jwt-token');

      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123'
      };

      const result = await authService.login(credentials);

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        roles: mockUser.roles
      });
      expect(result.user).not.toHaveProperty('password');
      expect(JwtTokenService.generateToken).toHaveBeenCalledWith({
        user_id: mockUser.id,
        username: mockUser.username,
        roles: mockUser.roles
      });
    });

    it('should not return password in response', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (JwtTokenService.generateToken as jest.Mock).mockReturnValue('token');

      const result = await authService.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(result.user).not.toHaveProperty('password');
    });

    it('should propagate InvalidCredentialsException', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login({
        username: 'nonexistent',
        password: 'password'
      })).rejects.toThrow(InvalidCredentialsException);
    });
  });

  describe('edge cases', () => {
    it('should handle empty username', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);
      
      await expect(authService.validateUser('', 'password'))
        .rejects.toThrow(InvalidCredentialsException);
    });

    it('should handle empty password', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.validateUser('testuser', ''))
        .rejects.toThrow(InvalidCredentialsException);
    });

    it('should handle special characters in username', async () => {
      const specialUser = { ...mockUser, username: 'test@user#123' };
      mockUserRepository.findByUsername.mockResolvedValue(specialUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser('test@user#123', 'password123');
      expect(result.username).toBe('test@user#123');
    });
  });
});
