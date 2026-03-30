# Data Model: 030-plugin-architecture

## Metadata
```yaml
feature_id: 030-plugin-architecture
version: 1.0.0
created_at: 2026-03-31
```

---

## Overview

本文档定义 Plugin 系统的核心数据模型，包括：
- Plugin Registry Schema (`registry.json`)
- Plugin Metadata Schema (`plugin.json`)
- Plugin Manifest Schema (Instance tracking)
- Skill Extension Schema
- Template File Classification

---

## Plugin Registry Schema

### File: `plugins/registry.json`

**Purpose**: Central registry for all available plugins, tracking status and compatibility.

### Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-2020-12/schema#",
  "$id": "plugin-registry.schema.json",
  "title": "Plugin Registry",
  "description": "Central registry for plugin discovery and status tracking",
  "type": "object",
  "required": ["version", "plugins", "loader_version"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Registry schema version (semver)"
    },
    "plugins": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/plugin_entry"
      },
      "description": "List of registered plugins"
    },
    "loader_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Minimum loader version required"
    }
  },
  "definitions": {
    "plugin_entry": {
      "type": "object",
      "required": ["id", "path", "status"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^[a-z][a-z0-9-]*[a-z0-9]$",
          "description": "Unique plugin identifier (lowercase, hyphen-separated)"
        },
        "path": {
          "type": "string",
          "description": "Relative path to plugin directory from plugins/"
        },
        "status": {
          "type": "string",
          "enum": ["available", "installed", "planned", "deprecated"],
          "description": "Plugin availability status"
        },
        "core_compatibility": {
          "type": "string",
          "description": "Semver range for core version compatibility"
        },
        "installed_in": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "List of project paths where plugin is installed"
        },
        "installed_at": {
          "type": "string",
          "format": "date-time",
          "description": "Timestamp of installation (if installed)"
        }
      }
    }
  }
}
```

### Example

```json
{
  "version": "1.0.0",
  "plugins": [
    {
      "id": "vite-react-ts",
      "path": "vite-react-ts/",
      "status": "available",
      "core_compatibility": ">=1.0.0"
    },
    {
      "id": "nextjs",
      "path": "nextjs/",
      "status": "planned",
      "core_compatibility": ">=1.0.0"
    },
    {
      "id": "vue-vite",
      "path": "vue-vite/",
      "status": "planned",
      "core_compatibility": ">=1.0.0"
    }
  ],
  "loader_version": "1.0.0"
}
```

### Status Values

| Status | Meaning | Usage |
|--------|---------|-------|
| `available` | Plugin ready for installation | Can be installed via loader |
| `installed` | Plugin installed in at least one project | Registry tracks installation |
| `planned` | Plugin planned but not implemented | Future roadmap item |
| `deprecated` | Plugin no longer maintained | Warning on install |

---

## Plugin Metadata Schema

### File: `plugins/{plugin-id}/plugin.json`

**Purpose**: Define plugin capabilities, dependencies, and content.

### Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-2020-12/schema#",
  "$id": "plugin-metadata.schema.json",
  "title": "Plugin Metadata",
  "description": "Plugin definition including skills, templates, hooks",
  "type": "object",
  "required": ["id", "name", "version", "description", "compatibility"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9-]*[a-z0-9]$",
      "description": "Unique plugin identifier"
    },
    "name": {
      "type": "string",
      "maxLength": 100,
      "description": "Human-readable plugin name"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Plugin version (semver)"
    },
    "description": {
      "type": "string",
      "maxLength": 500,
      "description": "Plugin purpose and scope"
    },
    "author": {
      "type": "string",
      "description": "Plugin author or maintainer"
    },
    "compatibility": {
      "type": "object",
      "required": ["core_version"],
      "properties": {
        "core_version": {
          "type": "string",
          "description": "Semver range for core package compatibility"
        },
        "node_version": {
          "type": "string",
          "description": "Optional Node.js version requirement"
        }
      }
    },
    "skills": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of skill names provided by this plugin"
    },
    "templates": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of template files provided"
    },
    "hooks": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of hook configurations provided"
    },
    "dependencies": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/plugin_dependency"
      },
      "description": "Other plugins this plugin depends on"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Search/discovery tags"
    },
    "repository": {
      "type": "string",
      "format": "uri",
      "description": "Plugin source repository URL"
    },
    "license": {
      "type": "string",
      "description": "Plugin license"
    }
  },
  "definitions": {
    "plugin_dependency": {
      "type": "object",
      "required": ["id"],
      "properties": {
        "id": {
          "type": "string",
          "description": "Dependency plugin ID"
        },
        "version": {
          "type": "string",
          "description": "Required version range"
        },
        "optional": {
          "type": "boolean",
          "default": false,
          "description": "Whether dependency is optional"
        }
      }
    }
  }
}
```

### Example: vite-react-ts

```json
{
  "id": "vite-react-ts",
  "name": "Vite + React + TypeScript",
  "version": "1.0.0",
  "description": "Tech stack adapter for Vite + React + TypeScript projects: configuration guidance, CSS Module testing patterns",
  "author": "amazing_agent_specialist",
  "compatibility": {
    "core_version": ">=1.0.0",
    "node_version": ">=18.0.0"
  },
  "skills": [
    "vite-setup",
    "css-module-test"
  ],
  "templates": [
    "tsconfig.app.json",
    "tsconfig.node.json",
    "tsconfig.test.json",
    "vite-env.d.ts",
    "vite.config.ts"
  ],
  "hooks": [
    "docstring-exclusions"
  ],
  "dependencies": [],
  "tags": ["frontend", "react", "typescript", "vite", "vitest", "css-modules"]
}
```

---

## Plugin Instance Manifest Schema

### File: `{project}/.opencode/plugin-manifest.json`

**Purpose**: Track installed plugins in a specific project instance.

### Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-2020-12/schema#",
  "$id": "plugin-instance-manifest.schema.json",
  "title": "Plugin Instance Manifest",
  "description": "Track plugins installed in a project",
  "type": "object",
  "required": ["version", "plugins"],
  "properties": {
    "version": {
      "type": "string",
      "description": "Manifest schema version"
    },
    "core_version": {
      "type": "string",
      "description": "Core package version at installation"
    },
    "plugins": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/installed_plugin"
      }
    }
  },
  "definitions": {
    "installed_plugin": {
      "type": "object",
      "required": ["id", "version", "installed_at"],
      "properties": {
        "id": {
          "type": "string",
          "description": "Plugin ID"
        },
        "version": {
          "type": "string",
          "description": "Installed plugin version"
        },
        "installed_at": {
          "type": "string",
          "format": "date-time",
          "description": "Installation timestamp"
        },
        "skills_enabled": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Skills from this plugin that are enabled"
        },
        "templates_copied": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Templates that were copied"
        },
        "hooks_configured": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Hooks that were configured"
        },
        "source_path": {
          "type": "string",
          "description": "Original plugin source path"
        }
      }
    }
  }
}
```

### Example

```json
{
  "version": "1.0.0",
  "core_version": "1.0.0",
  "plugins": [
    {
      "id": "vite-react-ts",
      "version": "1.0.0",
      "installed_at": "2026-03-31T10:30:00Z",
      "skills_enabled": ["vite-setup", "css-module-test"],
      "templates_copied": [
        "tsconfig.app.json",
        "tsconfig.node.json",
        "vite.config.ts"
      ],
      "hooks_configured": ["docstring-exclusions"],
      "source_path": "plugins/vite-react-ts/"
    }
  ]
}
```

---

## Skill Extension Schema

### Plugin Skill Naming Convention

Plugin skills must use a naming pattern that distinguishes them from core skills:

| Pattern | Example | Purpose |
|---------|---------|---------|
| `{plugin-id}-{skill-name}` | `vite-react-ts-setup` | Fully qualified |
| `{tech-stack}-{skill-name}` | `vite-setup` | Short form (recommended) |

### Skill Metadata Extension

Plugin skills follow the standard SKILL.md format with additional metadata:

```yaml
skill_id: vite-setup
plugin_id: vite-react-ts
plugin_version: 1.0.0
core_compatibility: >=1.0.0
```

### Skill Directory Structure

```
plugins/{plugin-id}/skills/{skill-name}/
├── SKILL.md              # Skill definition (required)
├── examples/             # Optional examples
│   └── example-1.md
└── templates/            # Optional skill-specific templates
    └── template-1.json
```

---

## Template File Classification

### Template Categories

| Category | Description | Example |
|----------|-------------|---------|
| `config` | Configuration files | tsconfig.json, vite.config.ts |
| `declaration` | Type declarations | vite-env.d.ts |
| `boilerplate` | Code templates | component-template.tsx |
| `test` | Test setup templates | vitest.config.ts |

### Template Metadata (Optional)

Templates may include inline metadata header:

```typescript
// @plugin: vite-react-ts
// @template-type: config
// @template-name: tsconfig.app.json
// @version: 1.0.0
// @description: TypeScript configuration for application code
{
  "compilerOptions": {
    ...
  }
}
```

---

## Hook Configuration Schema

### File: `plugins/{plugin-id}/hooks/{hook-name}.md`

**Purpose**: Define plugin-specific hooks that extend or modify core behavior.

### Structure

```markdown
# Hook: {hook-name}

## Plugin
{id: plugin-id}

## Hook Type
{hook-type}

## Trigger
{trigger-condition}

## Action
{action-description}

## Configuration
{configuration-options}
```

### Example: docstring-exclusions.md

```markdown
# Hook: docstring-exclusions

## Plugin
id: vite-react-ts

## Hook Type
policy-exclusion

## Trigger
Docstring policy check encounters triple-slash directive

## Action
Exclude triple-slash directives (`/// <reference types="...">`) from docstring policy validation

## Configuration
exclusions:
  - pattern: "^///\\s*<reference"
    reason: "TypeScript triple-slash directive (required syntax)"
```

---

## Compatibility Matrix

### Version Compatibility Rules

| Plugin Version | Core Version | Compatibility |
|---------------|--------------|---------------|
| 1.0.x | 1.0.0 | ✅ Compatible |
| 1.1.0 | 1.0.0 | ✅ Compatible (if core_version allows) |
| 2.0.0 | 1.0.0 | ⚠️ Check core_version range |

### Compatibility Check Logic

```javascript
function checkCompatibility(plugin, coreVersion) {
  const range = plugin.compatibility.core_version;
  
  // Parse semver range (e.g., ">=1.0.0", "1.0.0 - 1.5.0")
  const minVersion = parseMinVersion(range);
  const maxVersion = parseMaxVersion(range);
  
  if (coreVersion < minVersion) {
    return { compatible: false, reason: 'core_version_below_minimum' };
  }
  
  if (maxVersion && coreVersion > maxVersion) {
    return { compatible: false, reason: 'core_version_above_maximum' };
  }
  
  return { compatible: true };
}
```

---

## Data Model Relationships

```
registry.json
    │
    ├── plugin_entry[] ────────────────────────► plugin.json
    │       │                                      │
    │       │                                      ├── skills[]
    │       │                                      │       │
    │       │                                      │       ▼
    │       │                                      │   skills/{skill}/SKILL.md
    │       │                                      │
    │       │                                      ├── templates[]
    │       │                                      │       │
    │       │                                      │       ▼
    │       │                                      │   templates/{file}
    │       │                                      │
    │       │                                      └── hooks[]
    │       │                                              │
    │       │                                              ▼
    │       │                                          hooks/{hook}.md
    │       │
    │       └── installed_in[] ─────────────────► .opencode/plugin-manifest.json
    │                                               (in target project)
```

---

## Validation Rules

### Registry Validation

| Rule | Check | Error Level |
|------|-------|-------------|
| R-001 | All plugin IDs unique | Error |
| R-002 | All paths resolve to existing directories | Warning |
| R-003 | Status values valid enum | Error |
| R-004 | Schema version matches loader capability | Warning |

### Plugin Metadata Validation

| Rule | Check | Error Level |
|------|-------|-------------|
| P-001 | All required fields present | Error |
| P-002 | Skills directories exist | Warning |
| P-003 | Templates files exist | Warning |
| P-004 | Hooks files exist | Warning |
| P-005 | core_version is valid semver range | Error |
| P-006 | Plugin ID matches directory name | Error |

### Skill Validation

| Rule | Check | Error Level |
|------|-------|-------------|
| S-001 | SKILL.md exists and parses | Error |
| S-002 | Skill ID follows naming convention | Warning |
| S-003 | Skill ID not conflicts with core skills | Error |

---

## Next Recommended Command

建议执行 `/spec-tasks 030-plugin-architecture` 生成详细任务清单，基于此数据模型定义具体的实现任务。