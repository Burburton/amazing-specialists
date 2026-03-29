const { CommitBuilder } = require('../../src/commit-builder');

describe('CommitBuilder', () => {
  let builder;

  beforeEach(() => {
    builder = new CommitBuilder({
      github_pr_config: {
        pr_config: {
          title_format: {
            'design_note': '[Design] {title}',
            'implementation_summary': '[Implement] {title}',
            'default': '[Expert Pack] {title}'
          }
        }
      }
    });
  });

  describe('buildCommitMessage', () => {
    it('should build commit message with correct prefix', () => {
      const files = [{ path: 'src/test.js', change_type: 'added' }];
      const message = builder.buildCommitMessage(files, { artifact_type: 'implementation_summary' });

      expect(message).toContain('[Implement]');
      expect(message).toContain('1 added');
    });

    it('should include multiple change types in summary', () => {
      const files = [
        { path: 'a.js', change_type: 'added' },
        { path: 'b.js', change_type: 'modified' },
        { path: 'c.js', change_type: 'deleted' }
      ];
      const message = builder.buildCommitMessage(files);

      expect(message).toContain('1 added');
      expect(message).toContain('1 modified');
      expect(message).toContain('1 deleted');
    });

    it('should include Co-authored-by line', () => {
      const files = [{ path: 'test.js', change_type: 'added' }];
      const message = builder.buildCommitMessage(files);

      expect(message).toContain('Co-authored-by: Expert Pack');
    });
  });

  describe('buildPRTitle', () => {
    it('should build PR title with artifact type format', () => {
      const artifact = { artifact_type: 'design_note', title: 'API Design' };
      const title = builder.buildPRTitle(artifact, {});

      expect(title).toBe('[Design] API Design');
    });

    it('should use default format for unknown types', () => {
      const artifact = { artifact_type: 'unknown', title: 'Test' };
      const title = builder.buildPRTitle(artifact, {});

      expect(title).toBe('[Expert Pack] Test');
    });
  });

  describe('buildPRBody', () => {
    it('should build complete PR body', () => {
      const result = {
        dispatch_id: 'dispatch-001',
        task_id: 'T001',
        role: 'developer',
        status: 'SUCCESS',
        summary: 'Completed successfully',
        changed_files: [{ path: 'src/test.js', change_type: 'added' }]
      };
      const artifacts = [{ path: 'docs/summary.md', title: 'Summary' }];

      const body = builder.buildPRBody(result, artifacts);

      expect(body).toContain('dispatch-001');
      expect(body).toContain('T001');
      expect(body).toContain('developer');
      expect(body).toContain('SUCCESS');
      expect(body).toContain('Completed successfully');
      expect(body).toContain('docs/summary.md');
      expect(body).toContain('src/test.js');
    });
  });

  describe('countByChangeType', () => {
    it('should count files by type', () => {
      const files = [
        { change_type: 'added' },
        { change_type: 'added' },
        { change_type: 'modified' },
        { change_type: 'deleted' }
      ];

      const counts = builder.countByChangeType(files);

      expect(counts.added).toBe(2);
      expect(counts.modified).toBe(1);
      expect(counts.deleted).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should return file statistics', () => {
      const files = [
        { change_type: 'added' },
        { change_type: 'modified' }
      ];

      const stats = builder.getStats(files);

      expect(stats.total).toBe(2);
      expect(stats.added).toBe(1);
      expect(stats.modified).toBe(1);
    });
  });
});