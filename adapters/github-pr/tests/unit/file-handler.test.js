const { FileHandler, ChangeType } = require('../../src/file-handler');

describe('FileHandler', () => {
  let handler;

  beforeEach(() => {
    handler = new FileHandler({});
  });

  describe('processChangedFiles', () => {
    it('should process added files', () => {
      const files = [{ path: 'src/new.js', change_type: 'added', content: 'code' }];
      const result = handler.processChangedFiles(files);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
      expect(result.files[0].operations).toContainEqual({ type: 'create', path: 'src/new.js' });
    });

    it('should process modified files', () => {
      const files = [{ path: 'src/existing.js', change_type: 'modified', content: 'new code' }];
      const result = handler.processChangedFiles(files);

      expect(result.success).toBe(true);
      expect(result.files[0].operations).toContainEqual({ type: 'update', path: 'src/existing.js' });
    });

    it('should process deleted files', () => {
      const files = [{ path: 'src/old.js', change_type: 'deleted' }];
      const result = handler.processChangedFiles(files);

      expect(result.success).toBe(true);
      expect(result.files[0].operations).toContainEqual({ type: 'delete', path: 'src/old.js' });
    });

    it('should process renamed files', () => {
      const files = [{ path: 'src/new-name.js', change_type: 'renamed', old_path: 'src/old-name.js' }];
      const result = handler.processChangedFiles(files);

      expect(result.success).toBe(true);
      expect(result.files[0].operations).toContainEqual({ type: 'delete', path: 'src/old-name.js' });
      expect(result.files[0].operations).toContainEqual({ type: 'create', path: 'src/new-name.js' });
    });

    it('should reject blocked paths', () => {
      const files = [{ path: '.env', change_type: 'added', content: 'secret' }];
      const result = handler.processChangedFiles(files);

      expect(result.success).toBe(false);
      expect(result.files[0].valid).toBe(false);
      expect(result.files[0].error).toContain('blocked');
    });

    it('should reject path traversal', () => {
      const files = [{ path: '../outside.js', change_type: 'added' }];
      const result = handler.processChangedFiles(files);

      expect(result.success).toBe(false);
    });

    it('should handle empty array', () => {
      const result = handler.processChangedFiles([]);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(0);
    });

    it('should reject invalid input', () => {
      const result = handler.processChangedFiles(null);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('changed_files must be an array');
    });
  });

  describe('validatePath', () => {
    it('should accept valid relative paths', () => {
      const result = handler.validatePath('src/file.js');

      expect(result.valid).toBe(true);
    });

    it('should reject .git paths', () => {
      const result = handler.validatePath('.git/config');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('.git');
    });

    it('should reject .env files', () => {
      const result = handler.validatePath('.env');

      expect(result.valid).toBe(false);
    });

it('should reject path traversal', () => {
      const result = handler.validatePath('../outside.js');

      expect(result.valid).toBe(false);
    });

    it('should reject absolute paths', () => {
      const result = handler.validatePath('/etc/passwd');

      expect(result.valid).toBe(false);
    });
  });

  describe('groupByChangeType', () => {
    it('should group files by change type', () => {
      const files = [
        { path: 'a.js', change_type: 'added' },
        { path: 'b.js', change_type: 'added' },
        { path: 'c.js', change_type: 'modified' },
        { path: 'd.js', change_type: 'deleted' }
      ];

      const groups = handler.groupByChangeType(files);

      expect(groups.added).toHaveLength(2);
      expect(groups.modified).toHaveLength(1);
      expect(groups.deleted).toHaveLength(1);
    });
  });

  describe('buildCommitMessage', () => {
    it('should build commit message with artifact type prefix', () => {
      const files = [{ path: 'src/test.js', change_type: 'added' }];
      const message = handler.buildCommitMessage(files, 'implementation_summary');

      expect(message).toContain('[Implement]');
      expect(message).toContain('1 added');
      expect(message).toContain('Co-authored-by: Expert Pack');
    });
  });

  describe('getStats', () => {
    it('should return file statistics', () => {
      const files = [
        { path: 'a.js', change_type: 'added' },
        { path: 'b.js', change_type: 'modified' }
      ];

      const stats = handler.getStats(files);

      expect(stats.total).toBe(2);
      expect(stats.by_type.added).toBe(1);
      expect(stats.by_type.modified).toBe(1);
    });
  });
});