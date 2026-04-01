# Spec: 032-workflow-extensibility-enhancements

## Metadata

| Field | Value |
|-------|-------|
| Feature ID | 032-workflow-extensibility-enhancements |
| Feature Name | Workflow Extensibility Enhancements |
| Status | Complete |
| Created | 2026-04-01 |
| Source | `specs/001-initial-ui/openclaw-workflow-validation-report.md` |
| Milestone | M032 |

## Overview

### Goal

增强专家包的可扩展性，支持项目级定制和自动化测试执行，使专家包能够更好地适配不同项目的差异化需求。

### Background

通过 `amazing-specialist-face` 项目的 OpenClaw 工作流测试（T-005 Layout 组件开发），发现以下改进点：

1. **Issue Template 不完整** - 缺少 `project_id`、`verification_steps[]` 等结构化字段
2. **环境限制** - 无法运行 `npm run build` / `npm test`
3. **缺少自动化测试执行** - tester 只创建测试，未实际运行

### Problem

当前专家包的扩展机制不足以支持项目级定制：

| 问题 | 当前状态 | 影响 |
|------|----------|------|
| Body Parser 硬编码 | Section 格式固定，不支持项目定制 | 无法支持不同的 Issue Template 格式 |
| Plugin 无执行能力 | Plugin 只提供配置和测试模式，不提供执行命令 | tester 无法运行测试 |
| Tester Skill 不完整 | Step 6 (运行验证) 描述过于简单 | 测试执行流程不明确 |

### Solution

分层扩展专家包的可定制性：

```
┌─────────────────────────────────────────────────────────────┐
│ 项目层                                                       │
│ - 项目特定 Issue Template                                    │
│ - CI/CD 配置                                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓ 配置
┌─────────────────────────────────────────────────────────────┐
│ Adapter 扩展层                                               │
│ - Body Parser 可配置 section                                │
│ - Template → Command 映射                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓ 加载
┌─────────────────────────────────────────────────────────────┐
│ Plugin 层                                                    │
│ - Commands 配置 (build/test/lint)                           │
│ - 执行 Skills (run-tests, run-build)                        │
└─────────────────────────────────────────────────────────────┘
                              ↓ 指导
┌─────────────────────────────────────────────────────────────┐
│ 核心层                                                       │
│ - Tester Skill Step 6 增强                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Scope

### In Scope

| ID | 组件 | 改进项 | 优先级 | 描述 |
|----|------|--------|--------|------|
| R1 | Adapter | Body Parser 可配置 section | High | 支持项目定制 Issue Body 格式 |
| R2 | Adapter | Template → Command 映射 | Medium | Issue Template 名称映射到执行命令 |
| R3 | Plugin | Commands 配置规范 | High | Plugin 提供 build/test/lint 命令配置 |
| R4 | Plugin | 执行 Skills | High | Plugin 提供 run-tests, run-build skills |
| R5 | Core | Tester Skill Step 6 增强 | Medium | 增强测试执行指导 |

### Out of Scope

| ID | Item | Reason |
|----|------|--------|
| CI/CD 集成 | 项目层实现 | 专家包提供能力，项目配置 CI/CD |
| Issue Template 内容 | 项目层实现 | 专家包提供扩展机制，项目定制模板 |
| Webhook 集成 | 独立 Feature | 属于 OpenClaw 管理层能力 |

---

## Requirements

### R1: Body Parser 可配置 Section

**Problem**: Body Parser 硬编码 section 格式，不支持项目定制。

**Current State**:
```javascript
// body-parser.js
const EXPECTED_SECTIONS = [
  'Context', 'Goal', 'Constraints', 'Inputs', 'Expected Outputs'
];
```

**Solution**: 支持可配置的 section 解析。

**Acceptance Criteria**:
- [ ] `github-issue.config.json` 新增 `body_parser_config.sections` 配置
- [ ] 支持 `required`, `recommended`, `optional` section 分类
- [ ] 支持 section 名称映射到 Dispatch Payload 字段
- [ ] 向后兼容：默认配置保持现有行为
- [ ] 单元测试覆盖配置解析逻辑

**Configuration Schema**:
```json
{
  "github_config": {
    "body_parser_config": {
      "sections": {
        "required": ["Goal"],
        "recommended": ["Context", "Expected Outputs"],
        "optional": ["Constraints", "Inputs", "Acceptance Criteria", "Verification Steps"],
        "mapping": {
          "Context": "context.task_scope",
          "Goal": "goal",
          "Constraints": "constraints",
          "Inputs": "inputs",
          "Expected Outputs": "expected_outputs",
          "Acceptance Criteria": "verification_steps",
          "Verification Steps": "verification_steps"
        }
      }
    }
  }
}
```

---

### R2: Template → Command 映射

**Problem**: Issue Template 名称无法自动映射到执行命令。

**Current State**: 无 Template 解析机制，依赖 `command:` label 指定命令。

**Solution**: 根据 Issue Template 名称推断默认命令。

**Acceptance Criteria**:
- [ ] `github-issue.config.json` 新增 `template_mapping` 配置
- [ ] 从 Issue 的 `body` 或 `labels` 推断 Template 类型
- [ ] Template 名称映射到默认 command
- [ ] 显式 `command:` label 优先级高于 Template 映射
- [ ] 单元测试覆盖映射逻辑

**Configuration Schema**:
```json
{
  "github_config": {
    "template_mapping": {
      "task.md": "implement-task",
      "bug.md": "bugfix-workflow",
      "design.md": "design-task",
      "refactor.md": "refactor-task"
    }
  }
}
```

---

### R3: Plugin Commands 配置规范

**Problem**: Plugin 无法提供技术栈特定的构建/测试命令。

**Current State**: Plugin 提供 skills 和 templates，但不提供执行命令。

**Solution**: 在 `plugin.json` 新增 `commands` 配置字段。

**Acceptance Criteria**:
- [ ] `PLUGIN-SPEC.md` 增加 `commands` 字段规范
- [ ] `plugin.json` 支持配置 build/test/lint 命令
- [ ] 支持命令参数和环境变量
- [ ] 向后兼容：无 commands 配置时使用默认值

**Configuration Schema**:
```json
{
  "id": "vite-react-ts",
  "commands": {
    "build": {
      "cmd": "npm run build",
      "env": {},
      "description": "Build for production"
    },
    "test": {
      "cmd": "npm test",
      "env": { "CI": "true" },
      "description": "Run unit tests"
    },
    "lint": {
      "cmd": "npm run lint",
      "description": "Run linter"
    }
  }
}
```

---

### R4: Plugin 执行 Skills

**Problem**: Plugin 无法执行构建/测试命令。

**Current State**: Plugin 提供 `css-module-test` 等测试模式指导，但不提供执行能力。

**Solution**: Plugin 提供 `run-tests`, `run-build` skills。

**Acceptance Criteria**:
- [ ] `vite-react-ts` Plugin 新增 `run-tests` skill
- [ ] `vite-react-ts` Plugin 新增 `run-build` skill
- [ ] Skill 读取 `plugin.json` 的 `commands` 配置
- [ ] 支持测试结果解析和报告生成
- [ ] 错误处理：命令不存在、执行失败等

**Skill Structure**:
```
plugins/vite-react-ts/skills/
├── run-tests/
│   └── SKILL.md
└── run-build/
    └── SKILL.md
```

---

### R5: Tester Skill Step 6 增强

**Problem**: `tester/unit-test-design` Step 6 (运行验证) 描述过于简单。

**Current State**:
```markdown
### Step 6: 运行验证
1. 运行所有测试
2. 确保全部通过
3. 检查覆盖率
4. 修复问题
```

**Solution**: 增强 Step 6 的详细指导，包括测试执行流程。

**Acceptance Criteria**:
- [ ] Step 6 细化为 4 个子步骤
- [ ] 包含测试命令检测逻辑
- [ ] 包含 Plugin skill 调用指导
- [ ] 包含测试结果解析指导
- [ ] 包含 verification-report 生成指导

**Enhanced Step 6**:
```markdown
### Step 6: 运行验证

#### 6.1 检测测试命令
- 检查 `package.json` 的 `test` 脚本
- 或使用 Plugin 提供的 `commands.test`
- 记录检测到的命令

#### 6.2 执行测试
- 调用 Plugin skill: `run-tests` (如果可用)
- 或手动执行测试命令: `npm test`
- 捕获测试输出

#### 6.3 解析结果
- 解析测试输出（Vitest/Jest/pytest 格式）
- 提取通过/失败数量
- 计算覆盖率

#### 6.4 生成报告
- 生成 verification-report (TC-001)
- 记录测试结果、覆盖率、发现的问题
```

---

## Architecture

### Component Changes

```
adapters/github-issue/
├── body-parser.js           # 修改：支持可配置 section
├── issue-parser.js          # 修改：支持 template_mapping
├── github-issue.config.json # 修改：新增配置项
└── tests/
    └── body-parser.test.js  # 新增：配置解析测试

plugins/vite-react-ts/
├── plugin.json              # 修改：新增 commands 字段
└── skills/
    ├── run-tests/           # 新增
    │   └── SKILL.md
    └── run-build/           # 新增
        └── SKILL.md

.opencode/skills/tester/unit-test-design/
└── SKILL.md                 # 修改：Step 6 增强
```

### Data Flow

```
Issue Body
    │
    ├── body-parser.js (读取 body_parser_config.sections)
    │
    ├── 解析可配置的 sections
    │
    └── 映射到 Dispatch Payload 字段

Issue Template
    │
    ├── issue-parser.js (读取 template_mapping)
    │
    ├── 推断 Template 类型
    │
    └── 映射到默认 command

Plugin Commands
    │
    ├── plugin.json (commands 配置)
    │
    ├── run-tests skill (读取 commands.test)
    │
    └── 执行测试命令
```

---

## Actors

| Actor | Role | Responsibility |
|-------|------|----------------|
| Adapter Layer | 扩展机制提供者 | 提供可配置的 section 解析和 template 映射 |
| Plugin Layer | 技术栈能力提供者 | 提供执行命令配置和 skills |
| Core Layer | 方法论指导者 | 提供测试执行流程指导 |
| Project | 定制实现者 | 定义项目特定的 Issue Template 和 CI/CD |

---

## Non-functional Requirements

### NFR-001: Backward Compatibility
- 现有配置文件无需修改即可工作
- 新配置项有合理默认值
- Body Parser 默认行为保持不变

### NFR-002: Extensibility
- 配置驱动的扩展，无需修改代码
- Plugin 可自定义 section 和 commands
- 项目可覆盖默认配置

### NFR-003: Performance
- 配置解析开销 < 10ms
- 不影响现有 adapter 性能

---

## Acceptance Criteria

### Feature Level

- [ ] Body Parser 支持可配置 section
- [ ] Template → Command 映射生效
- [ ] Plugin 可配置 commands
- [ ] Plugin 提供 run-tests, run-build skills
- [ ] Tester Skill Step 6 增强
- [ ] 所有单元测试通过
- [ ] 文档更新完成

---

## Assumptions

1. 项目使用 GitHub Issue 作为任务入口
2. Plugin 已安装并激活
3. 测试命令在 `package.json` 中定义

---

## Open Questions

1. **Template 推断方式**: 如何从 Issue 推断使用的 Template？
   - 选项 A: 从 Issue body 结构推断
   - 选项 B: 从 label 推断
   - 选项 C: 依赖用户显式指定

2. **Commands 优先级**: 多个 Plugin 都提供 commands 时如何选择？
   - 当前设计：只有一个 Plugin 处于 active 状态

3. **测试结果格式**: 不同测试框架输出格式不同，如何统一解析？
   - Vitest/Jest: JSON reporter
   - pytest: JSON report plugin
   - go test: JSON output

---

## References

- `specs/001-initial-ui/openclaw-workflow-validation-report.md` - 问题来源
- `adapters/github-issue/body-parser.js` - 当前实现
- `plugins/PLUGIN-SPEC.md` - Plugin 规范
- `.opencode/skills/tester/unit-test-design/SKILL.md` - Tester Skill