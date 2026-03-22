// T-009: Performance Tests
// File: src/tests/performance/auth.performance.test.ts

import { performance } from 'perf_hooks';
import bcrypt from 'bcrypt';
import { AuthService } from '../../services/AuthService';
import { JwtTokenService } from '../../services/JwtTokenService';
import { AuthController } from '../../controllers/AuthController';

// Test configuration
const TARGET_RESPONSE_TIME = 200; // ms (P99)
const TARGET_QPS = 1000;
const CONCURRENT_USERS = 100;
const TEST_DURATION_MS = 10000; // 10 seconds

describe('Auth Performance Tests', () => {
  let authService: AuthService;
  let authController: AuthController;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'performance-test-secret-key';
    
    // Create mock repository with test user
    const hashedPassword = await bcrypt.hash('perfTest123', 10);
    const mockRepo = {
      findByUsername: jest.fn().mockResolvedValue({
        id: 'perf-test-1',
        username: 'perftest',
        password: hashedPassword,
        email: 'perf@test.com',
        roles: ['user']
      })
    };

    authService = new AuthService(mockRepo as any);
    authController = new AuthController(authService);
  });

  describe('Response Time (P99 < 200ms)', () => {
    it('should handle single login within 200ms', async () => {
      const start = performance.now();
      
      await authController.login({
        username: 'perftest',
        password: 'perfTest123'
      });
      
      const end = performance.now();
      const responseTime = end - start;

      console.log(`Single login response time: ${responseTime.toFixed(2)}ms`);
      expect(responseTime).toBeLessThan(TARGET_RESPONSE_TIME);
    });

    it('should maintain P99 < 200ms under 100 concurrent requests', async () => {
      const responseTimes: number[] = [];

      // Warmup
      for (let i = 0; i < 10; i++) {
        await authController.login({
          username: 'perftest',
          password: 'perfTest123'
        });
      }

      // Concurrent requests
      const promises = Array(CONCURRENT_USERS).fill(null).map(async () => {
        const start = performance.now();
        await authController.login({
          username: 'perftest',
          password: 'perfTest123'
        });
        const end = performance.now();
        return end - start;
      });

      const results = await Promise.all(promises);
      responseTimes.push(...results);

      // Calculate P99
      const sorted = responseTimes.sort((a, b) => a - b);
      const p99Index = Math.ceil(sorted.length * 0.99) - 1;
      const p99 = sorted[p99Index];

      console.log(`P99 Response Time: ${p99.toFixed(2)}ms`);
      console.log(`Average Response Time: ${(sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(2)}ms`);
      console.log(`Min Response Time: ${sorted[0].toFixed(2)}ms`);
      console.log(`Max Response Time: ${sorted[sorted.length - 1].toFixed(2)}ms`);

      expect(p99).toBeLessThan(TARGET_RESPONSE_TIME);
    });

    it('should handle sustained load over 10 seconds', async () => {
      const responseTimes: number[] = [];
      const startTime = Date.now();
      let requestCount = 0;

      while (Date.now() - startTime < TEST_DURATION_MS) {
        const reqStart = performance.now();
        await authController.login({
          username: 'perftest',
          password: 'perfTest123'
        });
        const reqEnd = performance.now();
        
        responseTimes.push(reqEnd - reqStart);
        requestCount++;
      }

      const actualQPS = requestCount / (TEST_DURATION_MS / 1000);
      
      console.log(`Total requests: ${requestCount}`);
      console.log(`Actual QPS: ${actualQPS.toFixed(2)}`);
      console.log(`Average response time: ${(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2)}ms`);

      expect(actualQPS).toBeGreaterThan(TARGET_QPS);
    });
  });

  describe('Token Generation Performance', () => {
    it('should generate tokens quickly', async () => {
      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        JwtTokenService.generateToken({
          user_id: `user-${i}`,
          username: `testuser${i}`,
          roles: ['user']
        });
      }

      const end = performance.now();
      const totalTime = end - start;
      const avgTime = totalTime / iterations;

      console.log(`Token generation: ${iterations} tokens in ${totalTime.toFixed(2)}ms`);
      console.log(`Average time per token: ${avgTime.toFixed(4)}ms`);

      expect(avgTime).toBeLessThan(1); // Should be less than 1ms per token
    });
  });

  describe('Bcrypt Performance', () => {
    it('should complete bcrypt compare within acceptable time', async () => {
      const hashedPassword = await bcrypt.hash('test123', 10);
      
      const start = performance.now();
      await bcrypt.compare('test123', hashedPassword);
      const end = performance.now();

      const compareTime = end - start;
      console.log(`Bcrypt compare time: ${compareTime.toFixed(2)}ms`);

      // Bcrypt with 10 rounds typically takes ~50-100ms
      expect(compareTime).toBeLessThan(150);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory under load', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Generate load
      for (let i = 0; i < 1000; i++) {
        await authController.login({
          username: 'perftest',
          password: 'perfTest123'
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

      console.log(`Memory increase: ${memoryIncrease.toFixed(2)} MB`);

      // Should not increase by more than 50MB
      expect(memoryIncrease).toBeLessThan(50);
    });
  });
});

// Performance benchmark utility
export async function runBenchmark(
  name: string,
  fn: () => Promise<void>,
  iterations: number
): Promise<{ avgTime: number; minTime: number; maxTime: number }> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  const sorted = times.sort((a, b) => a - b);
  return {
    avgTime: times.reduce((a, b) => a + b, 0) / times.length,
    minTime: sorted[0],
    maxTime: sorted[sorted.length - 1]
  };
}
