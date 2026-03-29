const { ArtifactWriter } = require('../../src/artifact-writer');

describe('ArtifactWriter', () => {
  let writer;
  let mockPRClient;

  beforeEach(() => {
    mockPRClient = {
      getFile: jest.fn(),
      createOrUpdateFile: jest.fn()
    };

    const config = {
      output_config: {
        artifact_path: 'docs/artifacts/'
      },
      github_pr_config: {
        validation: {
          path_blocklist: ['.env', '.git', 'node_modules'],
          max_file_size_bytes: 10 * 1024 * 1024
        }
      }
    };

    writer = new ArtifactWriter(mockPRClient, config);
  });

  describe('writeArtifacts', () => {
    it('should write multiple artifacts', async () => {
      const artifacts = [
        {
          artifact_id: 'art-001',
          artifact_type: 'implementation_summary',
          path: 'summary.md',
          title: 'Summary',
          created_by_role: 'developer',
          metadata: { content: '# Summary\n\nContent here' }
        },
        {
          artifact_id: 'art-002',
          artifact_type: 'test_report',
          path: 'test-report.md',
          title: 'Test Report',
          created_by_role: 'tester',
          metadata: { content: '# Test Report\n\nAll tests pass' }
        }
      ];

      mockPRClient.getFile.mockRejectedValue(new Error('Not found'));
      mockPRClient.createOrUpdateFile.mockResolvedValue({
        sha: 'sha123',
        commit_sha: 'commit456',
        operation: 'created'
      });

      const result = await writer.writeArtifacts(artifacts, 'owner', 'repo', 'main');

      expect(result.success).toBe(true);
      expect(result.artifacts_written).toHaveLength(2);
      expect(mockPRClient.createOrUpdateFile).toHaveBeenCalledTimes(2);
    });

    it('should return warning for empty artifacts array', async () => {
      const result = await writer.writeArtifacts([], 'owner', 'repo', 'main');

      expect(result.warnings).toContain('No artifacts to write');
    });

    it('should handle null artifacts', async () => {
      const result = await writer.writeArtifacts(null, 'owner', 'repo', 'main');

      expect(result.warnings).toContain('No artifacts to write');
    });

    it('should collect errors from failed writes', async () => {
      const artifacts = [
        {
          artifact_id: 'art-001',
          artifact_type: 'implementation_summary',
          path: 'valid.md',
          metadata: { content: 'content' }
        },
        {
          artifact_id: 'art-002',
          artifact_type: 'design_note',
          path: '.env',
          metadata: { content: 'secret' }
        }
      ];

      mockPRClient.createOrUpdateFile.mockResolvedValue({
        sha: 'sha123',
        operation: 'created'
      });

      const result = await writer.writeArtifacts(artifacts, 'owner', 'repo', 'main');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('writeArtifact', () => {
    it('should write a valid artifact', async () => {
      const artifact = {
        artifact_id: 'art-001',
        artifact_type: 'implementation_summary',
        path: 'summary.md',
        title: 'Summary',
        created_by_role: 'developer',
        metadata: { content: '# Summary' }
      };

      mockPRClient.getFile.mockRejectedValue(new Error('Not found'));
      mockPRClient.createOrUpdateFile.mockResolvedValue({
        sha: 'sha123',
        commit_sha: 'commit456',
        operation: 'created'
      });

      const result = await writer.writeArtifact(artifact, 'owner', 'repo', 'main');

      expect(result.success).toBe(true);
      expect(result.operation).toBe('created');
    });

    it('should update existing file', async () => {
      const artifact = {
        artifact_id: 'art-001',
        artifact_type: 'implementation_summary',
        path: 'existing.md',
        metadata: { content: 'Updated content' }
      };

      mockPRClient.getFile.mockResolvedValue({
        isDirectory: false,
        sha: 'existingsha',
        content: 'old content'
      });
      mockPRClient.createOrUpdateFile.mockResolvedValue({
        sha: 'newsha',
        commit_sha: 'newcommit',
        operation: 'updated'
      });

      const result = await writer.writeArtifact(artifact, 'owner', 'repo', 'main');

      expect(result.success).toBe(true);
      expect(result.operation).toBe('updated');
    });

    it('should reject artifact without path', async () => {
      const artifact = {
        artifact_id: 'art-001',
        artifact_type: 'implementation_summary',
        metadata: { content: 'content' }
      };

      const result = await writer.writeArtifact(artifact, 'owner', 'repo', 'main');

      expect(result.success).toBe(false);
      expect(result.error).toContain('missing path');
    });

    it('should reject artifact without type', async () => {
      const artifact = {
        artifact_id: 'art-001',
        path: 'file.md',
        metadata: { content: 'content' }
      };

      const result = await writer.writeArtifact(artifact, 'owner', 'repo', 'main');

      expect(result.success).toBe(false);
      expect(result.error).toContain('missing artifact_type');
    });

    it('should reject artifact without content', async () => {
      const artifact = {
        artifact_id: 'art-001',
        artifact_type: 'implementation_summary',
        path: 'file.md'
      };

      const result = await writer.writeArtifact(artifact, 'owner', 'repo', 'main');

      expect(result.success).toBe(false);
      expect(result.error).toContain('no content');
    });

    it('should reject blocked path', async () => {
      const artifact = {
        artifact_id: 'art-001',
        artifact_type: 'implementation_summary',
        path: '.env',
        metadata: { content: 'secret' }
      };

      const result = await writer.writeArtifact(artifact, 'owner', 'repo', 'main');

      expect(result.success).toBe(false);
      expect(result.error).toContain('blocked');
    });
  });

  describe('validateArtifact', () => {
    it('should pass for valid artifact', () => {
      const artifact = {
        path: 'docs/summary.md',
        artifact_type: 'implementation_summary',
        metadata: { content: 'content' }
      };

      const result = writer.validateArtifact(artifact);

      expect(result.valid).toBe(true);
    });

    it('should fail for missing path', () => {
      const artifact = {
        artifact_type: 'implementation_summary'
      };

      const result = writer.validateArtifact(artifact);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('missing path');
    });

    it('should fail for missing artifact_type', () => {
      const artifact = {
        path: 'file.md'
      };

      const result = writer.validateArtifact(artifact);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('missing artifact_type');
    });

    it('should fail for oversized content', () => {
      const largeContent = 'x'.repeat(20 * 1024 * 1024);
      const artifact = {
        path: 'large.md',
        artifact_type: 'implementation_summary',
        metadata: { content: largeContent }
      };

      const result = writer.validateArtifact(artifact);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds max size');
    });
  });

  describe('validatePath', () => {
    it('should accept valid paths', () => {
      const result = writer.validatePath('docs/summary.md');

      expect(result.valid).toBe(true);
    });

    it('should reject null path', () => {
      const result = writer.validatePath(null);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('required');
    });

    it('should reject blocked paths', () => {
      const result = writer.validatePath('.env');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('blocked');
    });

    it('should reject path traversal', () => {
      const result = writer.validatePath('../outside.md');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('traversal');
    });
  });

  describe('extractContent', () => {
    it('should extract from metadata.content', () => {
      const artifact = {
        metadata: { content: 'metadata content' }
      };

      const content = writer.extractContent(artifact);

      expect(content).toBe('metadata content');
    });

    it('should extract from content field', () => {
      const artifact = {
        content: 'direct content'
      };

      const result = writer.extractContent(artifact);

      expect(result).toBe('direct content');
    });

    it('should prefer metadata.content over content', () => {
      const artifact = {
        content: 'direct',
        metadata: { content: 'metadata' }
      };

      const result = writer.extractContent(artifact);

      expect(result).toBe('metadata');
    });

    it('should return null for no content', () => {
      const artifact = {};

      const result = writer.extractContent(artifact);

      expect(result).toBeNull();
    });
  });

  describe('resolvePath', () => {
    it('should prepend artifact_path', () => {
      const artifact = { path: 'summary.md' };

      const result = writer.resolvePath(artifact);

      expect(result).toBe('docs/artifacts/summary.md');
    });

    it('should return path as-is if no artifact_path', () => {
      const noPathWriter = new ArtifactWriter(mockPRClient, {
        output_config: {}
      });

      const artifact = { path: 'summary.md' };

      const result = noPathWriter.resolvePath(artifact);

      expect(result).toBe('summary.md');
    });
  });

  describe('buildCommitMessage', () => {
    it('should build commit message with prefix', () => {
      const artifact = {
        artifact_id: 'art-001',
        artifact_type: 'implementation_summary',
        path: 'summary.md',
        title: 'My Summary',
        created_by_role: 'developer'
      };

      const message = writer.buildCommitMessage(artifact);

      expect(message).toContain('[Implement]');
      expect(message).toContain('My Summary');
      expect(message).toContain('art-001');
      expect(message).toContain('developer');
      expect(message).toContain('Co-authored-by');
    });

    it('should use path if no title', () => {
      const artifact = {
        artifact_id: 'art-001',
        artifact_type: 'design_note',
        path: 'design.md',
        created_by_role: 'architect'
      };

      const message = writer.buildCommitMessage(artifact);

      expect(message).toContain('design.md');
    });
  });

  describe('getTypePrefix', () => {
    it('should return correct prefix for known types', () => {
      expect(writer.getTypePrefix('design_note')).toBe('[Design]');
      expect(writer.getTypePrefix('implementation_summary')).toBe('[Implement]');
      expect(writer.getTypePrefix('test_report')).toBe('[Test]');
      expect(writer.getTypePrefix('review_report')).toBe('[Review]');
      expect(writer.getTypePrefix('security_report')).toBe('[Security]');
    });

    it('should return default prefix for unknown types', () => {
      expect(writer.getTypePrefix('unknown_type')).toBe('[Artifact]');
    });
  });

  describe('getStats', () => {
    it('should return artifact statistics', () => {
      const artifacts = [
        { artifact_type: 'design_note', metadata: { content: 'a' } },
        { artifact_type: 'design_note', metadata: { content: 'b' } },
        { artifact_type: 'test_report', metadata: { content: 'c' } },
        { artifact_type: 'empty' }
      ];

      const stats = writer.getStats(artifacts);

      expect(stats.total).toBe(4);
      expect(stats.by_type.design_note).toBe(2);
      expect(stats.by_type.test_report).toBe(1);
      expect(stats.with_content).toBe(3);
    });
  });

  describe('groupByType', () => {
    it('should group artifacts by type', () => {
      const artifacts = [
        { artifact_type: 'a' },
        { artifact_type: 'b' },
        { artifact_type: 'a' }
      ];

      const groups = writer.groupByType(artifacts);

      expect(groups.a).toBe(2);
      expect(groups.b).toBe(1);
    });
  });
});