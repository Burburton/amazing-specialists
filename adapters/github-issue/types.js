/**
 * GitHub Issue Adapter Type Definitions
 * 
 * Type definitions for GitHub Issue Orchestrator Adapter.
 * Reference: docs/adapters/github-issue-adapter-design.md
 */

/**
 * GitHub Issue structure (simplified from GitHub API)
 */
export interface GitHubIssue {
  number: number;
  repository: {
    owner: { login: string };
    name: string;
    full_name: string;
  };
  title: string;
  body: string | null;
  labels: GitHubLabel[];
  milestone: GitHubMilestone | null;
  user: { login: string };
  assignees: Array<{ login: string }>;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  html_url: string;
}

/**
 * GitHub Label structure
 */
export interface GitHubLabel {
  id: number;
  name: string;
  description: string | null;
  color: string;
}

/**
 * GitHub Milestone structure
 */
export interface GitHubMilestone {
  number: number;
  title: string;
  state: 'open' | 'closed';
}

/**
 * GitHub Webhook Event structure
 */
export interface GitHubWebhookEvent {
  event: string;
  action?: string;
  delivery: string;
  payload: any;
  signature: string;
}

/**
 * Label Parse Result
 */
export interface LabelParseResult {
  milestone_id: string | null;
  task_id: string | null;
  role: 'architect' | 'developer' | 'tester' | 'reviewer' | 'docs' | 'security' | null;
  command: string | null;
  risk_level: 'low' | 'medium' | 'high' | 'critical' | null;
  unrecognized_labels: string[];
  warnings: string[];
}

/**
 * Body Parse Result
 */
export interface BodyParseResult {
  goal: string;
  description: string;
  context: {
    task_scope: string;
    project_goal?: string;
    milestone_goal?: string;
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
  missing_sections: string[];
  warnings: string[];
}

/**
 * Issue Parse Result
 */
export interface IssueParseResult {
  success: boolean;
  dispatch_payload?: any; // DispatchPayload from orchestrator-adapter.interface.ts
  errors: ParseError[];
  warnings: string[];
}

/**
 * Parse Error
 */
export interface ParseError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * GitHub API Error
 */
export interface GitHubApiError {
  status: number;
  message: string;
  documentation_url?: string;
  errors?: Array<{
    resource: string;
    code: string;
    field: string;
    message: string;
  }>;
}

/**
 * Rate Limit Info
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

/**
 * Webhook Verification Result
 */
export interface WebhookVerificationResult {
  valid: boolean;
  error?: string;
  event?: string;
  action?: string;
}

/**
 * Comment Template Variables
 */
export interface CommentTemplateVariables {
  [key: string]: string | number | boolean | string[];
}

/**
 * GitHub Client Config
 */
export interface GitHubClientConfig {
  token?: string;
  baseUrl?: string;
  userAgent?: string;
  appId?: string;
  appPrivateKey?: string;
}

/**
 * Retry Decision
 */
export type RetryDecision = 'retry' | 'abort' | 'escalate';

/**
 * Retry Context
 */
export interface RetryContext {
  retry_count: number;
  max_retry: number;
  previous_error: Error;
  previous_output?: any;
  backoff_seconds: number;
}

/**
 * Adapter Config (from github-issue.config.json)
 */
export interface GitHubIssueAdapterConfig {
  adapter_id: string;
  adapter_type: string;
  priority: string;
  version: string;
  github_config: {
    api: {
      base_url: string;
      graphql_url: string;
      api_version: string;
      user_agent: string;
    };
    authentication: {
      primary_method: string;
      fallback_method: string;
      token_env_var: string;
      app_id_env_var: string;
      app_private_key_env_var: string;
    };
    webhook: {
      secret_env_var: string;
      signature_header: string;
      event_header: string;
      delivery_header: string;
    };
    label_mappings: {
      milestone_prefix: string;
      role_prefix: string;
      command_prefix: string;
      task_prefix: string;
      risk_prefix: string;
      escalation_prefix: string;
      status_prefix: string;
    };
    default_values: {
      role: string;
      command: string;
      risk_level: string;
    };
    retry_config: {
      strategy: string;
      max_retry: number;
      backoff_seconds: number;
      comment_on_retry: boolean;
      no_retry_for_risk: string[];
    };
    rate_limit: {
      enabled: boolean;
      warning_threshold: number;
      backoff_multiplier: number;
      max_backoff_seconds: number;
    };
    events: {
      process: string[];
      ignore: string[];
    };
  };
  dispatch_config: {
    dispatch_id_format: string;
    project_id_format: string;
  };
  validation: {
    require_role_label: boolean;
    require_milestone: boolean;
    require_task_id: boolean;
    strict_body_parsing: boolean;
  };
}