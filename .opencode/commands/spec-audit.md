---
description: Audit consistency between spec, plan, tasks, code, and canonical governance documents
agent: explore
flags:
  --enhanced: Enable M4 enhancement kit for comprehensive audit
---

Audit feature `$1`.

## Audit Scope

### Required Document Reads
- `specs/$1/spec.md`
- `specs/$1/plan.md`
- `specs/$1/tasks.md`
- `specs/$1/completion-report.md`
- `specs/$1/data-model.md` if present
- `specs/$1/contracts/` if present

### Mandatory Canonical Comparison
Must also read and compare against:
- `role-definition.md` - Role definitions and boundaries (authority: highest)
- `package-spec.md` - Package spec and skill classifications (authority: highest)
- `io-contract.md` - I/O contract formats (authority: highest)
- `quality-gate.md` - Severity levels and quality gates (authority: highest)
- `README.md` - Repository status narrative (authority: high)

Also inspect the relevant implementation files.

## Audit Dimensions

### 1. Feature Internal Completeness
- [ ] Requirement-to-implementation coverage gaps
- [ ] Missing or orphan tasks
- [ ] Terminology inconsistencies within feature
- [ ] Data model mismatches
- [ ] Contract mismatches
- [ ] Acceptance criteria validation status
- [ ] Assumptions that leaked into implementation as facts
- [ ] Risks introduced by implementation not reflected in plan/spec

### 2. Canonical Alignment (NEW - Mandatory)
- [ ] **Role Definition Alignment**: Feature uses roles consistent with `role-definition.md`
- [ ] **Package Spec Alignment**: Feature terminology matches `package-spec.md`
- [ ] **IO Contract Alignment**: Payloads/artifacts follow `io-contract.md` formats
- [ ] **Quality Gate Alignment**: Severity levels match `quality-gate.md` definitions
- [ ] **Terminology Consistency**: No undefined terms, canonical terms used correctly

**Rule**: Any conflict with canonical documents MUST be reported as finding (AH-001).

### 3. Cross-Document Consistency (NEW - Mandatory)
- [ ] **Flow Order Consistency**: Process sequence consistent across spec/plan/tasks/README
- [ ] **Role Boundary Consistency**: Role responsibilities match `role-definition.md`
- [ ] **Stage Status Consistency**: Feature status consistent across all documents
- [ ] **Path Declaration Consistency**: Declared paths match actual file locations
- [ ] **Completion Status Consistency**: Status narrative aligned (no partial→complete drift)

**Finding Severity**: Canonical flow order conflict = major; Status misrepresentation = major

### 4. Path Resolution Verification (NEW - Mandatory)
- [ ] All artifact paths declared in `spec.md` resolve to actual files
- [ ] All output paths in `plan.md` resolve to actual files/directories
- [ ] All deliverable paths in `tasks.md` resolve to actual files
- [ ] All evidence paths in `completion-report.md` resolve to actual files

**Finding Severity**: Path declaration error = major (even if file exists but path misspelled)

### 5. Status Truthfulness Verification (NEW - Mandatory)
- [ ] **Completion-Report vs README**: Status narrative consistent
- [ ] **Known Gaps Disclosure**: Partial gaps explicitly disclosed, not hidden
- [ ] **Status Classification**: Uses correct status level (see below)

**Status Classification**:
- **a) Fully Complete**: All AC pass, no known gaps → Can use "✅ 已完成", "COMPLETE"
- **b) Substantially Complete with Known Gaps**: Main goals achieved, documented gaps → Must use "COMPLETE with known gaps", "主体完成 (gap 见 X)"
- **c) Incomplete**: Main goals not achieved → Use "进行中", "PARTIAL"

**Finding Severity**: Reporting (b) as (a) = major; Missing gap disclosure = major

### 6. README Governance Sync (NEW - Mandatory)
- [ ] README feature status matches `completion-report.md`
- [ ] If feature affects roles, README role list updated
- [ ] If feature affects workflow, README flow description updated
- [ ] If feature has known gaps, README reflects gaps

**Rule**: README is governance document when it defines process/stage/role/status (AH-005).

## Findings Severity Levels

| Level | Definition | Examples |
|-------|------------|----------|
| **blocker** | Must fix, blocks milestone acceptance | Critical spec deviation, fake verification results |
| **major** | Affects downstream or causes confusion | Canonical conflict, README status misleading, path errors, undisclosed gaps |
| **minor** | Minor issue, room for improvement | Terminology inconsistency that doesn't affect understanding |
| **note** | Informational, for reference | Suggestions, observations |

## Output Sections

### Required Output Structure
```yaml
audit_report:
  feature_id: string
  audit_date: timestamp
  auditor: string
  
  summary:
    overall_status: pass | pass_with_warnings | fail
    blocker_count: number
    major_count: number
    minor_count: number
    note_count: number
    
  feature_internal:
    completeness_score: number
    gaps: [...]
    inconsistencies: [...]
    
  canonical_alignment:
    documents_checked: [role-definition.md, package-spec.md, io-contract.md, quality-gate.md, README.md]
    conflicts_found: [...]  # AH-001 findings
    
  cross_document_consistency:
    flow_order_aligned: boolean
    role_boundaries_aligned: boolean
    stage_status_aligned: boolean
    issues: [...]  # AH-002 findings
    
  path_resolution:
    paths_checked: number
    paths_failed: number
    failures: [...]  # AH-003 findings
    
  status_truthfulness:
    completion_report_status: string
    readme_status: string
    aligned: boolean
    gaps_disclosed: boolean
    issues: [...]  # AH-004 findings
    
  readme_governance:
    needs_sync: boolean
    sync_items: [...]  # AH-005 findings
    
  findings:
    - id: string
      severity: blocker | major | minor | note
      category: canonical_alignment | cross_doc_consistency | path_resolution | status_truthfulness | readme_sync
      rule: AH-001 | AH-002 | AH-003 | AH-004 | AH-005 | AH-006
      description: string
      location: string
      recommendation: string
      
  recommendation:
    action: approve | approve_with_warnings | request_changes | escalate
    must_fix: [...]
    should_fix: [...]
    notes: [...]
```

## Audit Flags

- `--canonical-check`: Enable canonical document comparison (AH-001)
- `--cross-doc-check`: Enable cross-document consistency check (AH-002)
- `--path-check`: Enable path resolution verification (AH-003)
- `--truthfulness-check`: Enable status truthfulness verification (AH-004)
- `--readme-sync-check`: Enable README governance sync check (AH-005)
- `--full-governance-audit`: Enable all governance checks (default for milestone audit)
- `--enhanced`: Enable M4 enhancement kit for comprehensive audit

## Enhanced Mode (--enhanced)

When `--enhanced` flag is provided or `spec.md` has `enhanced: true`, additionally apply M4 skills:

### Maintainability Review (reviewer)
Evaluate code maintainability:
- Complexity analysis (cyclomatic, cognitive)
- Naming and documentation quality
- Dependency relationship assessment
- SOLID principles compliance
- Technical debt identification

### Risk Review (reviewer)
Assess technical risks:
- Identify high-risk areas
- Evaluate failure impact
- Check rollback capability
- Assess monitoring coverage
- Verify fault tolerance mechanisms

### Secret Handling Review (security)
If the feature handles sensitive information:
- Check for hardcoded secrets
- Verify secret storage security
- Check for logging leaks
- Verify secret rotation mechanisms
- Check transport security

### Dependency Risk Review (security)
Analyze dependency security:
- Check for known CVEs
- Verify dependency maintenance status
- Check license compliance
- Assess supply chain security

### Enhanced Output Structure
Add to audit report:
```yaml
enhanced_audit:
  maintainability:
    score: number (1-10)
    findings: [...]
  risk_assessment:
    level: low | medium | high | critical
    items: [...]
  security_enhanced:
    secret_handling: pass | needs_fix | block
    dependency_risk: pass | needs_fix | block
```

## References

- `docs/audit-hardening.md` - Complete audit hardening specification
- `quality-gate.md` - Severity level definitions
- `role-definition.md` - Role definitions
- `package-spec.md` - Package specifications
- `io-contract.md` - I/O contract formats
