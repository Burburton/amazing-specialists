# Changelog Entry Checklist

## Document Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | `007-docs-core` |
| **Document Type** | Artifact Validation Checklist |
| **Version** | 1.0.0 |
| **Created** | 2026-03-27 |
| **Status** | Complete |
| **Owner** | reviewer |
| **Aligned With** | `specs/007-docs-core/contracts/changelog-entry-contract.md` |

---

## Purpose

Validate that `changelog-entry` artifacts meet all structural, content, and business rule requirements before acceptance. This checklist is used by the reviewer role to verify changelog outputs from the docs role.

This checklist ensures:
1. All 10 required fields are present and valid
2. BR-006 change type distinction verified
3. Breaking change disclosure validated
4. Honest limitation disclosure verified

---

## 1. Structural Validation

### 1.1 Metadata Fields

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `created_at` | [ ] Valid timestamp format | minor | | |
| `created_by` | [ ] Value is "docs" | major | | |

### 1.2 Required Fields (AC-002: 10 fields)

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `feature_id` | [ ] Present and valid format | major | | |
| `feature_name` | [ ] Human-readable name present | minor | | |
| `change_type` | [ ] One of: feature/repair/docs-only/governance | blocker | | |
| `summary` | [ ] Present and non-empty | blocker | | |
| `capability_changes` | [ ] Present (may be empty array) | minor | | |
| `docs_changes` | [ ] Present (may be empty array) | minor | | |
| `validation_changes` | [ ] Present (may be empty array) | minor | | |
| `breaking_changes` | [ ] Present (may be empty array) | minor | | |
| `known_limitations` | [ ] Present (may be empty array) | minor | | |
| `related_features` | [ ] Present (may be empty array) | minor | | |

---

## 2. feature_id Validation

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Matches naming convention (e.g., "005-tester-core") | major | | |
| [ ] References existing feature in specs/ | major | | |
| [ ] Not "documentation" or "governance" for feature releases | minor | | |

### 2.1 Special Feature IDs

| Feature ID | When Used | Check |
|------------|-----------|-------|
| `documentation` | docs-only changes | [ ] Valid for docs-only type |
| `governance` | governance changes | [ ] Valid for governance type |
| Feature ID (e.g., 005-tester-core) | Feature/repair releases | [ ] Matches change_type |

---

## 3. change_type Validation (BR-006)

### 3.1 Change Type Definitions

| Type | Definition | When Used | Check |
|------|------------|-----------|-------|
| `feature` | New capability or significant enhancement | New features, major capabilities | [ ] Used correctly |
| `repair` | Bug fix or correction | Bug fixes, error corrections | [ ] Used correctly |
| `docs-only` | Documentation-only changes | No code changes, doc updates | [ ] Used correctly |
| `governance` | Governance or process changes | Spec updates, process mods | [ ] Used correctly |

### 3.2 BR-006 Compliance: Change Type Distinction

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] `change_type` is exactly one of: feature/repair/docs-only/governance | blocker | | |
| [ ] Change type accurately reflects nature of changes | major | | |
| [ ] Summary matches change type semantics | major | | |
| [ ] No generic "updates and improvements" without classification | blocker | | |

### 3.3 Change Type to Content Mapping

| Change Type | Required Content | Check |
|-------------|------------------|-------|
| `feature` | [ ] capability_changes has entries | |
| `repair` | [ ] capability_changes has fix description | |
| `docs-only` | [ ] docs_changes has entries | |
| `governance` | [ ] Capability or docs changes documented | |

---

## 4. summary Validation (R-003)

### 4.1 Summary Quality Checks

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] 1-2 sentences (50-150 characters ideal) | minor | | |
| [ ] User-facing language (not internal jargon) | major | | |
| [ ] Describes value/impact, not just what changed | major | | |
| [ ] Complete sentences (not starting with "Added"/"Fixed") | minor | | |

### 4.2 Prohibited Summary Patterns

| Prohibited Pattern | Check NOT Present | Severity | Status |
|--------------------|-------------------|----------|--------|
| "Various improvements and bug fixes" | [ ] Absent | blocker | |
| "Updates and enhancements" | [ ] Absent | blocker | |
| Technical jargon without context | [ ] Absent | major | |
| Incomplete sentence fragments | [ ] Absent | minor | |

### 4.3 Required Summary Patterns

| Required Pattern | Check Present | Severity | Status |
|------------------|---------------|----------|--------|
| User-facing value description | [ ] Present | major | |
| Specific to this release | [ ] Present | major | |

---

## 5. capability_changes Validation

### 5.1 Entry Structure

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `description` | [ ] Clear description present | major | | |
| `user_impact` | [ ] User impact documented | major | | |
| `breaking` | [ ] Boolean value present | major | | |

### 5.2 Breaking Change Flag Validation

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] If `breaking: true`, `breaking_changes` has corresponding entry | blocker | | |
| [ ] `breaking` flag accurately reflects change nature | major | | |

---

## 6. docs_changes Validation

### 6.1 Entry Structure

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `document` | [ ] Document name present | major | | |
| `change_description` | [ ] Clear description present | major | | |
| `user_impact` | [ ] User impact documented | minor | | |

### 6.2 Document Reference Validation

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Referenced documents exist | major | | |
| [ ] Change descriptions specific | minor | | |

---

## 7. validation_changes Validation

### 7.1 Entry Structure

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `description` | [ ] Clear description present | major | | |
| `scope` | [ ] Scope documented | minor | | |
| `impact` | [ ] Impact documented | minor | | |

---

## 8. breaking_changes Validation (BR-006 Critical)

### 8.1 Entry Structure

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `change` | [ ] What is breaking clearly described | blocker | | |
| `affected_usage` | [ ] What existing usage affected | blocker | | |
| `migration_path` | [ ] Clear migration instructions | blocker | | |
| `severity` | [ ] One of: major/minor | major | | |
| `announced_deprecation` | [ ] Boolean deprecation status | minor | | |

### 8.2 Breaking Change Disclosure Validation

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] If any `capability_changes[].breaking: true`, `breaking_changes` has entry | blocker | | |
| [ ] Each breaking change has `migration_path` documented | blocker | | |
| [ ] No hidden breaking changes | blocker | | |
| [ ] Breaking changes prominently documented | major | | |

### 8.3 Migration Path Quality

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Migration path is actionable | major | | |
| [ ] Migration path is specific | major | | |
| [ ] User can follow migration instructions | major | | |

---

## 9. known_limitations Validation (BR-008)

### 9.1 Entry Structure

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `limitation` | [ ] Clear limitation description | major | | |
| `impact` | [ ] User impact documented | major | | |
| `workaround` | [ ] Workaround documented if available | minor | | |
| `planned_resolution` | [ ] Resolution timeline if known | minor | | |

### 9.2 Limitation Transparency Validation

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] All documented gaps from completion-report appear in limitations | major | | |
| [ ] Each limitation has `impact` documented | major | | |
| [ ] No hiding known issues | blocker | | |
| [ ] Honest disclosure without marketing language | major | | |

### 9.3 BR-008 Compliance: Honest Limitation Disclosure

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] Limitations match actual gaps | major | | |
| [ ] No understating impact | major | | |
| [ ] Workarounds documented where available | minor | | |

---

## 10. related_features Validation

### 10.1 Entry Structure

| Field | Check | Severity | Status | Notes |
|-------|-------|----------|--------|-------|
| `feature_id` | [ ] Valid feature ID | major | | |
| `relationship` | [ ] One of: depends-on/enables/supersedes/related | major | | |
| `description` | [ ] Relationship description | minor | | |

### 10.2 Relationship Type Definitions

| Relationship | Definition | Check |
|--------------|------------|-------|
| `depends-on` | This feature requires the related feature | [ ] Used correctly |
| `enables` | This feature enables the related feature | [ ] Used correctly |
| `supersedes` | This feature replaces the related feature | [ ] Used correctly |
| `related` | Features related without dependency | [ ] Used correctly |

### 10.3 Feature Chain Validation

| Check | Severity | Status | Notes |
|-------|----------|--------|-------|
| [ ] All features in implementation chain listed | major | | |
| [ ] Relationships accurately describe dependency | major | | |
| [ ] Downstream readers can understand context | minor | | |

---

## 11. Pass/Fail Criteria

### 11.1 PASS Criteria

All of the following must be true:

| Criterion | Check |
|-----------|-------|
| [ ] All 10 required fields present | |
| [ ] change_type correctly classified (BR-006) | |
| [ ] Summary quality meets standards | |
| [ ] Breaking changes disclosed with migration paths | |
| [ ] Known limitations honestly disclosed | |
| [ ] No blocker-level violations | |

### 11.2 FAIL Criteria

Any of the following causes FAIL:

| Criterion | Severity |
|-----------|----------|
| Missing change_type or invalid value | blocker |
| Generic "updates and improvements" summary | blocker |
| Hidden breaking changes | blocker |
| Missing migration path for breaking changes | blocker |
| Known limitations not disclosed | blocker |
| Two or more major violations | major |

### 11.3 N/A Criteria

The following may be marked N/A with justification:

| Criterion | When N/A Applies |
|-----------|------------------|
| `breaking_changes` empty | When no breaking changes |
| `known_limitations` empty | When no known limitations |
| `related_features` empty | When no related features |

---

## 12. Severity Levels

| Level | Definition | Action Required |
|-------|------------|-----------------|
| **blocker** | Must fix, blocks acceptance | Return to docs for correction |
| **major** | Significant issue, affects quality | Document and require resolution |
| **minor** | Minor issue, improvement | Document for future improvement |

---

## 13. Checklist Summary

| Category | Checks | Blocker | Major | Minor |
|----------|--------|---------|-------|-------|
| Structural Validation | 12 | 2 | 4 | 6 |
| feature_id Validation | 3 | 0 | 2 | 1 |
| change_type Validation | 8 | 2 | 4 | 0 |
| summary Validation | 8 | 2 | 3 | 3 |
| capability_changes Validation | 5 | 1 | 3 | 1 |
| docs_changes Validation | 5 | 0 | 3 | 2 |
| validation_changes Validation | 3 | 0 | 1 | 2 |
| breaking_changes Validation | 12 | 5 | 5 | 2 |
| known_limitations Validation | 9 | 1 | 6 | 2 |
| related_features Validation | 7 | 0 | 5 | 2 |
| Pass/Fail Criteria | 6 | 4 | 1 | 0 |
| **Total** | **78** | **17** | **37** | **21** |

---

## References

- `specs/007-docs-core/spec.md` - Feature specification (AC-002, BR-006, BR-008)
- `specs/007-docs-core/contracts/changelog-entry-contract.md` - Artifact schema
- `specs/007-docs-core/role-scope.md` - Docs role boundaries
- `role-definition.md` Section 5 - Docs role definition
- `quality-gate.md` - Quality gate rules

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial changelog-entry validation checklist |