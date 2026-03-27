# Feature Spec: 011-m4-enhancement-kit

## Document Status
- **Feature ID**: `011-m4-enhancement-kit`
- **Version**: 1.0.0
- **Status**: Complete
- **Created**: 2026-03-28
- **Completed**: 2026-03-28
- **Author**: architect (via OpenCode agent)

---

## Background

README.md 定义了 **M4 可选增强**，包含 12 个高级 skills：

| 角色 | Skills |
|------|--------|
| architect | `interface-contract-design`, `migration-planning` |
| developer | `refactor-safely`, `dependency-minimization` |
| tester | `integration-test-design`, `flaky-test-diagnosis` |
| reviewer | `maintainability-review`, `risk-review` |
| docs | `architecture-doc-sync`, `user-guide-update` |
| security | `secret-handling-review`, `dependency-risk-review` |

### 设计原则

用户要求 M4 为**可选增强套件**：
1. **默认不启用** - 标准流程使用 MVP skills
2. **调用者选择** - 通过命令标志启用
3. **与 /spec 命令集成** - 通过 `--enhanced` 标志激活

---

## Goal

实现 M4 可选增强套件：

1. **创建 12 个 M4 skills** - 每个角色 2 个高级 skills
2. **设计增强套件机制** - 可选启用架构
3. **修改 /spec 系列命令** - 支持 `--enhanced` 标志
4. **建立文档** - 说明如何使用增强套件

---

## Scope

### In Scope

#### 1. M4 Skills 实现

**architect skills**:
- `interface-contract-design` - API/接口契约设计
- `migration-planning` - 数据/系统迁移规划

**developer skills**:
- `refactor-safely` - 安全重构方法论
- `dependency-minimization` - 依赖最小化

**tester skills**:
- `integration-test-design` - 集成测试设计
- `flaky-test-diagnosis` - 不稳定测试诊断

**reviewer skills**:
- `maintainability-review` - 可维护性审查
- `risk-review` - 技术风险评估

**docs skills**:
- `architecture-doc-sync` - 架构文档同步
- `user-guide-update` - 用户指南更新

**security skills**:
- `secret-handling-review` - 密钥处理审查
- `dependency-risk-review` - 依赖风险审查

#### 2. 增强套件机制

**标志设计**:
- `--enhanced` 或 `--m4` - 启用 M4 增强套件
- 环境变量: `OPCODE_ENHANCED=true`
- 配置文件: `.opencode/config.yml` 中 `enhanced: true`

**命令修改**:
- `/spec-start [--enhanced]` - 增强 spec 编写
- `/spec-plan [--enhanced]` - 增强规划
- `/spec-implement [--enhanced]` - 增强实现
- `/spec-audit [--enhanced]` - 增强审计

#### 3. 套件行为差异

| 场景 | MVP 模式 | Enhanced 模式 |
|------|----------|---------------|
| Spec 编写 | 标准 spec.md | + interface contract 草稿 |
| Plan 生成 | 标准 plan.md | + migration plan（如涉及） |
| 实现 | MVP skills | + refactor-safely 检查 |
| 测试 | unit test | + integration test 设计 |
| 审查 | code review | + maintainability + risk review |
| 安全 | auth/input review | + secret + dependency review |

#### 4. 文档更新

- README.md M4 章节 - 更新为"可选增强套件"
- `docs/enhanced-mode-guide.md` - 增强模式使用指南
- 每个增强 skill 的 SKILL.md

### Out of Scope

1. **不修改 MVP skills** - 003-008 保持不变
2. **不强制启用** - 永远保持可选
3. **不修改现有 artifacts 格式** - 保持向后兼容

---

## Business Rules

### BR-001: 默认 MVP 模式
不带 `--enhanced` 标志时，使用 MVP skills (003-008)，不调用 M4 skills。

### BR-002: 增强标志继承
在 feature 流程开始时使用 `--enhanced`，后续命令自动继承（除非显式取消）。

### BR-003: 增强套件可选
即使安装了 M4 skills，也不强制使用。调用者明确选择才启用。

### BR-004: MVP 优先
M4 skills 是 MVP 的**补充**，不是替代。MVP skills 始终可用。

### BR-005: 向后兼容
已有 feature 不受影响，除非显式使用 `--enhanced` 重新执行。

---

## Acceptance Criteria

### AC-001: 12 个 M4 skills 创建
`.opencode/skills/{role}/` 目录下存在 12 个 M4 skill 目录，每个包含 `SKILL.md`。

### AC-002: 命令支持 --enhanced 标志
5 个 `/spec-*` 命令支持 `--enhanced` 标志，能够识别并启用 M4 skills。

### AC-003: MVP 模式不受影响
不带 `--enhanced` 时，流程与之前完全一致，不调用 M4 skills。

### AC-004: Enhanced 模式正确激活
带 `--enhanced` 时，在适当场景调用相应的 M4 skills。

### AC-005: 增强模式文档完整
存在 `docs/enhanced-mode-guide.md`，说明如何使用增强套件。

### AC-006: README.md 更新
README.md M4 章节更新为"可选增强套件"，说明启用方式。

---

## Command Enhancement Design

### /spec-start --enhanced

**MVP 模式**:
```
1. 创建 specs/{feature}/spec.md
2. 定义 Goal, Scope, AC 等
```

**Enhanced 模式** (+):
```
1. 创建 specs/{feature}/spec.md
2. 定义 Goal, Scope, AC 等
3. (architect) interface-contract-design - 若涉及 API，生成接口契约草案
4. (architect) migration-planning - 若涉及数据迁移，生成迁移规划章节
```

### /spec-plan --enhanced

**MVP 模式**:
```
1. 创建 plan.md
2. 定义 implementation strategy
3. 分解 tasks
```

**Enhanced 模式** (+):
```
1. 创建 plan.md
2. 定义 implementation strategy
3. 分解 tasks
4. (architect) migration-planning - 若需要，生成迁移策略
5. (developer) dependency-minimization - 分析依赖优化点
```

### /spec-implement --enhanced

**MVP 模式**:
```
1. 实现 task
2. 自检
3. 运行测试
```

**Enhanced 模式** (+):
```
1. 实现 task
2. (developer) refactor-safely - 若涉及重构，执行安全重构检查
3. 自检
4. 运行测试
5. (tester) integration-test-design - 若需要集成测试
```

### /spec-tasks --enhanced

**MVP 模式**:
```
1. 读取 spec.md 和 plan.md
2. 生成 tasks.md
3. 定义任务依赖关系
```

**Enhanced 模式** (+):
```
1. 读取 spec.md 和 plan.md
2. 生成 tasks.md
3. 定义任务依赖关系
4. (architect) migration-planning - 若涉及迁移，添加迁移任务
5. (tester) integration-test-design - 若需要集成测试，添加集成测试任务
6. (security) dependency-risk-review - 分析依赖风险，添加审查任务
```

### /spec-audit --enhanced

**MVP 模式**:
```
1. Feature 内部完整性检查
2. Canonical 对齐检查
3. 路径解析验证
4. 状态真实性验证
5. README 同步检查
```

**Enhanced 模式** (+):
```
1. Feature 内部完整性检查
2. Canonical 对齐检查
3. 路径解析验证
4. 状态真实性验证
5. README 同步检查
6. (reviewer) maintainability-review - 可维护性评估
7. (reviewer) risk-review - 技术风险评估
8. (security) secret-handling-review - 若涉及敏感信息
9. (security) dependency-risk-review - 依赖安全审查
```

---

## Assumptions

### ASM-001: MVP skills 完整
MVP skills (003-008) 功能完整，M4 是真正的"增强"而非"修复"。

### ASM-002: 调用者理解增强场景
文档需要清楚说明何时使用 `--enhanced`。

### ASM-003: 命令解析支持标志
OpenCode 命令系统支持解析可选标志。

---

## Open Questions

### OQ-001: 标志命名？
**选项**:
- `--enhanced` - 语义清晰
- `--m4` - 简短
- `--extended` - 避免版本号

**推荐**: `--enhanced`（语义清晰，避免版本号耦合）

### OQ-002: 标志继承机制？
**选项**:
- 在 spec.md 中记录 `enhanced: true`
- 通过 `.opencode/.enhanced` 文件标记
- 每次命令独立指定

**推荐**: 在 `spec.md` metadata 中记录，后续命令自动识别

### OQ-003: 部分增强？
是否支持只启用部分 M4 skills（如只用 security 增强）？

**推荐**: 第一版支持全局 `--enhanced`，后续可扩展细粒度控制

---

## Implementation Phases

### Phase 1: 核心 Skills 实现
- 12 个 M4 SKILL.md 文件

### Phase 2: 命令增强
- 修改 5 个 `/spec-*` 命令支持 `--enhanced`

### Phase 3: 文档与测试
- enhanced-mode-guide.md
- README.md 更新
- 验证流程

---

## References

- `README.md` M4 章节
- `.opencode/commands/spec-*.md` - 现有命令
- `specs/003-architect-core/` - MVP architect skills
- `specs/004-developer-core/` - MVP developer skills
- `specs/005-tester-core/` - MVP tester skills
- `specs/006-reviewer-core/` - MVP reviewer skills
- `specs/007-docs-core/` - MVP docs skills
- `specs/008-security-core/` - MVP security skills

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial spec creation |