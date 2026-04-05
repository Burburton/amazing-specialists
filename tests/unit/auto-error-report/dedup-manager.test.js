const {
  computeErrorHash,
  isDuplicate,
  recordErrorHash,
  clearAllHashes,
  getHashCount
} = require('../../../lib/auto-error-report/dedup-manager');

describe('dedup-manager', () => {
  beforeEach(() => {
    clearAllHashes();
  });

  describe('computeErrorHash', () => {
    test('produces 16-character hash', () => {
      const errorReport = {
        error_details: {
          error_code: 'ERR-001',
          title: 'Test Error'
        },
        error_context: {
          dispatch_id: 'dispatch-123'
        }
      };
      
      const hash = computeErrorHash(errorReport);
      
      expect(hash).toHaveLength(16);
      expect(hash).toMatch(/^[a-f0-9]{16}$/);
    });

    test('produces same hash for same input', () => {
      const errorReport = {
        error_details: {
          error_code: 'ERR-001',
          title: 'Test Error'
        },
        error_context: {
          dispatch_id: 'dispatch-123'
        }
      };
      
      const hash1 = computeErrorHash(errorReport);
      const hash2 = computeErrorHash(errorReport);
      
      expect(hash1).toBe(hash2);
    });

    test('produces different hash for different error codes', () => {
      const errorReport1 = {
        error_details: {
          error_code: 'ERR-001',
          title: 'Test Error'
        },
        error_context: {
          dispatch_id: 'dispatch-123'
        }
      };
      
      const errorReport2 = {
        error_details: {
          error_code: 'ERR-002',
          title: 'Test Error'
        },
        error_context: {
          dispatch_id: 'dispatch-123'
        }
      };
      
      const hash1 = computeErrorHash(errorReport1);
      const hash2 = computeErrorHash(errorReport2);
      
      expect(hash1).not.toBe(hash2);
    });

    test('produces different hash for different dispatch IDs', () => {
      const errorReport1 = {
        error_details: {
          error_code: 'ERR-001',
          title: 'Test Error'
        },
        error_context: {
          dispatch_id: 'dispatch-123'
        }
      };
      
      const errorReport2 = {
        error_details: {
          error_code: 'ERR-001',
          title: 'Test Error'
        },
        error_context: {
          dispatch_id: 'dispatch-456'
        }
      };
      
      const hash1 = computeErrorHash(errorReport1);
      const hash2 = computeErrorHash(errorReport2);
      
      expect(hash1).not.toBe(hash2);
    });

    test('handles missing fields gracefully', () => {
      const errorReport = {};
      
      const hash = computeErrorHash(errorReport);
      
      expect(hash).toHaveLength(16);
    });
  });

  describe('isDuplicate', () => {
    test('returns false for new hash', () => {
      const hash = 'a1b2c3d4e5f67890';
      
      expect(isDuplicate(hash, 60)).toBe(false);
    });

    test('returns true for recorded hash within window', () => {
      const hash = 'a1b2c3d4e5f67890';
      recordErrorHash(hash);
      
      expect(isDuplicate(hash, 60)).toBe(true);
    });

    test('returns false for recorded hash outside window', () => {
      const hash = 'a1b2c3d4e5f67890';
      recordErrorHash(hash);
      
      const isDup = isDuplicate(hash, 0);
      
      expect(isDup).toBe(false);
    });

    test('handles different hashes independently', () => {
      const hash1 = 'a1b2c3d4e5f67890';
      const hash2 = '0987654321fedcba';
      
      recordErrorHash(hash1);
      
      expect(isDuplicate(hash1, 60)).toBe(true);
      expect(isDuplicate(hash2, 60)).toBe(false);
    });
  });

  describe('recordErrorHash', () => {
    test('stores hash with timestamp', () => {
      const hash = 'a1b2c3d4e5f67890';
      
      recordErrorHash(hash);
      
      expect(getHashCount()).toBe(1);
    });

    test('multiple hashes are stored', () => {
      recordErrorHash('hash1');
      recordErrorHash('hash2');
      recordErrorHash('hash3');
      
      expect(getHashCount()).toBe(3);
    });
  });

  describe('clearAllHashes', () => {
    test('clears all stored hashes', () => {
      recordErrorHash('hash1');
      recordErrorHash('hash2');
      
      clearAllHashes();
      
      expect(getHashCount()).toBe(0);
    });
  });
});