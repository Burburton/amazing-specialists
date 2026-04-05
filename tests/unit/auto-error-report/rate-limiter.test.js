const {
  checkRateLimit,
  recordReport,
  getHourCount,
  getDayCount,
  clearAllCounts,
  getCurrentHourKey,
  getCurrentDayKey
} = require('../../../lib/auto-error-report/rate-limiter');

describe('rate-limiter', () => {
  beforeEach(() => {
    clearAllCounts();
  });

  describe('checkRateLimit', () => {
    test('returns allowed when under limits', () => {
      const config = {
        rate_limit: {
          max_per_hour: 5,
          max_per_day: 20
        }
      };
      
      const result = checkRateLimit(config);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining_hour).toBe(5);
      expect(result.remaining_day).toBe(20);
    });

    test('returns not allowed when hour limit exceeded', () => {
      const config = {
        rate_limit: {
          max_per_hour: 2,
          max_per_day: 20
        }
      };
      
      recordReport('hash1', new Date());
      recordReport('hash2', new Date());
      
      const result = checkRateLimit(config);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('hour_limit');
      expect(result.remaining_hour).toBe(0);
    });

    test('returns not allowed when day limit exceeded', () => {
      const config = {
        rate_limit: {
          max_per_hour: 100,
          max_per_day: 2
        }
      };
      
      recordReport('hash1', new Date());
      recordReport('hash2', new Date());
      
      const result = checkRateLimit(config);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('day_limit');
      expect(result.remaining_day).toBe(0);
    });

    test('uses default values when config missing', () => {
      const result = checkRateLimit({});
      
      expect(result.allowed).toBe(true);
      expect(result.remaining_hour).toBe(5);
      expect(result.remaining_day).toBe(20);
    });

    test('correctly calculates remaining counts', () => {
      const config = {
        rate_limit: {
          max_per_hour: 5,
          max_per_day: 20
        }
      };
      
      recordReport('hash1', new Date());
      recordReport('hash2', new Date());
      
      const result = checkRateLimit(config);
      
      expect(result.remaining_hour).toBe(3);
      expect(result.remaining_day).toBe(18);
    });
  });

  describe('recordReport', () => {
    test('increments hour and day counts', () => {
      recordReport('hash1', new Date());
      
      expect(getHourCount()).toBe(1);
      expect(getDayCount()).toBe(1);
    });

    test('multiple reports increment correctly', () => {
      recordReport('hash1', new Date());
      recordReport('hash2', new Date());
      recordReport('hash3', new Date());
      
      expect(getHourCount()).toBe(3);
      expect(getDayCount()).toBe(3);
    });
  });

  describe('getHourCount', () => {
    test('returns 0 when no reports', () => {
      expect(getHourCount()).toBe(0);
    });

    test('returns correct count after reports', () => {
      recordReport('hash1', new Date());
      recordReport('hash2', new Date());
      
      expect(getHourCount()).toBe(2);
    });
  });

  describe('getDayCount', () => {
    test('returns 0 when no reports', () => {
      expect(getDayCount()).toBe(0);
    });

    test('returns correct count after reports', () => {
      recordReport('hash1', new Date());
      recordReport('hash2', new Date());
      recordReport('hash3', new Date());
      
      expect(getDayCount()).toBe(3);
    });
  });

  describe('key generation', () => {
    test('getCurrentHourKey returns correct format', () => {
      const key = getCurrentHourKey();
      expect(key).toMatch(/^\d{4}-\d{2}-\d{2}-\d{2}$/);
    });

    test('getCurrentDayKey returns correct format', () => {
      const key = getCurrentDayKey();
      expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});