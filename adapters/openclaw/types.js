/**
 * OpenClaw Orchestrator Adapter Type Definitions
 * 
 * TypeScript-compatible type definitions for the OpenClaw adapter.
 * Based on spec.md §5.1 and io-contract.md §1.
 * 
 * @module adapters/openclaw/types
 */

// ==================== Role and Risk Level Enums ====================

/**
 * Valid role values (6-role formal execution model)
 * @see role-definition.md
 */
const RoleEnum = {
  ARCHITECT: 'architect',
  DEVELOPER: 'developer',
  TESTER: 'tester',
  REVIEWER: 'reviewer',
  DOCS: 'docs',
  SECURITY: 'security'
};

/**
 * Valid risk level values
 */
const RiskLevelEnum = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Valid execution status values
 * @see io-contract.md §2
 */
const ExecutionStatusEnum = {
  SUCCESS: 'SUCCESS',
  FAILED_RETRYABLE: 'FAILED_RETRYABLE',
  FAILED_ESCALATE: 'FAILED_ESCALATE',
  BLOCKED: 'BLOCKED'
};

/**
 * Valid recommendation values
 * @see io-contract.md §2
 */
const RecommendationEnum = {
  CONTINUE: 'CONTINUE',
  REWORK: 'REWORK',
  REPLAN: 'REPLAN',
  ESCALATE: 'ESCALATE'
};

/**
 * Valid escalation level values
 */
const EscalationLevelEnum = {
  INTERNAL: 'INTERNAL',
  USER: 'USER'
};

/**
 * Valid escalation response status values
 * @see design.md §3
 */
const EscalationResponseStatusEnum = {
  ACKNOWLEDGED: 'acknowledged',
  DECISION_MADE: 'decision_made',
  ESCALATE_FURTHER: 'escalate_further',
  ABORT: 'abort'
};

/**
 * Valid heartbeat status values
 */
const HeartbeatStatusEnum = {
  RUNNING: 'running',
  WAITING: 'waiting',
  BLOCKED: 'blocked'
};

/**
 * Valid retry strategy values
 */
const RetryStrategyEnum = {
  AUTO: 'auto',
  MANUAL: 'manual',
  DISABLED: 'disabled'
};

/**
 * Valid backoff type values
 */
const BackoffTypeEnum = {
  EXPONENTIAL: 'exponential',
  LINEAR: 'linear',
  FIXED: 'fixed'
};

// ==================== OpenClaw Input Types ====================

/**
 * OpenClaw dispatch message schema
 * @see spec.md §5.1
 */
const OpenClawDispatchMessage = {
  dispatch_id: '',          // string (optional, will be generated if missing)
  project: null,            // OpenClawProject
  milestone: null,          // OpenClawMilestone
  task: null,               // OpenClawTask
  role: '',                 // RoleEnum
  command: '',              // string
  retry_context: null,      // RetryContext (optional)
  upstream_dependencies: [], // Dependency[] (optional)
  downstream_expectations: [], // string[] (optional)
  metadata: {}              // Record<string, any> (optional)
};

/**
 * OpenClaw project object
 */
const OpenClawProject = {
  id: '',                   // string
  name: '',                 // string
  goal: ''                  // string
};

/**
 * OpenClaw milestone object
 */
const OpenClawMilestone = {
  id: '',                   // string
  name: '',                 // string
  goal: '',                 // string
  status: ''                // 'planned' | 'active' | 'completed' | 'blocked'
};

/**
 * OpenClaw task object
 */
const OpenClawTask = {
  id: '',                   // string
  title: '',                // string
  goal: '',                 // string
  description: '',          // string
  context: null,            // OpenClawContext
  constraints: [],          // string[]
  inputs: [],               // ArtifactReference[]
  expected_outputs: [],     // string[]
  verification_steps: [],   // string[]
  risk_level: ''            // RiskLevelEnum
};

/**
 * OpenClaw context object
 */
const OpenClawContext = {
  project_goal: '',         // string
  milestone_goal: '',       // string
  task_scope: '',           // string
  related_spec_sections: [], // string[]
  code_context_summary: ''  // string
};

// ==================== Dispatch Payload Types (io-contract.md §1) ====================

/**
 * Dispatch Payload schema
 * @see io-contract.md §1
 */
const DispatchPayload = {
  dispatch_id: '',          // string (required)
  project_id: '',           // string (required)
  milestone_id: '',         // string (required)
  task_id: '',              // string (required)
  role: '',                 // RoleEnum (required)
  command: '',              // string (required)
  title: '',                // string (required)
  goal: '',                 // string (required)
  description: '',          // string (required)
  context: null,            // DispatchContext (required)
  constraints: [],          // string[] (required)
  inputs: [],               // ArtifactReference[] (required)
  expected_outputs: [],     // string[] (required)
  verification_steps: [],   // string[] (required)
  risk_level: '',           // RiskLevelEnum (required)
  retry_context: null       // RetryContext (optional)
};

/**
 * Dispatch context schema
 */
const DispatchContext = {
  project_goal: '',         // string
  milestone_goal: '',       // string
  task_scope: '',           // string
  related_spec_sections: [], // string[]
  code_context_summary: '', // string
  upstream_task_summaries: [], // string[] (optional)
  related_artifacts: []     // ArtifactReference[] (optional)
};

/**
 * Artifact reference schema
 */
const ArtifactReference = {
  artifact_id: '',          // string
  artifact_type: '',        // string (e.g., 'design-note', 'implementation-summary')
  path: '',                 // string (file path)
  summary: ''               // string (brief description)
};

// ==================== Execution Result Types (io-contract.md §2) ====================

/**
 * Execution Result schema
 * @see io-contract.md §2
 */
const ExecutionResult = {
  dispatch_id: '',          // string
  project_id: '',           // string
  milestone_id: '',         // string
  task_id: '',              // string
  role: '',                 // RoleEnum
  command: '',              // string
  status: '',               // ExecutionStatusEnum
  summary: '',              // string
  artifacts: [],            // Artifact[]
  changed_files: [],        // ChangedFile[]
  checks_performed: [],     // string[]
  issues_found: [],         // Issue[]
  risks: [],                // Risk[]
  recommendation: '',       // RecommendationEnum
  needs_followup: false,    // boolean
  followup_suggestions: [], // string[]
  escalation: null          // Escalation (optional)
};

/**
 * Artifact schema (output)
 */
const Artifact = {
  artifact_id: '',          // string
  artifact_type: '',        // string
  path: '',                 // string
  content_hash: '',         // string (optional)
  summary: ''               // string
};

/**
 * Changed file schema
 */
const ChangedFile = {
  path: '',                 // string
  change_type: '',          // 'created' | 'modified' | 'deleted'
  lines_added: 0,           // number (optional)
  lines_removed: 0          // number (optional)
};

/**
 * Issue schema
 */
const Issue = {
  issue_id: '',             // string
  severity: '',             // 'error' | 'warning' | 'info'
  message: '',              // string
  location: ''              // string (optional)
};

/**
 * Risk schema
 */
const Risk = {
  risk_id: '',              // string
  level: '',                // RiskLevelEnum
  description: '',          // string
  mitigation: ''            // string (optional)
};

// ==================== Escalation Types (io-contract.md §4) ====================

/**
 * Escalation schema
 * @see io-contract.md §4
 */
const Escalation = {
  escalation_id: '',        // string
  dispatch_id: '',          // string
  project_id: '',           // string
  milestone_id: '',         // string
  task_id: '',              // string
  role: '',                 // RoleEnum
  level: '',                // EscalationLevelEnum
  reason_type: '',          // string
  summary: '',              // string
  blocking_points: [],      // string[]
  evidence: null,           // EscalationEvidence
  attempted_actions: [],    // string[]
  recommended_next_steps: [], // string[]
  options: [],              // EscalationOption[]
  recommended_option: '',   // string (optional)
  required_decision: '',    // string
  impact_if_continue: '',   // string (optional)
  impact_if_stop: '',       // string (optional)
  requires_user_decision: true, // boolean
  requires_acknowledgment: true, // boolean
  created_at: '',           // string (ISO 8601)
  created_by: ''            // string
};

/**
 * Escalation evidence schema
 */
const EscalationEvidence = {
  related_artifacts: [],    // string[]
  logs: [],                 // string[]
  failure_history: []       // object[]
};

/**
 * Escalation option schema
 */
const EscalationOption = {
  option_id: '',            // string
  description: '',          // string
  pros: [],                 // string[]
  cons: []                  // string[]
};

/**
 * Escalation response schema
 * @see design.md §3
 */
const EscalationResponse = {
  status: '',               // EscalationResponseStatusEnum
  decision: '',             // string (optional)
  next_action: '',          // string (optional)
  timestamp: ''             // string (ISO 8601)
};

// ==================== Retry Types ====================

/**
 * Retry context schema
 */
const RetryContext = {
  retry_count: 0,           // number
  previous_failure_reason: '', // string
  previous_output_summary: '', // string
  required_fixes: [],       // string[]
  retry_strategy: '',       // RetryStrategyEnum
  backoff_seconds: 0        // number
};

/**
 * Retry decision schema
 */
const RetryDecision = {
  should_retry: false,      // boolean
  reason: '',               // string
  backoff_seconds: 0,       // number
  escalate: false           // boolean
};

/**
 * Retry log schema
 * @see design.md §4
 */
const RetryLog = {
  retry_id: '',             // string
  dispatch_id: '',          // string
  retry_count: 0,           // number
  max_retry: 0,             // number
  previous_failure_reason: '', // string
  previous_output_summary: '', // string
  required_fixes: [],       // string[]
  retry_strategy: '',       // RetryStrategyEnum
  backoff_seconds: 0,       // number
  timestamp: ''             // string (ISO 8601)
};

// ==================== Heartbeat Types ====================

/**
 * Heartbeat payload schema
 * @see design.md §6
 */
const HeartbeatPayload = {
  dispatch_id: '',          // string
  status: '',               // HeartbeatStatusEnum
  progress: null,           // HeartbeatProgress
  timestamp: ''             // string (ISO 8601)
};

/**
 * Heartbeat progress schema
 */
const HeartbeatProgress = {
  phase: '',                // string
  percent_complete: 0,      // number (0-100)
  estimated_remaining_seconds: 0 // number
};

// ==================== Validation Types ====================

/**
 * Validation result schema
 */
const ValidationResult = {
  isValid: false,           // boolean
  errors: []                // ValidationError[]
};

/**
 * Validation error schema
 */
const ValidationError = {
  field: '',                // string
  message: '',              // string
  severity: ''              // 'error' | 'warning'
};

// ==================== Configuration Types ====================

/**
 * OpenClaw adapter configuration schema
 * @see spec.md §7
 */
const OpenClawAdapterConfig = {
  adapter_id: 'openclaw',   // string
  adapter_type: 'orchestrator', // string
  priority: 'later',        // string
  version: '1.0.0',         // string
  
  openclaw_config: {
    api_base_url: '',       // string (env var: OPENCLAW_API_URL)
    authentication: {
      type: 'jwt',          // 'jwt' | 'api_key' | 'oauth'
      token_env_var: 'OPENCLAW_JWT_TOKEN', // string
      refresh_threshold_seconds: 300 // number
    },
    endpoints: {
      result: '/api/v1/results',      // string
      escalation: '/api/v1/escalations', // string
      retry: '/api/v1/retries',       // string
      heartbeat: '/api/v1/heartbeat'  // string
    },
    retry_config: {
      strategy: 'auto',     // RetryStrategyEnum
      max_retry: 2,         // number
      backoff_type: 'exponential', // BackoffTypeEnum
      backoff_initial_seconds: 60 // number
    },
    heartbeat_config: {
      enabled: true,        // boolean
      interval_seconds: 120, // number
      task_length_thresholds: {
        short: 300,         // number (5 min)
        medium: 1800,       // number (30 min)
        long: 3600          // number (60 min)
      }
    },
    timeout_config: {
      connection_timeout_ms: 5000,  // number
      request_timeout_ms: 30000,    // number
      max_wait_for_decision_ms: 300000 // number (5 min)
    }
  }
};

// ==================== Adapter Info Types ====================

/**
 * Adapter info schema
 * @see io-contract.md §8
 */
const AdapterInfo = {
  adapter_id: '',           // string
  adapter_type: '',         // string
  version: '',              // string
  priority: '',             // string
  status: '',               // string
  description: '',          // string
  compatible_profiles: [],  // string[] ('minimal', 'full')
  compatible_workspaces: [] // string[] ('github-pr', 'local-repo')
};

// ==================== Module Exports ====================

module.exports = {
  // Enums
  RoleEnum,
  RiskLevelEnum,
  ExecutionStatusEnum,
  RecommendationEnum,
  EscalationLevelEnum,
  EscalationResponseStatusEnum,
  HeartbeatStatusEnum,
  RetryStrategyEnum,
  BackoffTypeEnum,
  
  // OpenClaw Input Types
  OpenClawDispatchMessage,
  OpenClawProject,
  OpenClawMilestone,
  OpenClawTask,
  OpenClawContext,
  
  // Dispatch Payload Types
  DispatchPayload,
  DispatchContext,
  ArtifactReference,
  
  // Execution Result Types
  ExecutionResult,
  Artifact,
  ChangedFile,
  Issue,
  Risk,
  
  // Escalation Types
  Escalation,
  EscalationEvidence,
  EscalationOption,
  EscalationResponse,
  
  // Retry Types
  RetryContext,
  RetryDecision,
  RetryLog,
  
  // Heartbeat Types
  HeartbeatPayload,
  HeartbeatProgress,
  
  // Validation Types
  ValidationResult,
  ValidationError,
  
  // Configuration Types
  OpenClawAdapterConfig,
  
  // Adapter Info Types
  AdapterInfo,
  
  // Validation helpers
  validRoles: Object.values(RoleEnum),
  validRiskLevels: Object.values(RiskLevelEnum),
  validExecutionStatuses: Object.values(ExecutionStatusEnum),
  validRecommendations: Object.values(RecommendationEnum),
  validEscalationResponses: Object.values(EscalationResponseStatusEnum),
  validHeartbeatStatuses: Object.values(HeartbeatStatusEnum),
  validRetryStrategies: Object.values(RetryStrategyEnum),
  validBackoffTypes: Object.values(BackoffTypeEnum)
};