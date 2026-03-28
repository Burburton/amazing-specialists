# Implementation Plan: 016-release-preparation

## Document Status
- **Feature ID**: `016-release-preparation`
- **Version**: 1.0.0
- **Status**: In Progress
- **Created**: 2026-03-28

---

## Phase 1: 文档一致性检查结果

### 1.1 README.md Feature 表格

**当前状态**: ✅ 基本一致

README feature 表格包含 003-015 (13 个 features)。
实际 specs/ 目录包含 17 个 feature 目录 (001-016)。

**差异分析**:
- `001-bootstrap` - 早期引导 feature，无 completion-report，不在表格中 ✅ 正确
- `002-role-model-alignment` - 有 completion-report，不在表格中 ⚠️ 需确认
- `002b-governance-repair` - 有 completion-report，不在表格中 ⚠️ 需确认
- `016-release-preparation` - 进行中，不应在表格中 ✅ 正确

### 1.2 Skills 清单

**当前状态**: ✅ 一致

- README 声明: 37 个 skills (21 MVP + 16 M4)
- 实际 .opencode/skills/: 37 个 SKILL.md 文件 ✅ 匹配

### 1.3 Skills 分布

| 目录 | 实际数量 | README 声明 | 状态 |
|------|----------|-------------|------|
| common | 5 | 5 MVP | ✅ |
| architect | 5 | 3 MVP + 2 M4 | ✅ |
| developer | 5 | 3 MVP + 2 M4 | ✅ |
| tester | 9 | 3 MVP + 6 M4 | ✅ |
| reviewer | 5 | 3 MVP + 2 M4 | ✅ |
| docs | 4 | 2 MVP + 2 M4 | ✅ |
| security | 4 | 2 MVP + 2 M4 | ✅ |
| **总计** | **37** | **37** | ✅ |

---

## Phase 2: 临时/过渡产物扫描结果

### 2.1 需要处理的目录/文件

#### A. docs/infra/ - 早期设计文档
**状态**: 保留但整理

包含重要的早期设计文档，建议:
1. 保留核心设计文档作为参考
2. `docs/infra/feature/` 中的文件与 `specs/` 重复，考虑归档

| 文件 | 决定 | 理由 |
|------|------|------|
| OpenClaw 管理层调度设计.md | 保留 | 上层设计参考 |
| OpenCode 专家包设计.md | 保留 | 核心设计文档 |
| 全自动产品研发闭环_MVP设计稿.md | 保留 | 项目背景文档 |
| docs/infra/feature/*.md | 归档 | 与 specs/ 重复 |

#### B. docs/planning/ - 空目录
**状态**: 删除

空目录，无内容。

#### C. docs/api/auth.md
**状态**: 归档或删除

可能是早期示例或遗留文件，与当前项目无关。

#### D. specs/ 根目录验证报告
**状态**: 整理

```
specs/
├── common-skills-verification-report.md
├── m2-skills-integration-verification-report.md
├── m3-skills-integration-verification-report.md
├── skill-development-plan.md
```

建议: 保留在当前位置，因为这些是全局验证报告。

#### E. examples/ 根目录文件
**状态**: 整理

```
examples/
├── edge-cases.md
├── failure-cases.md
├── happy-path.md
```

建议: 移动到 `examples/00-general-examples/` 或保持现状。

---

## Phase 3: 文档整理计划

### 3.1 需要执行的清理操作

| 操作 | 文件/目录 | 理由 |
|------|-----------|------|
| 删除 | docs/planning/ | 空目录 |
| 归档 | docs/infra/feature/ | 与 specs/ 重复 |
| 归档 | docs/api/auth.md | 遗留文件 |
| 添加 | 002, 002b 到 README | 保持完整性 |

### 3.2 文档结构优化

当前结构基本合理，建议:
1. 保持 docs/infra/ 作为设计文档参考
2. 保持 specs/ 作为 feature 开发目录
3. 保持 examples/ 作为使用示例目录

---

## Phase 4: 发布验证检查清单

### 4.1 AH-001~AH-006 验证

| 规则 | 检查项 | 状态 |
|------|--------|------|
| AH-001 | Canonical Comparison | ⬜ 待验证 |
| AH-002 | Cross-Document Consistency | ⬜ 待验证 |
| AH-003 | Path Resolution | ⬜ 待验证 |
| AH-004 | Status Truthfulness | ⬜ 待验证 |
| AH-005 | README Governance Sync | ⬜ 待验证 |
| AH-006 | Enhanced Reviewer Responsibilities | ⬜ 待验证 |

### 4.2 发布前检查清单

- [ ] 所有 features 有正确的 status
- [ ] README.md feature 表格完整
- [ ] CHANGELOG.md 更新
- [ ] 无临时文件残留
- [ ] 文档链接有效
- [ ] Skills 数量正确 (37)
- [ ] Commands 正常工作 (5)

---

## 执行计划

### Step 1: 清理空目录
```bash
rm -rf docs/planning/
```

### Step 2: 归档重复文件
```bash
mkdir -p docs/archive/early-design/
mv docs/infra/feature/ docs/archive/early-design/
mv docs/api/ docs/archive/early-design/
```

### Step 3: 更新 README.md
添加 002 和 002b features 到表格。

### Step 4: 验证 governance
运行 AH-001~AH-006 验证。

### Step 5: 生成发布报告