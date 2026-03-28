# Example 002: Governance Drift Detection

## Scenario

Reviewer is performing spec-implementation diff for a feature that claims to be complete, but governance alignment checks reveal multiple issues with canonical documents.

## Input Artifacts

### Feature Under Review

- Feature ID: `00X-example-feature`
- Claimed Status: COMPLETE
- Implementation includes changes to governance concepts

### Completion-Report (excerpt)

```yaml
completion_report:
  feature_id: 00X-example-feature
  overall_status: COMPLETE
  
  acceptance_criteria:
    - id: AC-001
      description: "Core skill implemented"
      status: PASS
    - id: AC-002
      description: "Artifact contracts defined"
      status: PASS
    - id: AC-003
      description: "Examples created"
      status: PARTIAL  # ⚠️ Only 1 example instead of 2
      
  known_gaps:
    - gap: "Only 1 example instead of required 2"
      impact: "minor"
```

### README Feature Status (excerpt)

```markdown
## Feature Status

| Feature | Status |
|---------|--------|
| 00X-example-feature | ✅ Complete |
```

## Step-by-Step Governance Alignment Check

### Step 1: Canonical Document Collection

Read all canonical governance documents:

| Document | Purpose | Key Content to Check |
|----------|---------|---------------------|
| `role-definition.md` | Role definitions | 6-role model boundaries |
| `package-spec.md` | Package specifications | Skill classifications |
| `io-contract.md` | I/O contracts | Artifact formats |
| `quality-gate.md` | Quality gates | Severity levels |
| `README.md` | Project status | Feature status table |

### Step 2: Role Boundary Check (AH-001/AH-006)

Compare feature's role descriptions with `role-definition.md`:

```yaml
role_comparison:
  feature_claimed:
    - role: "auditor"
      description: "New role for compliance checking"
      permissions: ["read all artifacts", "modify compliance reports"]
      
  canonical_defined:
    - roles: [architect, developer, tester, reviewer, docs, security]
    - no_role_named: "auditor"
    
  finding:
    type: "role_boundary_violation"
    severity: blocker
    description: "Feature introduces 'auditor' role not in canonical 6-role model"
    canonical_value: "6-role model: architect, developer, tester, reviewer, docs, security"
    feature_value: "Added 'auditor' as 7th role"
    recommendation: "Remove 'auditor' role, use existing 'reviewer' + 'security' instead"
```

### Step 3: Terminology Consistency Check

Compare feature's terminology with canonical documents:

```yaml
terminology_check:
  conflicts:
    - term: "spec-writer"
      feature_usage: "Described as active role in workflow"
      canonical_value: "Legacy transition role (per role-definition.md)"
      severity: major
      recommendation: "Mark spec-writer as legacy in feature docs"
      
    - term: "task-executor"
      feature_usage: "Used in primary workflow description"
      canonical_value: "Bootstrap compatibility only"
      severity: major
      recommendation: "Use 6-role terminology in primary descriptions"
```

### Step 4: Cross-Document Consistency Check (AH-002)

Check consistency across feature's own documents:

```yaml
cross_document_check:
  flow_order:
    spec_flow: "Design → Implement → Test → Review"
    plan_flow: "Design → Implement → Test → Review"
    status: aligned
    
  stage_status:
    spec_stage: "Phase 2"
    plan_stage: "Phase 2"
    completion_stage: "Phase 2"
    status: aligned
    
  terminology_within_feature:
    spec_terms: ["reviewer", "developer"]
    plan_terms: ["reviewer", "developer"]
    tasks_terms: ["reviewer", "developer"]
    status: aligned
    
  issues: []
```

### Step 5: Path Resolution Check (AH-003)

Verify all declared paths exist:

```yaml
path_resolution:
  paths_to_check:
    - declared: "specs/00X-example-feature/examples/example-001.md"
      expected: "specs/00X-example-feature/examples/example-001.md"
      actual: "specs/00X-example-feature/examples/example-001.md"
      status: resolved
      
    - declared: "specs/00X-example-feature/examples/example-002.md"
      expected: "specs/00X-example-feature/examples/example-002.md"
      actual: null  # ❌ Does not exist!
      status: not_found
      
    - declared: "docs/governance/audit-workflow.md"
      expected: "docs/governance/audit-workflow.md"
      actual: null  # ❌ Does not exist!
      status: not_found
      
  summary:
    total_checked: 5
    resolved: 3
    failures: 2
```

### Step 6: Status Truthfulness Check (BR-009/AH-004)

Compare completion-report with README:

```yaml
status_truthfulness_check:
  completion_report:
    overall_status: "COMPLETE"
    partial_acs:
      - AC-003: PARTIAL
    known_gaps:
      - "Only 1 example instead of required 2"
      
  readme_status:
    feature_status: "✅ Complete"
    gaps_mentioned: false  # ❌ Not disclosed!
    
  finding:
    type: "status_misrepresentation"
    severity: major
    description: "completion-report shows AC-003 PARTIAL, README shows '✅ Complete'"
    violation: "Partial completion reported as fully complete"
    recommendation: "Update README to '✅ Complete (AC-003 PARTIAL)' or similar"
```

## Output: Governance Drift Report

```yaml
spec_implementation_diff:
  dispatch_id: "dispatch-00X-review"
  task_id: "review-task-002"
  
  summary:
    overall_status: partial_aligned
    alignment_percentage: 70
    governance_status: drift_detected  # ⚠️ Governance issues found
    
  spec_reference:
    spec_version: "1.0.0"
    
  comparison:
    - category: "Requirements"
      items:
        - spec_item: "AC-001: Core skill"
          implementation_status: implemented
          alignment: aligned
        - spec_item: "AC-002: Contracts"
          implementation_status: implemented
          alignment: aligned
        - spec_item: "AC-003: Examples"
          implementation_status: partial
          alignment: deviation
          deviation:
            type: omission
            description: "Only 1 example created, 2 required"
            severity: minor
            acceptable: false
            
  gaps:
    - gap: "AC-003: Only 1 example instead of 2"
      description: "Spec requires 2 examples, only 1 exists"
      impact: "Minor - feature still usable but incomplete documentation"
      mitigation: "Create second example"
      
  governance_alignment:
    canonical_documents_checked:
      - role-definition.md
      - package-spec.md
      - io-contract.md
      - quality-gate.md
      - README.md
      
    conflicts:
      # Finding 1: Role Boundary Violation
      - document: "role-definition.md"
        conflict_type: "role_boundary"
        feature_value: "Added 'auditor' role"
        canonical_value: "6-role model only"
        severity: blocker
        recommendation: "Remove 'auditor', use reviewer + security"
        
      # Finding 2: Terminology Conflict
      - document: "role-definition.md"
        conflict_type: "terminology"
        feature_value: "spec-writer as active role"
        canonical_value: "spec-writer is legacy"
        severity: major
        recommendation: "Mark spec-writer as legacy"
        
    cross_document_consistency:
      flow_order_aligned: true
      role_boundaries_aligned: false  # ⚠️ Issue
      stage_status_aligned: true
      terminology_consistent: true
      issues: []
      
    path_resolution:
      paths_checked: 5
      paths_resolved: 3
      failures:
        - declared_path: "specs/00X-example-feature/examples/example-002.md"
          expected_location: "specs/00X-example-feature/examples/example-002.md"
          actual_location: null
          severity: major
        - declared_path: "docs/governance/audit-workflow.md"
          expected_location: "docs/governance/audit-workflow.md"
          actual_location: null
          severity: major
          
    status_truthfulness:
      completion_report_status: "COMPLETE (AC-003 PARTIAL)"
      readme_status: "✅ Complete"
      aligned: false  # ⚠️ Status mismatch
      gaps_disclosed: false  # ⚠️ README doesn't disclose gap
      issues:
        - issue: "README shows 'Complete' but AC-003 is PARTIAL"
          severity: major
        - issue: "Known gap not disclosed in README"
          severity: major
          
  recommendation:
    action: request_changes  # ⚠️ Cannot approve with governance issues
    must_fix:
      # Blockers
      - "Remove 'auditor' role, align with 6-role model"
      # Majors
      - "Mark spec-writer as legacy in feature docs"
      - "Fix missing path: specs/00X-example-feature/examples/example-002.md"
      - "Fix missing path: docs/governance/audit-workflow.md"
      - "Update README to reflect AC-003 PARTIAL status"
      - "Disclose known gap in README"
    should_fix:
      - "Create second example for AC-003"
    acceptable_deviations: []
    governance_actions:
      - action: update_readme
        description: "Sync README status with completion-report partial status"
      - action: sync_canonical
        description: "Remove unauthorized role additions, align with role-definition.md"
      - action: document_drift
        description: "If 'auditor' role is intentional, update role-definition.md first"
```

## Findings Summary

| ID | Severity | Category | Description | BR Reference |
|----|----------|----------|-------------|--------------|
| F-001 | **blocker** | Role Boundary | Added 'auditor' role not in canonical | AH-006 |
| F-002 | **major** | Terminology | spec-writer not marked as legacy | AH-001 |
| F-003 | **major** | Path Resolution | example-002.md does not exist | AH-003 |
| F-004 | **major** | Path Resolution | audit-workflow.md does not exist | AH-003 |
| F-005 | **major** | Status Truthfulness | README shows Complete, AC-003 is PARTIAL | BR-009 |
| F-006 | **major** | Status Truthfulness | Known gap not disclosed in README | BR-009 |
| F-007 | minor | Documentation | Only 1 example instead of 2 | AC-003 |

## Key Takeaways

1. **Governance Checks Are Mandatory**: AH-006 requires checking against canonical documents - this example shows why
2. **Role Boundaries Are Sacred**: Adding new roles requires updating `role-definition.md` first
3. **Status Must Be Truthful**: BR-009 requires completion-report and README to align
4. **Paths Must Resolve**: AH-003 requires all declared paths to exist
5. **Blockers Block Approval**: Cannot approve a review with blocker-level findings

## BR Compliance Summary

| Rule | Status | Evidence |
|------|--------|----------|
| BR-006 | ❌ FAIL | Found role boundary conflict with canonical |
| BR-008 | ✅ PASS | No scope creep detected |
| BR-009 | ❌ FAIL | Status mismatch between completion-report and README |

## Resolution Path

Before this feature can be approved:

1. **Remove 'auditor' role** - Use existing reviewer + security roles
2. **Mark legacy terminology** - Update feature docs to note spec-writer is legacy
3. **Create missing files** - example-002.md, audit-workflow.md
4. **Update README** - Change "✅ Complete" to "✅ Complete (AC-003 PARTIAL)"
5. **Re-run review** - Verify all findings resolved