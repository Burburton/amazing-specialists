# Feature: Plugin Skill Activation

## Feature ID
`031-plugin-skill-activation`

## Status
`complete`

## Version
`1.0.0`

## Created
2026-03-31

---

## Overview

### Goal

实现 Plugin Skills 的激活机制，让用户可以选择启用哪些 Plugin Skills，并通过符号链接使其被 OpenCode 自动加载。

### Background

`030-plugin-architecture` 实现了 Plugin 架构，但存在关键缺陷：

1. **Skills 不被加载**: `loader.js install` 只复制 templates，不处理 skills
2. **用户无法选择**: 没有配置机制让用户选择启用哪些 skills
3. **OpenCode 无法发现**: Plugin skills 在 `plugins/*/skills/` 目录，OpenCode 不扫描此路径

OpenCode 的 skill 发现机制只扫描：
- `.opencode/skills/<name>/SKILL.md` (项目级)
- `~/.config/opencode/skills/<name>/SKILL.md` (全局级)

### Problem

当前状态：
```
用户项目/
├── plugins/vite-react-ts/skills/vite-setup/SKILL.md  # ← OpenCode 无法发现
└── .opencode/
    └── plugin-manifest.json                           # ← 只记录元数据
```

期望状态：
```
用户项目/
├── plugins/vite-react-ts/skills/vite-setup/SKILL.md  # 源文件
└── .opencode/
    ├── skill-registry.json                            # 用户配置
    └── skills/
        └── vite-setup/SKILL.md                        # 符号链接 → OpenCode 可发现
```

### Solution

引入 **注册表模式 + 符号链接**：

1. **skill-registry.json**: 用户配置文件，声明可用的 plugin skills 及启用状态
2. **sync-skills 命令**: 读取配置，为启用的 skills 创建符号链接到 `.opencode/skills/`
3. **OpenCode 自动加载**: 扫描 `.opencode/skills/` 发现所有 skills

---

## Requirements

### Functional Requirements

#### FR-001: Skill Registry 配置文件

- 创建 `.opencode/skill-registry.json` 配置文件
- 格式：
  ```json
  {
    "version": "1.0.0",
    "skills": [
      {
        "name": "vite-setup",
        "source": "plugins/vite-react-ts/skills/vite-setup/SKILL.md",
        "enabled": true
      }
    ]
  }
  ```
- 支持 `enabled: true/false` 控制是否启用

#### FR-002: sync-skills 命令

- 新增 `sync-skills` 命令到 `loader.js`
- 功能：
  1. 读取 `.opencode/skill-registry.json`
  2. 为 `enabled: true` 的 skills 创建符号链接到 `.opencode/skills/<name>/SKILL.md`
  3. 删除 `enabled: false` 的符号链接
  4. 支持 `--dry-run` 预览

#### FR-003: install 命令增强

- `install` 命令完成后：
  1. 自动创建 `.opencode/skill-registry.json` 模板
  2. 所有 plugin skills 默认 `enabled: true`
  3. 提示用户运行 `sync-skills` 或直接同步

#### FR-004: uninstall 命令增强

- `uninstall` 命令执行时：
  1. 从 `skill-registry.json` 移除相关 skills
  2. 删除对应的符号链接

#### FR-005: list 命令增强

- `list` 命令显示每个 plugin 的 skills 启用状态：
  ```
  ✅ vite-react-ts (available)
     Skills: vite-setup (enabled), css-module-test (disabled)
  ```

#### FR-006: 用户自定义 skills 支持

- 用户可以在 `.opencode/skills/` 目录直接添加自定义 skills
- 自定义 skills 不受 `skill-registry.json` 管理
- 自定义 skills 与 plugin skills 共存

---

## Technical Constraints

### TC-001: 符号链接跨平台

Windows 创建符号链接需要管理员权限或开发者模式。

**解决方案**：
- Windows 使用 `junction` 代替 `symlink`（不需要管理员权限）
- 检测操作系统，选择合适的链接类型

```javascript
const fs = require('fs');
const path = require('path');

function createSkillLink(source, target) {
  const isWindows = process.platform === 'win32';
  
  // 确保目标目录存在
  const targetDir = path.dirname(target);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  if (isWindows) {
    // Windows: 使用 junction（目录链接）
    // 需要 source 是绝对路径
    const absoluteSource = path.resolve(source);
    const parentDir = path.dirname(target);
    const linkName = path.basename(targetDir);
    
    // 删除已存在的链接
    if (fs.existsSync(targetDir)) {
      fs.rmdirSync(targetDir, { recursive: true });
    }
    
    // 创建 junction
    fs.symlinkSync(absoluteSource, parentDir, 'junction');
  } else {
    // Unix: 使用符号链接
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
    }
    fs.symlinkSync(source, target);
  }
}
```

### TC-002: Skill 命名冲突

Plugin skill 名称可能与核心 skill 或其他 plugin skill 冲突。

**规则**：
- 核心技能优先级最高，不允许覆盖
- 同名 plugin skill，先安装的优先
- 冲突时警告用户，记录在 `skill-registry.json` 的 `conflict` 字段

### TC-003: 相对路径解析

`skill-registry.json` 中的 `source` 路径：
- 支持相对于项目根目录的相对路径
- 支持绝对路径（用于开发/调试）

---

## Acceptance Criteria

### AC-001: skill-registry.json 创建

- [ ] install 命令创建 `.opencode/skill-registry.json`
- [ ] 格式符合 FR-001 定义
- [ ] 所有 plugin skills 默认 `enabled: true`

### AC-002: sync-skills 命令实现

- [ ] `sync-skills` 命令读取配置并创建符号链接
- [ ] 符号链接指向正确的源文件
- [ ] OpenCode 可以发现并加载 `.opencode/skills/` 下的 skills
- [ ] `--dry-run` 正确预览变更

### AC-003: 符号链接跨平台

- [ ] Windows 使用 junction
- [ ] Unix 使用 symlink
- [ ] 不需要管理员权限

### AC-004: 启用/禁用控制

- [ ] 用户修改 `enabled: false` 后运行 `sync-skills` 删除符号链接
- [ ] 该 skill 不再被 OpenCode 加载

### AC-005: 用户自定义 skills 共存

- [ ] 用户可以直接在 `.opencode/skills/` 添加自定义 skills
- [ ] 自定义 skills 不被 `sync-skills` 影响
- [ ] Plugin skills 和自定义 skills 可以同时使用

---

## Risks

### Risk-001: Windows 符号链接权限

**描述**: Windows 创建符号链接需要管理员权限或开发者模式。

**缓解**: 使用 junction 代替 symlink，不需要管理员权限。

### Risk-002: Skill 命名冲突

**描述**: 不同 plugin 可能有同名 skill。

**缓解**: 
- 检测冲突并警告
- 建议使用 `plugin-name/skill-name` 格式

### Risk-003: 路径解析错误

**描述**: 相对路径在不同工作目录下可能解析错误。

**缓解**: 
- 始终基于项目根目录解析
- 记录绝对路径在内部处理

---

## Milestones

### M1: 核心实现

- skill-registry.json 格式定义
- sync-skills 命令实现
- 符号链接创建（跨平台）

### M2: 命令增强

- install 命令增强
- uninstall 命令增强
- list 命令增强

### M3: 验证

- 跨平台测试（Windows, macOS, Linux）
- OpenCode 加载验证
- 冲突处理验证

---

## 030 Design Cleanup

本 Feature 实现时需要同步修改 `030-plugin-architecture` 中被 031 取代的设计。

### 需要修改的 030 元素

#### M-001: PLUGIN-SPEC.md "Skill 合并机制" 章节

**位置**: `plugins/PLUGIN-SPEC.md` lines 358-373

**当前设计**:
```javascript
// OpenCode 加载 skills 时
const coreSkills = loadSkills('.opencode/skills/');
const pluginSkills = loadPluginSkills('plugins/*/skills/');  // ← 概念，未实现
const allSkills = [...coreSkills, ...pluginSkills];
```

**问题**: `loadPluginSkills()` 从未实现，误导开发者。

**修改为**:
```markdown
## Skill 激活机制

Plugin skills 通过符号链接激活，用户可以选择启用哪些 skills：

1. 用户在 `.opencode/skill-registry.json` 配置启用状态
2. 运行 `sync-skills` 命令创建符号链接
3. OpenCode 扫描 `.opencode/skills/` 发现所有 skills

详见 `specs/031-plugin-skill-activation/` 获取完整设计。
```

#### M-002: plugin-manifest.json `skills_enabled` 字段

**位置**: `specs/030-plugin-architecture/data-model.md` line 347, `plugins/loader.js` line 256

**当前设计**:
```json
{
  "skills_enabled": ["vite-setup", "css-module-test"]
}
```

**问题**: 只记录元数据，不控制加载，与 `skill-registry.json` 的 `enabled` 字段语义重叠。

**修改为**:
```json
{
  "skills_available": ["vite-setup", "css-module-test"],
  "_comment": "启用状态由 .opencode/skill-registry.json 控制"
}
```

并在 data-model.md 标注 `skills_enabled` 为 **deprecated**。

#### M-003: 030 spec.md "Activation" 章节

**位置**: `specs/030-plugin-architecture/spec.md` lines 220-229

**当前设计**: 描述未实现的自动加载机制

**修改为**: 引用 031 的用户选择激活机制

### 需要弃用的 030 元素

| 元素 | 位置 | 原因 | 替代方案 |
|------|------|------|---------|
| `loadPluginSkills()` 概念 | PLUGIN-SPEC.md | 从未实现，误导性 | 031 的符号链接机制 |
| `skills_enabled` 字段语义 | plugin-manifest.json | 只记录不控制，冗余 | skill-registry.json 的 `enabled` |
| "自动合并" 描述 | spec.md, PLUGIN-SPEC.md | 未实现 | "用户选择激活" |

### 需要保持的 030 元素

| 元素 | 原因 |
|------|------|
| `plugins/registry.json` | Plugin 发现机制，仍然需要 |
| `plugins/{id}/plugin.json` | Plugin 元数据，仍然需要 |
| `templates/` 目录 | 复制模板机制，仍然有效 |
| `hooks/` 目录 | Hook 配置机制，仍然有效 |
| `loader.js list/install/uninstall` | CLI 命令，031 会增强 |

---

## References

- `specs/030-plugin-architecture/` - Plugin 架构基础
- `plugins/PLUGIN-SPEC.md` - Plugin 规格定义（需按 M-001 修改）
- `plugins/loader.js` - 当前 loader 实现
- `specs/030-plugin-architecture/data-model.md` - 需按 M-002 标注 deprecated
- OpenCode skill discovery mechanism (skills.mdx)