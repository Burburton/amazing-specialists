# 003-architect-core Implementation Plan

## Document Status
- **Feature ID**: `003-architect-core`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-23
- **Based On**: `specs/003-architect-core/spec.md` v1.0.0

---

## 1. Architecture Summary

本 feature 实现 `architect` 角色的完整核心能力系统，包括：

1. **3 个 Core Skills**：`requirement-to-design`、`module-boundary-design`、`tradeoff-analysis`
2. **4 个 Standard Artifacts**：`design-note`、`module-boundaries`、`risks-and-tradeoffs`、`open-questions`
3. **完整质量保障体系**：Checklists、Anti-examples、Failure modes、Validation gates
4. **下游角色接口**：与 developer/tester/reviewer/docs/security 的交付契约

本 feature 不是 bootstrap 骨架，而是 architect 角色的完整第一阶段实现。

---

## 2. Inputs from Spec

### 2.1 Core Requirements (from spec.md)

| Requirement ID | Description | Priority |
|----------------|-------------|----------|
| BR-001 | Design Must Be Consumable | Critical |
| BR-002 | Design Must Map Requirements | Critical |
| BR-003 | Boundaries Must Be Clear | Critical |
| BR-004 | Uncertainties Must Be Explicit | Critical |
| BR-005 | Skill System Must Be Extensible | High |
| BR-006 | Use 6-Role Formal Semantics | Critical |

### 2.2 Skill Requirements (from spec.md)

| Skill ID | Skill Name | Purpose |
|----------|------------|---------|
| SKILL-001 | requirement-to-design | Transform feature specs into structured design notes |
| SKILL-002 | module-boundary-design | Define module boundaries, responsibilities, and dependencies |
| SKILL-003 | tradeoff-analysis | Document design decisions with alternatives and rationale |

### 2.3 Artifact Requirements (from spec.md)

| Artifact ID | Artifact Name | Required Fields Count |
|-------------|---------------|----------------------|
| AC-001 | design-note | 10 fields |
| AC-002 | module-boundaries | 7 fields |
| AC-003 | risks-and-tradeoffs | 7 fields |
| AC-004 | open-questions | 5 fields |

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
| C-002: 标记 3-skill 为 legacy | role-model-evolution.md | 避免 semantic drift |
| C-003: 遵循 I/O Contract | io-contract.md | 确保管理层可调用 |
| C-004: 满足 Quality Gate | quality-gate.md | 确保输出质量 |

### 3.2 Directory Structure Constraints

```
.opencode/skills/architect/
├── requirement-to-design/
│   ├── SKILL.md
│   ├── examples/
│   │   └── example-1-design-note.md
│   ├── anti-examples/
│   │   └── anti-example-1-spec-parroting.md
│   └── checklists/
│       └── design-note-checklist.md
├── module-boundary-design/
│   ├── SKILL.md
│   ├── examples/
│   ├── anti-examples/
│   └── checklists/
└── tradeoff-analysis/
    ├── SKILL.md
    ├── examples/
    ├── anti-examples/
    └── checklists/
```

### 3.3 Artifact Storage Constraints

- Artifacts 存储在 `specs/<feature>/` 目录
- 遵循 feature-level traceability 原则
- 文件命名规范：`design-note.md`, `module-boundaries.md`, `risks-and-tradeoffs.md`, `open-questions.md`

### 3.4 Compatibility Constraints

- 不删除现有 3-skill 目录
- 不破坏现有 bootstrap 流程
- 在 skill 文档中标注 legacy compatibility 说明

---

## 4. Module Decomposition

### 4.1 Phase Overview

```
Phase 1: Role Scope Finalization (2 days)
  ├── P1-1: Architect role boundary confirmation
  ├── P1-2: Downstream interface definition
  └── P1-3: De-legacy mapping notes

Phase 2: Skill Taxonomy Definition (1 day)
  ├── P2-1: Skill categorization schema
  ├── P2-2: Skill metadata standard
  └── P2-3: Extension point definition

Phase 3: Core Skills Enhancement (6 days)
  ├── P3-1: requirement-to-design enhancement
  ├── P3-2: module-boundary-design enhancement
  └── P3-3: tradeoff-analysis enhancement

Phase 4: Artifact Contract Establishment (3 days)
  ├── P4-1: design-note contract
  ├── P4-2: module-boundaries contract
  ├── P4-3: risks-and-tradeoffs contract
  └── P4-4: open-questions contract

Phase 5: Validation & Quality Layer (4 days)
  ├── P5-1: Cross-skill validation checklist
  ├── P5-2: Downstream-consumability checklist
  ├── P5-3: Failure-mode checklist
  └── P5-4: Anti-pattern guidance

Phase 6: Educational & Example Layer (3 days)
  ├── P6-1: Examples for each skill
  ├── P6-2: Anti-examples for each skill
  └── P6-3: Templates/checklists for each skill

Phase 7: Workflow & Package Integration (2 days)
  ├── P7-1: Minimal workflow reference points
  ├── P7-2: Package governance updates
  └── P7-3: Feature completion delivery

Phase 8: Consistency Review (2 days)
  ├── P8-1: Governance document sync
  ├── P8-2: Cross-document consistency check
  └── P8-3: Final acceptance validation
```

### 4.2 Detailed Module Breakdown

#### Phase 1: Role Scope Finalization

**P1-1: Architect Role Boundary Confirmation**
- 目标：明确 architect 职责边界，与 role-definition.md 对齐
- 输入：role-definition.md, package-spec.md
- 输出：architect-role-boundary.md (in specs/003-architect-core/)
- 验收：与 role-definition.md 无矛盾，下游角色可理解

**P1-2: Downstream Interface Definition**
- 目标：定义 architect 与 developer/tester/reviewer/docs/security 的交付契约
- 输入：role-definition.md, io-contract.md
- 输出：downstream-interfaces.md (in specs/003-architect-core/)
- 验收：每个下游角色都有明确的消费指引

**P1-3: De-legacy Mapping Notes**
- 目标：明确 architect 与 legacy architect-auditor 的关系
- 输入：role-model-evolution.md, skill-to-role-migration.md
- 输出：de-legacy-mapping-note.md (in specs/003-architect-core/)
- 验收：标注 legacy compatibility，不混淆语义

---

#### Phase 2: Skill Taxonomy Definition

**P2-1: Skill Categorization Schema**
- 目标：建立 skill 分类标准
- 输出：skill-taxonomy.md (in specs/003-architect-core/)
- 内容：
  - Core Skills vs Advanced Skills 分类
  - Skill ID 命名规范
  - Skill metadata schema

**P2-2: Skill Metadata Standard**
- 目标：定义每个 skill 必须包含的 metadata
- 必需字段：
  - `skill_id`: 唯一标识
  - `skill_name`: 显示名称
  - `role`: 所属角色
  - `purpose`: 一句话描述
  - `inputs`: 输入定义
  - `outputs`: 输出定义
  - `checklists`: 检查清单引用
  - `examples`: 正例引用
  - `anti_examples`: 反例引用
  - `failure_modes`: 失败模式

**P2-3: Extension Point Definition**
- 目标：定义未来高级 skill 的扩展点
- 输出：扩展点定义文档
- 高级 skills：interface-contract-design, dependency-shaping, architecture-risk-framing 等

---

#### Phase 3: Core Skills Enhancement

**P3-1: requirement-to-design Enhancement**

现有 SKILL.md 需要增强的部分：

| 增强项 | 当前状态 | 目标状态 |
|--------|----------|----------|
| Anti-examples | 无 | 至少 3 个 |
| Examples | 2 个 | 至少 3 个 |
| Checklists | 内嵌在 SKILL.md | 独立 checklist 文件 |
| Failure modes | 表格形式 | 完整文档 + 处理策略 |
| Downstream integration | 提及但未详述 | 完整的下游交付说明 |

**P3-2: module-boundary-design Enhancement**

需要创建/增强的内容：
- 完整的 SKILL.md（参考 requirement-to-design 结构）
- 至少 3 个 examples
- 至少 3 个 anti-examples
- 独立 checklist
- Failure modes 文档

**P3-3: tradeoff-analysis Enhancement**

需要创建/增强的内容：
- 完整的 SKILL.md
- 至少 3 个 examples
- 至少 3 个 anti-examples
- 独立 checklist
- Failure modes 文档

---

#### Phase 4: Artifact Contract Establishment

**P4-1: design-note Contract**
- 目标：定义 design-note 的完整 schema
- 输出：contracts/design-note-contract.md
- 内容：
  - Required fields with descriptions
  - Field validation rules
  - Example valid/invalid instances
  - Downstream consumption notes

**P4-2: module-boundaries Contract**
- 目标：定义 module-boundaries 的完整 schema
- 输出：contracts/module-boundaries-contract.md

**P4-3: risks-and-tradeoffs Contract**
- 目标：定义 risks-and-tradeoffs 的完整 schema
- 输出：contracts/risks-and-tradeoffs-contract.md

**P4-4: open-questions Contract**
- 目标：定义 open-questions 的完整 schema
- 输出：contracts/open-questions-contract.md

---

#### Phase 5: Validation & Quality Layer

**P5-1: Cross-skill Validation Checklist**
- 目标：定义跨 skill 的验证检查
- 输出：validation/cross-skill-validation-checklist.md
- 检查项：
  - design-note 与 module-boundaries 一致性
  - risks-and-tradeoffs 与 design-note 关联性
  - open-questions 与 design-note 关联性
  - 全局术语一致性

**P5-2: Downstream-consumability Checklist**
- 目标：确保输出可被下游消费
- 输出：validation/downstream-consumability-checklist.md
- 按 downstream role 分类：
  - developer 消费检查
  - tester 消费检查
  - reviewer 消费检查
  - docs 消费检查
  - security 消费检查

**P5-3: Failure-mode Checklist**
- 目标：识别常见失败模式
- 输出：validation/failure-mode-checklist.md
- 内容：
  - 7 个 anti-patterns 的检测方法
  - 每个失败模式的预警信号
  - 修复策略

**P5-4: Anti-pattern Guidance**
- 目标：提供反模式指导
- 输出：validation/anti-pattern-guidance.md
- 基于 spec.md 中的 7 个 anti-patterns：
  - AP-001: Spec Parroting
  - AP-002: Folder-Driven Architecture
  - AP-003: Decision Without Alternatives
  - AP-004: Silent Assumptions
  - AP-005: Role Bleeding
  - AP-006: Over-Abstract Design
  - AP-007: No Future Boundary

---

#### Phase 6: Educational & Example Layer

**P6-1: Examples for Each Skill**
- 目标：为每个 skill 提供完整示例
- 输出结构：
  ```
  examples/
  ├── requirement-to-design/
  │   ├── example-1-user-auth.md
  │   ├── example-2-data-migration.md
  │   └── example-3-api-design.md
  ├── module-boundary-design/
  │   ├── example-1-microservice-split.md
  │   ├── example-2-layered-architecture.md
  │   └── example-3-plugin-system.md
  └── tradeoff-analysis/
      ├── example-1-db-selection.md
      ├── example-2-sync-vs-async.md
      └── example-3-cache-strategy.md
  ```

**P6-2: Anti-examples for Each Skill**
- 目标：展示常见错误
- 输出结构：
  ```
  anti-examples/
  ├── requirement-to-design/
  │   ├── anti-example-1-spec-parroting.md
  │   ├── anti-example-2-missing-non-goals.md
  │   └── anti-example-3-implementation-jump.md
  ├── module-boundary-design/
  │   ├── anti-example-1-folder-only.md
  │   ├── anti-example-2-overlapping-responsibilities.md
  │   └── anti-example-3-no-integration-seams.md
  └── tradeoff-analysis/
      ├── anti-example-1-no-alternatives.md
      ├── anti-example-2-vague-language.md
      └── anti-example-3-no-revisit-trigger.md
  ```

**P6-3: Templates/Checklists for Each Skill**
- 目标：提供可复用模板
- 输出结构：
  ```
  templates/
  ├── design-note-template.md
  ├── module-boundaries-template.md
  ├── risks-and-tradeoffs-template.md
  └── open-questions-template.md

  checklists/
  ├── requirement-to-design-checklist.md
  ├── module-boundary-design-checklist.md
  └── tradeoff-analysis-checklist.md
  ```

---

#### Phase 7: Workflow & Package Integration

**P7-1: Minimal Workflow Reference Points**
- 目标：在 package workflow 中建立 architect 引用点
- 输出：更新 collaboration-protocol.md（如需要）
- 内容：
  - architect 在标准 feature flow 中的位置
  - architect 触发条件
  - architect 完成判定

**P7-2: Package Governance Updates**
- 目标：更新相关 governance 文档
- 需检查/更新的文档：
  - README.md（Skills 清单、Workflow）
  - AGENTS.md（角色语义部分）
  - package-spec.md（Skills 部分）
  - quality-gate.md（architect gate 部分）

**P7-3: Feature Completion Delivery**
- 目标：准备 completion-report.md
- 内容：
  - 交付内容清单
  - 与 spec 的 traceability matrix
  - 未覆盖的高级 skills
  - 对 features 004-008 的输入价值

---

#### Phase 8: Consistency Review

**P8-1: Governance Document Sync**
- 目标：确保所有 governance 文档一致
- 检查项：
  - [ ] README.md 与 role-definition.md 术语一致
  - [ ] AGENTS.md 与 package-spec.md 约束一致
  - [ ] quality-gate.md architect gate 与本 feature 对齐
  - [ ] io-contract.md artifact types 包含本 feature 定义的 artifacts

**P8-2: Cross-document Consistency Check**
- 目标：验证文档间无矛盾
- 使用 governance sync rule（AGENTS.md）
- 检查 6-role vs 3-skill 语义一致性

**P8-3: Final Acceptance Validation**
- 目标：对照 spec.md acceptance criteria 验证
- 验收项：
  - AC-001: Feature Package Complete
  - AC-002: Core Skills Implemented
  - AC-003: Skill Assets Complete
  - AC-004: Artifact Contracts Defined
  - AC-005: Downstream Interfaces Clear
  - AC-006: Consistency with Canonical Docs
  - AC-007: Anti-Pattern Guidance Established
  - AC-008: Completion Report Quality
  - AC-009: Scope Boundary Maintained
  - AC-010: First-Class Role Established

---

## 5. Data Flow

### 5.1 Standard Feature Design Flow

```
User Request / Feature Spec
         │
         ▼
┌─────────────────────────┐
│   Common: artifact-reading   │
│   Common: context-summarization │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   architect: requirement-to-design   │
│   ├─ Input: spec.md, governance docs │
│   └─ Output: design-note             │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   architect: module-boundary-design   │
│   ├─ Input: design-note, codebase   │
│   └─ Output: module-boundaries      │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   architect: tradeoff-analysis   │
│   ├─ Input: design alternatives   │
│   └─ Output: risks-and-tradeoffs  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Output: open-questions.md   │
│   (if unresolved items exist)  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Downstream Handoff     │
│   ├─ developer           │
│   ├─ tester              │
│   ├─ reviewer            │
│   ├─ docs                │
│   └─ security            │
└─────────────────────────┘
```

### 5.2 Design Revision Flow

```
Existing Artifacts + Change Request
         │
         ▼
┌─────────────────────────┐
│   architect: tradeoff-analysis   │
│   └─ Output: updated risks-and-tradeoffs │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   architect: requirement-to-design   │
│   └─ Output: updated design-note   │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Downstream Notification   │
└─────────────────────────┘
```

---

## 6. Failure Handling

### 6.1 Skill-Level Failure Modes

| Skill | Failure Mode | Detection | Recovery |
|-------|--------------|-----------|----------|
| requirement-to-design | Spec Parroting | Checklist: 有无 requirement→design mapping | Rework with explicit mapping |
| requirement-to-design | Missing Non-goals | Checklist: non-goals 是否为空 | 补充 non-goals |
| module-boundary-design | Folder-Driven | Checklist: 是否只列目录 | 补充 responsibility table |
| module-boundary-design | No Integration Seams | Checklist: integration_seams 是否定义 | 补充 seam 定义 |
| tradeoff-analysis | No Alternatives | Checklist: alternatives_considered 是否有内容 | 补充 alternatives |
| tradeoff-analysis | No Revisit Trigger | Checklist: revisit_trigger 是否定义 | 补充 revisit 条件 |

### 6.2 Artifact-Level Failure Modes

| Artifact | Failure Mode | Detection | Recovery |
|----------|--------------|-----------|----------|
| design-note | Hidden Assumptions | assumptions 字段为空但存在假设 | 强制填写 assumptions |
| module-boundaries | Overlapping Responsibilities | responsibility 检查 | 重新划分 |
| risks-and-tradeoffs | Vague Language | 语言检查（"优化"、"提升"等） | 要求具体量化 |
| open-questions | Missing Impact Surface | impact_surface 未定义 | 补充影响范围 |

### 6.3 Escalation Rules

以下情况触发升级（ESCALATE）：
- spec 与现有架构根本性冲突
- 关键约束相互矛盾
- 缺少核心输入无法设计
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
    - developer_can_implement: true
    - tester_can_design_tests: true
    - reviewer_can_judge: true
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
| R-001 | 现有 3-skill 目录可能造成混淆 | Medium | 明确标注 legacy compatibility |
| R-002 | skill 内容可能与 governance 文档 drift | Medium | Phase 8 强制 consistency review |
| R-003 | 下游角色尚未实现，接口可能需调整 | Low | 设计预留灵活性 |
| R-004 | 过度设计导致实现复杂度高 | Medium | 遵循 MVP 原则，先核心后扩展 |

### 8.2 Tradeoffs

| Decision | Chosen Approach | Alternative | Rationale |
|----------|-----------------|-------------|-----------|
| Artifact 存储位置 | `specs/<feature>/` | 专用 `artifacts/` 目录 | 保持 feature-level traceability |
| Skill examples 数量 | 至少 3 个 | 至少 1 个 | 确保覆盖典型场景 |
| Anti-pattern 组织 | 独立文档 | 内嵌在 SKILL.md | 便于扩展和引用 |
| 与 3-skill 关系 | 并行共存 | 直接替代 | 保持 bootstrap 流程稳定 |

### 8.3 Assumptions

| Assumption ID | Description | Impact if Wrong |
|---------------|-------------|-----------------|
| AS-001 | 002-role-model-alignment 已完成 | 需要补充治理文档 |
| AS-002 | 6-role 模型已被接受 | 需要重新讨论语义 |
| AS-003 | 下游 features 004-008 将按计划开发 | 接口可能需要调整 |
| AS-004 | Skill 内容主要使用英文 | 需要翻译支持 |

---

## 9. Requirement Traceability

### 9.1 Spec to Plan Mapping

| Spec Requirement | Plan Section | Task IDs |
|------------------|--------------|----------|
| BR-001: Design Must Be Consumable | Phase 4 (Artifact Contracts), Phase 5 (Validation) | P4-1~P4-4, P5-2 |
| BR-002: Design Must Map Requirements | Phase 3 (requirement-to-design enhancement) | P3-1 |
| BR-003: Boundaries Must Be Clear | Phase 1 (Role Scope), Phase 3 (module-boundary-design) | P1-1, P3-2 |
| BR-004: Uncertainties Must Be Explicit | Phase 4 (open-questions contract), Phase 5 (Failure-mode) | P4-4, P5-3 |
| BR-005: Skill System Must Be Extensible | Phase 2 (Skill Taxonomy) | P2-1~P2-3 |
| BR-006: Use 6-Role Formal Semantics | Phase 1, Phase 8 (Consistency Review) | P1-3, P8-1 |

### 9.2 Acceptance Criteria to Tasks Mapping

| Acceptance Criteria | Tasks |
|---------------------|-------|
| AC-001: Feature Package Complete | All phases |
| AC-002: Core Skills Implemented | P3-1, P3-2, P3-3 |
| AC-003: Skill Assets Complete | P6-1, P6-2, P6-3 |
| AC-004: Artifact Contracts Defined | P4-1, P4-2, P4-3, P4-4 |
| AC-005: Downstream Interfaces Clear | P1-2, P5-2 |
| AC-006: Consistency with Canonical Docs | P8-1, P8-2 |
| AC-007: Anti-Pattern Guidance Established | P5-4, P6-2 |
| AC-008: Completion Report Quality | P7-3 |
| AC-009: Scope Boundary Maintained | All phases (by design) |
| AC-010: First-Class Role Established | All phases (by design) |

---

## 10. Implementation Order

### 10.1 Recommended Execution Sequence

```
Week 1:
├── Phase 1: Role Scope Finalization (2 days)
│   └── Parallel: P1-1, P1-2, P1-3
├── Phase 2: Skill Taxonomy Definition (1 day)
│   └── Sequential: P2-1 → P2-2 → P2-3
└── Phase 3 Start: requirement-to-design enhancement (1 day)

Week 2:
├── Phase 3 Continue: Core Skills Enhancement (4 days)
│   ├── P3-1: requirement-to-design (1.5 days)
│   ├── P3-2: module-boundary-design (1.5 days)
│   └── P3-3: tradeoff-analysis (1 day)

Week 3:
├── Phase 4: Artifact Contract Establishment (3 days)
│   └── Parallel: P4-1, P4-2, P4-3, P4-4
├── Phase 5: Validation & Quality Layer (2 days start)
│   └── Sequential: P5-1 → P5-2 → P5-3 → P5-4

Week 4:
├── Phase 5 Complete (2 days)
├── Phase 6: Educational & Example Layer (3 days)
│   └── Parallel: P6-1, P6-2, P6-3
├── Phase 7: Workflow & Package Integration (2 days)
│   └── Sequential: P7-1 → P7-2 → P7-3

Week 5:
├── Phase 8: Consistency Review (2 days)
│   └── Sequential: P8-1 → P8-2 → P8-3
└── Buffer: Unforeseen issues (3 days)
```

### 10.2 Parallel-Safe Tasks

| Phase | Parallel-Safe Tasks |
|-------|---------------------|
| Phase 1 | P1-1, P1-2, P1-3 (可并行) |
| Phase 4 | P4-1, P4-2, P4-3, P4-4 (可并行) |
| Phase 6 | P6-1, P6-2, P6-3 (可并行) |

### 10.3 Dependencies

```
P1-1, P1-2, P1-3 → P2-1
P2-1 → P2-2 → P2-3
P2-3 → P3-1, P3-2, P3-3
P3-1 → P4-1
P3-2 → P4-2
P3-3 → P4-3
P4-1, P4-2, P4-3, P4-4 → P5-1
P5-1 → P5-2 → P5-3 → P5-4
P5-4 → P6-1, P6-2, P6-3
P6-1, P6-2, P6-3 → P7-1
P7-1 → P7-2 → P7-3
P7-3 → P8-1 → P8-2 → P8-3
```

---

## 11. Open Questions

### 11.1 From Spec (OQ-001, OQ-002, OQ-003)

| OQ ID | Question | Impact | Recommended Resolution |
|-------|----------|--------|------------------------|
| OQ-001 | Advanced Skill Priority? | Roadmap | 在 completion-report 中记录建议 |
| OQ-002 | 3-skill Integration? | Bootstrap flow | 在 de-legacy-mapping-note 中定义兼容层 |
| OQ-003 | Artifact Storage Location? | Discoverability | 确认使用 `specs/<feature>/` |

### 11.2 New Open Questions from Planning

| OQ ID | Question | Impact | Temporary Assumption |
|-------|----------|--------|---------------------|
| OQ-004 | 是否需要为每个 skill 创建独立的测试用例？ | Quality | 先完成 examples，测试用例待后续 feature |
| OQ-005 | templates 是否需要版本控制？ | Maintenance | 初版不引入版本，后续根据需要添加 |

---

## 12. Next Steps

### 12.1 Immediate Actions

1. **创建 tasks.md**：将本 plan 转换为可执行任务列表
2. **确认 open questions**：与 stakeholders 确认 OQ-001~OQ-005 的决策
3. **开始 Phase 1**：Role Scope Finalization

### 12.2 Dependencies on Other Features

| Dependency | Feature | Status |
|------------|---------|--------|
| 002-role-model-alignment | Completed | ✅ |
| 002b-governance-repair | Completed | ✅ |
| 004-developer-core | Planned | 待本 feature 完成 |
| 005-tester-core | Planned | 待本 feature 完成 |

### 12.3 Deliverables Checklist

- [ ] `specs/003-architect-core/plan.md` (本文档)
- [ ] `specs/003-architect-core/tasks.md`
- [ ] `specs/003-architect-core/contracts/design-note-contract.md`
- [ ] `specs/003-architect-core/contracts/module-boundaries-contract.md`
- [ ] `specs/003-architect-core/contracts/risks-and-tradeoffs-contract.md`
- [ ] `specs/003-architect-core/contracts/open-questions-contract.md`
- [ ] `.opencode/skills/architect/requirement-to-design/` (enhanced)
- [ ] `.opencode/skills/architect/module-boundary-design/` (enhanced)
- [ ] `.opencode/skills/architect/tradeoff-analysis/` (enhanced)
- [ ] `specs/003-architect-core/validation/` (checklists)
- [ ] `specs/003-architect-core/completion-report.md`

---

## References

- `specs/003-architect-core/spec.md` - Feature specification
- `package-spec.md` - Package governance specification
- `role-definition.md` - 6-role definition
- `io-contract.md` - Input/output contract
- `quality-gate.md` - Quality gate rules
- `docs/architecture/role-model-evolution.md` - Role model evolution strategy