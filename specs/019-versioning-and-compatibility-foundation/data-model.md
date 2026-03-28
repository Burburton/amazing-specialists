# Data Model: 019-versioning-and-compatibility-foundation

## Metadata
```yaml
feature_id: 019-versioning-and-compatibility-foundation
data_model_version: 1.0.0
created_at: 2026-03-28
status: Draft
```

---

## Overview

本 Data Model 定义 Feature 019 涉及的数据结构，主要包括：
- Compatibility Matrix JSON Schema
- Version Number Storage Locations
- Version Object Attributes

---

## Data Entities

### Entity 1: Compatibility Matrix

**Purpose**: 存储版本间兼容性关系，支持程序化查询

**Storage**: `compatibility-matrix.json`

**Schema Definition** (`compatibility-matrix.schema.json`):

```json
{
  "$schema": "http://json-schema.org/draft-2020-12/schema#",
  "$id": "compatibility-matrix.schema.json",
  "title": "Compatibility Matrix",
  "description": "Version compatibility matrix for OpenCode Expert Pack",
  "type": "object",
  "required": ["matrix_id", "created_at", "updated_at", "versions", "compatibility_entries"],
  "properties": {
    "matrix_id": {
      "type": "string",
      "description": "Unique identifier for the matrix",
      "pattern": "^compat-matrix-[0-9]+$"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "Matrix creation timestamp"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time",
      "description": "Last update timestamp"
    },
    "versions": {
      "type": "array",
      "description": "List of all known versions",
      "items": {
        "$ref": "#/$defs/version_descriptor"
      },
      "minItems": 1
    },
    "compatibility_entries": {
      "type": "array",
      "description": "Compatibility relationships between versions",
      "items": {
        "$ref": "#/$defs/compatibility_entry"
      }
    }
  },
  "$defs": {
    "version_descriptor": {
      "type": "object",
      "required": ["package_version", "profiles"],
      "properties": {
        "package_version": {
          "type": "string",
          "pattern": "^v?[0-9]+\\.[0-9]+\\.[0-9]+(-[a-zA-Z0-9.]+)?$",
          "description": "Package version (SemVer format)"
        },
        "contract_pack_version": {
          "type": "string",
          "pattern": "^v?[0-9]+\\.[0-9]+\\.[0-9]+$",
          "description": "Contract Pack version (follows Package)"
        },
        "template_pack_version": {
          "type": "string",
          "pattern": "^v?[0-9]+\\.[0-9]+\\.[0-9]+$",
          "description": "Template Pack version (follows Package)"
        },
        "profiles": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["minimal", "full"]
          },
          "description": "Available profiles for this version"
        },
        "node_version": {
          "type": "string",
          "description": "Required Node.js version (SemVer range)"
        },
        "opencode_version": {
          "type": "string",
          "description": "Required OpenCode CLI version (SemVer range)"
        },
        "release_date": {
          "type": "string",
          "format": "date",
          "description": "Version release date"
        },
        "status": {
          "type": "string",
          "enum": ["released", "deprecated", "development"],
          "description": "Version lifecycle status"
        }
      }
    },
    "compatibility_entry": {
      "type": "object",
      "required": ["from_version_ref", "to_version_ref", "status"],
      "properties": {
        "from_version_ref": {
          "type": "string",
          "description": "Reference to from version in versions array (package_version)"
        },
        "to_version_ref": {
          "type": "string",
          "description": "Reference to to version in versions array (package_version)"
        },
        "status": {
          "type": "string",
          "enum": ["compatible", "compatible_with_migration", "incompatible"],
          "description": "Compatibility status between versions"
        },
        "migration_guide": {
          "type": "string",
          "description": "Path to migration guide document",
          "pattern": "^docs/migration/v[0-9]+\\.[0-9]+\\.[0-9]+-to-v[0-9]+\\.[0-9]+\\.[0-9]+\\.md$"
        },
        "breaking_changes": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "List of breaking changes (if status is compatible_with_migration or incompatible)"
        },
        "notes": {
          "type": "string",
          "description": "Additional notes or warnings"
        },
        "profile_specific": {
          "type": "object",
          "description": "Profile-specific compatibility overrides",
          "properties": {
            "minimal": {
              "$ref": "#/$defs/profile_compatibility"
            },
            "full": {
              "$ref": "#/$defs/profile_compatibility"
            }
          }
        }
      }
    },
    "profile_compatibility": {
      "type": "object",
      "properties": {
        "status_override": {
          "type": "string",
          "enum": ["compatible", "compatible_with_migration", "incompatible"]
        },
        "notes": {
          "type": "string"
        }
      }
    }
  }
}
```

**Initial Data Example** (`compatibility-matrix.json`):

```json
{
  "$schema": "./compatibility-matrix.schema.json",
  "matrix_id": "compat-matrix-001",
  "created_at": "2026-03-28T00:00:00Z",
  "updated_at": "2026-03-28T00:00:00Z",
  "versions": [
    {
      "package_version": "1.0.0",
      "contract_pack_version": "1.0.0",
      "template_pack_version": "1.0.0",
      "profiles": ["minimal", "full"],
      "node_version": ">=18.0.0",
      "opencode_version": ">=1.0.0",
      "release_date": "2026-03-28",
      "status": "released"
    }
  ],
  "compatibility_entries": [
    {
      "from_version_ref": "1.0.0",
      "to_version_ref": "1.0.0",
      "status": "compatible",
      "notes": "Self-compatibility: v1.0.0 is compatible with itself"
    }
  ]
}
```

---

### Entity 2: Version Number Storage

**Purpose**: 明确各版本化对象的版本号存储位置

**Mapping Table**:

| Version Object | Storage Location | Field Name | Format |
|----------------|------------------|------------|--------|
| Package Version | `package-lifecycle.md` | "Current Version" section | `MAJOR.MINOR.PATCH[-prerelease]` |
| Contract Pack Version | `contracts/pack/registry.json` | `pack_version` | `MAJOR.MINOR.PATCH` |
| Template Pack Version | `templates/pack/pack-version.json` | `version` | `MAJOR.MINOR.PATCH` |
| Profile Version | `templates/pack/pack-version.json` | `profiles.{name}.version` (future) | `MAJOR.MINOR.PATCH` |
| Tooling Version | `templates/pack/pack-version.json` | `tooling_version` (future) | `MAJOR.MINOR.PATCH` |

**Current State**:
- Package Version: `0.1.0-MVP` (package-lifecycle.md) - **Needs update to 1.0.0**
- Contract Pack Version: `1.0.0` (registry.json)
- Template Pack Version: `1.0.0` (pack-version.json)

---

### Entity 3: Version Object Attributes

**Purpose**: 定义每个版本化对象的核心属性

#### Package Version Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| version_number | string | yes | SemVer format |
| release_date | date | yes | Release timestamp |
| status | enum | yes | `released` / `deprecated` / `development` |
| contract_pack_version | string | yes | Associated contract version |
| template_pack_version | string | yes | Associated template version |
| breaking_changes | array | no | List of breaking changes |
| deprecations | array | no | List of deprecated features |

#### Contract Pack Version Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| pack_version | string | yes | SemVer format |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Last update timestamp |
| total_contracts | integer | yes | Number of contracts |
| contracts | array | yes | Contract metadata list |

#### Template Pack Version Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| version | string | yes | SemVer format |
| release_date | date | yes | Release timestamp |
| template_pack_id | string | yes | Pack identifier |
| profiles | object | yes | Profile definitions |
| breaking_changes | array | no | List of breaking changes |
| deprecations | array | no | Deprecated features |
| checksum | object | no | Integrity checksums |
| compatibility | object | yes | Runtime requirements |

#### Profile Attributes
| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | yes | Profile identifier |
| file_count | integer | yes | Number of files |
| skill_count | integer | yes | Number of skills |
| description | string | yes | Profile description |
| extends | string | no | Parent profile (for inheritance) |

---

## Data Relationships

### Version Object Hierarchy (BR-001)

```
Package Version (MAJOR.MINOR.PATCH)
    │
    ├── Contract Pack Version (MAJOR.MINOR.PATCH)
    │   └── Inherits Package MAJOR.MINOR
    │   └── Can independently PATCH
    │
    ├── Template Pack Version (MAJOR.MINOR.PATCH)
    │   ├── Inherits Package MAJOR.MINOR
    │   └── Can independently MINOR (new profiles)
    │   └── Can independently PATCH
    │
    ├── Profile Version (MAJOR.MINOR.PATCH)
    │   └── Inherits Template Pack MAJOR.MINOR
    │   └── Can independently PATCH
    │
    └── Tooling Version (MAJOR.MINOR.PATCH)
        └── Independent versioning
        └── No inheritance from Package
```

### Compatibility Matrix Relationships

```
version_descriptor A ─────────┐
                              │
                              ▼
                     compatibility_entry
                              │
                              ▼
version_descriptor B ─────────┘

status: compatible | compatible_with_migration | incompatible

if status == compatible_with_migration:
    migration_guide: docs/migration/vA-to-vB.md
```

---

## Data Validation Rules

### Rule 1: SemVer Format Validation
**Applies to**: All version_number fields
**Pattern**: `^v?[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$`
**Examples**:
- Valid: `1.0.0`, `v1.0.0`, `1.0.0-alpha.1`, `0.1.0-MVP`
- Invalid: `1.0`, `v1`, `1.0.0.1`

### Rule 2: Migration Guide Path Validation
**Applies to**: compatibility_entry.migration_guide
**Pattern**: `^docs/migration/v[0-9]+\.[0-9]+\.[0-9]+-to-v[0-9]+\.[0-9]+\.[0-9]+\.md$`
**Examples**:
- Valid: `docs/migration/v0.1.0-to-v1.0.0.md`, `docs/migration/v1.0.0-to-v1.1.0.md`
- Invalid: `migration-guide.md`, `docs/migration/0-to-1.md`

### Rule 3: Version Reference Integrity
**Applies to**: compatibility_entry.from_version_ref, to_version_ref
**Rule**: Must reference existing version_descriptor.package_version in versions array
**Validation**: Check versions array contains matching package_version

### Rule 4: Status-Migration Consistency
**Applies to**: compatibility_entry
**Rule**:
- If `status == "compatible_with_migration"`, `migration_guide` must be present (non-null)
- If `status == "compatible"`, `migration_guide` should be null or omitted
- If `status == "incompatible"`, `breaking_changes` must be non-empty

---

## Data Lifecycle

### Creation Flow
```
New Version Release
  │
  ├── 1. Add version_descriptor to versions array
  │
  ├── 2. Add compatibility_entries for new version
  │     ├── Self-compatibility (from_version == to_version)
  │     └── Compatibility with previous versions
  │
  ├── 3. Update package-lifecycle.md Current Version
  │
  ├── 4. Update pack-version.json version
  │
  ├── 5. Update registry.json pack_version (if contract changes)
  │
  └── 6. Write Migration Guide (if needed)
```

### Update Flow
```
Version Status Change (e.g., deprecation)
  │
  ├── 1. Update version_descriptor.status
  │
  ├── 2. Update compatibility_entries affected
  │
  └── 3. Update matrix updated_at timestamp
```

### Query Flow
```
Consumer Query: "Is vA compatible with vB?"
  │
  ├── 1. Load compatibility-matrix.json
  │
  ├── 2. Find compatibility_entry where:
  │     from_version_ref == A, to_version_ref == B
  │
  ├── 3. Return entry.status
  │
  └── 4. If compatible_with_migration:
  │     Return entry.migration_guide path
```

---

## Schema Validation Implementation

### Validation Script (Future CI Integration Point)
```bash
# scripts/validate-compatibility.sh (defined, not implemented)

# 1. Validate JSON schema compliance
node contracts/pack/validate-schema.js \
  compatibility-matrix.json \
  compatibility-matrix.schema.json

# 2. Validate version reference integrity
# (custom logic to check from/to_version_ref exists)

# 3. Validate status-migration consistency
# (custom logic to enforce rules above)
```

---

## Migration Guide Document Structure

**Template**: `docs/templates/migration-guide-template.md`

**Required Sections**:
1. **Upgrade Path**: From/To version specification
2. **Breaking Changes**: List of breaking changes with impact
3. **Step-by-Step Instructions**: Ordered migration steps
4. **Validation Steps**: Post-migration verification checklist
5. **Rollback Instructions**: Recovery steps (optional but recommended)

**File Naming Convention**: `v{FROM}-to-v{TO}.md`
- Example: `docs/migration/v0.1.0-to-v1.0.0.md`
- From/To must match SemVer format

---

## Integration with Existing Data

### contracts/pack/registry.json Integration
**Current Structure**: Contains `pack_version` and `contracts` array
**Enhancement**: No structural change needed, `pack_version` already tracks version
**Usage**: Contract Pack Version queries use `pack_version` field

### templates/pack/pack-version.json Integration
**Current Structure**: Contains `version`, `profiles`, `compatibility`
**Enhancement**: No structural change needed
**Potential Future Addition**: `tooling_version` field for CLI tools

### package-lifecycle.md Integration
**Current Structure**: Contains "Current Version" section with version number
**Enhancement**: Update from `0.1.0-MVP` to `1.0.0`
**Usage**: Package Version source of truth for human-readable documents

---

## Data Model Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    compatibility-matrix.json                     │
├─────────────────────────────────────────────────────────────────┤
│  matrix_id: string                                               │
│  created_at: datetime                                            │
│  updated_at: datetime                                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ versions: array[version_descriptor]                      │    │
│  │  ├── package_version: semver                             │    │
│  │  ├── contract_pack_version: semver                       │    │
│  │  ├── template_pack_version: semver                       │    │
│  │  ├── profiles: ["minimal", "full"]                       │    │
│  │  ├── node_version: semver-range                          │    │
│  │  └── status: enum                                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ compatibility_entries: array[compatibility_entry]        │    │
│  │  ├── from_version_ref: string                            │    │
│  │  ├── to_version_ref: string                              │    │
│  │  ├── status: enum                                        │    │
│  │  ├── migration_guide: path                               │    │
│  │  ├── breaking_changes: array                             │    │
│  │  └── profile_specific: object                            │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│   registry.json         │
├─────────────────────────┤
│ pack_version: semver    │◄──┐
│ contracts: array        │   │
└─────────────────────────┘   │
                              │  Contract Pack Version
┌─────────────────────────┐   │  (follows Package)
│   pack-version.json     │   │
├─────────────────────────┤   │
│ version: semver         │◄──┤  Template Pack Version
│ profiles: object        │   │  (follows Package)
│ compatibility: object   │   │
└─────────────────────────┘   │
                              │
┌─────────────────────────┐   │
│   package-lifecycle.md  │   │
├─────────────────────────┤   │
│ Current Version: semver │◄──┘  Package Version (primary)
└─────────────────────────┘
```

---

## References

- `compatibility-matrix.schema.json` - Schema definition (to be created)
- `compatibility-matrix.json` - Data file (to be created)
- `contracts/pack/registry.json` - Existing contract metadata
- `templates/pack/pack-version.json` - Existing template metadata
- `package-lifecycle.md` - Existing version policy
- [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html)
- [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html)