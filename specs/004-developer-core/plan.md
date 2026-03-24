# 004-developer-core Implementation Plan

## Document Status
- **Feature ID**: `004-developer-core`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-24
- **Based On**: `specs/004-developer-core/spec.md` v1.0.0

---

## 1. Architecture Summary

本 feature 实现 `developer` 角色的完整核心能力系统，包括：

1. **3 个 Core Skills**：`feature-implementation`、`bugfix-workflow`、`code-change-selfcheck`
2. **3 个 Standard Artifacts**：`implementation-summary`、`self-check-report`、`bugfix-report`
3. **完整质量保障体系**：Checklists、Anti-examples、Failure modes、Validation gates
4. **上游/下游角色接口**：与 architect（上游）和 tester/reviewer/docs（下游）的交付契约

本 feature 不是 bootstrap 骨架，而是 developer 角色的完整第一阶段实现。

---

## 2. Inputs from Spec

### 2.1 Core Requirements (from spec.md)

| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| BR-001 | Implementation Must Match Design | Critical |
| BR-002 | Self-Check Is Mandatory | Critical |
| BR-003 | Bugfix Must Have Root Cause | Critical |
| BR-004 | Scope Control Is Developer Responsibility | Critical |
| BR-005 | Escalation Is Expected | High |
| BR-006 | Use 6-Role Formal Semantics | Critical |

### 2.2 Skill Requirements (from spec.md)

| Skill ID | Skill Name | Purpose |
|----------|------------|---------|
| SKILL-001 | feature-implementation | Transform design notes into working code |
| SKILL-002 | bugfix-workflow | Systematic bug fixing with root cause analysis |
| SKILL-003 | code-change-selfcheck | Pre-delivery self-validation |

### 2.3 Artifact Requirements (from spec.md)

| Artifact ID | Artifact Name | Required Fields Count |
|-------------|---------------|----------------------|
| AC-001 | implementation-summary | 10 fields |
| AC-002 | self-check-report | 6 fields |
| AC-003 | bugfix-report | 7 fields |

### 2.4 Validation Requirements (from spec.md)

| Validation ID | Type | Check Items |
|---------------|------|-------------|
| VM-001 | Skill-Level | 5 check items |
| VM-002 | Artifact-Level | 4 check items |
| VM-003 | Cross-Role | 3 check items |
| VM-004 | Consistency | 4 check items |

---

## 3. Technical Constraints

### 3.1 Governance Alignment Constraints

| Constraint | Source | Rationale |
|------------|--------|-----------|
| C-001: 使用 6-role 正式术语 | AGENTS.md, role-definition.md | 保持治理一致性 |
| C-002: 标记 task-executor 为 legacy | role-model-evolution.md | 避免 semantic drift |
| C-003: 遵循 I/O Contract | io-contract.md | 确保管理层可调用 |
| C-004: 满足 Quality Gate | quality-gate.md | 确保输出质量 |

### 3.2 Directory Structure Constraints

```
.opencode/skills/developer/
├── feature-implementation/
│   ├── SKILL.md
│   ├── examples/
│   │   └── example-1-implementation.md
│   ├── anti-examples/
│   │   └── anti-example-1-no-design.md
│   └── checklists/
│       └── implementation-checklist.md
├── bugfix-workflow/
│   ├── SKILL.md
│   ├── examples/
│   ├── anti-examples/
│   └── checklists/
└── code-change-selfcheck/
    ├── SKILL.md
    ├── examples/
    ├── anti-examples/
    └── checklists/
```

### 3.3 Artifact Storage Constraints

- Artifacts 存储在 task/feature 工作目录
- 遵循 feature-level traceability 原则
- 文件命名规范：`implementation-summary.md`, `self-check-report.md`, `bugfix-report.md`

### 3.4 Compatibility Constraints

- 不删除现有 task-executor 目录
- 不破坏现有 bootstrap 流程
- 在 skill 文档中标注 legacy compatibility 说明

---

## 4. Module Decomposition

### 4.1 Phase Overview

```
Phase 1: Role Scope Finalization (1 day)
  ├── P1-1: Developer role boundary confirmation
  ├── P1-2: Upstream interface from architect definition
  └── P1-3: Downstream interface to tester/reviewer/docs definition

Phase 2: Skill Formalization (2 days)
  ├── P2-1: feature-implementation formalization
  ├── P2-2: bugfix-workflow formalization
  └── P2-3: code-change-selfcheck formalization

Phase 3: Artifact Contract Establishment (1 day)
  ├── P3-1: implementation-summary contract
  ├── P3-2: self-check-report contract
  └── P3-3: bugfix-report contract

Phase 4: Validation & Quality Layer (1 day)
  ├── P4-1: Upstream-consumability checklist
  ├── P4-2: Downstream-consumability checklist
  ├── P4-3: Failure-mode checklist
  └── P4-4: Anti-pattern guidance

Phase 5: Educational & Example Layer (1 day)
  ├── P5-1: Examples for each skill
  ├── P5-2: Anti-examples for each skill
  └── P5-3: Templates/checklists for each skill

Phase 6: Workflow & Package Integration (0.5 day)
  ├── P6-1: Role-scope.md documentation
  ├── P6-2: Package governance updates check
  └── P6-3: Feature completion preparation

Phase 7: Consistency Review (0.5 day)
  ├── P7-1: Governance document sync
  ├── P7-2: Cross-document consistency check
  └── P7-3: Final acceptance validation
```

### 4.2 Detailed Module Breakdown

#### Phase 1: Role Scope Finalization

**P1-1: Developer Role Boundary Confirmation**
- 目标：明确 developer 职责边界，与 role-definition.md 对齐
- 输入：role-definition.md, package-spec.md
- 输出：role-scope.md (in specs/004-developer-core/)
- 验收：与 role-definition.md 无矛盾，上游/下游角色可理解

**P1-2: Upstream Interface Definition**
- 目标：定义 developer 如何消费 architect 的设计产物
- 输入：specs/003-architect-core/downstream-interfaces.md
- 输出：Upstream interface section in role-scope.md
- 验收：developer 知道如何读取和使用 design-note/module-boundaries

**P1-3: Downstream Interface Definition**
- 目标：定义 developer 向 tester/reviewer/docs 的交付契约
- 输入：role-definition.md, io-contract.md
- 输出：downstream-interfaces.md (in specs/004-developer-core/)
- 验收：每个下游角色都有明确的消费指引

---

#### Phase 2: Skill Formalization

**P2-1: feature-implementation Formalization**

现有 SKILL.md 需要增强的部分：

| 增强项 | 当前状态 | 目标状态 |
|--------|----------|----------|
| Examples | 2 个 | 至少 2 个正式 examples |
| Anti-examples | 无 | 至少 2 个 anti-examples |
| Checklists | 内嵌在 SKILL.md | 独立 checklist 文件 |
| Failure modes | 表格形式 | 与 anti-patterns 关联 |
| Contract alignment | 提及 schema | 与 artifact contract 对齐 |

**P2-2: bugfix-workflow Formalization**

现有 SKILL.md 需要增强的部分：

| 增强项 | 当前状态 | 目标状态 |
|--------|----------|----------|
| Examples | 2 个 | 至少 2 个正式 examples |
| Anti-examples | 无 | 至少 2 个 anti-examples |
| Checklists | 内嵌在 SKILL.md | 独立 checklist 文件 |
| Contract alignment | 提及 schema | 与 bugfix-report contract 对齐 |

**P2-3: code-change-selfcheck Formalization**

现有 SKILL.md 需要增强的部分：

| 增强项 | 当前状态 | 目标状态 |
|--------|----------|----------|
| Examples | 3 个 | 至少 2 个正式 examples |
| Anti-examples | 无 | 至少 2 个 anti-examples |
| Checklists | 部分内嵌 | 独立 checklist 文件 |
| Contract alignment | 提及 schema | 与 self-check-report contract 对齐 |

---

#### Phase 3: Artifact Contract Establishment

**P3-1: implementation-summary Contract**
- 目标：定义 implementation-summary 的完整 schema
- 输出：contracts/implementation-summary-contract.md
- 内容：
  - Required fields with descriptions
  - Field validation rules
  - Example valid/invalid instances
  - Downstream consumption notes

**P3-2: self-check-report Contract**
- 目标：定义 self-check-report 的完整 schema
- 输出：contracts/self-check-report-contract.md

**P3-3: bugfix-report Contract**
- 目标：定义 bugfix-report 的完整 schema
- 输出：contracts/bugfix-report-contract.md

---

#### Phase 4: Validation & Quality Layer

**P4-1: Upstream-consumability Checklist**
- 目标：确保 developer 能正确消费 architect 输出
- 输出：validation/upstream-consumability-checklist.md
- 检查项：
  - design-note 读取和理解
  - module-boundaries 解析
  - 约束识别
  - 开放问题处理

**P4-2: Downstream-consumability Checklist**
- 目标：确保输出可被下游消费
- 输出：validation/downstream-consumability-checklist.md
- 按 downstream role 分类：
  - tester 消费检查
  - reviewer 消费检查
  - docs 消费检查

**P4-3: Failure-mode Checklist**
- 目标：识别常见失败模式
- 输出：validation/failure-mode-checklist.md
- 内容：
  - 7 个 anti-patterns 的检测方法
  - 每个失败模式的预警信号
  - 修复策略

**P4-4: Anti-pattern Guidance**
- 目标：提供反模式指导
- 输出：validation/anti-pattern-guidance.md
- 基于 spec.md 中的 7 个 anti-patterns

---

#### Phase 5: Educational & Example Layer

**P5-1: Examples for Each Skill**
- 目标：为每个 skill 提供完整示例
- 输出结构：
  ```
  .opencode/skills/developer/
  ├── feature-implementation/
  │   └── examples/
  │       ├── example-001-auth-implementation.md
  │       └── example-002-api-endpoint.md
  ├── bugfix-workflow/
  │   └── examples/
  │       ├── example-001-null-pointer.md
  │       └── example-002-race-condition.md
  └── code-change-selfcheck/
      └── examples/
          ├── example-001-feature-selfcheck.md
          └── example-002-bugfix-selfcheck.md
  ```

**P5-2: Anti-examples for Each Skill**
- 目标：展示常见错误
- 输出结构类似 examples/

**P5-3: Templates/Checklists for Each Skill**
- 目标：提供可复用模板
- 输出结构：
  ```
  .opencode/skills/developer/
  ├── feature-implementation/
  │   └── checklists/
  │       └── implementation-checklist.md
  ├── bugfix-workflow/
  │   └── checklists/
  │       └── bugfix-checklist.md
  └── code-change-selfcheck/
      └── checklists/
          └── self-check-checklist.md
  ```

---

#### Phase 6: Workflow & Package Integration

**P6-1: Role-scope.md Documentation**
- 目标：完整的 developer 角色范围文档
- 输出：specs/004-developer-core/role-scope.md
- 内容：
  - Mission
  - In Scope / Out of Scope
  - Trigger conditions
  - Required / Optional inputs
  - Expected outputs
  - Escalation rules
  - Upstream / Downstream dependencies

**P6-2: Package Governance Updates Check**
- 目标：检查/更新相关 governance 文档
- 需检查/更新的文档：
  - README.md（Skills 清单、Workflow）
  - AGENTS.md（角色语义部分）
  - package-spec.md（Skills 部分）
  - quality-gate.md（developer gate 部分）

**P6-3: Feature Completion Preparation**
- 目标：准备 completion-report.md
- 内容：
  - 交付内容清单
  - 与 spec 的 traceability matrix
  - 未覆盖的高级 skills
  - 对 features 005-008 的输入价值

---

#### Phase 7: Consistency Review

**P7-1: Governance Document Sync**
- 目标：确保所有 governance 文档一致
- 检查项：
  - [ ] README.md 与 role-definition.md 术语一致
  - [ ] AGENTS.md 与 package-spec.md 约束一致
  - [ ] quality-gate.md developer gate 与本 feature 对齐
  - [ ] io-contract.md artifact types 包含本 feature 定义的 artifacts

**P7-2: Cross-document Consistency Check**
- 目标：验证文档间无矛盾
- 使用 governance sync rule（AGENTS.md）
- 检查 6-role vs 3-skill 语义一致性

**P7-3: Final Acceptance Validation**
- 目标：对照 spec.md acceptance criteria 验证
- 验收项：
  - AC-001 到 AC-011

---

## 5. Data Flow

### 5.1 Standard Feature Implementation Flow

```
Architect Artifacts
         │
         ▼
┌─────────────────────────┐
│   developer: Read design   │
│   - design-note            │
│   - module-boundaries      │
│   - constraints            │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   developer: feature       │
│   implementation           │
│   - Implement code         │
│   - Track changes          │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   developer: code-change   │
│   selfcheck                │
│   - Validate changes       │
│   - Fix blockers           │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Output Artifacts         │
│   - implementation-summary │
│   - self-check-report      │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Downstream Handoff       │
│   - tester                 │
│   - reviewer               │
│   - docs                   │
└─────────────────────────┘
```

### 5.2 Bugfix Flow

```
Bug Report / Test Failure
         │
         ▼
┌─────────────────────────┐
│   developer: bugfix-       │
│   workflow                 │
│   - Analyze problem        │
│   - Find root cause        │
│   - Create repro test      │
│   - Implement fix          │
│   - Verify fix             │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Output: bugfix-report    │
└─────────────────────────┘
         │
         ▼
   Downstream Verification
```

### 5.3 Escalation Flow

```
Implementation Blocker
         │
         ▼
┌─────────────────────────┐
│   Can resolve?             │
└─────────────────────────┘
    │           │
   Yes          No
    │           │
    ▼           ▼
Document    Escalate to
deviation   architect +
            reviewer
```

---

## 6. Failure Handling

### 6.1 Skill-Level Failure Modes

| Skill | Failure Mode | Detection | Recovery |
|-------|--------------|-----------|----------|
| feature-implementation | Implementation Without Design | Checklist: 是否引用了 design-note | Rework with design reference |
| feature-implementation | Silent Deviation | Checklist: deviations 字段是否为空但有实际偏离 | Document deviations |
| feature-implementation | Scope Creep | Checklist: 改动范围 vs task scope | Remove out-of-scope changes |
| bugfix-workflow | Surface Fix | Checklist: root_cause 是否深入 | Redo root cause analysis |
| bugfix-workflow | Large Fix | Checklist: 改动行数 vs issue scope | Minimize fix scope |
| code-change-selfcheck | Skipped Checks | self-check-report 缺失 | Generate report |
| code-change-selfcheck | False All-Clear | Reviewer finds obvious issues | Fix and re-check |

### 6.2 Artifact-Level Failure Modes

| Artifact | Failure Mode | Detection | Recovery |
|----------|--------------|-----------|----------|
| implementation-summary | Missing Files | changed_files 不完整 | Add missing files |
| implementation-summary | No Goal Alignment | goal_alignment 字段缺失 | Add goal assessment |
| self-check-report | Missing Blockers | obvious issues not marked | Re-check and mark blockers |
| bugfix-report | No Root Cause | root_cause 过于表面 | Redo analysis |
| bugfix-report | No Lessons | lessons_learned 为空 | Add prevention strategies |

### 6.3 Escalation Rules

以下情况触发升级（ESCALATE）：
- design-note 与实现根本性冲突
- 关键约束无法实现
- 缺少核心上下文无法继续
- 多次 rework 未收敛

---

## 7. Validation Strategy

### 7.1 Skill-Level Validation

每个 skill 完成后必须通过：

```yaml
validation_checklist:
  skill_level:
    - inputs_defined: true
    - outputs_complete: true
    - checklists_executable: true
    - examples_exist: true
    - anti_examples_exist: true
```

### 7.2 Artifact-Level Validation

每个 artifact 必须通过：

```yaml
validation_checklist:
  artifact_level:
    - required_fields_present: true
    - downstream_consumable: true
    - no_hidden_assumptions: true
    - no_missing_boundaries: true
```

### 7.3 Cross-Role Validation

必须验证下游可消费性：

```yaml
validation_checklist:
  cross_role:
    - tester_can_design_tests: true
    - reviewer_can_review: true
    - docs_can_sync: true
```

### 7.4 Consistency Validation

必须验证与 governance 文档一致：

```yaml
validation_checklist:
  consistency:
    - package_spec_aligned: true
    - role_definition_aligned: true
    - io_contract_aligned: true
    - quality_gate_aligned: true
```

---

## 8. Risks / Tradeoffs

### 8.1 Identified Risks

| Risk ID | Description | Level | Mitigation |
|---------|-------------|-------|------------|
| R-001 | 现有 task-executor 可能造成混淆 | Medium | 明确标注 legacy compatibility |
| R-002 | skill 内容可能与 governance 文档 drift | Medium | Phase 7 强制 consistency review |
| R-003 | 下游角色尚未实现，接口可能需调整 | Low | 设计预留灵活性 |
| R-004 | 与 003 接口不匹配 | Medium | 仔细对齐 003 downstream-interfaces |

### 8.2 Tradeoffs

| Decision | Chosen Approach | Alternative | Rationale |
|----------|-----------------|-------------|-----------|
| Skill enhancement vs rewrite | 增强现有 skills | 完全重写 | 现有 skills 已有基础，增强更高效 |
| Example 数量 | 2 个 per skill | 3 个 per skill | 平衡完整性与工作量 |
| Anti-example 组织 | 独立目录 | 内嵌在 SKILL.md | 便于扩展和引用 |
| 与 task-executor 关系 | 并行共存 | 直接替代 | 保持 bootstrap 流程稳定 |

### 8.3 Assumptions

| Assumption ID | Description | Impact if Wrong |
|---------------|-------------|-----------------|
| AS-001 | 003-architect-core 已完成 | 缺少上游接口定义 |
| AS-002 | 6-role 模型已被接受 | 需要重新讨论语义 |
| AS-003 | 下游 features 005-008 将按计划开发 | 接口可能需要调整 |
| AS-004 | 现有 developer skills 可作为 baseline | 需要从头开发 |

---

## 9. Requirement Traceability

### 9.1 Spec to Plan Mapping

| Spec Requirement | Plan Section | Task IDs |
|------------------|--------------|----------|
| BR-001: Implementation Must Match Design | Phase 4 (Validation), Phase 2 (Skills) | P2-1, P4-3 |
| BR-002: Self-Check Is Mandatory | Phase 2, Phase 3 | P2-3, P3-2 |
| BR-003: Bugfix Must Have Root Cause | Phase 2 (Skills) | P2-2 |
| BR-004: Scope Control | Phase 2, Phase 4 | P2-1, P4-3 |
| BR-005: Escalation Is Expected | Phase 1 (Role Scope) | P1-1 |
| BR-006: Use 6-Role Formal Semantics | Phase 1, Phase 7 | P1-1, P7-1 |

### 9.2 Acceptance Criteria to Tasks Mapping

| Acceptance Criteria | Tasks |
|---------------------|-------|
| AC-001: Feature Package Complete | All phases |
| AC-002: Core Skills Formally Mapped | P2-1, P2-2, P2-3 |
| AC-003: Skill Assets Complete | P5-1, P5-2, P5-3 |
| AC-004: Artifact Contracts Defined | P3-1, P3-2, P3-3 |
| AC-005: Downstream Interfaces Clear | P1-3, P4-2 |
| AC-006: Upstream Interface Clear | P1-2, P4-1 |
| AC-007: Consistency with Canonical Docs | P7-1, P7-2 |
| AC-008: Anti-Pattern Guidance Established | P4-4, P5-2 |
| AC-009: Completion Report Quality | P6-3 |
| AC-010: Scope Boundary Maintained | All phases (by design) |
| AC-011: First-Class Role Established | All phases (by design) |

---

## 10. Implementation Order

### 10.1 Recommended Execution Sequence

```
Day 1:
├── Phase 1: Role Scope Finalization (1 day)
│   └── Parallel: P1-1, P1-2, P1-3

Day 2-3:
├── Phase 2: Skill Formalization (2 days)
│   ├── P2-1: feature-implementation (0.7 days)
│   ├── P2-2: bugfix-workflow (0.7 days)
│   └── P2-3: code-change-selfcheck (0.6 days)

Day 4:
├── Phase 3: Artifact Contract Establishment (1 day)
│   └── Parallel: P3-1, P3-2, P3-3

Day 5:
├── Phase 4: Validation & Quality Layer (1 day)
│   └── Sequential: P4-1 → P4-2 → P4-3 → P4-4

Day 6:
├── Phase 5: Educational & Example Layer (1 day)
│   └── Parallel: P5-1, P5-2, P5-3

Day 7 (Morning):
├── Phase 6: Workflow & Package Integration (0.5 day)
│   └── Sequential: P6-1 → P6-2 → P6-3

Day 7 (Afternoon):
└── Phase 7: Consistency Review (0.5 day)
    └── Sequential: P7-1 → P7-2 → P7-3
```

### 10.2 Parallel-Safe Tasks

| Phase | Parallel-Safe Tasks |
|-------|---------------------|
| Phase 1 | P1-1, P1-2, P1-3 (可并行) |
| Phase 2 | P2-1, P2-2, P2-3 (可并行) |
| Phase 3 | P3-1, P3-2, P3-3 (可并行) |
| Phase 5 | P5-1, P5-2, P5-3 (可并行) |

### 10.3 Dependencies

```
P1-1, P1-2, P1-3 → P2-1, P2-2, P2-3
P2-1 → P3-1
P2-2 → P3-3
P2-3 → P3-2
P3-1, P3-2, P3-3 → P4-1, P4-2
P4-1, P4-2 → P4-3, P4-4
P4-3, P4-4 → P5-1, P5-2, P5-3
P5-1, P5-2, P5-3 → P6-1
P6-1 → P6-2 → P6-3
P6-3 → P7-1 → P7-2 → P7-3
```

---

## 11. Open Questions

### 11.1 From Spec (OQ-001, OQ-002, OQ-003)

| OQ ID | Question | Recommended Resolution |
|-------|----------|------------------------|
| OQ-001 | Advanced Skill Priority? | 在 completion-report 中记录建议 |
| OQ-002 | task-executor Integration? | 在 role-scope 中定义兼容层 |
| OQ-003 | Self-Check Automation? | 在 contract 中定义自动化 vs 手动 |

---

## 12. Next Steps

### 12.1 Immediate Actions

1. **创建 tasks.md**：将本 plan 转换为可执行任务列表
2. **确认 open questions**：与 stakeholders 确认 OQ-001~OQ-003 的决策
3. **开始 Phase 1**：Role Scope Finalization

### 12.2 Dependencies on Other Features

| Dependency | Feature | Status |
|------------|---------|--------|
| 003-architect-core | Completed | ✅ |
| 002-role-model-alignment | Completed | ✅ |
| 002b-governance-repair | Completed | ✅ |
| 005-tester-core | Planned | 待本 feature 完成 |
| 006-reviewer-core | Planned | 待本 feature 完成 |

### 12.3 Deliverables Checklist

- [ ] `specs/004-developer-core/plan.md` (本文档)
- [ ] `specs/004-developer-core/tasks.md`
- [ ] `specs/004-developer-core/role-scope.md`
- [ ] `specs/004-developer-core/downstream-interfaces.md`
- [ ] `specs/004-developer-core/contracts/implementation-summary-contract.md`
- [ ] `specs/004-developer-core/contracts/self-check-report-contract.md`
- [ ] `specs/004-developer-core/contracts/bugfix-report-contract.md`
- [ ] `.opencode/skills/developer/feature-implementation/` (enhanced)
- [ ] `.opencode/skills/developer/bugfix-workflow/` (enhanced)
- [ ] `.opencode/skills/developer/code-change-selfcheck/` (enhanced)
- [ ] `specs/004-developer-core/validation/` (checklists)
- [ ] `specs/004-developer-core/completion-report.md`

---

## References

- `specs/004-developer-core/spec.md` - Feature specification
- `specs/003-architect-core/` - Upstream feature
- `package-spec.md` - Package governance specification
- `role-definition.md` - 6-role definition
- `io-contract.md` - Input/output contract
- `quality-gate.md` - Quality gate rules
- `docs/architecture/role-model-evolution.md` - Role model evolution strategy
