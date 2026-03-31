# Data Model: 031-plugin-skill-activation

## Version
`1.0.0`

---

## skill-registry.json Schema

### Purpose

用户配置文件，声明项目可用的 Plugin Skills 及其启用状态。

### Location

`.opencode/skill-registry.json`

### Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "skill-registry.json",
  "title": "Skill Registry",
  "description": "Plugin skills configuration for a project",
  "type": "object",
  "required": ["version", "skills"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Schema version (semver)"
    },
    "skills": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/SkillEntry"
      },
      "description": "List of plugin skills"
    }
  },
  "definitions": {
    "SkillEntry": {
      "type": "object",
      "required": ["name", "source", "enabled"],
      "properties": {
        "name": {
          "type": "string",
          "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$",
          "minLength": 1,
          "maxLength": 64,
          "description": "Skill name (must match SKILL.md directory name)"
        },
        "source": {
          "type": "string",
          "description": "Relative path to SKILL.md from project root"
        },
        "enabled": {
          "type": "boolean",
          "description": "Whether this skill should be linked and loaded"
        },
        "plugin_id": {
          "type": "string",
          "description": "ID of the plugin providing this skill"
        },
        "plugin_version": {
          "type": "string",
          "description": "Version of the plugin"
        },
        "installed_at": {
          "type": "string",
          "format": "date-time",
          "description": "Timestamp when skill was registered"
        },
        "conflict": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string",
              "enum": ["core_skill", "duplicate"]
            },
            "message": {
              "type": "string"
            }
          },
          "description": "Conflict information if skill name clashes"
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
  "skills": [
    {
      "name": "vite-setup",
      "source": "plugins/vite-react-ts/skills/vite-setup/SKILL.md",
      "enabled": true,
      "plugin_id": "vite-react-ts",
      "plugin_version": "1.0.0",
      "installed_at": "2026-03-31T10:00:00.000Z"
    },
    {
      "name": "css-module-test",
      "source": "plugins/vite-react-ts/skills/css-module-test/SKILL.md",
      "enabled": true,
      "plugin_id": "vite-react-ts",
      "plugin_version": "1.0.0",
      "installed_at": "2026-03-31T10:00:00.000Z"
    }
  ]
}
```

---

## Link Target Path Convention

### Skill Link Location

```
.opencode/skills/{skill-name}/SKILL.md
```

### Link Target

```
{source-path-from-registry}
```

### Example

For skill entry:
```json
{
  "name": "vite-setup",
  "source": "plugins/vite-react-ts/skills/vite-setup/SKILL.md"
}
```

Link created:
- **Link path**: `.opencode/skills/vite-setup/SKILL.md`
- **Target**: `plugins/vite-react-ts/skills/vite-setup/SKILL.md`

On Windows (junction):
- **Junction**: `.opencode/skills/vite-setup` → `plugins/vite-react-ts/skills/vite-setup`

---

## Conflict Types

### Core Skill Conflict

A plugin skill has the same name as a core skill (in `.opencode/skills/`).

**Resolution**: Reject plugin skill, warn user.

```json
{
  "name": "feature-implementation",
  "source": "plugins/some-plugin/skills/feature-implementation/SKILL.md",
  "enabled": false,
  "conflict": {
    "type": "core_skill",
    "message": "Skill 'feature-implementation' conflicts with core skill. Rename plugin skill to avoid conflict."
  }
}
```

### Duplicate Plugin Skill Conflict

Two plugins provide skills with the same name.

**Resolution**: First installed wins, second marked as conflicted.

```json
{
  "name": "vite-setup",
  "source": "plugins/other-plugin/skills/vite-setup/SKILL.md",
  "enabled": false,
  "conflict": {
    "type": "duplicate",
    "message": "Skill 'vite-setup' already provided by plugin 'vite-react-ts'"
  }
}
```

---

## Validation Rules

### Skill Name Validation

- 1-64 characters
- Lowercase alphanumeric with hyphens
- Cannot start or end with hyphen
- No consecutive hyphens
- Regex: `^[a-z0-9]+(-[a-z0-9]+)*$`

### Source Path Validation

- Must be relative path from project root
- Must resolve to existing SKILL.md file
- Path format: `plugins/{plugin-id}/skills/{skill-name}/SKILL.md`

### Enabled Flag Validation

- Must be boolean
- If true, skill should be linked
- If false, skill should not be linked (link removed if exists)

---

## Relationship to plugin-manifest.json

### plugin-manifest.json (Existing)

Records what was installed:
- Plugin ID, version
- Templates copied
- Skills registered (metadata only)
- Hooks configured

### skill-registry.json (New)

Controls skill activation:
- Which skills are available
- Which skills are enabled
- User-controlled configuration

### Interaction

1. `install` command creates both files
2. plugin-manifest.json records the installation
3. skill-registry.json allows user control
4. `sync-skills` reads skill-registry.json to create links
5. `uninstall` updates both files