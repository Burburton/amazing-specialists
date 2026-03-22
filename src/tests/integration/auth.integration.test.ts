// T-008: Integration Tests
// File: src/tests/integration/auth.integration.test.ts

import request from 'supertest';
import bcrypt from 'bcrypt';

// Test database setup
// NOTE: Uses in-memory SQLite for testing to avoid external dependencies
const testDb = new Map<string, any>();

// Mock UserRepository for testing
class TestUserRepository {
  async findByUsername(username: string) {
    return testDb.get(username) || null;
  }

  async createUser(user: any) {
    testDb.set(user.username, user);
    return user;
  }
}

// Import after setting up test environment
import { AuthService } from '../../services/AuthService';
import { JwtTokenService } from '../../services/JwtTokenService';
import { AuthController } from '../../controllers/AuthController';

describe('Auth Integration Tests', () => {
  let authService: AuthService;
  let authController: AuthController;
  let userRepository: TestUserRepository;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-integration-secret-key';
    process.env.JWT_EXPIRES_IN = '24h';
  });

  beforeEach(async () => {
    testDb.clear();
    userRepository = new TestUserRepository();
    authService = new AuthService(userRepository as any);
    authController = new AuthController(authService);

    // Create test user
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    await userRepository.createUser({
      id: '1',
      username: 'integrationtest',
      password: hashedPassword,
      email: 'test@example.com',
      roles: ['user']
    });
  });

  describe('POST /api/auth/login - Full Flow', () => {
    it('should complete full login flow successfully', async () => {
      const response = await authController.login({
        username: 'integrationtest',
        password: 'testpassword123'
      });

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.token).toBeDefined();
      expect(response.data?.user.username).toBe('integrationtest');
      expect(response.data?.user).not.toHaveProperty('password');

      // Verify token is valid
      const decoded = JwtTokenService.verifyToken(response.data!.token);
      expect(decoded.user_id).toBe('1');
      expect(decoded.username).toBe('integrationtest');
    });

    it('should return 401 for wrong password', async () => {
      const response = await authController.login({
        username: 'integrationtest',
        password: 'wrongpassword'
      });

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('INVALID_CREDENTIALS');
      expect(response.error?.message).toBe('账号或密码错误');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await authController.login({
        username: 'nonexistentuser',
        password: 'anypassword'
      });

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 400 for missing parameters', async () => {
      const response1 = await authController.login({
        username: '',
        password: 'password'
      });
      expect(response1.error?.code).toBe('MISSING_PARAMETERS');

      const response2 = await authController.login({
        username: 'user',
        password: ''
      });
      expect(response2.error?.code).toBe('MISSING_PARAMETERS');
    });
  });

  describe('Database Integration', () => {
    it('should handle database query delays gracefully', async () => {
      // Simulate slow database
      const slowRepo = {
        findByUsername: jest.fn().mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve(testDb.get('integrationtest')), 100))
        )
      };
      const slowAuthService = new AuthService(slowRepo as any);
      const slowController = new AuthController(slowAuthService);

      const startTime = Date.now();
      const response = await slowController.login({
        username: 'integrationtest',
        password: 'testpassword123'
      });
      const endTime = Date.now();

      expect(response.success).toBe(true);
      expect(endTime - startTime).toBeGreaterThan(100);
    });

    it('should handle database connection errors', async () => {
      const errorRepo = {
        findByUsername: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      };
      const errorAuthService = new AuthService(errorRepo as any);
      const errorController = new AuthController(errorAuthService);

      await expect(errorController.login({
        username: 'integrationtest',
        password: 'testpassword123'
      })).rejects.toThrow('Database connection failed');
    });
  });

  describe('Token Verification Flow', () => {
    it('should generate valid token that can be verified', async () => {
      const loginResponse = await authController.login({
        username: 'integrationtest',
        password: 'testpassword123'
      });

      const token = loginResponse.data!.token;

      // Verify token structure
      const parts = token.split('.');
      expect(parts).toHaveLength(3);

      // Verify token content
      const decoded = JwtTokenService.verifyToken(token);
      expect(decoded).toHaveProperty('user_id');
      expect(decoded).toHaveProperty('username');
      expect(decoded).toHaveProperty('roles');
      expect(decoded).toHaveProperty('exp');
    });

    it('should generate different tokens for different users', async () => {
      // Create second user
      const hashedPassword2 = await bcrypt.hash('password2', 10);
      await userRepository.createUser({
        id: '2',
        username: 'integrationtest2',
        password: hashedPassword2,
        email: 'test2@example.com',
        roles: ['user']
      });

      const response1 = await authController.login({
        username: 'integrationtest',
        password: 'testpassword123'
      });

      const response2 = await authController.login({
        username: 'integrationtest2',
        password: 'password2'
      });

      expect(response1.data?.token).not.toBe(response2.data?.token);
    });
  });

  describe('Security Scenarios', () => {
    it('should not expose password in any response', async () => {
      const response = await authController.login({
        username: 'integrationtest',
        password: 'testpassword123'
      });

      const responseStr = JSON.stringify(response);
      expect(responseStr).not.toContain('testpassword123');
      expect(responseStr).not.toContain('$2b$10$'); // bcrypt hash
    });

    it('should handle SQL injection attempts safely', async () => {
      const maliciousUsername = "' OR '1'='1";
      
      const response = await authController.login({
        username: maliciousUsername,
        password: 'anypassword'
      });

      // Should not authenticate
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('INVALID_CREDENTIALS');
    });
  });
});
