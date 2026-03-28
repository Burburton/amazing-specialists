# Data Model: 017-contract-schema-pack

## Document Status
- **Feature ID**: `017-contract-schema-pack`
- **Version**: 1.0.0
- **Created**: 2026-03-28

---

## Overview

This document defines the data model for the Contract Schema Pack, including the registry structure, schema file format, and metadata fields.

---

## Registry Data Model

### Registry Structure

```typescript
interface ContractRegistry {
  pack_version: string;              // Schema pack version (e.g., "1.0.0")
  created_at: string;                // ISO 8601 timestamp
  updated_at: string;                // ISO 8601 timestamp (last update)
  total_contracts: number;           // Total contract count (17)
  
  contracts: ContractEntry[];        // Array of contract entries
}

interface ContractEntry {
  contract_id: string;               // Unique ID (e.g., "AC-001", "DC-001")
  contract_name: string;             // Contract name (e.g., "design-note")
  producer_role: RoleType;           // Role that produces this artifact
  consumer_roles: RoleType[];        // Roles that consume this artifact
  version: string;                   // Contract version (e.g., "1.0.0")
  schema_path: string;               // Path to JSON Schema file
  markdown_path: string;             // Path to markdown contract
  description: string;               // Brief description of contract purpose
}

type RoleType = 
  | "architect"
  | "developer"
  | "tester"
  | "reviewer"
  | "docs"
  | "security"
  | "acceptance"
  | "management";
```

### Registry JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "contracts/pack/registry.schema.json",
  "title": "Contract Registry Schema",
  "description": "Schema for the unified contract registry",
  "type": "object",
  "properties": {
    "pack_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Schema pack version in semver format"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "Registry creation timestamp"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time",
      "description": "Registry last update timestamp"
    },
    "total_contracts": {
      "type": "integer",
      "minimum": 1,
      "description": "Total number of contracts in registry"
    },
    "contracts": {
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "#/$defs/contractEntry"
      }
    }
  },
  "required": ["pack_version", "created_at", "updated_at", "total_contracts", "contracts"],
  "$defs": {
    "contractEntry": {
      "type": "object",
      "properties": {
        "contract_id": {
          "type": "string",
          "pattern": "^[A-Z]+-\\d+$",
          "description": "Unique contract identifier"
        },
        "contract_name": {
          "type": "string",
          "pattern": "^[a-z-]+$",
          "description": "Contract name in kebab-case"
        },
        "producer_role": {
          "type": "string",
          "enum": ["architect", "developer", "tester", "reviewer", "docs", "security"]
        },
        "consumer_roles": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["architect", "developer", "tester", "reviewer", "docs", "security", "acceptance", "management"]
          }
        },
        "version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$"
        },
        "schema_path": {
          "type": "string",
          "pattern": "^contracts/pack/[a-z]+/[a-z-]+\\.schema\\.json$"
        },
        "markdown_path": {
          "type": "string",
          "pattern": "^specs/[\\d]+-[a-z-]+/contracts/[a-z-]+-contract\\.md$"
        },
        "description": {
          "type": "string",
          "minLength": 10,
          "maxLength": 200
        }
      },
      "required": ["contract_id", "contract_name", "producer_role", "consumer_roles", "version", "schema_path", "markdown_path", "description"]
    },
    "roleType": {
      "type": "string",
      "enum": ["architect", "developer", "tester", "reviewer", "docs", "security", "acceptance", "management"]
    }
  }
}
```

---

## Pack Version Data Model

### Pack Version Structure

```typescript
interface PackVersion {
  pack_version: string;              // Current pack version
  base_contracts_version: string;    // Version of base contracts this pack is derived from
  schema_spec_version: string;       // JSON Schema spec version used
  created_at: string;
  changelog: PackChangelogEntry[];
}

interface PackChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}
```

### Pack Version JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "contracts/pack/pack-version.schema.json",
  "title": "Schema Pack Version",
  "type": "object",
  "properties": {
    "pack_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "base_contracts_version": {
      "type": "string",
      "description": "Version identifier for base markdown contracts"
    },
    "schema_spec_version": {
      "type": "string",
      "const": "draft/2020-12"
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "changelog": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "version": { "type": "string" },
          "date": { "type": "string", "format": "date" },
          "changes": {
            "type": "array",
            "items": { "type": "string" }
          }
        },
        "required": ["version", "date", "changes"]
      }
    }
  },
  "required": ["pack_version", "base_contracts_version", "schema_spec_version", "created_at", "changelog"]
}
```

---

## Contract Schema Data Model

### Common Schema Structure Pattern

All contract schemas follow a common pattern:

```typescript
interface ContractSchema {
  "$schema": string;                 // JSON Schema spec version
  "$id": string;                     // Schema identifier URI
  "title": string;                   // Contract title
  "description": string;             // Contract purpose description
  "type": "object";                  // Root type is always object
  "properties": Record<string, PropertyDef>;  // Field definitions
  "required": string[];              // Required field names
  "additionalProperties": boolean;   // Strict mode (false)
}
```

### Type Mapping Table

| Markdown Type | JSON Schema Type | Notes |
|---------------|------------------|-------|
| string | `{ "type": "string" }` | Markdown strings become JSON strings |
| string (markdown) | `{ "type": "string", "format": "markdown" }` | Custom format for markdown content |
| boolean | `{ "type": "boolean" }` | Direct mapping |
| integer | `{ "type": "integer" }` | Direct mapping |
| number | `{ "type": "number" }` | Direct mapping |
| timestamp | `{ "type": "string", "format": "date-time" }` | ISO 8601 format |
| array of objects | `{ "type": "array", "items": { ... } }` | Nested object schema |
| array of strings | `{ "type": "array", "items": { "type": "string" } }` | Simple string array |
| enum | `{ "type": "string", "enum": [...] }` | Enum values as string array |
| object | `{ "type": "object", "properties": { ... } }` | Nested object schema |
| optional | Add to properties but not required array | Not in required list |
| nullable | `{ "type": ["string", "null"] }` | Union type with null |

### Required vs Optional Field Handling

```typescript
// Required field (must be in required array)
"field_name": {
  "type": "string",
  "description": "Required field description"
}

// Optional field (not in required array)
"optional_field": {
  "type": "string",
  "description": "Optional field description"
}

// Nullable field (can be null)
"nullable_field": {
  "type": ["string", "null"],
  "description": "Nullable field description"
}
```

---

## Example Schema: Design Note

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "contracts/pack/architect/design-note.schema.json",
  "title": "Design Note Contract",
  "description": "Primary design baseline document produced by architect role",
  "type": "object",
  "properties": {
    "background": {
      "type": "string",
      "format": "markdown",
      "description": "Context and motivation for the design",
      "minLength": 50
    },
    "feature_goal": {
      "type": "string",
      "format": "markdown",
      "description": "What this feature aims to achieve",
      "minLength": 30
    },
    "input_sources": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "source": { "type": "string" },
          "type": { "type": "string", "enum": ["spec", "governance", "constraint", "context"] },
          "mandatory": { "type": "boolean" }
        },
        "required": ["source", "type", "mandatory"]
      },
      "minItems": 1
    },
    "requirement_to_design_mapping": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "requirement_id": { "type": "string" },
          "requirement_text": { "type": "string" },
          "design_decision": { "type": "string" },
          "artifact_section": { "type": "string" }
        },
        "required": ["requirement_id", "requirement_text", "design_decision", "artifact_section"]
      }
    },
    "design_summary": {
      "type": "string",
      "format": "markdown",
      "description": "High-level design overview",
      "minLength": 100
    },
    "constraints": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "constraint_id": { "type": "string" },
          "description": { "type": "string" },
          "source": { "type": "string" },
          "impact": { "type": "string" }
        },
        "required": ["constraint_id", "description", "source", "impact"]
      }
    },
    "non_goals": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "item": { "type": "string" },
          "rationale": { "type": "string" },
          "future_consideration": { "type": "boolean" }
        },
        "required": ["item", "rationale", "future_consideration"]
      }
    },
    "assumptions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "assumption_id": { "type": "string" },
          "description": { "type": "string" },
          "risk_if_wrong": { "type": "string" },
          "validation_method": { "type": "string" }
        },
        "required": ["assumption_id", "description", "risk_if_wrong", "validation_method"]
      }
    },
    "open_questions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "question_id": { "type": "string" },
          "question": { "type": "string" },
          "why_it_matters": { "type": "string" },
          "temporary_assumption": { "type": "string" },
          "impact_surface": { "type": "string" },
          "recommended_next_step": { "type": "string" }
        },
        "required": ["question_id", "question", "why_it_matters", "temporary_assumption", "impact_surface", "recommended_next_step"]
      }
    }
  },
  "required": [
    "background",
    "feature_goal",
    "input_sources",
    "requirement_to_design_mapping",
    "design_summary",
    "constraints",
    "non_goals",
    "assumptions",
    "open_questions"
  ],
  "additionalProperties": false
}
```

---

## Validation Utility Data Model

### Validation Request

```typescript
interface ValidationRequest {
  artifact_path: string;             // Path to artifact file (YAML/JSON)
  schema_id: string;                 // Schema contract ID (e.g., "AC-001")
  strict: boolean;                   // Enable strict validation (default: true)
}
```

### Validation Response

```typescript
interface ValidationResponse {
  valid: boolean;                    // Overall validation result
  errors: ValidationError[];         // Validation errors if any
  warnings: ValidationWarning[];     // Validation warnings if any
  checked_at: string;                // Timestamp of validation
}

interface ValidationError {
  path: string;                      // JSON path to error location
  message: string;                   // Error message
  schema_field: string;              // Schema field that failed
  expected: string;                  // Expected value/type
  actual: string;                    // Actual value found
}

interface ValidationWarning {
  path: string;
  message: string;
  suggestion: string;
}
```

---

## Entity Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                    Contract Registry                           │
│  (contracts/pack/registry.json)                               │
│                                                                │
│  1 ──────────────────────── 17                                │
│  (pack)                      (contracts)                       │
└──────────────────────────────│─────────────────────────────────┘
                               │
                               │ references
                               │
               ┌───────────────┼───────────────┐
               │               │               │
               ▼               ▼               ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│   Contract Entry     │ │   Contract Entry     │ │   Contract Entry     │
│   (AC-001)           │ │   (DC-001)           │ │   (SEC-001)          │
│                      │ │                      │ │                      │
│   schema_path ──────┼─┼──────────────────────┼─┼─> .schema.json       │
│   markdown_path ────┼─┼──────────────────────┼─┼─> -contract.md       │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
          │                       │                       │
          │                       │                       │
          ▼                       ▼                       ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  JSON Schema File    │ │  JSON Schema File    │ │  JSON Schema File    │
│  (design-note)       │ │  (implementation)    │ │  (security-review)   │
│                      │ │                      │ │                      │
│  $schema: draft/2020 │ │  $schema: draft/2020 │ │  $schema: draft/2020 │
│  properties: {...}   │ │  properties: {...}   │ │  properties: {...}   │
│  required: [...]     │ │  required: [...]     │ │  required: [...]     │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
```

---

## Data Validation Constraints

### Registry Constraints
- `pack_version` must be valid semver
- `total_contracts` must match actual array length
- Each `contract_id` must be unique
- `schema_path` must point to existing file
- `markdown_path` must point to existing file

### Schema Constraints
- `$schema` must be `"https://json-schema.org/draft/2020-12/schema"`
- `type` must be `"object"` at root level
- `required` array must contain only valid property names
- `additionalProperties` should be `false` for strict validation
- All property definitions must have `type` and `description`

### Cross-Reference Constraints
- Registry `contract_id` must match schema `$id` pattern
- Registry `schema_path` must resolve to valid schema file
- Registry `markdown_path` must resolve to valid markdown contract
- Schema fields must match markdown contract fields (parity check)

---

## References

- `specs/017-contract-schema-pack/spec.md` - Feature specification
- `specs/017-contract-schema-pack/plan.md` - Implementation plan
- JSON Schema Draft 2020-12 Specification - https://json-schema.org/draft/2020-12/json-schema-core.html