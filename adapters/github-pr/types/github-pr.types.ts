/**
 * GitHub PR Workspace Adapter Type Definitions
 * 
 * TypeScript type definitions for GitHub PR Workspace Adapter.
 * Implements WorkspaceAdapter interface per io-contract.md §8.
 * 
 * @module github-pr-types
 * @see io-contract.md §8
 */

// ==================== Core Types ====================

/**
 * Execution Status enum
 * @see io-contract.md §2
 */
export type ExecutionStatus =
  | 'SUCCESS'
  | 'SUCCESS_WITH_WARNINGS'
  | 'PARTIAL'
  | 'BLOCKED'
  | 'FAILED_RETRYABLE'
  | 'FAILED_ESCALATE';

/**
 * Recommendation enum
 * @see io-contract.md §2
 */
export type Recommendation =
  | 'CONTINUE'
  | 'SEND_TO_TEST'
  | 'SEND_TO_REVIEW'
  | 'REWORK'
  | 'REPLAN'
  | 'ESCALATE';

/**
 * Change type enum
 * @see io-contract.md §2
 */
export type ChangeType = 'added' | 'modified' | 'deleted' | 'renamed';

/**
 * Artifact format enum
 * @see io-contract.md §3
 */
export type ArtifactFormat = 'markdown' | 'yaml' | 'json' | 'code' | 'txt';

/**
 * Artifact type enum
 * @see io-contract.md §3
 */
export type ArtifactType =
  | 'design_note'
  | 'implementation_summary'
  | 'code_diff_summary'
  | 'test_report'
  | 'review_report'
  | 'doc_update_report'
  | 'docs_sync_report'
  | 'changelog_entry'
  | 'security_report'
  | 'performance_report';

// ==================== Execution Result Types ====================

/**
 * Artifact object
 * @see io-contract.md §3
 */
export interface Artifact {
  artifact_id: string;
  artifact_type: ArtifactType;
  title: string;
  path: string;
  format: ArtifactFormat;
  summary: string;
  created_by_role: string;
  related_task_id: string;
  created_at: string;
  metadata?: {
    word_count?: number;
    related_artifacts?: string[];
    version?: string;
    content?: string;
  };
}

/**
 * Changed file object
 * @see io-contract.md §2
 */
export interface ChangedFile {
  path: string;
  change_type: ChangeType;
  diff_summary: string;
  content?: string;
  old_path?: string; // For renamed files
}

/**
 * Issue found in execution
 * @see io-contract.md §2
 */
export interface IssueFound {
  issue_id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

/**
 * Risk assessment
 * @see io-contract.md §2
 */
export interface Risk {
  risk_id: string;
  level: 'high' | 'medium' | 'low';
  description: string;
  mitigation: string;
}

/**
 * Execution Result
 * @see io-contract.md §2
 */
export interface ExecutionResult {
  dispatch_id: string;
  project_id: string;
  milestone_id: string;
  task_id: string;
  role: string;
  command: string;
  status: ExecutionStatus;
  summary: string;
  artifacts: Artifact[];
  changed_files: ChangedFile[];
  checks_performed: string[];
  issues_found: IssueFound[];
  risks: Risk[];
  recommendation: Recommendation;
  needs_followup: boolean;
  followup_suggestions?: string[];
  escalation?: Escalation;
  created_at: string;
  metadata?: {
    execution_time_ms?: number;
    model_version?: string;
  };
}

// ==================== Escalation Types ====================

/**
 * Escalation reason type
 * @see io-contract.md §4
 */
export type EscalationReasonType =
  | 'MISSING_CONTEXT'
  | 'CONFLICTING_CONSTRAINTS'
  | 'HIGH_RISK_CHANGE'
  | 'REPEATED_FAILURE'
  | 'OUT_OF_SCOPE_REQUEST'
  | 'TOOLING_BLOCKER'
  | 'AMBIGUOUS_GOAL'
  | 'UNRESOLVED_TRADEOFF';

/**
 * Escalation level
 * @see io-contract.md §4
 */
export type EscalationLevel = 'INTERNAL' | 'USER';

/**
 * Escalation option
 */
export interface EscalationOption {
  option_id: string;
  description: string;
  pros: string[];
  cons: string[];
}

/**
 * Failure history entry
 */
export interface FailureHistory {
  attempt_number: number;
  failure_reason: string;
  timestamp: string;
}

/**
 * Escalation evidence
 */
export interface EscalationEvidence {
  related_artifacts: string[];
  logs: string[];
  failure_history: FailureHistory[];
}

/**
 * Escalation object
 * @see io-contract.md §4
 */
export interface Escalation {
  escalation_id: string;
  dispatch_id: string;
  project_id: string;
  milestone_id: string;
  task_id: string;
  role: string;
  level: EscalationLevel;
  reason_type: EscalationReasonType;
  summary: string;
  blocking_points: string[];
  evidence: EscalationEvidence;
  attempted_actions: string[];
  recommended_next_steps: string[];
  options?: EscalationOption[];
  recommended_option?: string;
  required_decision?: string;
  impact_if_continue?: string;
  impact_if_stop?: string;
  requires_user_decision: boolean;
  created_at: string;
  created_by: string;
}

// ==================== GitHub PR Specific Types ====================

/**
 * PR Review status
 */
export type ReviewEvent = 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT' | 'PENDING';

/**
 * PR result
 */
export interface PRResult {
  pr_number: number;
  pr_url: string;
  branch_name: string;
  status: 'created' | 'updated';
  base_branch: string;
}

/**
 * Branch result
 */
export interface BranchResult {
  branch_name: string;
  base_branch: string;
  created: boolean;
  head_sha: string;
}

/**
 * Commit result
 */
export interface CommitResult {
  commit_sha: string;
  files_changed: number;
  additions: number;
  deletions: number;
}

/**
 * Review comment
 */
export interface ReviewComment {
  body: string;
  path?: string;
  line?: number;
  start_line?: number;
  side?: 'LEFT' | 'RIGHT';
  comment_type: 'general' | 'file' | 'line';
}

/**
 * Review status
 */
export interface ReviewStatus {
  event: ReviewEvent;
  body?: string;
  commit_id?: string;
}

/**
 * File operation result
 */
export interface FileOperationResult {
  path: string;
  operation: 'created' | 'updated' | 'deleted';
  success: boolean;
  error?: string;
}

// ==================== Validation Types ====================

/**
 * Validation result
 * @see io-contract.md §8
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error';
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
}

/**
 * Path validation result
 * @see io-contract.md §8 BR-006
 */
export interface PathValidationResult {
  path: string;
  exists: boolean;
  writable: boolean;
  conflict: boolean;
  profileMatch: boolean;
  errors: string[];
  suggestions?: string[];
}

// ==================== Retry Types ====================

/**
 * Retry context
 */
export interface RetryContext {
  retry_count: number;
  max_retry: number;
  previous_failure_reason: string;
  previous_output_summary: string;
  required_fixes: string[];
  error_type: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Retry decision
 */
export interface RetryDecision {
  should_retry: boolean;
  reason: string;
  backoff_seconds?: number;
  escalation_needed: boolean;
}

// ==================== Output Types ====================

/**
 * Artifact output result
 */
export interface ArtifactOutputResult {
  success: boolean;
  artifacts_written: string[];
  errors: string[];
  warnings: string[];
}

/**
 * Changed files result
 */
export interface ChangedFilesResult {
  success: boolean;
  files_changed: string[];
  commit_sha?: string;
  errors: string[];
  warnings: string[];
}

/**
 * Escalation result
 */
export interface EscalationResult {
  success: boolean;
  comment_id?: number;
  review_id?: number;
  error?: string;
}

/**
 * Workspace output result
 */
export interface WorkspaceOutputResult {
  success: boolean;
  artifacts_written: string[];
  files_changed: string[];
  console_output: boolean;
  errors: string[];
  warnings: string[];
  pr_number?: number;
  pr_url?: string;
  commit_sha?: string;
}

// ==================== Adapter Info Types ====================

/**
 * Adapter info
 * @see io-contract.md §8
 */
export interface WorkspaceAdapterInfo {
  adapter_id: string;
  adapter_type: 'workspace';
  version: string;
  priority: 'must-have' | 'later' | 'future';
  status: 'implemented' | 'design-only' | 'planned';
  description: string;
  compatible_profiles: string[];
  workspace_type: 'github_repo';
}

// ==================== Rate Limit Types ====================

/**
 * Rate limit info
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

// ==================== Configuration Types ====================

/**
 * GitHub PR adapter configuration
 */
export interface GitHubPRConfig {
  adapter_id: string;
  adapter_type: 'workspace';
  workspace_type: 'github_repo';
  priority: 'later';
  version: string;
  profile: 'minimal' | 'full';
  output_config: OutputConfig;
  escalation_config: EscalationConfig;
  retry_config: RetryConfig;
  github_pr_config: GitHubPRSpecificConfig;
  validation_config: ValidationConfig;
  version_config: VersionConfig;
  metadata: ConfigMetadata;
}

/**
 * Output configuration
 */
export interface OutputConfig {
  artifact_path: string;
  changed_files_path: string;
  console_output: boolean;
  commit_strategy: 'single' | 'per-file' | 'per-artifact';
}

/**
 * Escalation configuration
 */
export interface EscalationConfig {
  channel: 'github_comment';
  requires_acknowledgment: boolean;
  review_status_on_escalation: ReviewEvent;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  strategy: 'interactive' | 'auto' | 'disabled' | 'configurable';
  max_retry: number;
  trigger: 'user_decision' | 'auto' | 'bot';
  retry_labels?: {
    approved: string;
    aborted: string;
  };
}

/**
 * GitHub PR specific configuration
 */
export interface GitHubPRSpecificConfig {
  api: APIConfig;
  authentication: AuthenticationConfig;
  branch_config: BranchConfig;
  pr_config: PRConfig;
  review_config: ReviewConfig;
  labels: LabelConfig;
  rate_limit: RateLimitConfig;
  validation: PathValidationConfig;
}

/**
 * API configuration
 */
export interface APIConfig {
  base_url: string;
  api_version: string;
  user_agent: string;
}

/**
 * Authentication configuration
 */
export interface AuthenticationConfig {
  primary_method: 'github_app' | 'pat';
  fallback_method: 'pat' | 'github_app';
  token_env_var: string;
  app_id_env_var: string;
  app_private_key_env_var: string;
}

/**
 * Branch configuration
 */
export interface BranchConfig {
  default_base_branch: string;
  branch_prefix: string;
  branch_name_format: string;
}

/**
 * PR configuration
 */
export interface PRConfig {
  title_format: Record<string, string>;
  default_body_template: string;
  draft_by_default: boolean;
}

/**
 * Review configuration
 */
export interface ReviewConfig {
  status_mapping: Record<ExecutionStatus, ReviewEvent>;
  auto_approve_on_success: boolean;
  request_changes_on_failure: boolean;
}

/**
 * Label configuration
 */
export interface LabelConfig {
  success: string;
  warning: string;
  partial: string;
  failed: string;
  escalation: string;
  retry_approved: string;
  retry_aborted: string;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  enabled: boolean;
  warning_threshold: number;
  backoff_multiplier: number;
  max_backoff_seconds: number;
}

/**
 * Path validation configuration
 */
export interface PathValidationConfig {
  path_blocklist: string[];
  max_file_size_bytes: number;
  validate_paths: boolean;
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  validate_paths: boolean;
  validate_contract: boolean;
  contract_schema_path: string;
}

/**
 * Version configuration
 */
export interface VersionConfig {
  check_compatibility: boolean;
  compatibility_matrix_path: string;
  package_version: string;
}

/**
 * Configuration metadata
 */
export interface ConfigMetadata {
  created_at: string;
  created_by: string;
  description: string;
}