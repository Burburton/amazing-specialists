/**
 * dispatch-normalizer.js
 * 
 * Converts parsed CLI arguments into a standard Dispatch Payload
 * conforming to io-contract.md §1 schema.
 * 
 * Reference: io-contract.md §1, ADAPTERS.md §CLI/Local
 */

'use strict';

/**
 * Normalize parsed CLI arguments into a Dispatch Payload.
 * 
 * @param {ParsedArgs} parsedArgs - Arguments parsed by arg-parser.js
 * @returns {DispatchPayload} Standardized Dispatch Payload
 * 
 * @example
 * const { parseArgs } = require('./arg-parser');
 * const { normalize } = require('./dispatch-normalizer');
 * const parsed = parseArgs(process.argv.slice(2));
 * const dispatch = normalize(parsed);
 */
function normalize(parsedArgs) {
  const now = new Date().toISOString();
  
  const dispatch = {
    dispatch_id: parsedArgs.dispatch_id,
    project_id: parsedArgs.project_id,
    milestone_id: parsedArgs.milestone_id,
    task_id: parsedArgs.task_id,
    role: parsedArgs.role,
    command: parsedArgs.command,
    title: parsedArgs.title || '',
    goal: parsedArgs.goal || parsedArgs.title || '',
    description: buildDescription(parsedArgs),
    
    context: buildContext(parsedArgs),
    constraints: parsedArgs.constraints.length > 0 
      ? parsedArgs.constraints 
      : ['No special constraints'],
    
    inputs: buildInputs(parsedArgs),
    expected_outputs: buildExpectedOutputs(parsedArgs),
    verification_steps: buildVerificationSteps(parsedArgs),
    
    risk_level: parsedArgs.risk_level,
    
    metadata: {
      source: 'cli-local-adapter',
      created_at: now,
      created_by: 'cli-user'
    }
  };
  
  return dispatch;
}

/**
 * Build description from parsed arguments.
 * Combines title and goal into a comprehensive description.
 * 
 * @param {ParsedArgs} parsedArgs - Parsed arguments
 * @returns {string} Description string
 */
function buildDescription(parsedArgs) {
  const parts = [];
  
  if (parsedArgs.title) {
    parts.push(`Task: ${parsedArgs.title}`);
  }
  
  if (parsedArgs.goal) {
    parts.push(`Goal: ${parsedArgs.goal}`);
  }
  
  if (parsedArgs.context.task_scope) {
    parts.push(`Scope: ${parsedArgs.context.task_scope}`);
  }
  
  return parts.join('\n') || 'No description provided';
}

/**
 * Build context object conforming to io-contract.md §1.
 * Ensures task_scope is always present (required field).
 * 
 * @param {ParsedArgs} parsedArgs - Parsed arguments
 * @returns {Object} Context object
 */
function buildContext(parsedArgs) {
  const context = parsedArgs.context || {};
  
  return {
    project_goal: context.project_goal || '',
    milestone_goal: context.milestone_goal || '',
    task_scope: context.task_scope || parsedArgs.goal || parsedArgs.title || 'Unknown task scope',
    related_spec_sections: context.related_spec_sections || [],
    code_context_summary: context.code_context_summary || ''
  };
}

/**
 * Build inputs array.
 * Creates default input if none provided.
 * 
 * @param {ParsedArgs} parsedArgs - Parsed arguments
 * @returns {Array} Inputs array
 */
function buildInputs(parsedArgs) {
  if (parsedArgs.context.inputs && parsedArgs.context.inputs.length > 0) {
    return parsedArgs.context.inputs.map(input => ({
      artifact_id: input.artifact_id || `input-${Date.now()}`,
      artifact_type: input.artifact_type || 'spec',
      path: input.path || '',
      summary: input.summary || ''
    }));
  }
  
  return [{
    artifact_id: `cli-input-${parsedArgs.dispatch_id}`,
    artifact_type: 'spec',
    path: 'cli-arguments',
    summary: `CLI command input: ${parsedArgs.command} for role ${parsedArgs.role}`
  }];
}

/**
 * Build expected outputs based on role and command.
 * Provides role-specific default outputs.
 * 
 * @param {ParsedArgs} parsedArgs - Parsed arguments
 * @returns {string[]} Expected outputs array
 */
function buildExpectedOutputs(parsedArgs) {
  const roleDefaults = {
    architect: ['design_note', 'module_boundaries'],
    developer: ['implementation_summary', 'code_changes'],
    tester: ['test_report', 'verification_results'],
    reviewer: ['review_report', 'actionable_feedback'],
    docs: ['docs_sync_report', 'changelog_entry'],
    security: ['security_report', 'risk_assessment']
  };
  
  if (parsedArgs.context.expected_outputs && parsedArgs.context.expected_outputs.length > 0) {
    return parsedArgs.context.expected_outputs;
  }
  
  return roleDefaults[parsedArgs.role] || ['execution_result'];
}

/**
 * Build verification steps based on role and command.
 * Provides role-specific default verification steps.
 * 
 * @param {ParsedArgs} parsedArgs - Parsed arguments
 * @returns {string[]} Verification steps array
 */
function buildVerificationSteps(parsedArgs) {
  const roleDefaults = {
    architect: ['design_review', 'boundary_check'],
    developer: ['build', 'unit_test', 'self_check'],
    tester: ['test_run', 'coverage_check', 'edge_case_verification'],
    reviewer: ['spec_comparison', 'code_quality_check'],
    docs: ['doc_consistency_check', 'changelog_validation'],
    security: ['auth_check', 'input_validation_review']
  };
  
  if (parsedArgs.context.verification_steps && parsedArgs.context.verification_steps.length > 0) {
    return parsedArgs.context.verification_steps;
  }
  
  return roleDefaults[parsedArgs.role] || ['execution_validation'];
}

/**
 * Build retry context if present in parsed args.
 * 
 * @param {ParsedArgs} parsedArgs - Parsed arguments
 * @returns {Object|null} Retry context or null
 */
function buildRetryContext(parsedArgs) {
  if (!parsedArgs.context.retry_context) {
    return undefined;
  }
  
  return {
    retry_count: parsedArgs.context.retry_context.retry_count || 0,
    previous_failure_reason: parsedArgs.context.retry_context.previous_failure_reason || '',
    previous_output_summary: parsedArgs.context.retry_context.previous_output_summary || '',
    required_fixes: parsedArgs.context.retry_context.required_fixes || []
  };
}

module.exports = {
  normalize,
  buildDescription,
  buildContext,
  buildInputs,
  buildExpectedOutputs,
  buildVerificationSteps,
  buildRetryContext
};