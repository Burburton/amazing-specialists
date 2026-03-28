# Task List: 012-performance-testing-skills

## 任务状态总览

| Task ID | 描述 | 角色 | 状态 | 依赖 |
|---------|------|------|------|------|
| T-1.1 | 创建 performance-test-design 目录 | developer | ✅ COMPLETE | - |
| T-1.2 | 实现 SKILL.md | developer | ✅ COMPLETE | T-1.1 |
| T-1.3 | 创建 examples/ | developer | ✅ COMPLETE | T-1.2 |
| T-1.4 | 创建 anti-examples/ | developer | ✅ COMPLETE | T-1.2 |
| T-1.5 | 创建 checklists/ | developer | ✅ COMPLETE | T-1.2 |
| T-2.1 | 创建 benchmark-analysis 目录 | developer | ✅ COMPLETE | T-1.5 |
| T-2.2 | 实现 SKILL.md | developer | ✅ COMPLETE | T-2.1 |
| T-2.3 | 创建 examples/ | developer | ✅ COMPLETE | T-2.2 |
| T-2.4 | 创建 anti-examples/ | developer | ✅ COMPLETE | T-2.2 |
| T-2.5 | 创建 checklists/ | developer | ✅ COMPLETE | T-2.2 |
| T-3.1 | 创建 load-test-orchestration 目录 | developer | ✅ COMPLETE | T-2.5 |
| T-3.2 | 实现 SKILL.md | developer | ✅ COMPLETE | T-3.1 |
| T-3.3 | 创建 examples/ | developer | ✅ COMPLETE | T-3.2 |
| T-3.4 | 创建 anti-examples/ | developer | ✅ COMPLETE | T-3.2 |
| T-3.5 | 创建 checklists/ | developer | ✅ COMPLETE | T-3.2 |
| T-4.1 | 创建 performance-regression-analysis 目录 | developer | ✅ COMPLETE | T-3.5 |
| T-4.2 | 实现 SKILL.md | developer | ✅ COMPLETE | T-4.1 |
| T-4.3 | 创建 examples/ | developer | ✅ COMPLETE | T-4.2 |
| T-4.4 | 创建 anti-examples/ | developer | ✅ COMPLETE | T-4.2 |
| T-4.5 | 创建 checklists/ | developer | ✅ COMPLETE | T-4.2 |
| T-5.1 | 更新 enhanced-mode-guide.md | docs | ✅ COMPLETE | T-4.5 |
| T-5.2 | 更新 README.md | docs | ✅ COMPLETE | T-5.1 |
| T-5.3 | 创建 completion-report.md | docs | ✅ COMPLETE | T-5.2 |

**总计**: 23 个任务
**已完成**: 23 个 (100%)
**实际耗时**: 约 2 小时

---

## Phase 1: performance-test-design

### T-1.1: 创建 performance-test-design 目录
- **状态**: ⬜ PENDING
- **相关需求**: AC-001
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `.opencode/skills/tester/performance-test-design/` 目录
- **验收标准**:
  - [ ] 目录存在
  - [ ] 包含 SKILL.md 占位文件

### T-1.2: 实现 SKILL.md
- **状态**: ⬜ PENDING
- **相关需求**: AC-003
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `.opencode/skills/tester/performance-test-design/SKILL.md`
- **验收标准**:
  - [ ] 包含 Purpose, When to Use, Key Activities, Output
  - [ ] 包含性能指标定义方法
  - [ ] 包含测试场景设计方法

### T-1.3: 创建 examples/
- **状态**: ⬜ PENDING
- **相关需求**: AC-003
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `examples/example-001-api-performance-test.md`
  - ⬜ `examples/example-002-database-performance.md`
- **验收标准**:
  - [ ] 至少 2 个示例
  - [ ] 包含完整测试场景

### T-1.4: 创建 anti-examples/
- **状态**: ⬜ PENDING
- **相关需求**: AC-003
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `anti-examples/anti-example-001-no-baseline.md`
  - ⬜ `anti-examples/anti-example-002-unrealistic-targets.md`
- **验收标准**:
  - [ ] 至少 2 个反例
  - [ ] 说明为何不可取

### T-1.5: 创建 checklists/
- **状态**: ⬜ PENDING
- **相关需求**: AC-003
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `checklists/validation-checklist.md`
- **验收标准**:
  - [ ] 包含验证清单
  - [ ] 覆盖关键检查项

---

## Phase 2: benchmark-analysis

### T-2.1: 创建 benchmark-analysis 目录
- **状态**: ⬜ PENDING
- **相关需求**: AC-001
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `.opencode/skills/tester/benchmark-analysis/` 目录

### T-2.2: 实现 SKILL.md
- **状态**: ⬜ PENDING
- **相关需求**: AC-003
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `.opencode/skills/tester/benchmark-analysis/SKILL.md`
- **验收标准**:
  - [ ] 包含 Purpose, When to Use, Key Activities, Output
  - [ ] 包含基线建立方法
  - [ ] 包含对比分析方法

### T-2.3: 创建 examples/
- **状态**: ⬜ PENDING
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `examples/example-001-api-benchmark.md`
  - ⬜ `examples/example-002-version-comparison.md`

### T-2.4: 创建 anti-examples/
- **状态**: ⬜ PENDING
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `anti-examples/anti-example-001-inconsistent-environment.md`
  - ⬜ `anti-examples/anti-example-002-single-sample.md`

### T-2.5: 创建 checklists/
- **状态**: ⬜ PENDING
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `checklists/validation-checklist.md`

---

## Phase 3: load-test-orchestration

### T-3.1: 创建 load-test-orchestration 目录
- **状态**: ⬜ PENDING
- **相关需求**: AC-001
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `.opencode/skills/tester/load-test-orchestration/` 目录

### T-3.2: 实现 SKILL.md
- **状态**: ⬜ PENDING
- **相关需求**: AC-003
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `.opencode/skills/tester/load-test-orchestration/SKILL.md`
- **验收标准**:
  - [ ] 包含 Purpose, When to Use, Key Activities, Output
  - [ ] 包含并发设计方法
  - [ ] 包含瓶颈识别方法

### T-3.3: 创建 examples/
- **状态**: ⬜ PENDING
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `examples/example-001-concurrent-users.md`
  - ⬜ `examples/example-002-stress-test.md`

### T-3.4: 创建 anti-examples/
- **状态**: ⬜ PENDING
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `anti-examples/anti-example-001-no-monitoring.md`
  - ⬜ `anti-examples/anti-example-002-premature-stop.md`

### T-3.5: 创建 checklists/
- **状态**: ⬜ PENDING
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `checklists/validation-checklist.md`

---

## Phase 4: performance-regression-analysis

### T-4.1: 创建 performance-regression-analysis 目录
- **状态**: ⬜ PENDING
- **相关需求**: AC-001
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `.opencode/skills/tester/performance-regression-analysis/` 目录

### T-4.2: 实现 SKILL.md
- **状态**: ⬜ PENDING
- **相关需求**: AC-003
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `.opencode/skills/tester/performance-regression-analysis/SKILL.md`
- **验收标准**:
  - [ ] 包含 Purpose, When to Use, Key Activities, Output
  - [ ] 包含回归检测方法
  - [ ] 包含根因分析方法

### T-4.3: 创建 examples/
- **状态**: ⬜ PENDING
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `examples/example-001-response-time-regression.md`
  - ⬜ `examples/example-002-throughput-degradation.md`

### T-4.4: 创建 anti-examples/
- **状态**: ⬜ PENDING
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `anti-examples/anti-example-001-no-historical-data.md`
  - ⬜ `anti-examples/anti-example-002-ignore-variance.md`

### T-4.5: 创建 checklists/
- **状态**: ⬜ PENDING
- **执行角色**: developer
- **Deliverable**:
  - ⬜ `checklists/validation-checklist.md`

---

## Phase 5: 文档更新

### T-5.1: 更新 enhanced-mode-guide.md
- **状态**: ⬜ PENDING
- **相关需求**: AC-002
- **执行角色**: docs
- **Deliverable**:
  - ⬜ `docs/enhanced-mode-guide.md` 更新
- **验收标准**:
  - [ ] 添加性能测试 skills 到 M4 清单
  - [ ] 说明何时使用性能测试 skills

### T-5.2: 更新 README.md
- **状态**: ⬜ PENDING
- **相关需求**: AC-005
- **执行角色**: docs
- **Deliverable**:
  - ⬜ `README.md` 更新
- **验收标准**:
  - [ ] tester skills 清单更新
  - [ ] Skills 总数更新

### T-5.3: 创建 completion-report.md
- **状态**: ⬜ PENDING
- **相关需求**: AC-001-AC-005
- **执行角色**: docs
- **Deliverable**:
  - ⬜ `specs/012-performance-testing-skills/completion-report.md`
- **验收标准**:
  - [ ] 所有 AC 状态记录
  - [ ] Traceability matrix 包含

---

## 并行执行策略

Phase 1-4 可并行执行（4 个 skills 独立创建）：
- **Batch A**: T-1.1 - T-1.5 (performance-test-design)
- **Batch B**: T-2.1 - T-2.5 (benchmark-analysis)
- **Batch C**: T-3.1 - T-3.5 (load-test-orchestration)
- **Batch D**: T-4.1 - T-4.5 (performance-regression-analysis)

Phase 5 顺序执行。

---

## 文档信息

- **Tasks ID**: tasks-012-performance-testing-skills-v1
- **版本**: 1.0.0
- **创建日期**: 2026-03-28
- **作者**: architect (via OpenCode agent)
- **关联 Spec**: `specs/012-performance-testing-skills/spec.md`
- **关联 Plan**: `specs/012-performance-testing-skills/plan.md`