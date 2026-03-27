# Upstream Consumption Guide

## Document Status
- **Feature ID**: `008-security-core`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-27
- **Purpose**: Define how security consumes outputs from developer, tester, and feature context

---

## 1. Purpose

This document defines the upstream interface for the security role, specifying:
- What artifacts security consumes from developer (004-developer-core)
- What artifacts security consumes from tester (005-tester-core)
- What context security consumes from feature specifications
- Field-by-field consumption guidance
- High-risk task identification heuristics

---

## 2. Upstream Artifact Overview

### 2.1 Artifact Sources

| Source Role | Feature ID | Primary Artifacts |
|-------------|------------|-------------------|
| developer | 004-developer-core | implementation-summary, self-check-report, changed-files |
| tester | 005-tester-core | verification-report |
| feature context | N/A | spec.md, task-risk-level |

### 2.2 Consumption Priority

```
1. changed_files (Critical) - Must have before any review
2. implementation-summary (Critical) - Must have before any review
3. task-risk-level (Critical) - Must check to determine review necessity
4. spec.md (High) - Should have for context
5. self-check-report (Medium) - Useful for understanding known issues
6. verification-report (Medium) - Useful for understanding test coverage
```

---

## 3. Developer Artifact Consumption

### 3.1 implementation-summary (AC-001-dev)

**Source**: `specs/004-developer-core/contracts/implementation-summary-contract.md`

**Purpose**: Understand what was implemented, what changed, and what risks exist.

#### Critical Fields for Security

| Field | Path | Security Use |
|-------|------|--------------|
| `goal_alignment` | Root level | Verify implementation claims against security expectations |
| `changed_files` | Root level | **Primary input** - establishes review surface |
| `implementation.approach` | Root level | Understand implementation strategy for security patterns |
| `known_issues` | Root level | Distinguish known issues from new findings |
| `risks` | Root level | Prioritize high-risk areas |
| `recommendation` | Root level | Understand developer confidence |

#### Field-by-Field Consumption Guide

##### `changed_files` (Required)

```yaml
# How security consumes this field:
security_consumption:
  purpose: "Establish the security review surface"
  
  analysis_steps:
    - step: "Identify security-relevant files"
      patterns:
        - "**/auth*"
        - "**/login*"
        - "**/permission*"
        - "**/role*"
        - "**/session*"
        - "**/token*"
        - "**/password*"
        - "**/credential*"
        - "**/input*"
        - "**/validation*"
        - "**/sanitize*"
        - "**/query*"
        - "**/upload*"
        - "**/api/**/*"
    
    - step: "Determine review skill"
      mapping:
        auth_permission_patterns: "auth-and-permission-review"
        input_validation_patterns: "input-validation-review"
        both_patterns: "Both skills (may produce combined report)"
    
    - step: "Establish review scope"
      output: "scope.components_reviewed in security-review-report"
  
  example:
    input:
      changed_files:
        - path: "src/services/AuthService.ts"
          change_type: "added"
          description: "Core authentication service"
        - path: "src/controllers/AuthController.ts"
          change_type: "added"
          description: "HTTP endpoints for auth"
    
    security_analysis:
      security_relevant_files: ["AuthService.ts", "AuthController.ts"]
      recommended_skill: "auth-and-permission-review"
      scope: "Authentication service and endpoints"
```

##### `goal_alignment` (Required)

```yaml
# How security consumes this field:
security_consumption:
  purpose: "Verify security claims match implementation claims"
  
  analysis_steps:
    - step: "Compare goal with security-relevant features"
      questions:
        - "Does goal mention authentication/authorization?"
        - "Does goal mention input handling?"
        - "Does goal mention sensitive data?"
    
    - step: "Check alignment status"
      mapping:
        achieved: true: "Proceed with standard review"
        achieved: partial: "Focus review on claimed achievements"
        achieved: false: "Consider blocking until implementation complete"
  
  example:
    input:
      goal_alignment:
        goal: "Implement user authentication with JWT"
        achieved: true
    
    security_analysis:
      security_relevant: true
      focus_areas: ["JWT implementation", "Authentication flow"]
```

##### `known_issues` (Required)

```yaml
# How security consumes this field:
security_consumption:
  purpose: "Distinguish known issues from new security findings"
  
  analysis_steps:
    - step: "Review known issues for security relevance"
      filter: "severity == 'high' OR security-related keywords"
    
    - step: "Document in security report"
      field: "scope.known_issues_acknowledged"
    
    - step: "Check if known issues have security implications"
      action: "If security-related, include in findings with reference"
  
  example:
    input:
      known_issues:
        - issue_id: "ISSUE-001"
          description: "Token expiry handling needs improvement"
          severity: "medium"
    
    security_analysis:
      security_relevant: true
      action: "Include in findings as SEC-XXX (references ISSUE-001)"
```

##### `risks` (Required)

```yaml
# How security consumes this field:
security_consumption:
  purpose: "Prioritize high-risk areas for security review"
  
  analysis_steps:
    - step: "Review risks for security implications"
      filter: "level == 'high' OR security-related"
    
    - step: "Prioritize review areas"
      mapping:
        authentication_related: "High priority for auth-and-permission-review"
        input_handling_related: "High priority for input-validation-review"
    
    - step: "Verify developer-identified risks"
      action: "Confirm or expand risk assessment in security report"
```

### 3.2 self-check-report (AC-002-dev)

**Source**: `specs/004-developer-core/contracts/self-check-report-contract.md`

**Purpose**: Understand developer's own security assessment.

#### Critical Fields for Security

| Field | Path | Security Use |
|-------|------|--------------|
| `check_results` | Root level | Review security-related checks |
| `blockers` | Root level | Understand blocking issues |
| `overall_status` | Root level | Gauge developer confidence |

#### Field-by-Field Consumption Guide

```yaml
# How security consumes self-check-report:
security_consumption:
  purpose: "Understand developer security awareness, not substitute for security review"
  
  key_check_categories:
    - category: "Security"
      checks_to_review:
        - "Input validation present"
        - "No sensitive data leak"
        - "No injection risks"
    
    - category: "Constraint Compliance"
      security_relevant_checks:
        - "Security constraints met"
  
  important_notes:
    - "Self-check does NOT substitute security review"
    - "Security must perform independent review"
    - "Acknowledge self-check findings but verify independently"
    - "Do not rely on self-check pass/fail for security gate"
  
  example:
    input:
      check_results:
        - category: "Security"
          checks:
            - item: "Input validation present"
              status: "pass"
              severity: "blocker"
            - item: "No injection risks"
              status: "pass"
    
    security_consumption:
      acknowledgment: "Developer claims security checks pass"
      action: "Verify independently through security review"
      note: "Do not assume pass means secure"
```

### 3.3 changed-files (Direct)

When `changed_files` is provided directly (not in implementation-summary):

```yaml
# Direct consumption of changed files list:
security_consumption:
  purpose: "Identify security-relevant code"
  
  analysis_steps:
    - step: "Map file paths to security categories"
      categories:
        authentication: ["**/auth*", "**/login*", "**/session*", "**/token*"]
        authorization: ["**/permission*", "**/role*", "**/access*"]
        input_handling: ["**/input*", "**/validation*", "**/sanitize*", "**/query*"]
        api: ["**/api/**/*", "**/controller*", "**/handler*"]
        data_access: ["**/repository*", "**/dao*", "**/model*"]
    
    - step: "Determine review scope"
      output: "List of security-relevant files by category"
```

---

## 4. Tester Artifact Consumption

### 4.1 verification-report (AC-002-test)

**Source**: `specs/005-tester-core/contracts/verification-report-contract.md`

**Purpose**: Understand test coverage for security-relevant code paths.

#### Critical Fields for Security

| Field | Path | Security Use |
|-------|------|--------------|
| `coverage_gaps` | Root level | Identify untested security paths |
| `edge_cases_checked` | Root level | Verify security boundary testing |
| `confidence_level` | Root level | Understand testing confidence |

#### Field-by-Field Consumption Guide

```yaml
# How security consumes verification-report:
security_consumption:
  purpose: "Understand testing coverage for security analysis"
  
  key_fields:
    coverage_gaps:
      purpose: "Identify untested security paths"
      security_focus:
        - "Authentication failure paths"
        - "Authorization denial paths"
        - "Invalid input handling"
        - "Error conditions"
      
      action: "If coverage gaps in security paths, note in security report"
    
    edge_cases_checked:
      purpose: "Verify security boundary testing"
      security_focus:
        - "Boundary: Invalid credentials"
        - "Boundary: Missing permissions"
        - "Boundary: Malformed input"
        - "Boundary: SQL injection attempts"
        - "Boundary: XSS payloads"
      
      action: "If security boundaries not tested, flag as finding"
    
    confidence_level:
      purpose: "Understand testing confidence"
      mapping:
        FULL: "Testing complete, security review can proceed normally"
        PARTIAL: "Some areas untested, security review should focus there"
        LOW: "Testing incomplete, security review may need to recommend tests"
  
  important_notes:
    - "Verification report informs security review scope"
    - "Untested security paths are higher risk"
    - "Do not rely on tester for security validation"
  
  example:
    input:
      coverage_gaps:
        - gap_id: "GAP-001"
          description: "Token refresh flow not tested"
          affected_component: "AuthService.refreshToken"
    
      edge_cases_checked:
        - edge_id: "EDGE-001"
          description: "Empty username"
          category: "invalid_input"
          test_result: "pass"
    
    security_consumption:
      untested_areas: ["Token refresh flow"]
      tested_boundaries: ["Empty username", "Empty password"]
      action: "Focus security review on token refresh; verify input boundary coverage"
```

---

## 5. Feature Context Consumption

### 5.1 spec.md

**Purpose**: Understand expected behavior and security requirements.

#### Consumption Guide

```yaml
# How security consumes spec.md:
security_consumption:
  purpose: "Understand security requirements and expected behavior"
  
  sections_to_review:
    - section: "Security Requirements"
      action: "Extract explicit security requirements"
    
    - section: "Authentication/Authorization"
      action: "Understand expected auth flows"
    
    - section: "Input Handling"
      action: "Understand expected input validation"
    
    - section: "Data Sensitivity"
      action: "Identify PII/sensitive data handling requirements"
    
    - section: "Constraints"
      action: "Extract security constraints"
  
  extraction_template:
    security_requirements: []
    auth_flows: []
    input_sources: []
    sensitive_data: []
    security_constraints: []
```

### 5.2 task-risk-level

**Purpose**: Determine if security review is mandatory (BR-008).

#### Risk Level Determination

| Risk Level | Security Action | Example |
|------------|-----------------|---------|
| `critical` | **Mandatory** security review, block until complete | Authentication bypass fix |
| `high` | **Mandatory** security review, parallel with reviewer | New authentication feature |
| `medium` | Recommended security review | New API endpoint |
| `low` | Optional security review | Documentation update |

#### High-Risk Task Identification (BR-008)

A task is considered high-risk when:

```yaml
high_risk_indicators:
  explicit_markers:
    - risk_level: "critical"
    - risk_level: "high"
    - tags: ["security", "auth", "authentication", "authorization"]
  
  implicit_indicators:
    - changed_files_match: "**/auth*"
    - changed_files_match: "**/login*"
    - changed_files_match: "**/permission*"
    - changed_files_match: "**/session*"
    - changed_files_match: "**/token*"
    - changed_files_match: "**/password*"
    - changed_files_match: "**/credential*"
    - changed_files_match: "**/input*"
    - changed_files_match: "**/validation*"
    - changed_files_match: "**/api/**/*"
  
  goal_keywords:
    - "authentication"
    - "authorization"
    - "login"
    - "password"
    - "token"
    - "session"
    - "permission"
    - "access control"
    - "input validation"
    - "injection"
    - "XSS"
```

---

## 6. Missing Data Handling

When required upstream data is missing:

| Missing Artifact | Action | Impact |
|------------------|--------|--------|
| `changed_files` | **Block** - Cannot establish review surface | Cannot proceed |
| `implementation-summary` | **Block** - No context for review | Cannot proceed |
| `task-risk-level` | Assume `medium`, proceed with caution | May miss mandatory review |
| `self-check-report` | Proceed, note in report | Less context on known issues |
| `verification-report` | Proceed, assume untested | May recommend testing |
| `spec.md` | Proceed, rely on code analysis only | May miss requirements |

---

## 7. Consumption Workflow

### 7.1 Standard Consumption Flow

```
1. Receive dispatch with task context
   ↓
2. Check task-risk-level
   - If critical/high: Mandatory security review
   - If medium: Recommended review
   - If low: Optional review
   ↓
3. Read implementation-summary
   - Extract changed_files
   - Understand goal_alignment
   - Review known_issues and risks
   ↓
4. Analyze changed_files
   - Identify security-relevant files
   - Determine review skill (auth-and-permission vs input-validation)
   - Establish review scope
   ↓
5. (Optional) Read self-check-report
   - Understand developer security awareness
   - Note acknowledged issues
   ↓
6. (Optional) Read verification-report
   - Understand test coverage
   - Identify untested security paths
   ↓
7. (Optional) Read spec.md
   - Extract security requirements
   - Understand expected behavior
   ↓
8. Execute security review skill
   ↓
9. Generate security-report
```

### 7.2 Minimal Viable Consumption

When time-constrained or minimal information available:

```
Required:
- changed_files (must have)
- task-risk-level (must check)

Proceed with:
- Code analysis only
- Generate findings based on code review
- Note limited context in report
```

---

## 8. Examples

### 8.1 Complete Consumption Example

```yaml
# Input artifacts received:
dispatch:
  task_id: "T-008-001"
  risk_level: "high"
  
artifacts:
  implementation_summary:
    goal_alignment:
      goal: "Implement user authentication with JWT"
      achieved: true
    changed_files:
      - path: "src/services/AuthService.ts"
        change_type: "added"
        description: "Core authentication service"
      - path: "src/controllers/AuthController.ts"
        change_type: "added"
        description: "HTTP endpoints for auth"
      - path: "src/services/JwtTokenService.ts"
        change_type: "added"
        description: "JWT token generation and validation"
    known_issues: []
    risks:
      - risk_id: "RISK-001"
        description: "JWT secret management"
        level: "medium"
  
  self_check_report:
    overall_status: "PASS"
    check_results:
      - category: "Security"
        checks:
          - item: "Input validation present"
            status: "pass"
  
  verification_report:
    confidence_level:
      level: "FULL"
    coverage_gaps: []
    edge_cases_checked:
      - edge_id: "EDGE-001"
        description: "Empty username"
        test_result: "pass"

# Security consumption analysis:
security_analysis:
  review_required: true  # risk_level: high
  security_relevant_files:
    - "AuthService.ts"      # Authentication logic
    - "AuthController.ts"   # Auth endpoints
    - "JwtTokenService.ts"  # Token handling
  
  recommended_skill: "auth-and-permission-review"
  
  focus_areas:
    - "JWT secret handling"      # From risks
    - "Authentication flow"       # From goal
    - "Token generation/validation" # From changed_files
  
  known_context:
    developer_confidence: "high"  # self-check PASS
    testing_confidence: "full"    # verification FULL
    developer_identified_risk: "JWT secret management"
  
  scope_definition:
    components_reviewed:
      - "AuthService.ts"
      - "AuthController.ts"
      - "JwtTokenService.ts"
    auth_mechanisms:
      - "JWT-based authentication"
    focus_areas:
      - "Token generation security"
      - "Secret management"
      - "Endpoint authorization"
```

### 8.2 Minimal Consumption Example

```yaml
# Minimal input received:
dispatch:
  task_id: "T-008-002"
  risk_level: "medium"

artifacts:
  changed_files:
    - path: "src/utils/validation.ts"
      change_type: "modified"

# Security consumption analysis:
security_analysis:
  review_required: false  # risk_level: medium (recommended, not mandatory)
  security_relevant_files:
    - "validation.ts"  # Input validation related
  
  recommended_skill: "input-validation-review"
  
  scope_definition:
    components_reviewed:
      - "validation.ts"
    input_sources:
      - "Unknown (no spec context)"
  
  notes:
    - "Limited context available"
    - "Proceeding with code analysis only"
    - "Recommend full context for comprehensive review"
```

---

## 9. Validation Checklist

Before proceeding with security review, verify:

- [ ] `changed_files` received and analyzed
- [ ] Security-relevant files identified
- [ ] Review skill determined (auth-and-permission vs input-validation)
- [ ] Task risk level checked
- [ ] Implementation goal understood
- [ ] Known issues acknowledged
- [ ] Test coverage gaps noted (if verification-report available)

---

## 10. References

- `specs/004-developer-core/contracts/implementation-summary-contract.md` - Developer artifact contract
- `specs/004-developer-core/contracts/self-check-report-contract.md` - Self-check contract
- `specs/005-tester-core/contracts/verification-report-contract.md` - Verification contract
- `specs/008-security-core/spec.md` - Security feature specification
- `specs/008-security-core/role-scope.md` - Security role scope

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial upstream consumption guide |