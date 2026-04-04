# Implementation Plan: README Quick Start and Doc Unification

## Metadata
- Feature ID: 038-readme-quick-start-and-doc-unification
- Version: 1.0.0
- Based on: spec.md v1.0.0
- Created: 2026-04-04

---

## Implementation Strategy

**策略**: 文档结构调整为主，保持现有内容不变

- README 修改：插入新章节，调整顺序，不删除现有内容
- skills-usage-guide 修改：仅更新计数口径和标题
- 低风险变更：无代码修改，仅文档

---

## Phases

### Phase 1: README Quick Start 添加
- 目标：在 README 顶部添加 "30秒快速入门" 章节
- 风险：低（纯新增，不影响现有结构）
- 角色：docs

### Phase 2: README 文档导航添加
- 目标：添加 "文档导航" 章节，统一入口
- 风险：低（纯新增）
- 角色：docs

### Phase 3: Skills 计数统一
- 目标：README 和 skills-usage-guide 使用相同计数口径
- 风险：低（数字修正）
- 角色：docs

### Phase 4: 验证
- 目标：验证 AC-001~AC-004
- 风险：低
- 角色：reviewer

---

## Architecture Summary

### 文件变更清单

| 文件 | 变更类型 | 变更内容 |
|------|----------|----------|
| `README.md` | modified | 添加 Quick Start 章节（约 15 行） |
| `README.md` | modified | 添加文档导航章节（约 20 行） |
| `README.md` | modified | 更新 Skills 计数口径 |
| `docs/skills-usage-guide.md` | modified | 更新标题和计数口径 |

### README 结构变更

```diff
# OpenCode 专家包 - 全自动产品研发闭环执行层

## What It Is
...

+ ## 30秒快速入门
+ 
+ ```bash
+ # 初始化新项目
+ node templates/cli/init.js ./my-project
+ 
+ # 开始第一个 feature
+ /spec-start hello-world
+ 
+ # 查看最小示例
+ 查看 examples/01-quick-start/minimal-example.md
+ ```

## What Problem It Solves
...

+ ## 文档导航
+ 
+ | 阅读顺序 | 文档 | 用途 |
+ |----------|------|------|
+ | 新手第一步 | [30秒快速入门](#30秒快速入门) | 初始化项目 |
+ | 新手第二步 | [examples/01-quick-start/](examples/01-quick-start/) | 最小示例 |
+ | 进阶使用 | [docs/skills-usage-guide.md](docs/skills-usage-guide.md) | 23 个 MVP Skills 使用方法 |
+ | Enhanced 模式 | [docs/enhanced-mode-guide.md](docs/enhanced-mode-guide.md) | 16 个 M4 Skills 启用方法 |
+ | Plugin 扩展 | [docs/plugin-usage-guide.md](docs/plugin-usage-guide.md) | 技术栈特定能力 |
+ | Adapter 集成 | [docs/adapters/adapter-usage-guide.md](docs/adapters/adapter-usage-guide.md) | 外部系统集成 |
+ | Template 使用 | [templates/USAGE.md](templates/USAGE.md) | 模板初始化/升级 |
+ | 深度参考 | [specs/](specs/) | Feature 开发记录和验证报告 |

## Included Components
...
```

### Skills 计数口径定义

**统一口径**（所有文档使用）：

| 分类 | 数量 | 包含 Skills |
|------|------|-------------|
| MVP 核心 | 23 | common(5) + architect(3) + developer(3) + tester(3) + reviewer(3) + docs(3) + security(2) |
| M4 增强 | 16 | interface-contract-design, migration-planning, refactor-safely, dependency-minimization, integration-test-design, flaky-test-diagnosis, performance-test-design, benchmark-analysis, load-test-orchestration, performance-regression-analysis, maintainability-review, risk-review, architecture-doc-sync, user-guide-update, secret-handling-review, dependency-risk-review |
| Plugin | 4 | vite-setup, css-module-test, run-tests, run-build |
| **总计** | **43** | MVP + M4 + Plugin |

---

## Tasks

### T-1.1: README Quick Start 章节添加
- 角色: docs
- 输入: spec.md, minimal-example.md
- 输出: README.md（新增章节）
- 验收: AC-001, AC-004

### T-2.1: README 文档导航章节添加
- 角色: docs
- 输入: spec.md, 现有文档列表
- 输出: README.md（新增章节）
- 验收: AC-002

### T-3.1: README Skills 计数更新
- 角色: docs
- 输入: plan.md 计数定义
- 输出: README.md（计数修正）
- 验收: AC-003

### T-4.1: skills-usage-guide 计数修正
- 角色: docs
- 输入: plan.md 计数定义
- 输出: skills-usage-guide.md（标题和计数修正）
- 验收: AC-003

### T-5.1: 验证文档一致性
- 角色: reviewer
- 输入: README.md, skills-usage-guide.md, spec.md
- 输出: verification-report.md
- 验收: AC-001~AC-004

---

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| `templates/cli/init.js` | 存在 | ✅ 确认存在 |
| `examples/01-quick-start/minimal-example.md` | 存在 | ✅ 确认存在 |
| `docs/skills-usage-guide.md` | 存在 | ✅ 确认存在 |

---

## Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Quick Start 命令过时 | Low | Medium | 与 Template CLI 保持同步，定期检查 |
| 文档链接失效 | Low | Low | 使用相对路径，编辑时验证 |
| 计数口径再次漂移 | Medium | Low | 在 spec.md 中固化口径定义 |

---

## Estimated Effort

| Task | Effort | Complexity |
|------|--------|------------|
| T-1.1 | 15 min | Low |
| T-2.1 | 10 min | Low |
| T-3.1 | 5 min | Low |
| T-4.1 | 5 min | Low |
| T-5.1 | 10 min | Low |
| **Total** | **45 min** | **Low** |

---

## Rollback Plan

如果变更导致问题：
1. 使用 git revert 撤销 README.md 和 skills-usage-guide.md 变更
2. 无代码变更，无系统影响

---

## Next Command

执行 `/spec-tasks 038-readme-quick-start-and-doc-unification` 生成详细任务列表。