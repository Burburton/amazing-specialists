// T-002: JwtTokenService Unit Tests
// File: src/services/JwtTokenService.test.ts

import { JwtTokenService, TokenPayload } from './JwtTokenService';
import jwt from 'jsonwebtoken';

describe('JwtTokenService', () => {
  const mockUser = {
    user_id: '123',
    username: 'testuser',
    roles: ['user']
  };

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRES_IN = '24h';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = JwtTokenService.generateToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should include user_id, username, and roles in payload', () => {
      const token = JwtTokenService.generateToken(mockUser);
      const decoded = jwt.decode(token) as TokenPayload;
      
      expect(decoded.user_id).toBe(mockUser.user_id);
      expect(decoded.username).toBe(mockUser.username);
      expect(decoded.roles).toEqual(mockUser.roles);
    });

    it('should set expiration to 24 hours', () => {
      const token = JwtTokenService.generateToken(mockUser);
      const decoded = jwt.decode(token) as TokenPayload;
      
      expect(decoded.exp).toBeDefined();
      
      // Check expiration is approximately 24 hours from now
      const expectedExp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
      expect(decoded.exp).toBeGreaterThan(expectedExp - 60);
      expect(decoded.exp).toBeLessThan(expectedExp + 60);
    });

    it('should generate different tokens for different users', () => {
      const token1 = JwtTokenService.generateToken(mockUser);
      const token2 = JwtTokenService.generateToken({ ...mockUser, user_id: '456' });
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = JwtTokenService.generateToken(mockUser);
      const decoded = JwtTokenService.verifyToken(token);
      
      expect(decoded.user_id).toBe(mockUser.user_id);
      expect(decoded.username).toBe(mockUser.username);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        JwtTokenService.verifyToken('invalid-token');
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { user_id: '123', username: 'test', roles: ['user'] },
        'test-secret-key',
        { expiresIn: '0s' }
      );
      
      // Wait for token to expire
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);
      
      expect(() => {
        JwtTokenService.verifyToken(expiredToken);
      }).toThrow('jwt expired');
      
      jest.useRealTimers();
    });
  });
});
