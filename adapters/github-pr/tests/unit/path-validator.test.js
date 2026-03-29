const { PathValidator } = require('../../src/path-validator');

describe('PathValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new PathValidator({});
  });

  describe('validatePath', () => {
    it('should accept valid paths', () => {
      const result = validator.validatePath('src/file.js');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject null path', () => {
      const result = validator.validatePath(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Path is required and must be a string');
    });

    it('should reject path traversal', () => {
      const result = validator.validatePath('../outside.js');

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('traversal'))).toBe(true);
    });

    it('should reject absolute paths', () => {
      const result = validator.validatePath('/etc/passwd');

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Absolute'))).toBe(true);
    });

    it('should reject blocked paths', () => {
      const result = validator.validatePath('.env');

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Blocked'))).toBe(true);
    });

    it('should warn about spaces', () => {
      const result = validator.validatePath('my file.js');

      expect(result.warnings.some(w => w.includes('spaces'))).toBe(true);
    });

    it('should warn about hidden files', () => {
      const result = validator.validatePath('.hidden');

      expect(result.warnings.some(w => w.includes('Hidden'))).toBe(true);
    });
  });

  describe('validatePaths', () => {
    it('should validate multiple paths', () => {
      const paths = ['src/a.js', 'src/b.js', '.env'];
      const results = validator.validatePaths(paths);

      expect(results).toHaveLength(3);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(true);
      expect(results[2].valid).toBe(false);
    });
  });

  describe('validateContent', () => {
    it('should validate content size', () => {
      const largeContent = 'x'.repeat(20 * 1024 * 1024);
      const result = validator.validateContent('file.js', largeContent);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('max size'))).toBe(true);
    });

    it('should require content', () => {
      const result = validator.validateContent('file.js', null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Content is required');
    });
  });

  describe('isBlocked', () => {
    it('should identify blocked paths', () => {
      expect(validator.isBlocked('.env')).toBe(true);
      expect(validator.isBlocked('.git/config')).toBe(true);
      expect(validator.isBlocked('src/file.js')).toBe(false);
    });
  });

  describe('sanitizePath', () => {
    it('should remove path traversal', () => {
      const sanitized = validator.sanitizePath('../src/../../file.js');

      expect(sanitized).not.toContain('..');
    });

    it('should remove blocked components', () => {
      const sanitized = validator.sanitizePath('src/.env/file.js');

      expect(sanitized).not.toContain('.env');
    });

    it('should normalize slashes', () => {
      const sanitized = validator.sanitizePath('src//file.js');

      expect(sanitized).toBe('src/file.js');
    });
  });

  describe('blocklist management', () => {
    it('should get blocklist', () => {
      const blocklist = validator.getBlocklist();

      expect(blocklist).toContain('.env');
      expect(blocklist).toContain('.git');
    });

    it('should add to blocklist', () => {
      validator.addToBlocklist('secrets');

      expect(validator.isBlocked('secrets')).toBe(true);
    });

    it('should remove from blocklist', () => {
      validator.removeFromBlocklist('.env');

      expect(validator.isBlocked('.env')).toBe(false);
    });
  });
});