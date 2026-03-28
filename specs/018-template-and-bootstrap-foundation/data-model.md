# Data Model: 018-template-and-bootstrap-foundation

## Overview

This document defines the data structures used by the template and bootstrap foundation feature. The primary data entities are template manifests, profile definitions, and doctor check results.

---

## Entity Definitions

### E1: Template Manifest (template-manifest.json)

**Purpose**: Track template instance metadata in target projects.

**Location**: `{target-project}/template-manifest.json`

**Schema**:

```json
{
  "$schema": "http://json-schema.org/draft-2020-12/schema#",
  "title": "TemplateManifest",
  "description": "Metadata tracking for template instances",
  "type": "object",
  "required": [
    "template_version",
    "profile",
    "install_timestamp",
    "template_source"
  ],
  "properties": {
    "template_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Template pack version (semver)",
      "examples": ["1.0.0", "1.1.0"]
    },
    "profile": {
      "type": "string",
      "enum": ["minimal", "full"],
      "description": "Selected profile type"
    },
    "install_timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of initial installation"
    },
    "last_upgrade_timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of last upgrade (optional)"
    },
    "template_source": {
      "type": "string",
      "description": "Source location (URL or path reference)",
      "examples": [
        "https://github.com/anomaly/opencode-expert-pack",
        "local://templates/pack"
      ]
    },
    "install_options": {
      "type": "object",
      "description": "Options used during installation",
      "properties": {
        "force": {
          "type": "boolean",
          "default": false
        },
        "dry_run": {
          "type": "boolean",
          "default": false
        }
      }
    },
    "upgrade_history": {
      "type": "array",
      "description": "History of upgrade operations",
      "items": {
        "type": "object",
        "properties": {
          "from_version": { "type": "string" },
          "to_version": { "type": "string" },
          "timestamp": { "type": "string", "format": "date-time" },
          "changes": {
            "type": "object",
            "properties": {
              "added": { "type": "integer" },
              "changed": { "type": "integer" },
              "removed": { "type": "integer" }
            }
          }
        }
      }
    }
  },
  "additionalProperties": false
}
```

**Example**:

```json
{
  "template_version": "1.0.0",
  "profile": "minimal",
  "install_timestamp": "2026-03-28T10:30:00Z",
  "last_upgrade_timestamp": "2026-04-01T14:00:00Z",
  "template_source": "https://github.com/anomaly/opencode-expert-pack",
  "upgrade_history": [
    {
      "from_version": "1.0.0",
      "to_version": "1.1.0",
      "timestamp": "2026-04-01T14:00:00Z",
      "changes": {
        "added": 2,
        "changed": 5,
        "removed": 0
      }
    }
  ]
}
```

---

### E2: Pack Version (pack-version.json)

**Purpose**: Track template pack version in source repository.

**Location**: `templates/pack/pack-version.json`

**Schema**:

```json
{
  "$schema": "http://json-schema.org/draft-2020-12/schema#",
  "title": "PackVersion",
  "description": "Template pack version metadata",
  "type": "object",
  "required": ["version", "release_date", "profiles"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Current template pack version"
    },
    "release_date": {
      "type": "string",
      "format": "date",
      "description": "Release date of this version"
    },
    "profiles": {
      "type": "object",
      "description": "Available profiles and their metadata",
      "properties": {
        "minimal": {
          "type": "object",
          "required": ["file_count", "skills_count"],
          "properties": {
            "file_count": { "type": "integer", "minimum": 0 },
            "skills_count": { "type": "integer", "minimum": 0 },
            "description": { "type": "string" }
          }
        },
        "full": {
          "type": "object",
          "required": ["file_count", "skills_count"],
          "properties": {
            "file_count": { "type": "integer", "minimum": 0 },
            "skills_count": { "type": "integer", "minimum": 0 },
            "description": { "type": "string" }
          }
        }
      },
      "required": ["minimal", "full"]
    },
    "breaking_changes": {
      "type": "array",
      "description": "Breaking changes from previous versions",
      "items": {
        "type": "object",
        "properties": {
          "version": { "type": "string" },
          "change": { "type": "string" },
          "migration": { "type": "string" }
        }
      }
    },
    "checksum": {
      "type": "string",
      "description": "SHA256 checksum of pack contents for verification"
    }
  },
  "additionalProperties": false
}
```

**Example**:

```json
{
  "version": "1.0.0",
  "release_date": "2026-03-28",
  "profiles": {
    "minimal": {
      "file_count": 52,
      "skills_count": 21,
      "description": "Core execution capability without extras"
    },
    "full": {
      "file_count": 148,
      "skills_count": 37,
      "description": "Complete capability with documentation and examples"
    }
  },
  "breaking_changes": [],
  "checksum": "abc123..."
}
```

---

### E3: Doctor Check Result

**Purpose**: Structured output from doctor command health checks.

**Schema**:

```json
{
  "$schema": "http://json-schema.org/draft-2020-12/schema#",
  "title": "DoctorCheckResult",
  "description": "Result from template health check",
  "type": "object",
  "required": ["timestamp", "profile", "checks", "overall_status"],
  "properties": {
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "profile": {
      "type": "string",
      "enum": ["minimal", "full"]
    },
    "checks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["check_id", "check_name", "status", "details"],
        "properties": {
          "check_id": {
            "type": "string",
            "enum": ["D001", "D002", "D003", "D004", "D005", "D006", "D007"]
          },
          "check_name": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": ["PASS", "WARN", "FAIL"]
          },
          "details": {
            "type": "object",
            "properties": {
              "message": { "type": "string" },
              "missing_files": {
                "type": "array",
                "items": { "type": "string" }
              },
              "extra_files": {
                "type": "array",
                "items": { "type": "string" }
              },
              "invalid_files": {
                "type": "array",
                "items": { "type": "string" }
              }
            }
          },
          "fix_available": {
            "type": "boolean",
            "default": false
          },
          "fix_command": {
            "type": "string",
            "description": "Command or action to fix the issue"
          }
        }
      }
    },
    "overall_status": {
      "type": "string",
      "enum": ["PASS", "PASS_WITH_WARNINGS", "FAIL"]
    },
    "summary": {
      "type": "object",
      "properties": {
        "pass_count": { "type": "integer" },
        "warn_count": { "type": "integer" },
        "fail_count": { "type": "integer" }
      }
    },
    "execution_time_ms": {
      "type": "integer",
      "description": "Time taken to run all checks"
    }
  },
  "additionalProperties": false
}
```

**Example (PASS)**:

```json
{
  "timestamp": "2026-03-28T11:00:00Z",
  "profile": "minimal",
  "checks": [
    {
      "check_id": "D001",
      "check_name": "manifest-valid",
      "status": "PASS",
      "details": { "message": "template-manifest.json is valid" },
      "fix_available": false
    },
    {
      "check_id": "D002",
      "check_name": "required-files",
      "status": "PASS",
      "details": { "message": "All required files present" },
      "fix_available": false
    }
  ],
  "overall_status": "PASS",
  "summary": { "pass_count": 7, "warn_count": 0, "fail_count": 0 },
  "execution_time_ms": 1200
}
```

**Example (FAIL)**:

```json
{
  "timestamp": "2026-03-28T11:00:00Z",
  "profile": "minimal",
  "checks": [
    {
      "check_id": "D001",
      "check_name": "manifest-valid",
      "status": "FAIL",
      "details": { 
        "message": "template-manifest.json not found",
        "missing_files": ["template-manifest.json"]
      },
      "fix_available": true,
      "fix_command": "Run 'init' command first"
    },
    {
      "check_id": "D002",
      "check_name": "required-files",
      "status": "FAIL",
      "details": {
        "message": "Missing required files",
        "missing_files": ["AGENTS.md", ".opencode/commands/spec-start.md"]
      },
      "fix_available": true,
      "fix_command": "Run 'install' command to sync template files"
    }
  ],
  "overall_status": "FAIL",
  "summary": { "pass_count": 0, "warn_count": 0, "fail_count": 7 },
  "execution_time_ms": 800
}
```

---

### E4: Install Change Summary

**Purpose**: Output from install command showing changes applied.

**Schema**:

```json
{
  "$schema": "http://json-schema.org/draft-2020-12/schema#",
  "title": "InstallChangeSummary",
  "description": "Summary of changes from install operation",
  "type": "object",
  "required": ["operation", "profile", "changes", "preserved"],
  "properties": {
    "operation": {
      "type": "string",
      "enum": ["init", "install", "upgrade", "profile_change"]
    },
    "profile": {
      "type": "string",
      "enum": ["minimal", "full"]
    },
    "previous_version": {
      "type": "string",
      "description": "Previous template version (for upgrades)"
    },
    "new_version": {
      "type": "string",
      "description": "New template version"
    },
    "changes": {
      "type": "object",
      "properties": {
        "added": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Files added"
        },
        "changed": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Files modified"
        },
        "removed": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Files removed"
        },
        "skipped": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Files skipped due to user modifications"
        }
      }
    },
    "preserved": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Extension files preserved (specs/, artifacts/, etc.)"
    },
    "conflicts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "file": { "type": "string" },
          "type": { "type": "string", "enum": ["user_modified", "name_conflict"] },
          "resolution": { "type": "string", "enum": ["preserved_user", "renamed", "manual"] }
        }
      }
    },
    "success": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    }
  },
  "additionalProperties": false
}
```

**Example**:

```json
{
  "operation": "upgrade",
  "profile": "minimal",
  "previous_version": "1.0.0",
  "new_version": "1.1.0",
  "changes": {
    "added": ["docs/new-guide.md"],
    "changed": ["AGENTS.md", ".opencode/skills/architect/requirement-to-design/SKILL.md"],
    "removed": [],
    "skipped": ["quality-gate.md"]
  },
  "preserved": ["specs/", "artifacts/", "custom-rules.md"],
  "conflicts": [
    {
      "file": "quality-gate.md",
      "type": "user_modified",
      "resolution": "preserved_user"
    }
  ],
  "success": true,
  "message": "Upgrade completed. 1 file added, 2 files changed, 1 file skipped due to user modification."
}
```

---

## Content Classification Data

### Profile Content Definition

**Minimal Profile Required Files**:

```
minimal_required:
  - AGENTS.md
  - .opencode/commands/spec-start.md
  - .opencode/commands/spec-plan.md
  - .opencode/commands/spec-tasks.md
  - .opencode/commands/spec-implement.md
  - .opencode/commands/spec-audit.md
  - .opencode/skills/common/artifact-reading/SKILL.md
  - .opencode/skills/common/context-summarization/SKILL.md
  - .opencode/skills/common/failure-analysis/SKILL.md
  - .opencode/skills/common/execution-reporting/SKILL.md
  - .opencode/skills/common/retry-strategy/SKILL.md
  - .opencode/skills/architect/requirement-to-design/SKILL.md
  - .opencode/skills/architect/module-boundary-design/SKILL.md
  - .opencode/skills/architect/tradeoff-analysis/SKILL.md
  - .opencode/skills/developer/feature-implementation/SKILL.md
  - .opencode/skills/developer/bugfix-workflow/SKILL.md
  - .opencode/skills/developer/code-change-selfcheck/SKILL.md
  - .opencode/skills/tester/unit-test-design/SKILL.md
  - .opencode/skills/tester/regression-analysis/SKILL.md
  - .opencode/skills/tester/edge-case-matrix/SKILL.md
  - .opencode/skills/reviewer/code-review-checklist/SKILL.md
  - .opencode/skills/reviewer/spec-implementation-diff/SKILL.md
  - .opencode/skills/reviewer/reject-with-actionable-feedback/SKILL.md
  - .opencode/skills/docs/readme-sync/SKILL.md
  - .opencode/skills/docs/changelog-writing/SKILL.md
  - .opencode/skills/security/auth-and-permission-review/SKILL.md
  - .opencode/skills/security/input-validation-review/SKILL.md
  - contracts/pack/registry.json
  - package-spec.md
  - role-definition.md
  - io-contract.md
  - quality-gate.md
  - collaboration-protocol.md
  - .gitignore
```

**Full Profile Additional Files**:

```
full_optional:
  skills_m4:
    - .opencode/skills/architect/interface-contract-design/SKILL.md
    - .opencode/skills/architect/migration-planning/SKILL.md
    - .opencode/skills/developer/refactor-safely/SKILL.md
    - .opencode/skills/developer/dependency-minimization/SKILL.md
    - .opencode/skills/tester/integration-test-design/SKILL.md
    - .opencode/skills/tester/flaky-test-diagnosis/SKILL.md
    - .opencode/skills/tester/performance-test-design/SKILL.md
    - .opencode/skills/tester/benchmark-analysis/SKILL.md
    - .opencode/skills/tester/load-test-orchestration/SKILL.md
    - .opencode/skills/tester/performance-regression-analysis/SKILL.md
    - .opencode/skills/reviewer/maintainability-review/SKILL.md
    - .opencode/skills/reviewer/risk-review/SKILL.md
    - .opencode/skills/docs/architecture-doc-sync/SKILL.md
    - .opencode/skills/docs/user-guide-update/SKILL.md
    - .opencode/skills/security/secret-handling-review/SKILL.md
    - .opencode/skills/security/dependency-risk-review/SKILL.md
  docs:
    - docs/templates/design-note-template.md
    - docs/templates/implementation-summary-template.md
    - docs/templates/test-report-template.md
    - docs/templates/review-report-template.md
    - docs/templates/docs-sync-report-template.md
    - docs/templates/security-report-template.md
    - docs/templates/execution-report-template.md
    - docs/templates/completion-report-template.md
    - docs/templates/audit-checklist-template.md
    - docs/rules/coding-rules.md
    - docs/rules/testing-rules.md
    - docs/rules/review-rules.md
    - docs/validation/quality-gate-checklist.md
    - docs/validation/gate-validation-method.md
    - docs/traceability/traceability-method.md
    - docs/traceability/traceability-matrix-template.md
    - docs/enhanced-mode-guide.md
  schemas:
    - contracts/pack/architect/design-note.schema.json
    - contracts/pack/architect/module-boundaries.schema.json
    - contracts/pack/architect/open-questions.schema.json
    - contracts/pack/architect/risks-and-tradeoffs.schema.json
    - contracts/pack/developer/implementation-summary.schema.json
    - contracts/pack/developer/self-check-report.schema.json
    - contracts/pack/developer/bugfix-report.schema.json
    - contracts/pack/tester/verification-report.schema.json
    - contracts/pack/tester/test-scope-report.schema.json
    - contracts/pack/tester/regression-risk-report.schema.json
    - contracts/pack/reviewer/review-findings-report.schema.json
    - contracts/pack/reviewer/actionable-feedback-report.schema.json
    - contracts/pack/reviewer/acceptance-decision-record.schema.json
    - contracts/pack/docs/docs-sync-report.schema.json
    - contracts/pack/docs/changelog-entry.schema.json
    - contracts/pack/security/security-review-report.schema.json
    - contracts/pack/security/input-validation-review-report.schema.json
  examples:
    - examples/sample-workflow/README.md
    - examples/sample-workflow/spec.md
    - examples/sample-workflow/plan.md
    - examples/sample-workflow/tasks.md
```

**Source-Only Exclusion List**:

```
source_only_excluded:
  - specs/001-bootstrap/
  - specs/002-role-model-alignment/
  - specs/002b-governance-repair/
  - specs/003-architect-core/
  - specs/004-developer-core/
  - specs/005-tester-core/
  - specs/006-reviewer-core/
  - specs/007-docs-core/
  - specs/008-security-core/
  - specs/009-command-hardening/
  - specs/010-3-skill-migration/
  - specs/011-m4-enhancement-kit/
  - specs/012-performance-testing-skills/
  - specs/013-e2e-validation/
  - specs/014-enhanced-mode-validation/
  - specs/015-historical-features-audit/
  - specs/016-release-preparation/
  - specs/017-contract-schema-pack/
  - specs/*-verification-report.md
  - specs/*-report.md
  - docs/archive/
  - docs/infra/
  - src/ (if exists)
```

**Extension Files (Never Modified by Template)**:

```
extension_files:
  - specs/
  - artifacts/
  - *.project-specific.md
  - Any files not in template content list
```

---

## Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Source Repository                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ templates/pack/                                          ││
│  │  ├── pack-version.json ──────────────────────────────┐  ││
│  │  ├── minimal/                                        │  ││
│  │  │   └── [Required content files]                    │  ││
│  │  ├── full/                                           │  ││
│  │  │   └── [Required + Optional content files]         │  ││
│  │  └── manifest-template.json                          │  ││
│  └──────────────────────────────────────────────────────┘  ││
│  ┌─────────────────────────────────────────────────────────┐│
│  │ templates/cli/                                           ││
│  │  ├── init.js ────────────────────────────────────────┐  ││
│  │  ├── install.js ─────────────────────────────────────┤  ││
│  │  ├── doctor.js                                       │  ││
│  │  └── lib/                                             │  ││
│  └──────────────────────────────────────────────────────┘  ││
└─────────────────────────────────────────────────────────────┘
                              │
                              │ init/install copy operation
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Target Project                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ template-manifest.json ───────────────────────────────┐ ││
│  │  ├── template_version (matches pack-version.json)     │ ││
│  │  ├── profile                                          │ ││
│  │  └── timestamps                                       │ ││
│  └──────────────────────────────────────────────────────┘ ││
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Template Files (copied from pack/)                      ││
│  │  ├── AGENTS.md                                          ││
│  │  ├── .opencode/                                         ││
│  │  ├── contracts/                                         ││
│  │  └── governance files                                   ││
│  └──────────────────────────────────────────────────────┘ ││
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Extension Files (never touched)                         ││
│  │  ├── specs/                                             ││
│  │  ├── artifacts/                                         ││
│  │  └── user-specific files                                ││
│  └──────────────────────────────────────────────────────┘ ││
└─────────────────────────────────────────────────────────────┘

Data Flow:
init ──────► copy pack/{profile}/ ──────► target/
           │                              │
           └──► generate manifest ────────► template-manifest.json

install ───► read manifest ──────────────► compare versions
           │                              │
           └──► sync files ───────────────► target/ (preserve extensions)
           │                              │
           └──► update manifest ──────────► template-manifest.json

doctor ────► read manifest ──────────────► validate profile
           │                              │
           └──► check files ──────────────► DoctorCheckResult
           │                              │
           └──► output report ────────────► stdout/JSON
```

---

## Validation Constraints

### C1: Version Compatibility

- Template version must follow semver (X.Y.Z)
- Upgrade allowed from any version to higher version
- Breaking changes documented in pack-version.json
- Version mismatch warning when running install without --upgrade

### C2: Profile Consistency

- Profile in manifest must match actual content
- Profile change triggers file sync (add/remove optional files)
- Profile downgrade warns about removed optional files

### C3: Extension Isolation

- Template commands must not modify files outside template content
- User extension files (specs/, artifacts/) preserved on all operations
- Conflict detection when user modified template-managed file

### C4: Doctor Check Limits

- D001-D007 checks mandatory for all profiles
- Execution time < 5000ms (NFR-004)
- Auto-fix available for: missing manifest, missing required files
- Auto-fix NOT available for: user conflicts, governance inconsistency

---

## Indexes and Lookups

### I1: Profile File Index

Used by CLI to determine which files to copy/sync.

```javascript
const PROFILE_FILE_INDEX = {
  minimal: MINIMAL_REQUIRED_FILES,
  full: [...MINIMAL_REQUIRED_FILES, ...FULL_OPTIONAL_FILES]
};
```

### I2: Doctor Check Registry

Used by doctor to execute checks in order.

```javascript
const DOCTOR_CHECK_REGISTRY = [
  { id: 'D001', name: 'manifest-valid', autoFix: true },
  { id: 'D002', name: 'required-files', autoFix: true },
  { id: 'D003', name: 'governance-consistent', autoFix: false },
  { id: 'D004', name: 'skills-complete', autoFix: false },
  { id: 'D005', name: 'commands-complete', autoFix: false },
  { id: 'D006', name: 'contracts-registry', autoFix: false },
  { id: 'D007', name: 'no-source-leak', autoFix: false }
];
```

### I3: Source-Only Exclusion Index

Used by template pack generation and doctor to identify excluded content.

```javascript
const SOURCE_ONLY_INDEX = new Set(SOURCE_ONLY_EXCLUDED);
```

---

## Migration Notes

### From Manual Copy to Template

If a project already has partial template structure:
1. Run `doctor` to assess current state
2. If partial, run `install --profile <profile>` to sync
3. Manifest generated on first install
4. Extension files (specs/, artifacts/) preserved

### Version Upgrade Path

```
1.0.0 ──────► 1.1.0 (minor):
  - Files may be added
  - Files may be changed (non-breaking)
  - No files removed

1.x.x ──────► 2.0.0 (major):
  - Breaking changes documented
  - Migration guide provided
  - Manual review recommended
```