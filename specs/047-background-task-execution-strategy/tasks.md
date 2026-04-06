# Implementation Tasks: Background Task Execution Strategy Optimization

## Metadata

| Field | Value |
|-------|-------|
| Feature ID | `047-background-task-execution-strategy` |
| Tasks Version | 1.0.0 |
| Created | 2026-04-07 |
| Status | Ready for Implementation |

## Task Breakdown

### Phase 1: Metadata Foundation (30 min)

#### Task 1.1: Update Capabilities Metadata

**ID**: `T-001`  
**Role**: developer  
**Priority**: High  
**Estimated Duration**: 10 min  
**Dependencies**: None

**Description**: 
扩展 `adapters/platform/opencode/capabilities.json`，新增执行策略相关metadata字段。

**Acceptance Criteria**:
- ✅ `background_task_failure_rate`字段设置为0.9
- ✅ `recommended_execution_mode`包含9种task type的推荐模式
- ✅ `known_issues`增强为结构化数组，包含PAT_REJECTION和BACKGROUND_TASK_INSTABILITY
- ✅ JSON格式有效，schema validation通过

**Deliverables**:
- Updated `capabilities.json` with new metadata fields

**Validation**:
- JSON valid (no syntax errors)
- Fields match interface contract (Module 2)
- Manual review for semantic correctness

---

#### Task 1.2: Extend Interface Contract

**ID**: `T-002`  
**Role**: architect  
**Priority**: High  
**Estimated Duration**: 20 min  
**Dependencies**: T-001

**Description**:
扩展 `adapters/interfaces/platform-adapter.interface.ts`，定义新的ExecutionStrategy类型和PlatformCapabilities扩展字段。

**Acceptance Criteria**:
- ✅ `ExecutionMode`类型定义（3种模式）
- ✅ `ExecutionStrategy`接口定义（包含mode, rationale, fallback_hint）
- ✅ `PlatformCapabilities`扩展（新增background_task_failure_rate, recommended_execution_mode）
- ✅ `KnownIssue`接口定义（结构化known issues）
- ✅ `PlatformAdapter`接口新增方法：getExecutionStrategy(), shouldUseBackground()
- ✅ TypeScript compilation成功，无类型错误

**Deliverables**:
- Extended `platform-adapter.interface.ts` with new type definitions
- Exported new interfaces for runtime consumption

**Validation**:
- `tsc --noEmit` passes
- Interface matches capabilities.json structure (T-001)
- All new types exported correctly

---

### Phase 2: Runtime Implementation (45 min)

#### Task 2.1: Implement Decision Table

**ID**: `T-003`  
**Role**: developer  
**Priority**: High  
**Estimated Duration**: 15 min  
**Dependencies**: T-002

**Description**:
在 `adapters/platform/runtime.ts` 中实现决策表，定义task type到执行策略的映射。

**Acceptance Criteria**:
- ✅ `DECISION_TABLE`常量定义（10种task types）
- ✅ 每种task type包含max_duration_estimate和default_mode
- ✅ `FAILURE_RATE_THRESHOLD`常量定义（0.3）
- ✅ Decision table数据与AGENTS.md决策表一致

**Deliverables**:
- Decision table implementation in runtime.ts
- Constants for threshold and defaults

**Validation**:
- TypeScript compilation success
- Decision table matches AGENTS.md specification (Module 4)

---

#### Task 2.2: Implement getExecutionStrategy()

**ID**: `T-004`  
**Role**: developer  
**Priority**: High  
**Estimated Duration**: 20 min  
**Dependencies**: T-002, T-003

**Description**:
实现 `getExecutionStrategy(taskType: string): ExecutionStrategy` 方法，根据platform capabilities和decision table自动选择执行策略。

**Acceptance Criteria**:
- ✅ 方法签名正确，返回ExecutionStrategy对象
- ✅ 决策逻辑：platform推荐 > failure rate threshold > decision table default
- ✅ 处理platform推荐与failure rate冲突（background → background_with_fallback）
- ✅ 未知task type返回synchronous safe default
- ✅ rationale字符串清晰解释决策依据
- ✅ background_with_fallback模式包含fallback_hint

**Deliverables**:
- `getExecutionStrategy()` implementation in runtime.ts
- Integration with platform capabilities loading

**Validation**:
- Unit test for each task type (explore, librarian, oracle, deep, etc.)
- Edge case handling (unknown task type, missing capabilities)

---

#### Task 2.3: Implement shouldUseBackground()

**ID**: `T-005`  
**Role**: developer  
**Priority**: High  
**Estimated Duration**: 5 min  
**Dependencies**: T-004

**Description**:
实现 `shouldUseBackground(taskType: string): boolean` 辅助方法，简化判断逻辑。

**Acceptance Criteria**:
- ✅ 方法签名正确，返回boolean
- ✅ 基于getExecutionStrategy()结果判断
- ✅ background或background_with_fallback返回true
- ✅ synchronous返回false

**Deliverables**:
- `shouldUseBackground()` implementation in runtime.ts

**Validation**:
- Unit test covering all modes
- Consistency with getExecutionStrategy()

---

#### Task 2.4: Export Convenience Functions

**ID**: `T-006`  
**Role**: developer  
**Priority**: Medium  
**Estimated Duration**: 5 min  
**Dependencies**: T-004, T-005

**Description**:
导出便捷函数，让主agent无需先获取adapter即可调用策略API。

**Acceptance Criteria**:
- ✅ `getExecutionStrategy(platformId, taskType, options?)`导出
- ✅ `shouldUseBackground(platformId, taskType, options?)`导出
- ✅ 函数内部调用getPlatformAdapter()获取adapter
- ✅ 导出列表更新（index.ts）

**Deliverables**:
- Exported convenience functions in runtime.ts
- Updated export list in index.ts

**Validation**:
- Import success from external module
- Convenience functions work without adapter instantiation

---

### Phase 3: AGENTS.md Guidance (30 min)

#### Task 3.1: Insert Strategy Section

**ID**: `T-007`  
**Role**: docs  
**Priority**: High  
**Estimated Duration**: 20 min  
**Dependencies**: T-004

**Description**:
在 `AGENTS.md` Phase 2A后插入"OpenCode平台适配策略"章节，提供详细的执行策略指导。

**Acceptance Criteria**:
- ✅ 章节标题："OpenCode平台适配策略"
- ✅ 包含Background Task执行问题说明（PAT rejection, instability）
- ✅ 包含推荐执行策略（3条原则）
- ✅ 包含决策表（Task Type vs Recommended Mode）
- ✅ 包含代码示例（使用getExecutionStrategy API）
- ✅ 包含Non-Blocking Execution原则（4条应该/不应该）
- ✅ 包含平台能力检查示例

**Deliverables**:
- New section in AGENTS.md (after Phase 2A)

**Validation**:
- Manual review for clarity and completeness
- Example code executable
- Cross-reference links valid

---

#### Task 3.2: Update Phase 2A Section

**ID**: `T-008`  
**Role**: docs  
**Priority**: Medium  
**Estimated Duration**: 10 min  
**Dependencies**: T-007

**Description**:
更新 `AGENTS.md` Phase 2A - Exploration & Research章节，引用新的执行策略指导。

**Acceptance Criteria**:
- ✅ Phase 2A提及新的执行策略API
- ✅ Recommend使用getExecutionStrategy()而非手动判断
- ✅ 引用"OpenCode平台适配策略"章节链接

**Deliverables**:
- Updated Phase 2A section with strategy reference

**Validation**:
- Links valid
- Narrative consistent with new strategy

---

### Phase 4: Documentation Sync (20 min)

#### Task 4.1: Update Platform Adapter Guide

**ID**: `T-009`  
**Role**: docs  
**Priority**: Medium  
**Estimated Duration**: 10 min  
**Dependencies**: T-004, T-007

**Description**:
更新 `docs/platform-adapter-guide.md`，新增"Execution Strategy Selection"章节。

**Acceptance Criteria**:
- ✅ 新章节标题："Execution Strategy Selection"
- ✅ 包含API使用示例
- ✅ 包含决策逻辑说明（4个决策因素）
- ✅ 包含Best Practices（4条建议）
- ✅ 示例代码可执行

**Deliverables**:
- New section in platform-adapter-guide.md

**Validation**:
- Manual review
- Example code executable
- Links to AGENTS.md valid

---

#### Task 4.2: Update OpenCode Adapter README

**ID**: `T-010`  
**Role**: docs  
**Priority**: Medium  
**Estimated Duration**: 10 min  
**Dependencies**: T-007, T-009

**Description**:
更新 `adapters/platform/opencode/README.md` Known Issues章节，增强PAT Rejection和Background Task Instability说明。

**Acceptance Criteria**:
- ✅ PAT Rejection标注为CRITICAL severity
- ✅ 包含Root Cause和Impact说明
- ✅ Workaround示例使用getExecutionStrategy API
- ✅ Status标注为"Known limitation, workaround provided"
- ✅ Background Task Instability也更新

**Deliverables**:
- Enhanced Known Issues section in README.md

**Validation**:
- Manual review
- Workaround examples executable
- Consistency with AGENTS.md strategy section

---

### Phase 5: Integration Validation (15 min)

#### Task 5.1: Verify Acceptance Criteria

**ID**: `T-011`  
**Role**: tester  
**Priority**: High  
**Estimated Duration**: 10 min  
**Dependencies**: All previous tasks (T-001 ~ T-010)

**Description**:
验证所有Acceptance Criteria（AC-001 ~ AC-005）已满足。

**Acceptance Criteria**:
- ✅ AC-001: Platform Capabilities Metadata Extended (T-001)
- ✅ AC-002: Runtime API Extended (T-004, T-005, T-006)
- ✅ AC-003: AGENTS.md Strategy Guidance Added (T-007, T-008)
- ✅ AC-004: Decision Table Implemented (T-003)
- ✅ AC-005: Interface Contract Updated (T-002)

**Deliverables**:
- AC verification checklist
- Test results for each AC

**Validation**:
- All ACs marked as satisfied
- No blocking issues found

---

#### Task 5.2: Governance Alignment Check

**ID**: `T-012`  
**Role**: reviewer  
**Priority**: High  
**Estimated Duration**: 5 min  
**Dependencies**: T-011

**Description**:
执行AH-001 ~ AH-006 governance检查，确保feature完成符合治理规范。

**Acceptance Criteria**:
- ✅ AH-001: Canonical comparison (role-definition, package-spec, io-contract无冲突)
- ✅ AH-002: Cross-document consistency (AGENTS.md与README一致)
- ✅ AH-003: Path resolution (所有声明路径真实存在)
- ✅ AH-004: Status truthfulness (README披露已知限制)
- ✅ AH-005: README governance status (README更新feature状态)
- ✅ AH-006: Reviewer enhanced responsibilities (检查spec vs implementation)
- ✅ AH-007: Version declarations synchronized (无需，无版本变更)
- ✅ AH-008: CHANGELOG reflects release (CHANGELOG添加feature条目)
- ✅ AH-009: Compatibility matrix updated (无需，非MAJOR发布)

**Deliverables**:
- Governance alignment report
- README/CHANGELOG updates if needed

**Validation**:
- All AH checks pass
- No governance violations

---

## Task Execution Order

### Parallel-Safe Tasks

以下任务可并行执行：

**Parallel Group 1**: T-001, T-002 (Phase 1 tasks)
- T-001 (capabilities.json) 和 T-002 (interface) 可同时编写

**Parallel Group 2**: T-007, T-009, T-010 (Phase 3 & 4 docs tasks)
- AGENTS.md, platform-adapter-guide.md, opencode README可同时更新

### Sequential Dependencies

以下任务必须按顺序执行：

**Chain 1**: T-001 → T-002 → T-003 → T-004 → T-005 → T-006
- Metadata → Interface → Decision Table → API Implementation

**Chain 2**: T-004 → T-007 → T-008
- Runtime API → AGENTS.md Strategy Section

**Chain 3**: T-007 → T-009 → T-010
- AGENTS.md → Platform Guide → OpenCode README

**Final**: T-001~T-010 → T-011 → T-012
- All implementation → Validation → Governance

### Recommended Execution Flow

```
Parallel Start:
  T-001 (capabilities)  ──┐
  T-002 (interface)    ──┤
                          ↓
Sequential:              T-003 (decision table)
                          ↓
                         T-004 (getExecutionStrategy)
                          ↓
                         T-005 (shouldUseBackground)
                          ↓
                         T-006 (exports)
                          ↓
Parallel Mid:           T-007 (AGENTS.md) ──┐
                          T-009 (guide)  ──┤
                          T-010 (README) ──┤
                                           ↓
Sequential End:         T-008 (Phase 2A update)
                                           ↓
Final:                  T-011 (AC verification)
                                           ↓
                        T-012 (Governance check)
```

## Estimated Total Effort

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | T-001, T-002 | 30 min |
| Phase 2 | T-003 ~ T-006 | 45 min |
| Phase 3 | T-007, T-008 | 30 min |
| Phase 4 | T-009, T-010 | 20 min |
| Phase 5 | T-011, T-012 | 15 min |
| **Total** | **12 tasks** | **140 min (2.3 hours)** |

## Success Metrics

1. **Implementation Completeness**: All 12 tasks completed
2. **AC Satisfaction**: All 5 acceptance criteria verified
3. **Governance Compliance**: AH-001~AH-009 all pass
4. **Execution Time Improvement**: Explore task <5s (benchmark)
5. **Documentation Quality**: Examples executable, links valid

## Risk Mitigation

### Risk: Decision Table Complexity

**Mitigation**: Keep decision logic simple (3-step: platform recommendation → failure rate → default)

### Risk: Metadata Drift

**Mitigation**: Provide project override mechanism, plan future dynamic tracking feature

### Risk: Documentation Inconsistency

**Mitigation**: T-012 governance check ensures cross-document consistency

## Post-Implementation

1. **Benchmark**: Measure explore task execution time improvement
2. **Adoption Tracking**: Observe usage in subsequent features
3. **Failure Rate Monitoring**: Track actual background task success/failure
4. **Future Enhancement**: Plan dynamic failure rate tracking (feature 048+)

## References

- `specs/047-background-task-execution-strategy/spec.md` - Feature specification
- `specs/047-background-task-execution-strategy/plan.md` - Implementation plan
- `AGENTS.md` - Execution rules and governance
- `quality-gate.md` - Quality gate definition