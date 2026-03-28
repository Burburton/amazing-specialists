/**
 * OrchestratorAdapter Interface
 * 
 * Defines the contract for orchestrator adapters that convert
 * external input formats to standard Dispatch Payload.
 * 
 * Reference: io-contract.md §8
 */

/**
 * Dispatch Payload schema from io-contract.md §1
 */
export interface DispatchPayload {
  dispatch_id: string;
  project_id: string;
  milestone_id: string;
  task_id: string;
  role: 'architect' | 'developer' | 'tester' | 'reviewer' | 'docs' | 'security';
  command: string;
  title: string;
  goal: string;
  description: string;
  context: {
    project_goal?: string;
    milestone_goal?: string;
    task_scope: string;
    related_spec_sections?: string[];
    code_context_summary?: string;
  };
  constraints: string[];
  inputs: Array<{
    artifact_id: string;
    artifact_type: string;
    path: string;
    summary?: string;
  }>;
  expected_outputs: string[];
  verification_steps: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  retry_context?: {
    retry_count: number;
    previous_failure_reason: string;
    previous_output_summary: string;
    required_fixes: string[];
  };
  metadata?: Record<string, any>;
}

/**
 * Execution Status from io-contract.md §2
 */
export type ExecutionStatus = 
  | 'SUCCESS'
  | 'SUCCESS_WITH_WARNINGS'
  | 'PARTIAL'
  | 'BLOCKED'
  | 'FAILED_RETRYABLE'
  | 'FAILED_ESCALATE';

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
}

/**
 * Escalation schema from io-contract.md §4
 */
export interface Escalation {
  escalation_id: string;
  dispatch_id: string;
  project_id: string;
  milestone_id: string;
  task_id: string;
  role: string;
  level: 'INTERNAL' | 'USER';
  reason_type: 
    | 'MISSING_CONTEXT'
    | 'CONFLICTING_CONSTRAINTS'
    | 'HIGH_RISK_CHANGE'
    | 'REPEATED_FAILURE'
    | 'OUT_OF_SCOPE_REQUEST'
    | 'TOOLING_BLOCKER'
    | 'AMBIGUOUS_GOAL'
    | 'UNRESOLVED_TRADEOFF';
  summary: string;
  blocking_points: string[];
  evidence?: {
    related_artifacts?: string[];
    logs?: string[];
    failure_history?: Array<{
      attempt_number: number;
      failure_reason: string;
      timestamp: string;
    }>;
  };
  attempted_actions: string[];
  recommended_next_steps: string[];
  options?: Array<{
    option_id: string;
    description: string;
    pros: string[];
    cons: string[];
  }>;
  recommended_option?: string;
  required_decision?: string;
  impact_if_continue?: string;
  impact_if_stop?: string;
  created_at: string;
  created_by: string;
}

/**
 * Retry Context
 */
export interface RetryContext {
  retry_count: number;
  max_retry: number;
  previous_error: Error;
  previous_output?: any;
}

/**
 * Retry Decision
 */
export type RetryDecision = 'retry' | 'abort' | 'escalate';

/**
 * Escalation Context for generation
 */
export interface EscalationContext {
  dispatch: DispatchPayload;
  reason_type: Escalation['reason_type'];
  blocking_points: string[];
  attempted_actions: string[];
  recommended_next_steps: string[];
}

/**
 * Adapter Info
 */
export interface AdapterInfo {
  adapter_id: string;
  adapter_type: 'orchestrator';
  version: string;
  priority: 'must-have' | 'later' | 'future';
  status: 'implemented' | 'design-only' | 'planned';
  description: string;
  compatible_profiles: string[];
}

/**
 * OrchestratorAdapter Interface
 * 
 * All orchestrator adapters must implement this interface.
 */
export interface OrchestratorAdapter {
  /**
   * Normalize external input to standard Dispatch Payload.
   * 
   * @param externalInput - Input from external system (CLI args, GitHub Issue, etc.)
   * @returns Standardized Dispatch Payload
   */
  normalizeInput(externalInput: any): DispatchPayload;

  /**
   * Validate Dispatch Payload against io-contract.md §1 schema.
   * 
   * @param dispatch - Dispatch Payload to validate
   * @returns Validation result with errors if invalid
   */
  validateDispatch(dispatch: DispatchPayload): ValidationResult;

  /**
   * Route validated Dispatch Payload to execution entry point.
   * 
   * @param dispatch - Validated Dispatch Payload
   */
  routeToExecution(dispatch: DispatchPayload): void;

  /**
   * Map external error to Execution Status.
   * 
   * @param error - Error from external system or validation
   * @returns Execution status for result
   */
  mapError(error: any): ExecutionStatus;

  /**
   * Generate escalation request when execution cannot continue.
   * 
   * @param context - Context for escalation generation
   * @returns Escalation request
   */
  generateEscalation?(context: EscalationContext): Escalation;

  /**
   * Handle retry decision for failed execution.
   * 
   * @param retryContext - Context for retry decision
   * @returns Decision on how to proceed
   */
  handleRetry?(retryContext: RetryContext): RetryDecision;

  /**
   * Get adapter metadata.
   * 
   * @returns Adapter info from registry
   */
  getAdapterInfo(): AdapterInfo;
}

/**
 * OrchestratorAdapterConfig
 */
export interface OrchestratorAdapterConfig {
  adapter_id: string;
  adapter_type: 'orchestrator';
  priority: 'must-have' | 'later';
  status: 'implemented' | 'design-only';
  version: string;
  path: string;
  config_file: string;
  interface: 'OrchestratorAdapter';
  compatible_profiles: string[];
  dispatch_mapping: {
    input_format: string;
    output_format: string;
    mapping_doc: string;
  };
  escalation_mapping: {
    channel: string;
    interactive?: boolean;
    label_trigger?: string;
  };
  retry_config: {
    strategy: 'interactive' | 'auto';
    max_retry: number;
    trigger: string;
  };
}