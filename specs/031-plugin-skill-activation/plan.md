# Implementation Plan: 031-plugin-skill-activation

## Feature ID
`031-plugin-skill-activation`

## Version
`1.0.0`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Project                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  plugins/vite-react-ts/skills/                                  │
│  ├── vite-setup/SKILL.md         ─────┐                         │
│  └── css-module-test/SKILL.md    ─────┼── Source Files          │
│                                       │   (read-only)            │
│                                       │                          │
│  .opencode/                           │                          │
│  ├── skill-registry.json  ◄──────────┼── User Config            │
│  │   {                                │   (enabled: true/false)  │
│  │     "skills": [                    │                          │
│  │       {"name": "vite-setup",       │                          │
│  │        "source": "...",            │                          │
│  │        "enabled": true}            │                          │
│  │     ]                              │                          │
│  │   }                                │                          │
│  │                                    │                          │
│  └── skills/                          │                          │
│      ├── vite-setup/                  │                          │
│      │   └── SKILL.md ◄───────────────┘   Symlink/Junction      │
│      │                                                            │
│      └── my-custom-skill/              User Custom Skills        │
│          └── SKILL.md                  (not managed)             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    OpenCode discovers
                    .opencode/skills/*
                              │
                              ▼
                    All skills available
                    via skill tool
```

---

## Key Components

### 1. skill-registry.json

**Location**: `.opencode/skill-registry.json`

**Purpose**: User configuration file to enable/disable plugin skills

**Format**:
```json
{
  "version": "1.0.0",
  "skills": [
    {
      "name": "vite-setup",
      "source": "plugins/vite-react-ts/skills/vite-setup/SKILL.md",
      "enabled": true,
      "plugin_id": "vite-react-ts",
      "installed_at": "2026-03-31T10:00:00Z"
    }
  ]
}
```

### 2. sync-skills Command

**Location**: `plugins/loader.js`

**Purpose**: Read skill-registry.json and create/remove symlinks

**Algorithm**:
```
1. Read .opencode/skill-registry.json
2. For each skill in skills[]:
   a. If enabled == true:
      - Check if source file exists
      - Create symlink at .opencode/skills/<name>/SKILL.md
   b. If enabled == false:
      - Remove symlink if exists
3. Report summary
```

### 3. Enhanced install Command

**Purpose**: Auto-generate skill-registry.json on plugin install

**Algorithm**:
```
1. Existing install logic (templates, manifest)
2. NEW: Read plugin.json skills array
3. NEW: Create/update skill-registry.json
4. NEW: Auto-run sync-skills (or prompt user)
```

---

## Cross-Platform Symlink Strategy

### Windows

Windows supports two types of directory links:

| Type | Command | Admin Required | Works for |
|------|---------|----------------|-----------|
| Symlink | `fs.symlinkSync(target, path, 'dir')` | Yes (or Dev Mode) | Files & Dirs |
| Junction | `fs.symlinkSync(target, path, 'junction')` | No | Dirs only |

**Decision**: Use **junction** for skill directories (no admin required)

```javascript
function createSkillLink(skillName, sourceDir) {
  const targetDir = path.join('.opencode', 'skills', skillName);
  const parentDir = path.dirname(targetDir);
  
  // Remove existing
  if (fs.existsSync(targetDir)) {
    fs.rmdirSync(targetDir, { recursive: true });
  }
  
  // Create junction (Windows) or symlink (Unix)
  if (process.platform === 'win32') {
    // Junction: link the directory itself
    fs.symlinkSync(sourceDir, targetDir, 'junction');
  } else {
    // Symlink: create directory then link SKILL.md
    fs.mkdirSync(targetDir, { recursive: true });
    fs.symlinkSync(
      path.join(sourceDir, 'SKILL.md'),
      path.join(targetDir, 'SKILL.md')
    );
  }
}
```

---

## Error Handling

### Error Codes

| Code | Description | Recovery |
|------|-------------|----------|
| E001 | skill-registry.json not found | Create template with install command |
| E002 | Source skill file not found | Skip, warn user, mark as broken |
| E003 | Skill name conflict with core | Reject, require rename |
| E004 | Junction/symlink creation failed | Fall back to file copy |

---

## Validation

### Test Scenarios

1. **Fresh install**: Install plugin, verify skills linked
2. **Disable skill**: Set enabled=false, run sync, verify unlinked
3. **Re-enable**: Set enabled=true, run sync, verify linked again
4. **Conflict**: Install plugin with core skill name, verify rejection
5. **Custom skills**: Add custom skill, run sync, verify preserved
6. **Cross-platform**: Test on Windows (junction), macOS/Linux (symlink)
7. **OpenCode discovery**: Verify skill tool can invoke plugin skill

---

## Implementation Order

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| Phase 1 | skill-registry.json format, lib/skill-linker.js | None |
| Phase 2 | sync-skills command | Phase 1 |
| Phase 3 | install/uninstall enhancement | Phase 1 |
| Phase 4 | list enhancement | Phase 1 |
| Phase 5 | Validation & Testing | Phase 1-4 |

---

## Estimated Effort

1-2 days for implementation, 0.5 day for testing