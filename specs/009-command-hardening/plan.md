# Feature Plan: 009-command-hardening

## Document Status
- **Feature ID**: `009-command-hardening`
- **Version**: 1.0.0
- **Status**: Draft
- **Created**: 2026-03-27
- **Author**: architect (via OpenCode agent)

---

## Implementation Strategy

本 feature 采用 **分阶段交付** 策略，按工作类型分为 4 个并行可执行的阶段：

```
Phase 1: 规则文件建立 (docs/rules/)
Phase 2: 模板目录建立 (docs/templates/)
Phase 3: Quality Gate 检查规范 (docs/validation/)
Phase 4: Traceability 方法 (docs/traceability/)

Phase 5: Governance 同步（依赖 Phase 1-4 完成）
```

Phase 1-4 可并行执行，Phase 5 在所有 Phase 完成后执行。

---

## Phase 1: 规则文件建立

### T-1.1: 创建 coding-rules.md

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `docs/rules/coding-rules.md`

**内容框架**：
```markdown
1. 代码风格规范
2. 命名约定
3. 错误处理规范
4. 依赖管理规则
5. 代码变更自检规则
6. 与 developer skills 对齐说明
```

**对齐要求**：
- 参考 `specs/004-developer-core/contracts/selfcheck-report-contract.md`
- 参考 `.opencode/skills/developer/code-change-selfcheck/SKILL.md`

### T-1.2: 创建 testing-rules.md

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `docs/rules/testing-rules.md`

**内容框架**：
```markdown
1. 测试命名规范
2. 测试覆盖率要求
3. 测试分类规则（unit/integration/performance）
4. 测试数据管理
5. 边界条件测试规则
6. 与 tester skills 对齐说明
```

**对齐要求**：
- 参考 `specs/005-tester-core/contracts/test-scope-report-contract.md`
- 参考 `.opencode/skills/tester/unit-test-design/SKILL.md`

### T-1.3: 创建 review-rules.md

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `docs/rules/review-rules.md`

**内容框架**：
```markdown
1. 审查清单使用规则
2. 审查决策分类（approve/reject/warn）
3. 反馈规范（可执行反馈）
4. 返工规则
5. Spec-实现对比规则
6. 与 reviewer skills 对齐说明
```

**对齐要求**：
- 参考 `specs/006-reviewer-core/contracts/review-findings-report-contract.md`
- 参考 `.opencode/skills/reviewer/code-review-checklist/SKILL.md`

---

## Phase 2: 模板目录建立

### T-2.1: 创建 architect 角色模板

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `docs/templates/design-note-template.md`

**来源**: `specs/003-architect-core/contracts/design-note-contract.md`

**内容框架**：
- 标题和元数据 section
- Goal/Scope/Out-of-Scope section
- Module Boundaries section
- Risks and Trade-offs section
- Open Questions section
- 使用指南

### T-2.2: 创建 developer 角色模板

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `docs/templates/implementation-summary-template.md`

**来源**: `specs/004-developer-core/contracts/implementation-summary-contract.md`

**内容框架**：
- 标题和元数据 section
- Implementation Summary section
- Changed Files section
- Deviations section
- Self-Check section
- 使用指南

### T-2.3: 创建 tester 角色模板

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `docs/templates/test-report-template.md`

**来源**: `specs/005-tester-core/contracts/verification-report-contract.md`

**内容框架**：
- 标题和元数据 section
- Test Scope section
- Tests Run section
- Pass/Fail Summary section
- Coverage Gaps section
- 使用指南

### T-2.4: 创建 reviewer 角色模板

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `docs/templates/review-report-template.md`

**来源**: `specs/006-reviewer-core/contracts/review-findings-report-contract.md`

**内容框架**：
- 标题和元数据 section
- Overall Decision section
- Must-Fix Issues section
- Suggestions section
- Residual Risks section
- 使用指南

### T-2.5: 创建 docs 角色模板

**执行角色**: developer  
**预计耗时**: 0.5 小时  
**Deliverable**: `docs/templates/docs-sync-report-template.md`

**来源**: `specs/007-docs-core/contracts/docs-sync-report-contract.md`

### T-2.6: 创建 security 角色模板

**执行角色**: developer  
**预计耗时**: 0.5 小时  
**Deliverable**: `docs/templates/security-report-template.md`

**来源**: `specs/008-security-core/contracts/security-review-report-contract.md`

### T-2.7: 创建通用执行报告模板

**执行角色**: developer  
**预计耗时**: 0.5 小时  
**Deliverable**: `docs/templates/execution-report-template.md`

**来源**: `artifacts/001-bootstrap/batch-*-execution-report.md`

### T-2.8: 创建 completion-report 模板

**执行角色**: developer  
**预计耗时**: 0.5 小时  
**Deliverable**: `docs/templates/completion-report-template.md`

**来源**: 各 feature 的 completion-report.md

---

## Phase 3: Quality Gate 检查规范

### T-3.1: 创建 quality-gate-checklist.md

**执行角色**: developer  
**预计耗时**: 1.5 小时  
**Deliverable**: `docs/validation/quality-gate-checklist.md`

**内容框架**：
```markdown
1. 通用门禁检查清单（从 quality-gate.md Section 1 提取）
2. 角色专属检查清单整合（Section 3.1-3.6）
3. 验收层检查清单（Section 4）
4. 文档同步检查清单（Section 5）
5. 检查项编号和严重级别
```

### T-3.2: 创建 gate-validation-method.md

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `docs/validation/gate-validation-method.md`

**内容框架**：
```markdown
1. 验证方法定义（手动/自动/混合）
2. 检查执行流程（步骤化）
3. 失败处理规则（rework/escalation）
4. 验证报告格式
5. 验证时机（task-level/milestone-level）
```

---

## Phase 4: Traceability 方法

### T-4.1: 创建 traceability-method.md

**执行角色**: developer  
**预计耗时**: 1.5 小时  
**Deliverable**: `docs/traceability/traceability-method.md`

**内容框架**：
```markdown
1. 追溯链定义（需求→设计→实现→测试→审查→文档）
2. 映射方法（如何建立追溯关系）
3. Matrix 格式规范
4. 追溯验证规则（如何验证追溯完整性）
5. 追溯缺失处理规则
```

### T-4.2: 创建 traceability-matrix-template.md

**执行角色**: developer  
**预计耗时**: 1 小时  
**Deliverable**: `docs/traceability/traceability-matrix-template.md`

**内容框架**：
```markdown
1. Spec Requirements → Deliverables Matrix
2. Validation Requirements → Deliverables Matrix
3. Task → Artifact Matrix
4. 使用指南
```

---

## Phase 5: Governance 同步（依赖 Phase 1-4）

### T-5.1: 审查规范一致性

**执行角色**: reviewer  
**预计耗时**: 1 小时  
**Deliverable**: 审查报告

**审查内容**：
- 规则文件与 skills 对齐
- 模板与 contracts 对齐
- 检查清单与 quality-gate.md 对齐
- 追溯方法与 completion-report 对齐

### T-5.2: 更新 README.md

**执行角色**: docs  
**预计耗时**: 0.5 小时  
**Deliverable**: README.md 更新

**更新内容**：
- 阶段 5 标记为 "✅ 已完成"
- 添加规则文件引用说明
- 添加模板目录说明
- 添加 validation 和 traceability 目录说明

### T-5.3: 创建 completion-report.md

**执行角色**: docs  
**预计耗时**: 0.5 小时  
**Deliverable**: `specs/009-command-hardening/completion-report.md`

---

## 任务依赖图

```
Phase 1 (Rules) ─────────────────────────────┐
├── T-1.1: coding-rules.md                   │
├── T-1.2: testing-rules.md                  │
└── T-1.3: review-rules.md                   │
                                             │
Phase 2 (Templates) ──────────────────────── │
├── T-2.1: design-note-template.md           │
├── T-2.2: implementation-summary-template.md │
├── T-2.3: test-report-template.md           │
├── T-2.4: review-report-template.md         │
├── T-2.5: docs-sync-report-template.md      │
├── T-2.6: security-report-template.md       │
├── T-2.7: execution-report-template.md      │
└── T-2.8: completion-report-template.md     │
                                             │
Phase 3 (Validation) ────────────────────────│
├── T-3.1: quality-gate-checklist.md         │
└── T-3.2: gate-validation-method.md         │
                                             │
Phase 4 (Traceability) ──────────────────────│
├── T-4.1: traceability-method.md            │
└── T-4.2: traceability-matrix-template.md   │
                                             │
─────────────────────────────────────────────┘
                    │
                    ▼
Phase 5 (Governance)
├── T-5.1: 审查规范一致性
├── T-5.2: 更新 README.md
└── T-5.3: 创建 completion-report.md
```

---

## 预计总耗时

| Phase | 任务数 | 预计耗时 |
|-------|--------|----------|
| Phase 1 | 3 | 3 小时 |
| Phase 2 | 8 | 5 小时 |
| Phase 3 | 2 | 2.5 小时 |
| Phase 4 | 2 | 2.5 小时 |
| Phase 5 | 3 | 2 小时 |
| **总计** | **18** | **15 小时** |

---

## Risk Analysis

### Risk 1: 规则文件与 Skills 冲突
**影响**: 规则文件可能引入与现有 skills 不一致的约束  
**概率**: 低  
**缓解**: 严格对齐审查，参考现有 SKILL.md

### Risk 2: 模板格式不一致
**影响**: 各模板格式差异导致使用困惑  
**概率**: 中  
**缓解**: 建立统一模板骨架，统一 section 命名

### Risk 3: 检查清单遗漏
**影响**: quality-gate-checklist 遗漏关键检查项  
**概率**: 低  
**缓解**: 从 quality-gate.md 完整提取，逐项核对

### Risk 4: 追溯链不完整
**影响**: 追溯方法未能覆盖完整生命周期  
**概率**: 低  
**缓解**: 参考现有 completion-report matrix，验证覆盖度

---

## Parallel Execution Strategy

Phase 1-4 可并行执行：
- **Phase 1 + Phase 2**: 规则文件和模板文件可并行创建
- **Phase 3 + Phase 4**: 检查规范和追溯方法可并行创建

推荐分配：
- Agent A: Phase 1 (T-1.1, T-1.2, T-1.3)
- Agent B: Phase 2 (T-2.1-T-2.8)
- Agent C: Phase 3 (T-3.1, T-3.2)
- Agent D: Phase 4 (T-4.1, T-4.2)

---

## References

- `specs/009-command-hardening/spec.md` - Feature specification
- `quality-gate.md` - Quality gate definitions
- `specs/003-architect-core/contracts/` - Architect contracts
- `specs/004-developer-core/contracts/` - Developer contracts
- `specs/005-tester-core/contracts/` - Tester contracts
- `specs/006-reviewer-core/contracts/` - Reviewer contracts
- `specs/007-docs-core/contracts/` - Docs contracts
- `specs/008-security-core/contracts/` - Security contracts

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial plan creation |