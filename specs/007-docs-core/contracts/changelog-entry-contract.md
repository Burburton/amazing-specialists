# Changelog Entry Contract

## Contract Metadata

| Field | Value |
|-------|-------|
| **Contract ID** | changelog-entry |
| **Contract Name** | Changelog Entry Contract |
| **Version** | 1.0.0 |
| **Owner** | docs |
| **Consumers** | maintainers, release-notes, users |

---

## Purpose

Define the complete schema and validation rules for the `changelog-entry` artifact, which captures user-facing changes for release notes and CHANGELOG.md updates.

This artifact is the **primary output** of the docs role's `changelog-writing` skill and must be consumable by maintainers for release note generation.

---

## Schema

```yaml
changelog_entry:
  # Metadata
  created_at: timestamp            # Entry creation timestamp
  created_by: string               # Always "docs"
  
  # Required Fields (AC-002: 10 fields total)
  
  # Field 1: feature_id (Required)
  feature_id: string               # Feature identifier (e.g., "005-tester-core")
  
  # Field 2: feature_name (Required)
  feature_name: string             # Human-readable feature name
  
  # Field 3: change_type (Required - BR-006)
  change_type: enum                # feature | repair | docs-only | governance
  
  # Field 4: summary (Required)
  summary: string                  # 1-2 sentence user-facing summary
  
  # Field 5: capability_changes (Required)
  capability_changes:
    - description: string          # What capability was added/changed
      user_impact: string          # How this affects users
      breaking: boolean            # Whether this breaks existing usage
  
  # Field 6: docs_changes (Required)
  docs_changes:
    - document: string             # Document that changed
      change_description: string   # What changed in the document
      user_impact: string          # How this affects users
  
  # Field 7: validation_changes (Required)
  validation_changes:
    - description: string          # What validation was added/changed
      scope: string                # What area this validates
      impact: string               # Impact on quality assurance
  
  # Field 8: breaking_changes (Required)
  breaking_changes:
    - change: string               # What is breaking
      affected_usage: string       # What existing usage is affected
      migration_path: string       # How to migrate
      severity: enum               # major | minor
      announced_deprecation: boolean # Whether this was previously deprecated
  
  # Field 9: known_limitations (Required)
  known_limitations:
    - limitation: string           # What is limited
      impact: string               # How this affects users
      workaround: string | null    # Workaround if available
      planned_resolution: string | null # When this might be resolved
  
  # Field 10: related_features (Required)
  related_features:
    - feature_id: string           # Related feature ID
      relationship: enum           # depends-on | enables | supersedes | related
      description: string          # How features are related
```

---

## Field Specifications

### change_type (BR-006)

| Value | Definition | When to Use |
|-------|------------|-------------|
| `feature` | New capability or significant enhancement | New feature implementation, major capability addition |
| `repair` | Bug fix or correction | Bug fixes, error corrections, behavior fixes |
| `docs-only` | Documentation-only changes | Documentation updates with no code changes |
| `governance` | Governance or process changes | Spec updates, contract changes, process modifications |

### breaking_changes.severity

| Value | Definition | Action Required |
|-------|------------|-----------------|
| `major` | Breaking change requiring code modification | Must document migration path |
| `minor` | Breaking change with easy migration | Document workaround |

### related_features.relationship

| Value | Definition |
|-------|------------|
| `depends-on` | This feature requires the related feature |
| `enables` | This feature enables the related feature |
| `supersedes` | This feature replaces the related feature |
| `related` | Features are related but no dependency |

---

## Validation Rules

### R-001: Required Fields

All 10 required fields must be present and non-empty:

- `feature_id`
- `feature_name`
- `change_type`
- `summary`
- `capability_changes`
- `docs_changes`
- `validation_changes`
- `breaking_changes` (may be empty array)
- `known_limitations`
- `related_features`

### R-002: BR-006 Compliance (Change Type Distinction)

- `change_type` must be exactly one of: `feature`, `repair`, `docs-only`, `governance`
- Change type must accurately reflect the nature of changes
- Summary must match change type semantics

### R-003: Summary Quality

- Must be 1-2 sentences (50-150 characters ideal)
- Must use user-facing language (not internal technical jargon)
- Must describe the value/impact, not just what changed
- Must not start with "Added" or "Fixed" - use complete sentences

### R-004: Breaking Changes Disclosure

- If any `capability_changes` entry has `breaking: true`:
  - `breaking_changes` must have at least one entry
  - Each breaking change must have `migration_path` documented
- Breaking changes must not be hidden in `capability_changes` without `breaking_changes` entry

### R-005: Known Limitations Transparency

- All documented gaps from completion-report must appear in `known_limitations`
- Each limitation must have `impact` documented
- If `workaround` is available, must be documented
- Honest disclosure - no hiding known issues

### R-006: Related Features Accuracy

- All features in the implementation chain must be listed
- Relationship must accurately describe dependency
- Enables downstream readers to understand feature context

---

## Consumer Responsibilities

### Maintainers

- Use `summary` as release note bullet point
- Group entries by `change_type` in release notes
- Highlight `breaking_changes` prominently
- Use `known_limitations` for caveats section

### Release Notes

- `change_type: feature` → New Features section
- `change_type: repair` → Bug Fixes section
- `change_type: docs-only` → Documentation section
- `change_type: governance` → Internal Changes section (may omit from user-facing notes)

### Users

- Read `summary` for quick understanding
- Check `capability_changes` for new features
- Review `breaking_changes` before upgrading
- Reference `known_limitations` for usage constraints

---

## Producer Responsibilities

### Docs Role

- Extract feature context from implementation-summary, completion-report
- Classify `change_type` accurately per BR-006
- Write user-facing `summary` (not developer-facing)
- Document all `breaking_changes` with migration paths
- Disclose all `known_limitations` honestly
- Link to all `related_features`

---

## Example: Feature Release

```yaml
changelog_entry:
  created_at: "2026-03-26T16:30:00Z"
  created_by: "docs"
  
  feature_id: "006-reviewer-core"
  feature_name: "Reviewer Core Skills System"
  change_type: "feature"
  
  summary: "Establishes reviewer as a first-class verification role with complete artifact contracts, three core skills for code review and acceptance workflows, and validation layer for consistent quality assurance."
  
  capability_changes:
    - description: "Three core reviewer skills: code-review-checklist, spec-implementation-diff, reject-with-actionable-feedback"
      user_impact: "Developers receive consistent, actionable feedback on code changes with clear acceptance criteria"
      breaking: false
    - description: "Three artifact contracts: acceptance-decision-record, review-findings-report, actionable-feedback-report"
      user_impact: "Structured review outputs enable automated tracking and consistent handoffs"
      breaking: false
    - description: "Complete validation layer with checklists and anti-pattern guidance"
      user_impact: "Review quality is consistent and measurable across features"
      breaking: false
  
  docs_changes:
    - document: "README.md"
      change_description: "Added reviewer skills to skills inventory"
      user_impact: "Users can discover available reviewer capabilities"
    - document: "CHANGELOG.md"
      change_description: "Added changelog entry for 006-reviewer-core"
      user_impact: "Release notes reflect reviewer feature completion"
  
  validation_changes:
    - description: "Acceptance decision record validation with governance compliance checks"
      scope: "Feature acceptance workflow"
      impact: "Ensures consistent governance alignment in all acceptance decisions"
    - description: "Review findings report validation with confidence levels"
      scope: "Code review workflow"
      impact: "Provides confidence assessment for all review outcomes"
  
  breaking_changes: []
  
  known_limitations:
    - limitation: "Multi-language documentation not supported"
      impact: "Documentation available in English only"
      workaround: "Use translation tools for non-English users"
      planned_resolution: "Planned for M4 milestone"
    - limitation: "Advanced reviewer skills (maintainability-review, risk-review) not implemented"
      impact: "Limited to core review capabilities"
      workaround: null
      planned_resolution: "Future enhancement based on usage feedback"
  
  related_features:
    - feature_id: "003-architect-core"
      relationship: "depends-on"
      description: "Reviewer consumes design-note artifacts from architect"
    - feature_id: "004-developer-core"
      relationship: "depends-on"
      description: "Reviewer reviews implementation-summary from developer"
    - feature_id: "005-tester-core"
      relationship: "depends-on"
      description: "Reviewer consumes verification-report from tester"
    - feature_id: "007-docs-core"
      relationship: "enables"
      description: "Reviewer produces acceptance-decision-record consumed by docs"
```

---

## Example: Bug Fix Release

```yaml
changelog_entry:
  created_at: "2026-03-26T17:00:00Z"
  created_by: "docs"
  
  feature_id: "004-developer-core"
  feature_name: "Developer Core Skills System"
  change_type: "repair"
  
  summary: "Fixes self-check-report validation to correctly identify missing test coverage, preventing false positives on trivial changes."
  
  capability_changes:
    - description: "Improved test coverage detection in code-change-selfcheck skill"
      user_impact: "Developers receive accurate feedback on actual test coverage gaps"
      breaking: false
  
  docs_changes:
    - document: "CHANGELOG.md"
      change_description: "Added bug fix entry"
      user_impact: "Release notes document the fix"
  
  validation_changes:
    - description: "Enhanced test coverage validation logic"
      scope: "code-change-selfcheck skill"
      impact: "Reduces false positives in self-check workflow"
  
  breaking_changes: []
  
  known_limitations: []
  
  related_features:
    - feature_id: "005-tester-core"
      relationship: "related"
      description: "Test coverage detection interacts with tester verification"
```

---

## Example: Breaking Change Release

```yaml
changelog_entry:
  created_at: "2026-03-26T18:00:00Z"
  created_by: "docs"
  
  feature_id: "003-architect-core"
  feature_name: "Architect Core Skills System"
  change_type: "feature"
  
  summary: "Restructures design-note contract with explicit requirement mapping and validation rules. Existing design-note artifacts may require updates to include mandatory fields."
  
  capability_changes:
    - description: "Added requirement_to_design_mapping field with explicit traceability"
      user_impact: "Design decisions trace directly to requirements"
      breaking: true
    - description: "Added validation rules for all 9 required fields"
      user_impact: "Design artifacts are consistently structured"
      breaking: false
    - description: "Added open_questions field with temporary assumptions"
      user_impact: "Unresolved issues are explicitly tracked"
      breaking: false
  
  docs_changes:
    - document: "specs/003-architect-core/contracts/design-note-contract.md"
      change_description: "Complete contract restructuring with new fields"
      user_impact: "Architect must update existing design notes"
    - document: "README.md"
      change_description: "Updated architect skills documentation"
      user_impact: "Users understand new design-note structure"
  
  validation_changes:
    - description: "Contract validation requires all 9 fields"
      scope: "design-note artifact"
      impact: "Existing design notes without new fields will fail validation"
  
  breaking_changes:
    - change: "requirement_to_design_mapping field now required"
      affected_usage: "Existing design-note artifacts without this field"
      migration_path: "Add requirement_to_design_mapping array with BR/NFR mappings"
      severity: "major"
      announced_deprecation: false
    - change: "assumptions field now requires risk_if_wrong sub-field"
      affected_usage: "Existing assumption entries without risk assessment"
      migration_path: "Add risk_if_wrong to each assumption entry"
      severity: "minor"
      announced_deprecation: false
  
  known_limitations: []
  
  related_features:
    - feature_id: "004-developer-core"
      relationship: "enables"
      description: "Developer consumes design-note for implementation"
    - feature_id: "006-reviewer-core"
      relationship: "enables"
      description: "Reviewer validates design-note completeness"
```

---

## Example: Docs-Only Release

```yaml
changelog_entry:
  created_at: "2026-03-26T19:00:00Z"
  created_by: "docs"
  
  feature_id: "documentation"
  feature_name: "Documentation Updates"
  change_type: "docs-only"
  
  summary: "Updates skills-usage-guide.md with examples for new reviewer skills and clarifies role boundary definitions."
  
  capability_changes: []
  
  docs_changes:
    - document: "docs/skills-usage-guide.md"
      change_description: "Added reviewer skill examples and usage patterns"
      user_impact: "Users have clearer guidance on reviewer skill usage"
    - document: "role-definition.md"
      change_description: "Clarified reviewer boundary vs tester boundary"
      user_impact: "Role responsibilities are more clearly defined"
  
  validation_changes: []
  
  breaking_changes: []
  
  known_limitations: []
  
  related_features:
    - feature_id: "006-reviewer-core"
      relationship: "related"
      description: "Documentation reflects reviewer capabilities"
```

---

## Example: Governance Release

```yaml
changelog_entry:
  created_at: "2026-03-26T20:00:00Z"
  created_by: "docs"
  
  feature_id: "governance"
  feature_name: "Governance Framework Update"
  change_type: "governance"
  
  summary: "Establishes audit hardening requirements (AH-001 through AH-006) for all feature completions, ensuring consistent governance alignment verification."
  
  capability_changes:
    - description: "Added audit hardening checklist to completion-report requirements"
      user_impact: "All features undergo consistent governance verification"
      breaking: false
  
  docs_changes:
    - document: "docs/audit-hardening.md"
      change_description: "New document defining AH-001 through AH-006 requirements"
      user_impact: "Clear governance standards for all features"
    - document: "AGENTS.md"
      change_description: "Added audit hardening reference to completion workflow"
      user_impact: "Automated enforcement of governance checks"
  
  validation_changes:
    - description: "Governance compliance check required in acceptance-decision-record"
      scope: "All feature acceptances"
      impact: "Ensures governance alignment before feature completion"
  
  breaking_changes: []
  
  known_limitations:
    - limitation: "AH-006 requires manual governance document comparison"
      impact: "Time-consuming governance verification"
      workaround: "Use governance checklist template"
      planned_resolution: "Consider automated governance linting in future"
  
  related_features:
    - feature_id: "006-reviewer-core"
      relationship: "depends-on"
      description: "Governance checks integrated into reviewer acceptance workflow"
```

---

## Quality Checklist

### Structural Validation

- [ ] All 10 required fields present
- [ ] `feature_id` matches naming convention (e.g., "005-tester-core")
- [ ] `change_type` is one of: feature, repair, docs-only, governance
- [ ] All array fields have valid entries

### Content Validation

- [ ] `summary` is 1-2 sentences, user-facing
- [ ] `capability_changes` accurately reflects feature scope
- [ ] `breaking_changes` disclosed if any breaking changes
- [ ] `known_limitations` includes all documented gaps
- [ ] `related_features` lists all related features

### BR-006 Compliance

- [ ] `change_type` accurately classifies the change
- [ ] Breaking changes have migration paths
- [ ] No hidden breaking changes

### Transparency

- [ ] All known limitations disclosed
- [ ] Breaking changes prominently documented
- [ ] No marketing language (honest, factual)

---

## References

- `specs/007-docs-core/spec.md` - Feature specification (AC-002)
- `specs/007-docs-core/downstream-interfaces.md` - Maintainer handoff details
- `specs/007-docs-core/role-scope.md` - Docs role boundaries
- `role-definition.md` - 6-role definition (Section 5: docs)
- `io-contract.md` - I/O contract specification