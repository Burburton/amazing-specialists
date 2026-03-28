/**
 * WorkspaceAdapter Interface
 * 
 * Defines the contract for workspace adapters that handle
 * Execution Result output to target workspaces.
 * 
 * Reference: io-contract.md §8
 */

import { ExecutionStatus, ValidationResult, Escalation, RetryContext, RetryDecision } from './orchestrator-adapter.interface';

/**
 * Execution Result schema from io-contract.md §2
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
  issues_found: Issue[];
  risks: Risk[];
  recommendation: 
    | 'CONTINUE'
    | 'SEND_TO_TEST'
    | 'SEND_TO_REVIEW'
    | 'REWORK'
    | 'REPLAN'
    | 'ESCALATE';
  needs_followup: boolean;
  followup_suggestions?: string[];
  escalation?: Escalation;
  created_at: string;
  metadata?: Record<string, any>;
}

/**
 * Artifact schema from io-contract.md §3
 */
export interface Artifact {
  artifact_id: string;
  artifact_type: 
    | 'design_note'
    | 'implementation_summary'
    | 'test_report'
    | 'review_report'
    | 'docs_sync_report'
    | 'changelog_entry'
    | 'security_report';
  title: string;
  path: string;
  format: 'markdown' | 'yaml' | 'json' | 'code' | 'txt';
  summary: string;
  created_by_role: string;
  related_task_id: string;
  created_at: string;
  metadata?: {
    word_count?: number;
    related_artifacts?: string[];
    version?: string;
  };
  content?: string; // Optional content for direct output
}

/**
 * Changed File
 */
export interface ChangedFile {
  path: string;
  change_type: 'added' | 'modified' | 'deleted' | 'renamed';
  diff_summary?: string;
  content?: string; // Optional content for direct output
}

/**
 * Issue
 */
export interface Issue {
  issue_id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation?: string;
}

/**
 * Risk
 */
export interface Risk {
  risk_id: string;
  level: 'high' | 'medium' | 'low';
  description: string;
  mitigation?: string;
}

/**
 * Path Validation Result (BR-006)
 */
export interface PathValidationResult {
  path: string;
  exists: boolean;
  writable: boolean;
  conflict: boolean;
  profileMatch: boolean;
  errors: string[];
}

/**
 * Workspace Output Result
 */
export interface WorkspaceOutputResult {
  success: boolean;
  artifacts_written: string[];
  files_changed: string[];
  console_output: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Adapter Info for Workspace
 */
export interface WorkspaceAdapterInfo {
  adapter_id: string;
  adapter_type: 'workspace';
  version: string;
  priority: 'must-have' | 'later' | 'future';
  status: 'implemented' | 'design-only' | 'planned';
  description: string;
  compatible_profiles: string[];
  workspace_type: 'local_repo' | 'github_repo' | 'external_system';
}

/**
 * WorkspaceAdapter Interface
 * 
 * All workspace adapters must implement this interface.
 */
export interface WorkspaceAdapter {
  /**
   * Handle artifacts output from Execution Result.
   * 
   * Writes artifacts to target workspace based on workspace_type.
   * 
   * @param result - Execution Result containing artifacts
   */
  handleArtifacts(result: ExecutionResult): void;

  /**
   * Handle changed files from Execution Result.
   * 
   * Performs file operations (create/update/delete) in target workspace.
   * 
   * @param result - Execution Result containing changed_files
   */
  handleChangedFiles(result: ExecutionResult): void;

  /**
   * Handle escalation output to target channel.
   * 
   * Outputs escalation information to appropriate channel
   * (console, GitHub comment, API).
   * 
   * @param escalation - Escalation to output
   */
  handleEscalation(escalation: Escalation): void;

  /**
   * Validate artifact output against io-contract.md §3 schema.
   * 
   * @param artifacts - Artifacts to validate
   * @returns Validation result with errors if invalid
   */
  validateArtifactOutput(artifacts: Artifact[]): ValidationResult;

  /**
   * Validate output paths per BR-006 rules.
   * 
   * @param paths - Paths to validate
   * @returns Path validation results
   */
  validatePaths?(paths: string[]): PathValidationResult[];

  /**
   * Handle retry decision for failed output.
   * 
   * @param retryContext - Context for retry decision
   * @returns Decision on how to proceed
   */
  handleRetry?(retryContext: RetryContext): RetryDecision;

  /**
   * Sync execution state to workspace status.
   * 
   * Updates workspace state based on execution result.
   * 
   * @param result - Execution Result to sync
   */
  syncState?(result: ExecutionResult): void;

  /**
   * Get workspace output summary.
   * 
   * @returns Summary of output operations performed
   */
  getOutputSummary?(): WorkspaceOutputResult;

  /**
   * Get adapter metadata.
   * 
   * @returns Adapter info from registry
   */
  getAdapterInfo(): WorkspaceAdapterInfo;
}

/**
 * WorkspaceAdapterConfig
 */
export interface WorkspaceAdapterConfig {
  adapter_id: string;
  adapter_type: 'workspace';
  priority: 'must-have' | 'later';
  status: 'implemented' | 'design-only';
  version: string;
  path: string;
  config_file: string;
  interface: 'WorkspaceAdapter';
  compatible_profiles: string[];
  workspace_type: 'local_repo' | 'github_repo' | 'external_system';
  artifact_mapping: {
    input_format: string;
    output_format: string;
    mapping_doc: string;
  };
  escalation_mapping: {
    channel: string;
    interactive?: boolean;
    review_status?: boolean;
  };
  retry_config: {
    strategy: 'interactive' | 'auto' | 'disabled';
    max_retry: number;
    trigger: string;
  };
  validation_rules?: {
    path_exists: boolean;
    no_conflict: boolean;
    profile_match: boolean;
  };
}