# AGENTS.md

## Development Mode
This repository is expert-pack driven and spec-driven.
All feature work must follow the artifacts under `specs/<feature>/`.
All package-level decisions must follow the governance documents in the repository root.

## Package Governance Source of Truth
Priority order for package governance:
1. `package-spec.md`
2. `role-definition.md`
3. `io-contract.md`
4. `quality-gate.md`
5. `collaboration-protocol.md`
6. `package-lifecycle.md`

## Feature Implementation Source of Truth
Priority order for feature work:
1. `specs/<feature>/spec.md`
2. `specs/<feature>/plan.md`
3. `specs/<feature>/data-model.md`
4. `specs/<feature>/contracts/*`
5. `specs/<feature>/tasks.md`

## Global Rules
- Do not invent product requirements beyond the spec.
- Do not invent package capabilities beyond the package spec.
- If information is missing, record it under `Assumptions` or `Open Questions`.
- Prefer explicit conflict reports over silent interpretation.
- Use canonical terms consistently.
- Preserve traceability from package governance -> feature spec -> plan -> task -> code -> validation.

## Role Semantics Priority（角色语义优先规则）

### 正式模型优先

本仓库采用 **6-role 正式执行层语义**：
- `architect`（架构师）
- `developer`（开发者）
- `tester`（测试员）
- `reviewer`（审查员）
- `docs`（文档员）
- `security`（安全员）

当提及角色、actor、执行者时，**优先使用 6-role 术语**。

### 3-Skill 过渡骨架已归档

早期 **3-skill 过渡骨架**已归档到 `docs/archive/legacy-skills/`（2026-03-28）：
- `spec-writer` → architect + docs 角色协作
- `architect-auditor` → architect + reviewer 角色分工
- `task-executor` → developer + tester + docs + security 角色分工

> **注意**: 3-skill 已归档，不应在新开发中使用。使用 6-role skills 替代。详见 `specs/010-3-skill-migration/`。

### Feature 命名规范

后续 feature、artifact、actor 描述**必须使用 6-role 术语**：
- ✅ 推荐：`003-architect-core`, `004-developer-core`, `005-tester-core`, ...
- ❌ 避免：`003-spec-writer-core`, `004-architect-auditor-v2`, `005-task-executor-enhancement`, ...

### 语义冲突解决

若不同文档间出现角色语义冲突：
- **以 `package-spec.md` + `role-definition.md` 中的 6-role 定义为准**
- 3-skill 相关表述应理解为 "legacy compatibility" 而非正式语义
- 冲突应通过 governance repair feature 解决，而非 silent reinterpretation

### Completion Report Consistency

- completion-report 声称已完成的治理更新，必须与仓库当前内容一致
- 若不一致，应通过后续 feature（如 002b-governance-repair）修复并建立可追溯关系
- 不允许长期漂移（drift）

### 参考文档

- `role-definition.md` - 6-role 详细定义
- `package-spec.md` - 正式模型与角色说明
- `docs/archive/legacy-skills/README.md` - 3-skill 归档说明

## Package Rules
- Do not change role boundaries silently.
- Do not change I/O contract semantics silently.
- If changing package behavior, update governance docs first.
- Keep package responsibilities explicit and narrow.

## Governance Sync Rule（治理文档同步规则）

### Scope
以下类型的 feature 变更必须在完成前同步到公共文档：
- package governance（包治理规则、接口契约）
- role model semantics（角色定义、角色边界、角色映射）
- workflow ordering（工作流程、阶段顺序）
- command semantics（命令行为、输入输出格式）
- migration strategy（迁移策略、过渡方案）

### Required Action
在判定 feature 完成之前，必须：
1. 检查 `README.md` 是否需要更新
2. 检查 `package-spec.md` 是否需要更新
3. 检查 `role-definition.md` 是否需要更新
4. 检查 `AGENTS.md` 是否需要更新
5. 确保所有 governance 文档之间的一致性

### Completion Criteria
> 如果 feature 改变了上述 scope 中的任何一项，而公共文档（特别是 `README.md`）未同步更新，则该 feature **不能视为完成**。

## Audit Hardening Rule（审计强化规则）

### Background
`003-architect-core` 暴露了现有审计体系过于关注 feature-level completion 而忽略 repository-level governance consistency 的问题。本规则强制要求所有 feature audit 必须执行 governance alignment check。

### Audit Requirements

所有 `/spec-audit` 必须执行以下检查：

#### 1. Mandatory Canonical Comparison (AH-001)
- **必须对照的规范文档**：`role-definition.md`, `package-spec.md`, `io-contract.md`, `quality-gate.md`, `README.md`
- **规则**：若 canonical 文档与 feature 文档冲突，必须报告为 finding，不得静默忽略
- **严重级别**：canonical 冲突至少为 **major**

#### 2. Cross-Document Consistency (AH-002)
- **检查项**：流程顺序、角色边界、阶段状态、术语一致性
- **规则**：不仅检查"文件存在"，还要检查"同一事实在不同文档中的表述是否一致"
- **严重级别**：状态描述冲突至少为 **major**

#### 3. Path Resolution (AH-003)
- **规则**：`spec.md`, `plan.md`, `tasks.md`, `completion-report.md` 中声明的关键交付路径必须能 resolve 到真实文件
- **严重级别**：路径声明错误（即使文件存在但路径写错）= **major**

#### 4. Status Truthfulness (AH-004)
- **规则**：completion-report 中的 partial/known gaps 必须在 README 中同步披露
- **禁止**：把 "Substantially Complete with Known Gaps" 误报为 "Fully Complete"
- **严重级别**：partial gap 未同步披露 = **major**

#### 5. README Governance Status (AH-005)
- **规则**：README 不只是介绍页，当承担流程定义、阶段状态、角色模型说明时，属于治理文档
- **要求**：feature 审计必须检查 README 是否因本次交付而需要同步更新
- **严重级别**：README 状态误导 = **major**

#### 6. Reviewer Enhanced Responsibilities (AH-006)
- **规则**：reviewer 不仅要检查"做没做"，还要检查"是否与仓库治理基线保持一致"
- **额外检查**：
  - spec vs implementation
  - feature vs canonical governance docs
  - completion-report vs README state narrative
  - tasks declared outputs vs actual repository outputs

#### 7. Version Declarations Synchronized (AH-007)
- **规则**：所有版本声明必须同步更新
- **检查项**：`package.json`, `CHANGELOG.md`, `contracts/pack/pack-version.json`, `templates/pack/pack-version.json`
- **严重级别**：版本不同步 = **major**
- **参考**：`VERSIONING.md` Section "Version Sync Rules"

#### 8. CHANGELOG Reflects Release (AH-008)
- **规则**：每次发布必须有 CHANGELOG 条目
- **检查项**：Added/Changed/Deprecated/Removed/Fixed 部分
- **严重级别**：缺失 CHANGELOG 条目 = **major**

#### 9. Compatibility Matrix Updated (AH-009)
- **规则**：MAJOR 发布必须更新 `compatibility-matrix.json`
- **检查项**：版本历史、兼容性状态、迁移路径
- **严重级别**：MAJOR 发布未更新 = **major**
- **参考**：`VERSIONING.md` Section "Compatibility Matrix"

### Findings Severity

审计发现必须使用以下严重级别：

| 级别 | 定义 | 示例 |
|------|------|------|
| **blocker** | 必须修复，阻塞 milestone | 伪造验证结果、根本性治理冲突 |
| **major** | 影响下游或造成理解偏差 | canonical 冲突、README 误导、路径错误 |
| **minor** | 轻微问题 | 术语轻微不统一 |
| **note** | 信息性 | 建议、观察 |

### Audit Template

使用 `docs/templates/audit-checklist-template.md` 作为标准审计清单。

### References
- `docs/audit-hardening.md` - 完整审计强化规范
- `quality-gate.md` Section 2.2 - 审计严重级别定义
- `role-definition.md` Section 4 - reviewer 增强职责
- `.opencode/commands/spec-audit.md` - 增强后的审计命令

## Feature Rules
- Do not implement a feature unless `spec.md` and `plan.md` exist.
- Every code change must map to at least one task in `tasks.md`.
- Every completed task must be validated against acceptance criteria or derived tests.
- Implement one task at a time unless explicitly marked parallel-safe.

## OpenCode Platform Adaptation（OpenCode 平台适配）

### Background

OpenCode 平台不支持 `task(subagent_type="tester")` 语法，需要通过 `category` + `load_skills` 参数实现角色派发。Platform Adapter 提供统一抽象来解决此问题。

### Role → Category Mapping

| Role | Category | Default Skills |
|------|----------|----------------|
| architect | deep | architect/requirement-to-design, architect/module-boundary-design, architect/tradeoff-analysis |
| developer | unspecified-high | developer/feature-implementation, developer/bugfix-workflow, developer/code-change-selfcheck |
| tester | unspecified-high | tester/unit-test-design, tester/regression-analysis, tester/edge-case-matrix |
| reviewer | unspecified-high | reviewer/code-review-checklist, reviewer/spec-implementation-diff, reviewer/reject-with-actionable-feedback |
| docs | writing | docs/readme-sync, docs/changelog-writing, docs/issue-status-sync |
| security | unspecified-high | security/auth-and-permission-review, security/input-validation-review |

### Correct Usage

```typescript
// ❌ WRONG: subagent_type not supported
task(subagent_type="tester", prompt="Run tests...")

// ✅ CORRECT: Use category + load_skills
task(
  category="unspecified-high",
  load_skills=["tester/unit-test-design", "tester/regression-analysis", "tester/edge-case-matrix"],
  prompt="Run tests..."
)
```

### Runtime API

使用 `getPlatformAdapter()` 自动获取 category 和 skills：

```typescript
import { getPlatformAdapter } from './adapters/platform/runtime';

const adapter = getPlatformAdapter('opencode');

// 自动获取 category 和 skills
const category = adapter.mapRoleToCategory('tester');  // 'unspecified-high'
const skills = adapter.getDefaultSkills('tester');      // ['tester/unit-test-design', ...]

// 派发任务
task(
  category=category,
  load_skills=skills,
  prompt="Run tests..."
)
```

### Available Exports

```typescript
import { 
  getPlatformAdapter,    // 获取 adapter 实例
  getSupportedPlatforms, // 获取支持的 platform 列表
  clearCache,            // 清除缓存
  setProjectRoot,        // 设置项目根目录
  PlatformNotSupportedError,
  ConfigLoadError,
  InvalidRoleError
} from './adapters/platform/runtime';
```

### Customization

**项目级覆盖**：创建 `.opencode/platform-override.json` 文件覆盖默认映射。

**Plugin 扩展**：在 `plugin.json` 中添加 `platform_mapping` 字段扩展特定角色的 skills。

详见 `docs/platform-adapter-guide.md`。

## Execution Discipline
Always summarize:
- what was changed
- which file(s) were changed
- which task or governance update was performed
- what validation was run
- what risks, blockers, or assumptions remain
