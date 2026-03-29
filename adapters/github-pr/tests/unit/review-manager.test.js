const { ReviewManager, ReviewEvent } = require('../../src/review-manager');

describe('ReviewManager', () => {
  let manager;
  let mockPRClient;

  beforeEach(() => {
    mockPRClient = {
      createReview: jest.fn().mockResolvedValue({ review_id: 123, state: 'APPROVED' }),
      createReviewComment: jest.fn().mockResolvedValue({ comment_id: 456 }),
      addLabels: jest.fn().mockResolvedValue({})
    };

    manager = new ReviewManager(mockPRClient, {
      github_pr_config: {
        review_config: {
          status_mapping: {
            'SUCCESS': 'APPROVE',
            'PARTIAL': 'REQUEST_CHANGES',
            'BLOCKED': 'COMMENT'
          }
        },
        labels: {
          success: 'expert-pack:success',
          warning: 'expert-pack:warning',
          escalation: 'escalation:needs-decision'
        }
      }
    });
  });

  describe('mapStatusToReviewEvent', () => {
    it('should map SUCCESS to APPROVE', () => {
      const event = manager.mapStatusToReviewEvent('SUCCESS');

      expect(event).toBe(ReviewEvent.APPROVE);
    });

    it('should map PARTIAL to REQUEST_CHANGES', () => {
      const event = manager.mapStatusToReviewEvent('PARTIAL');

      expect(event).toBe(ReviewEvent.REQUEST_CHANGES);
    });

    it('should map BLOCKED to COMMENT', () => {
      const event = manager.mapStatusToReviewEvent('BLOCKED');

      expect(event).toBe(ReviewEvent.COMMENT);
    });

    it('should default to COMMENT for unknown status', () => {
      const event = manager.mapStatusToReviewEvent('UNKNOWN');

      expect(event).toBe(ReviewEvent.COMMENT);
    });
  });

  describe('setReviewStatus', () => {
    it('should create review with correct event', async () => {
      const result = await manager.setReviewStatus('owner', 'repo', 1, 'SUCCESS');

      expect(result.success).toBe(true);
      expect(result.event).toBe('APPROVE');
      expect(mockPRClient.createReview).toHaveBeenCalledWith(
        'owner', 'repo', 1, 'APPROVE', expect.any(String)
      );
    });
  });

  describe('getStatusLabel', () => {
    it('should return success label for SUCCESS', () => {
      const label = manager.getStatusLabel('SUCCESS');

      expect(label).toBe('expert-pack:success');
    });

    it('should return escalation label for FAILED_ESCALATE', () => {
      const label = manager.getStatusLabel('FAILED_ESCALATE');

      expect(label).toBe('escalation:needs-decision');
    });
  });

  describe('buildReviewBody', () => {
    it('should build complete review body', () => {
      const result = {
        status: 'SUCCESS',
        summary: 'All tests passed',
        issues_found: [],
        risks: [],
        recommendation: 'CONTINUE'
      };

      const body = manager.buildReviewBody(result);

      expect(body).toContain('SUCCESS');
      expect(body).toContain('All tests passed');
      expect(body).toContain('Ready to proceed');
    });

    it('should include issues section when present', () => {
      const result = {
        status: 'PARTIAL',
        summary: 'Partial completion',
        issues_found: [
          { severity: 'high', description: 'Missing tests', recommendation: 'Add tests' }
        ],
        risks: [],
        recommendation: 'REWORK'
      };

      const body = manager.buildReviewBody(result);

      expect(body).toContain('Issues Found');
      expect(body).toContain('Missing tests');
    });
  });

  describe('formatSeverity', () => {
    it('should format critical severity', () => {
      const formatted = manager.formatSeverity('critical');

      expect(formatted).toContain('Critical');
    });

    it('should format high severity', () => {
      const formatted = manager.formatSeverity('high');

      expect(formatted).toContain('High');
    });
  });
});