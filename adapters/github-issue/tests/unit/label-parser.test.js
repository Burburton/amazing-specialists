/**
 * label-parser.test.js
 * 
 * Unit tests for LabelParser class
 * Tests all label patterns, edge cases, and business rules per spec.md AC-002, BR-001, BR-002
 * 
 * @jest-environment node
 */

'use strict';

const { LabelParser, VALID_ROLES, VALID_RISK_LEVELS } = require('../../label-parser');

// Standard test configuration
const TEST_CONFIG = {
  label_mappings: {
    milestone_prefix: 'milestone:',
    role_prefix: 'role:',
    command_prefix: 'command:',
    task_prefix: 'task:',
    risk_prefix: 'risk:',
    escalation_prefix: 'escalation:',
    status_prefix: 'status:'
  }
};

// Configuration with role label requirement enabled
const STRICT_CONFIG = {
  label_mappings: {
    milestone_prefix: 'milestone:',
    role_prefix: 'role:',
    command_prefix: 'command:',
    task_prefix: 'task:',
    risk_prefix: 'risk:',
    escalation_prefix: 'escalation:',
    status_prefix: 'status:'
  },
  validation: {
    require_role_label: true
  }
};

describe('LabelParser', () => {
  describe('constructor', () => {
    it('should create instance with valid config', () => {
      const parser = new LabelParser(TEST_CONFIG);
      expect(parser).toBeInstanceOf(LabelParser);
      expect(parser.labelMappings).toEqual(TEST_CONFIG.label_mappings);
    });

    it('should throw error when config is null', () => {
      expect(() => new LabelParser(null)).toThrow('LabelParser requires a config object');
    });

    it('should throw error when config is undefined', () => {
      expect(() => new LabelParser(undefined)).toThrow('LabelParser requires a config object');
    });

    it('should throw error when label_mappings is missing', () => {
      expect(() => new LabelParser({})).toThrow('LabelParser requires config.label_mappings');
    });

    it('should throw error when config is empty object', () => {
      expect(() => new LabelParser({})).toThrow('LabelParser requires config.label_mappings');
    });

    it('should store validation config when provided', () => {
      const parser = new LabelParser(STRICT_CONFIG);
      expect(parser.validationConfig).toEqual({ require_role_label: true });
    });

    it('should handle empty validation config', () => {
      const config = { ...TEST_CONFIG, validation: {} };
      const parser = new LabelParser(config);
      expect(parser.validationConfig).toEqual({});
    });
  });

  describe('parse - empty/null labels', () => {
    it('should handle null labels array', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse(null);
      
      expect(result.milestone_id).toBeNull();
      expect(result.task_id).toBeNull();
      expect(result.role).toBeNull();
      expect(result.command).toBeNull();
      expect(result.risk_level).toBeNull();
      expect(result.unrecognized_labels).toEqual([]);
      expect(result.warnings).toContain('No labels provided for parsing');
    });

    it('should handle undefined labels', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse(undefined);
      
      expect(result.warnings).toContain('No labels provided for parsing');
    });

    it('should handle empty labels array', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([]);
      
      expect(result.warnings).toContain('No labels provided for parsing');
      expect(result.unrecognized_labels).toEqual([]);
    });

    it('should handle empty array with role requirement enabled', () => {
      const parser = new LabelParser(STRICT_CONFIG);
      const result = parser.parse([]);
      
      expect(result.warnings).toContain('No labels provided for parsing');
      expect(result.warnings).toContain('BR-001: At least one role:* label required for dispatch');
    });
  });

  describe('parse - milestone labels (AC-002)', () => {
    it('should parse milestone:M001', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'milestone:M001' }]);
      
      expect(result.milestone_id).toBe('M001');
      expect(result.unrecognized_labels).toEqual([]);
    });

    it('should parse milestone:M999', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'milestone:M999' }]);
      
      expect(result.milestone_id).toBe('M999');
    });

    it('should parse milestone:M123', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'milestone:M123' }]);
      
      expect(result.milestone_id).toBe('M123');
    });

    it('should reject invalid milestone format (M01)', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'milestone:M01' }]);
      
      expect(result.milestone_id).toBeNull();
      expect(result.warnings).toContain("Invalid milestone format: 'milestone:M01' (expected M###)");
    });

    it('should reject invalid milestone format (M0001)', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'milestone:M0001' }]);
      
      expect(result.milestone_id).toBeNull();
      expect(result.warnings).toContain("Invalid milestone format: 'milestone:M0001' (expected M###)");
    });

    it('should reject invalid milestone format (MA01)', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'milestone:MA01' }]);
      
      expect(result.milestone_id).toBeNull();
      expect(result.warnings).toContain("Invalid milestone format: 'milestone:MA01' (expected M###)");
    });

    it('should reject invalid milestone format (milestone:M)', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'milestone:M' }]);
      
      expect(result.milestone_id).toBeNull();
      expect(result.warnings).toContain("Invalid milestone format: 'milestone:M' (expected M###)");
    });

    it('should use last valid milestone when multiple provided', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([
        { name: 'milestone:M001' },
        { name: 'milestone:M002' }
      ]);
      
      expect(result.milestone_id).toBe('M002');
    });

    it('should trim whitespace from label names', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: '  milestone:M001  ' }]);
      
      expect(result.milestone_id).toBe('M001');
    });
  });

  describe('parse - role labels (AC-002)', () => {
    const roles = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];

    roles.forEach(role => {
      it(`should parse role:${role}`, () => {
        const parser = new LabelParser(TEST_CONFIG);
        const result = parser.parse([{ name: `role:${role}` }]);
        
        expect(result.role).toBe(role);
      });

      it(`should parse role:${role} (case insensitive)`, () => {
        const parser = new LabelParser(TEST_CONFIG);
        const result = parser.parse([{ name: `role:${role.toUpperCase()}` }]);
        
        expect(result.role).toBe(role);
      });

      it(`should parse role:${role} (mixed case)`, () => {
        const parser = new LabelParser(TEST_CONFIG);
        const result = parser.parse([{ name: `role:${role.charAt(0).toUpperCase()}${role.slice(1)}` }]);
        
        expect(result.role).toBe(role);
      });
    });

    it('should reject invalid role value', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'role:manager' }]);
      
      expect(result.role).toBeNull();
      expect(result.warnings).toContain("Invalid role value: 'role:manager' (valid roles: architect, developer, tester, reviewer, docs, security)");
    });

    it('should reject empty role value', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'role:' }]);
      
      expect(result.role).toBeNull();
      expect(result.warnings).toContain("Invalid role value: 'role:' (valid roles: architect, developer, tester, reviewer, docs, security)");
    });

    it('should recognize valid roles constant', () => {
      expect(VALID_ROLES).toEqual(['architect', 'developer', 'tester', 'reviewer', 'docs', 'security']);
    });
  });

  describe('parse - command labels (AC-002)', () => {
    it('should parse command:implement-task', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'command:implement-task' }]);
      
      expect(result.command).toBe('implement-task');
    });

    it('should parse command:design-task', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'command:design-task' }]);
      
      expect(result.command).toBe('design-task');
    });

    it('should parse command:test', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'command:test' }]);
      
      expect(result.command).toBe('test');
    });

    it('should parse command with special characters', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'command:my_command-123' }]);
      
      expect(result.command).toBe('my_command-123');
    });

    it('should reject empty command value', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'command:' }]);
      
      expect(result.command).toBeNull();
      expect(result.warnings).toContain("Empty command value: 'command:'");
    });

    it('should use last command when multiple provided', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([
        { name: 'command:first' },
        { name: 'command:second' }
      ]);
      
      expect(result.command).toBe('second');
    });
  });

  describe('parse - task labels (AC-002)', () => {
    it('should parse task:T001', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'task:T001' }]);
      
      expect(result.task_id).toBe('T001');
    });

    it('should parse task:T999', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'task:T999' }]);
      
      expect(result.task_id).toBe('T999');
    });

    it('should reject invalid task format (T01)', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'task:T01' }]);
      
      expect(result.task_id).toBeNull();
      expect(result.warnings).toContain("Invalid task format: 'task:T01' (expected T###)");
    });

    it('should reject invalid task format (TA01)', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'task:TA01' }]);
      
      expect(result.task_id).toBeNull();
      expect(result.warnings).toContain("Invalid task format: 'task:TA01' (expected T###)");
    });

    it('should use last valid task when multiple provided', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([
        { name: 'task:T001' },
        { name: 'task:T002' }
      ]);
      
      expect(result.task_id).toBe('T002');
    });
  });

  describe('parse - risk level labels (AC-002)', () => {
    const riskLevels = ['low', 'medium', 'high', 'critical'];

    riskLevels.forEach(level => {
      it(`should parse risk:${level}`, () => {
        const parser = new LabelParser(TEST_CONFIG);
        const result = parser.parse([{ name: `risk:${level}` }]);
        
        expect(result.risk_level).toBe(level);
      });

      it(`should parse risk:${level} (case insensitive)`, () => {
        const parser = new LabelParser(TEST_CONFIG);
        const result = parser.parse([{ name: `risk:${level.toUpperCase()}` }]);
        
        expect(result.risk_level).toBe(level);
      });
    });

    it('should reject invalid risk level', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'risk:extreme' }]);
      
      expect(result.risk_level).toBeNull();
      expect(result.warnings).toContain("Invalid risk level: 'risk:extreme' (valid levels: low, medium, high, critical)");
    });

    it('should reject empty risk value', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'risk:' }]);
      
      expect(result.risk_level).toBeNull();
      expect(result.warnings).toContain("Invalid risk level: 'risk:' (valid levels: low, medium, high, critical)");
    });

    it('should recognize valid risk levels constant', () => {
      expect(VALID_RISK_LEVELS).toEqual(['low', 'medium', 'high', 'critical']);
    });
  });

  describe('parse - multiple roles priority (BR-002)', () => {
    it('should use first role when multiple provided', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([
        { name: 'role:developer' },
        { name: 'role:tester' }
      ]);
      
      expect(result.role).toBe('developer');
    });

    it('should add warning for multiple roles (BR-002)', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([
        { name: 'role:architect' },
        { name: 'role:developer' },
        { name: 'role:tester' }
      ]);
      
      expect(result.role).toBe('architect');
      expect(result.warnings).toContain('BR-002: Multiple role labels found (architect, developer, tester), using first: architect');
    });

    it('should handle two roles with warning', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([
        { name: 'role:security' },
        { name: 'role:reviewer' }
      ]);
      
      expect(result.role).toBe('security');
      expect(result.warnings).toContain('BR-002: Multiple role labels found (security, reviewer), using first: security');
    });

    it('should not add warning for single role', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'role:developer' }]);
      
      expect(result.role).toBe('developer');
      const br002Warnings = result.warnings.filter(w => w.includes('BR-002'));
      expect(br002Warnings).toHaveLength(0);
    });

    it('should filter out invalid roles before determining multiple', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([
        { name: 'role:invalid' },
        { name: 'role:developer' },
        { name: 'role:tester' }
      ]);
      
      expect(result.role).toBe('developer');
      expect(result.warnings).toContain('BR-002: Multiple role labels found (developer, tester), using first: developer');
    });
  });

  describe('parse - required role validation (BR-001)', () => {
    it('should add warning when no role label and requirement enabled', () => {
      const parser = new LabelParser(STRICT_CONFIG);
      const result = parser.parse([{ name: 'milestone:M001' }]);
      
      expect(result.role).toBeNull();
      expect(result.warnings).toContain('BR-001: At least one role:* label required for dispatch');
    });

    it('should not add warning when role requirement disabled', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'milestone:M001' }]);
      
      expect(result.role).toBeNull();
      const br001Warnings = result.warnings.filter(w => w.includes('BR-001'));
      expect(br001Warnings).toHaveLength(0);
    });

    it('should not add warning when role is present', () => {
      const parser = new LabelParser(STRICT_CONFIG);
      const result = parser.parse([
        { name: 'role:developer' },
        { name: 'milestone:M001' }
      ]);
      
      expect(result.role).toBe('developer');
      const br001Warnings = result.warnings.filter(w => w.includes('BR-001'));
      expect(br001Warnings).toHaveLength(0);
    });

    it('should add BR-001 warning for empty labels with requirement enabled', () => {
      const parser = new LabelParser(STRICT_CONFIG);
      const result = parser.parse([]);
      
      expect(result.warnings).toContain('BR-001: At least one role:* label required for dispatch');
    });
  });

  describe('parse - escalation and status labels', () => {
    it('should recognize escalation:needs-decision', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'escalation:needs-decision' }]);
      
      expect(result.unrecognized_labels).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should recognize escalation:blocked', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'escalation:blocked' }]);
      
      expect(result.unrecognized_labels).toEqual([]);
    });

    it('should recognize status:in-progress', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'status:in-progress' }]);
      
      expect(result.unrecognized_labels).toEqual([]);
    });

    it('should recognize status:completed', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'status:completed' }]);
      
      expect(result.unrecognized_labels).toEqual([]);
    });
  });

  describe('parse - unrecognized labels', () => {
    it('should collect unrecognized labels', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([
        { name: 'bug' },
        { name: 'feature' },
        { name: 'help wanted' }
      ]);
      
      expect(result.unrecognized_labels).toEqual(['bug', 'feature', 'help wanted']);
    });

    it('should not include recognized labels in unrecognized list', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([
        { name: 'role:developer' },
        { name: 'bug' }
      ]);
      
      expect(result.unrecognized_labels).toEqual(['bug']);
      expect(result.role).toBe('developer');
    });

    it('should handle mixed recognized and unrecognized', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([
        { name: 'role:developer' },
        { name: 'milestone:M001' },
        { name: 'priority-high' },
        { name: 'task:T001' },
        { name: 'invalid-label' }
      ]);
      
      expect(result.unrecognized_labels).toEqual(['priority-high', 'invalid-label']);
      expect(result.role).toBe('developer');
      expect(result.milestone_id).toBe('M001');
      expect(result.task_id).toBe('T001');
    });
  });

  describe('parse - edge cases', () => {
    it('should handle malformed label object (null)', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([null]);
      
      expect(result.warnings).toContain('Malformed label object: null');
    });

    it('should handle malformed label object (undefined)', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([undefined]);
      
      expect(result.warnings).toContain('Malformed label object: undefined');
    });

    it('should handle label object without name property', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ id: 123 }]);
      
      expect(result.warnings).toContain('Malformed label object: {"id":123}');
    });

    it('should handle label object with non-string name', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 123 }]);
      
      expect(result.warnings).toContain('Malformed label object: {"name":123}');
    });

    it('should handle empty string label name', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: '' }]);
      
      expect(result.warnings).toContain('Empty label name encountered');
    });

    it('should handle whitespace-only label name', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: '   ' }]);
      
      expect(result.warnings).toContain('Empty label name encountered');
    });

    it('should handle label with only prefix', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([
        { name: 'milestone:' },
        { name: 'task:' },
        { name: 'role:' }
      ]);
      
      expect(result.warnings).toContain("Invalid milestone format: 'milestone:' (expected M###)");
      expect(result.warnings).toContain("Invalid task format: 'task:' (expected T###)");
      expect(result.warnings).toContain("Invalid role value: 'role:' (valid roles: architect, developer, tester, reviewer, docs, security)");
    });

    it('should handle labels with extra colons', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'role:developer:extra' }]);
      
      // "developer:extra" is not a valid role, so it's treated as invalid
      expect(result.role).toBeNull();
      expect(result.warnings).toContain("Invalid role value: 'role:developer:extra' (valid roles: architect, developer, tester, reviewer, docs, security)");
    });

    it('should handle very long label names', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const longLabel = 'command:' + 'a'.repeat(1000);
      const result = parser.parse([{ name: longLabel }]);
      
      expect(result.command).toBe('a'.repeat(1000));
    });

    it('should handle labels with unicode characters', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'command:测试' }]);
      
      expect(result.command).toBe('测试');
    });

    it('should handle labels with special characters', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([{ name: 'command:run&test' }]);
      
      expect(result.command).toBe('run&test');
    });
  });

  describe('parse - complete payload scenarios', () => {
    it('should parse complete dispatch payload labels', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([
        { name: 'milestone:M001' },
        { name: 'role:developer' },
        { name: 'command:implement-task' },
        { name: 'task:T001' },
        { name: 'risk:medium' }
      ]);
      
      expect(result.milestone_id).toBe('M001');
      expect(result.role).toBe('developer');
      expect(result.command).toBe('implement-task');
      expect(result.task_id).toBe('T001');
      expect(result.risk_level).toBe('medium');
      expect(result.unrecognized_labels).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should parse all six roles in separate scenarios', () => {
      const roles = ['architect', 'developer', 'tester', 'reviewer', 'docs', 'security'];
      
      roles.forEach(role => {
        const parser = new LabelParser(TEST_CONFIG);
        const result = parser.parse([
          { name: 'milestone:M001' },
          { name: `role:${role}` },
          { name: 'command:design-task' },
          { name: 'task:T001' },
          { name: 'risk:low' }
        ]);
        
        expect(result.role).toBe(role);
      });
    });

    it('should parse all risk levels in separate scenarios', () => {
      const risks = ['low', 'medium', 'high', 'critical'];
      
      risks.forEach(risk => {
        const parser = new LabelParser(TEST_CONFIG);
        const result = parser.parse([
          { name: 'milestone:M001' },
          { name: 'role:developer' },
          { name: `risk:${risk}` }
        ]);
        
        expect(result.risk_level).toBe(risk);
      });
    });

    it('should handle complex scenario with multiple labels', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([
        { name: 'milestone:M001' },
        { name: 'role:developer' },
        { name: 'role:tester' }, // Should trigger BR-002
        { name: 'command:implement-task' },
        { name: 'task:T001' },
        { name: 'risk:high' },
        { name: 'status:in-progress' },
        { name: 'escalation:blocked' },
        { name: 'bug' }, // Unrecognized
        { name: 'priority-urgent' } // Unrecognized
      ]);
      
      expect(result.milestone_id).toBe('M001');
      expect(result.role).toBe('developer'); // First role
      expect(result.command).toBe('implement-task');
      expect(result.task_id).toBe('T001');
      expect(result.risk_level).toBe('high');
      expect(result.unrecognized_labels).toEqual(['bug', 'priority-urgent']);
      expect(result.warnings).toContain('BR-002: Multiple role labels found (developer, tester), using first: developer');
    });
  });

  describe('parse - config prefix variations', () => {
    it('should use custom prefixes from config', () => {
      const customConfig = {
        label_mappings: {
          milestone_prefix: 'ms:',
          role_prefix: 'r:',
          command_prefix: 'cmd:',
          task_prefix: 't:',
          risk_prefix: 'rl:',
          escalation_prefix: 'esc:',
          status_prefix: 'st:'
        }
      };
      
      const parser = new LabelParser(customConfig);
      const result = parser.parse([
        { name: 'ms:M001' },
        { name: 'r:developer' },
        { name: 'cmd:test' },
        { name: 't:T001' },
        { name: 'rl:high' }
      ]);
      
      expect(result.milestone_id).toBe('M001');
      expect(result.role).toBe('developer');
      expect(result.command).toBe('test');
      expect(result.task_id).toBe('T001');
      expect(result.risk_level).toBe('high');
    });

    it('should treat labels with undefined prefix as unrecognized', () => {
      const configWithMissing = {
        label_mappings: {
          milestone_prefix: 'milestone:',
          // role_prefix is undefined
          command_prefix: 'command:'
        }
      };
      
      const parser = new LabelParser(configWithMissing);
      const result = parser.parse([
        { name: 'milestone:M001' },
        { name: 'role:developer' }, // role_prefix is undefined
        { name: 'command:test' }
      ]);
      
      expect(result.milestone_id).toBe('M001');
      expect(result.role).toBeNull(); // role_prefix not defined
      expect(result.unrecognized_labels).toContain('role:developer');
      expect(result.command).toBe('test');
    });
  });

  describe('static methods', () => {
    it('getValidRoles should return all valid roles', () => {
      const roles = LabelParser.getValidRoles();
      expect(roles).toEqual(['architect', 'developer', 'tester', 'reviewer', 'docs', 'security']);
    });

    it('getValidRiskLevels should return all valid risk levels', () => {
      const levels = LabelParser.getValidRiskLevels();
      expect(levels).toEqual(['low', 'medium', 'high', 'critical']);
    });

    it('getValidRoles should return valid roles array', () => {
      const roles = LabelParser.getValidRoles();
      expect(roles).toEqual(['architect', 'developer', 'tester', 'reviewer', 'docs', 'security']);
    });

    it('getValidRiskLevels should return valid risk levels array', () => {
      const levels = LabelParser.getValidRiskLevels();
      expect(levels).toEqual(['low', 'medium', 'high', 'critical']);
    });
  });

  describe('result object structure', () => {
    it('should return result with all expected properties', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([]);
      
      expect(result).toHaveProperty('milestone_id');
      expect(result).toHaveProperty('task_id');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('command');
      expect(result).toHaveProperty('risk_level');
      expect(result).toHaveProperty('unrecognized_labels');
      expect(result).toHaveProperty('warnings');
    });

    it('should have arrays for unrecognized_labels and warnings', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([]);
      
      expect(Array.isArray(result.unrecognized_labels)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should have null for optional fields when no labels', () => {
      const parser = new LabelParser(TEST_CONFIG);
      const result = parser.parse([]);
      
      expect(result.milestone_id).toBeNull();
      expect(result.task_id).toBeNull();
      expect(result.role).toBeNull();
      expect(result.command).toBeNull();
      expect(result.risk_level).toBeNull();
    });
  });
});
