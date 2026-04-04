# Tasks: README Quick Start and Doc Unification

## Metadata
- Feature ID: 038-readme-quick-start-and-doc-unification
- Version: 1.0.0
- Based on: plan.md v1.0.0
- Created: 2026-04-04

---

## Task List

### Phase 1: README Quick Start

| Task ID | Description | Role | Status | Acceptance Criteria |
|---------|-------------|------|--------|---------------------|
| T-1.1 | 在 README.md "What It Is" 之后插入 "30秒快速入门" 章节 | docs | ✅ COMPLETED | AC-001: README 前 50 行可见 Quick Start |
| T-1.2 | 验证 Quick Start 命令可执行 | reviewer | ✅ COMPLETED | AC-004: 命令可执行 |

### Phase 2: README 文档导航

| Task ID | Description | Role | Status | Acceptance Criteria |
|---------|-------------|------|--------|---------------------|
| T-2.1 | 在 README.md "What Problem It Solves" 之后插入 "文档导航" 章节 | docs | ✅ COMPLETED | AC-002: 文档导航完整 |

### Phase 3: Skills 计数统一

| Task ID | Description | Role | Status | Acceptance Criteria |
|---------|-------------|------|--------|---------------------|
| T-3.1 | 更新 README.md Skills 计数口径（使用 23 MVP + 16 M4 + 4 Plugin） | docs | ✅ COMPLETED | AC-003: 计数一致 |
| T-3.2 | 更新 skills-usage-guide.md 标题和计数口径 | docs | ✅ COMPLETED | AC-003: 计数一致 |

### Phase 4: 验证

| Task ID | Description | Role | Status | Acceptance Criteria |
|---------|-------------|------|--------|---------------------|
| T-4.1 | 验证 README 结构正确（Quick Start 在前 50 行） | reviewer | ✅ COMPLETED | AC-001 |
| T-4.2 | 验证文档导航链接有效 | reviewer | ✅ COMPLETED | AC-002 |
| T-4.3 | 验证 Skills 计数在 README 和 skills-usage-guide 一致 | reviewer | ✅ COMPLETED | AC-003 |
| T-4.4 | 创建 verification-report.md | docs | ✅ COMPLETED | - |

---

## Task Details

### T-1.1: README Quick Start 章节添加

**输入**:
- `README.md` 当前内容
- `examples/01-quick-start/minimal-example.md` 作为参考

**处理步骤**:
1. 定位 README.md 中 "## What It Is" 章节结束位置
2. 在其后插入 "## 30秒快速入门" 章节
3. 内容包含：
   - 初始化命令
   - 开始 feature 命令
   - 最小示例链接

**输出**:
- README.md（新增约 15 行）

**验证**:
- AC-001: README 前 50 行可见 "30秒快速入门"

---

### T-2.1: README 文档导航章节添加

**输入**:
- `README.md` 当前内容
- 主要文档列表

**处理步骤**:
1. 定位 README.md 中 "## What Problem It Solves" 章节结束位置
2. 在其后插入 "## 文档导航" 章节
3. 内容包含：
   - 阅读顺序表格
   - 各文档用途描述
   - 相对路径链接

**输出**:
- README.md（新增约 20 行）

**验证**:
- AC-002: 文档导航章节包含所有主要文档链接

---

### T-3.1: README Skills 计数更新

**输入**:
- plan.md 计数定义

**处理步骤**:
1. 定位 README.md 中 Skills 计数相关内容
2. 更新为统一口径：
   - MVP 核心: 23 个
   - M4 增强: 16 个
   - Plugin: 4 个
   - 总计: 43 个

**输出**:
- README.md（计数修正）

**验证**:
- AC-003: 计数与 skills-usage-guide 一致

---

### T-3.2: skills-usage-guide 计数修正

**输入**:
- plan.md 计数定义
- `docs/skills-usage-guide.md` 当前内容

**处理步骤**:
1. 更新标题：从 "21 个 Skills" 改为 "23 个 MVP 核心 Skills"
2. 更新概述章节的计数
3. 更新快速参考卡片章节的计数

**输出**:
- skills-usage-guide.md（标题和计数修正）

**验证**:
- AC-003: 计数与 README 一致

---

### T-4.1~T-4.4: 验证任务

**输入**:
- README.md（变更后）
- skills-usage-guide.md（变更后）
- spec.md（验收标准）

**处理步骤**:
1. 检查 README 前 50 行是否包含 Quick Start
2. 检查文档导航链接是否有效
3. 对比 README 和 skills-usage-guide 的 Skills 计数
4. 创建 verification-report.md

**输出**:
- verification-report.md

---

## Execution Order

```
T-1.1 (docs) ──────────────────────────────────────► T-1.2 (reviewer)
                                                         │
T-2.1 (docs) ──────────────────────────────────────►    │
                                                         │
T-3.1 (docs) ──────────────────────────────────────►    │
                                                         │
T-3.2 (docs) ──────────────────────────────────────►    │
                                                         ▼
                                           T-4.1~T-4.4 (reviewer + docs)
```

**并行可能性**:
- T-1.1, T-2.1, T-3.1 可并行执行（同文件不同位置）
- T-3.2 独立文件，可并行执行

---

## Summary

| Phase | Tasks | Parallelizable | Estimated Time |
|-------|-------|----------------|----------------|
| Phase 1 | 2 | No | 20 min |
| Phase 2 | 1 | Yes (with Phase 1) | 10 min |
| Phase 3 | 2 | Yes (with Phase 1) | 10 min |
| Phase 4 | 4 | No | 15 min |
| **Total** | **9** | **Partially** | **55 min** |

---

## Next Command

执行 `/spec-implement 038-readme-quick-start-and-doc-unification T-1.1` 开始实现。