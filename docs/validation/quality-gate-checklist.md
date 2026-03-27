# Quality Gate Checklist

> **版本**: 1.0.0  
> **来源**: `quality-gate.md` Section 1-6  
> **用途**: 手动质量门禁检查执行清单  
> **对齐规则**: BR-003 - 检查清单必须与 `quality-gate.md` 完全对齐

---

## 1. 使用方法

### 1.1 适用场景
- Task 完成后自检
- Milestone 验收前预检
- Reviewer 审查前对照
- 审计人员复核依据

### 1.2 检查执行流程
1. 识别输出所属角色（architect/developer/tester/reviewer/docs/security）
2. 执行通用门禁检查（Section 2）
3. 执行角色专属检查（Section 3）
4. 执行验收层检查（如需要）（Section 4）
5. 执行文档同步检查（如影响 governance）（Section 5）
6. 汇总检查结果，判定 Pass/Fail

### 1.3 结果判定规则

| 检查类别 | Pass 条件 | Fail 条件 |
|----------|-----------|-----------|
| 通用门禁 | 全项通过，无 S3 问题 | 存在 S3 问题或 >3 个 S2 问题 |
| 角色专属 | 全项通过，无 blocker | 存在任一 blocker |
| 验收层 | 状态为 ACCEPTED | 状态为 REWORK/ESCALATE |
| 文档同步 | 无 S2/S3 不一致 | 存在 S2/S3 级别不一致 |

---

## 2. 通用质量门禁检查清单 (Universal Gate)

> **来源**: `quality-gate.md` Section 1  
> **编号**: UG-*

### 2.1 Completeness Checks（完整性检查）

#### 输出结构检查

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| UG-001 | 必填字段全部存在（根据 I/O Contract） | S2 | 关键字段缺失阻塞下游 |
| UG-002 | artifacts 列表存在（若无 artifact 已说明原因） | S2 | 交付物追踪必需 |
| UG-003 | changed_files 已列出（若无改动显式写空列表） | S1 | 变更追踪基础 |
| UG-004 | checks_performed 已列出（至少一项自检） | S1 | 可追溯性保证 |
| UG-005 | issues_found 已列出（若无问题显式写空列表） | S1 | 问题追踪基础 |
| UG-006 | risks 已说明（若无风险显式说明） | S2 | 风险披露必需 |
| UG-007 | recommendation 已明确 | S2 | 下游决策必需 |

#### 内容完整性检查

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| UG-008 | summary 覆盖"做了什么、是否达成目标、还缺什么" | S1 | 信息完整性 |
| UG-009 | assumptions 已记录（设计假设、前提条件） | S1 | 可追溯性 |
| UG-010 | open questions 已记录（如有） | S0 | 未决问题追踪 |
| UG-011 | scope / out-of-scope 已明确 | S1 | 边界界定 |

### 2.2 Consistency Checks（一致性检查）

#### 术语一致性

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| UG-012 | 使用 canonical terms，不混用同义词 | S2 | 防止理解偏差 |
| UG-013 | 无未定义术语（首次出现的术语已解释） | S1 | 新术语解释 |
| UG-014 | 术语含义前后一致 | S2 | 语义一致性 |

#### 逻辑一致性

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| UG-015 | 无自相矛盾的规则或结论 | S3 | 逻辑冲突阻塞 |
| UG-016 | 输出与上游 spec / plan 不冲突 | S2 | 规范对齐 |
| UG-017 | status 与 summary 描述一致 | S1 | 状态描述一致 |

### 2.3 Traceability Checks（可追溯性检查）

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| UG-018 | 关键结论有输入来源支撑 | S2 | 证据支撑 |
| UG-019 | 每个 artifact 注明来源（spec/plan/task） | S1 | 交付物来源 |
| UG-020 | 需求能映射到设计（architect） | S2 | 需求-设计追溯 |
| UG-021 | 设计能映射到实现（developer） | S2 | 设计-实现追溯 |
| UG-022 | 实现能映射到验证（tester） | S2 | 实现-验证追溯 |

### 2.4 Output Format Checks（输出格式检查）

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| UG-023 | 使用统一的 schema 格式 | S1 | 格式标准化 |
| UG-024 | section 顺序符合模板要求 | S0 | 格式一致性 |
| UG-025 | 不存在空章节（未填写应标注"N/A"） | S1 | 内容完整性 |
| UG-026 | 日期时间使用统一格式（ISO 8601） | S0 | 时间格式标准化 |

### 2.5 Pass/Fail Criteria（通过/失败条件）

- **Pass**: 全部通用检查项通过，无 S3 级别问题
- **Fail**: 存在任一 S3 级别问题，或超过 3 个 S2 级别问题

---

## 3. 角色专属质量门禁检查清单

> **来源**: `quality-gate.md` Section 3.1-3.6  
> **编号**: RG-*

### 3.1 architect Gate（架构师）

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| RG-A-001 | design summary 存在且清晰 | S2 | 必备输出 |
| RG-A-002 | module boundary 已明确划分 | S2 | 必备输出 |
| RG-A-003 | interface / data contract 已定义（包含输入输出） | S2 | 必备输出 |
| RG-A-004 | assumptions 已记录 | S1 | 必备输出 |
| RG-A-005 | risks 已列出（至少识别 top 3 风险） | S2 | 必备输出 |
| RG-A-006 | recommended implementation order 可执行 | S1 | 必备输出 |
| RG-A-007 | 方案能把 requirement 转为可执行路径 | S2 | 设计质量 |
| RG-A-008 | 模块边界清晰，无重叠或遗漏 | S2 | 设计质量 |
| RG-A-009 | 接口契约完整（输入参数、输出格式、错误处理） | S2 | 设计质量 |
| RG-A-010 | 技术 trade-off 已说明（如有） | S1 | 设计质量 |

**低质量模式（Blocker）**:

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| RG-A-B01 | 方案过于抽象，无法落地 | S3 | blocker |
| RG-A-B02 | 只写原则，不写边界 | S3 | blocker |
| RG-A-B03 | 不写 assumptions | S2 | blocker |
| RG-A-B04 | 不写 trade-off | S2 | blocker |
| RG-A-B05 | 风险未暴露 | S3 | blocker |
| RG-A-B06 | implementation steps 不可执行 | S3 | blocker |

**Pass Criteria**: 全部必备输出存在，方案可被 developer 直接采用。

---

### 3.2 developer Gate（开发者）

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| RG-D-001 | changed_files 已列出（含变更类型） | S2 | 必备输出 |
| RG-D-002 | implementation summary 存在 | S2 | 必备输出 |
| RG-D-003 | deviations from design 已说明（如有偏离） | S2 | 必备输出 |
| RG-D-004 | self-check result 已记录 | S1 | 必备输出 |
| RG-D-005 | unresolved issues 已列出（如无显式写"无"） | S1 | 必备输出 |
| RG-D-006 | 满足 expected_outputs 所有要求 | S2 | 代码质量 |
| RG-D-007 | 遵守 constraints（未超范围改动） | S3 | 代码质量 |
| RG-D-008 | 实现范围清晰（说明做了什么、没做什么） | S1 | 代码质量 |
| RG-D-009 | 未隐瞒风险 | S3 | 代码质量 |

**自检最低要求**:

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| RG-D-SC01 | 实现目标对齐检查 | S1 | 自检项 |
| RG-D-SC02 | 改动范围检查（确认未改不相关文件） | S2 | 自检项 |
| RG-D-SC03 | 依赖引入检查（新依赖已说明必要性） | S1 | 自检项 |
| RG-D-SC04 | 关键路径自读检查 | S1 | 自检项 |
| RG-D-SC05 | 与 design note 一致性检查（若有 design） | S2 | 自检项 |

**低质量模式（Blocker）**:

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| RG-D-B01 | 代码写了，但无 summary | S3 | blocker |
| RG-D-B02 | 改了不相关文件（超范围） | S3 | blocker |
| RG-D-B03 | 与 design 偏离但未说明 | S2 | blocker |
| RG-D-B04 | 自检缺失 | S2 | blocker |
| RG-D-B05 | 失败路径没处理 | S2 | blocker |
| RG-D-B06 | 假装测试已经通过 | S3 | blocker |

**Pass Criteria**: 代码可编译/构建，实现满足 goal，具备进入 tester 的条件。

---

### 3.3 tester Gate（测试员）

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| RG-T-001 | test scope 已说明 | S2 | 必备输出 |
| RG-T-002 | tests added / tests run 已记录 | S1 | 必备输出 |
| RG-T-003 | pass/fail summary 明确（通过数/失败数/跳过数） | S2 | 必备输出 |
| RG-T-004 | uncovered gaps 已列出 | S1 | 必备输出 |
| RG-T-005 | edge cases checked 已说明 | S1 | 必备输出 |
| RG-T-006 | 覆盖 acceptance criteria 的关键路径 | S2 | 测试质量 |
| RG-T-007 | pass/fail 结论明确（不是"感觉没问题"） | S2 | 测试质量 |
| RG-T-008 | gap 分析清楚（哪些没测、为什么） | S1 | 测试质量 |
| RG-T-009 | failure 分类清晰（可重试/不可重试） | S1 | 测试质量 |

**低质量模式（Blocker）**:

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| RG-T-B01 | 只跑 happy path | S3 | blocker |
| RG-T-B02 | 不写 coverage gap | S2 | blocker |
| RG-T-B03 | 失败不分类 | S2 | blocker |
| RG-T-B04 | 不区分 test design 和 test execution | S2 | blocker |
| RG-T-B05 | 无法复现失败原因 | S3 | blocker |

**Pass Criteria**: 关键路径有测试覆盖，失败（如有）已分类并给出修复建议。

---

### 3.4 reviewer Gate（审查员）

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| RG-R-001 | overall decision 明确（approve / reject / warn） | S2 | 必备输出 |
| RG-R-002 | must-fix issues 已列出（如无显式写"无"） | S2 | 必备输出 |
| RG-R-003 | non-blocking issues 已区分 | S1 | 必备输出 |
| RG-R-004 | residual risks 已说明 | S1 | 必备输出 |
| RG-R-005 | actionable suggestions 已给出 | S1 | 必备输出 |
| RG-R-006 | spec 与实现对齐检查已完成 | S2 | 审查质量 |
| RG-R-007 | must-fix 和 suggestion 已区分 | S2 | 审查质量 |
| RG-R-008 | 每个 must-fix 都有具体修复建议 | S2 | 审查质量 |
| RG-R-009 | 风险说明清晰 | S1 | 审查质量 |

**低质量模式（Blocker）**:

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| RG-R-B01 | 只说"需要优化"但不说怎么改 | S2 | blocker |
| RG-R-B02 | 不区分严重性 | S2 | blocker |
| RG-R-B03 | 不对齐 spec / design | S3 | blocker |
| RG-R-B04 | 只看代码风格，不看目标达成 | S2 | blocker |
| RG-R-B05 | 一边 review 一边偷偷补实现 | S3 | blocker |

**Pass Criteria**: 结论明确，must-fix 可执行，建议具体可操作。

---

### 3.5 docs Gate（文档员）

> **实现来源**: `007-docs-core` feature 正式实现

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| RG-DOC-001 | synced docs list 已列出 | S2 | 必备输出 |
| RG-DOC-002 | missing docs 已说明（如无显式写"无"） | S1 | 必备输出 |
| RG-DOC-003 | user-facing summary 存在 | S2 | 必备输出 |
| RG-DOC-004 | internal summary 存在（如适用） | S1 | 必备输出 |
| RG-DOC-005 | sync_target 已定义 | S2 | docs-sync-report |
| RG-DOC-006 | consumed_artifacts 已记录（BR-001 证据消费） | S2 | docs-sync-report |
| RG-DOC-007 | touched_sections 已记录（BR-002 最小表面积） | S1 | docs-sync-report |
| RG-DOC-008 | change_reasons 每个变更都有原因 | S1 | docs-sync-report |
| RG-DOC-009 | consistency_checks 已执行（BR-005 跨文档一致性） | S2 | docs-sync-report |
| RG-DOC-010 | status_updates 基于证据 | S2 | docs-sync-report |
| RG-DOC-011 | recommendation 明确（sync-complete / needs-follow-up / blocked） | S2 | docs-sync-report |
| RG-DOC-012 | feature_id 正确 | S1 | changelog-entry |
| RG-DOC-013 | change_type 正确分类（BR-006） | S1 | changelog-entry |
| RG-DOC-014 | summary 具体，非空泛 | S2 | changelog-entry |
| RG-DOC-015 | breaking_changes 已披露（如有） | S2 | changelog-entry |
| RG-DOC-016 | known_limitations 已记录 | S1 | changelog-entry |
| RG-DOC-017 | 明确更新了哪些文档 | S1 | 文档质量 |
| RG-DOC-018 | 说明没覆盖的文档项 | S1 | 文档质量 |
| RG-DOC-019 | 与实现结果对齐 | S2 | 文档质量 |
| RG-DOC-020 | 避免写出未实现功能 | S3 | 文档质量 |

**低质量模式（Blocker）**:

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| RG-DOC-B01 | changelog 空泛 | S2 | blocker |
| RG-DOC-B02 | README 与实际不符 | S3 | blocker |
| RG-DOC-B03 | 文档遗漏风险说明 | S2 | blocker |
| RG-DOC-B04 | 文档提前描述未完成功能 | S3 | blocker |
| RG-DOC-B05 | Status Inflation (AP-001): 声明完成但证据显示部分完成 | S3 | blocker |
| RG-DOC-B06 | Over-Updating (AP-002): 变更无关部分 | S2 | blocker |
| RG-DOC-B07 | Drift Ignorance (AP-003): 未检查跨文档一致性 | S2 | blocker |
| RG-DOC-B08 | Vague Changelog (AP-005): 通用条目无具体内容 | S2 | blocker |

**Pass Criteria**: 用户侧可见的文档已同步，缺失文档已识别，状态与证据对齐。

**Validation References**:
- `specs/007-docs-core/validation/docs-sync-report-checklist.md`
- `specs/007-docs-core/validation/changelog-entry-checklist.md`
- `specs/007-docs-core/validation/consistency-review-checklist.md`

---

### 3.6 security Gate（安全员）

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| RG-S-001 | scope checked 已说明 | S2 | 必备输出 |
| RG-S-002 | issues by severity 已分类（critical/high/medium/low） | S2 | 必备输出 |
| RG-S-003 | must-fix list 已列出 | S2 | 必备输出 |
| RG-S-004 | residual risks 已说明 | S1 | 必备输出 |
| RG-S-005 | gate recommendation 明确（通过/条件通过/阻断） | S2 | 必备输出 |
| RG-S-006 | 明确检查范围 | S2 | 安全质量 |
| RG-S-007 | high / critical issue 已识别 | S2 | 安全质量 |
| RG-S-008 | 区分 must-fix 与可延期项 | S1 | 安全质量 |
| RG-S-009 | 给出放行建议 | S2 | 安全质量 |

**低质量模式（Blocker）**:

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| RG-S-B01 | 只给"注意安全"类空话 | S3 | blocker |
| RG-S-B02 | 不区分严重性 | S2 | blocker |
| RG-S-B03 | 不说明检查范围 | S2 | blocker |
| RG-S-B04 | 未识别权限 / secret / 输入校验类问题 | S3 | blocker |

**Pass Criteria**: 检查范围明确，critical/high 问题已识别，gate 建议清晰。

---

## 4. 验收层质量门禁检查清单

> **来源**: `quality-gate.md` Section 4  
> **编号**: AG-*

### 4.1 Task-Level Acceptance Gate

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| AG-T-001 | task 已完成（状态为 DONE/VERIFIED） | S2 | 状态检查 |
| AG-T-002 | required outputs 存在 | S2 | 交付物检查 |
| AG-T-003 | 通过对应角色的 role gate | S2 | 角色门禁 |
| AG-T-004 | 无 must-fix 问题 | S2 | 问题检查 |
| AG-T-005 | 风险在可接受范围内 | S1 | 风险检查 |

**状态判定**:
- **TASK_ACCEPTED**: 所有检查通过
- **TASK_ACCEPTED_WITH_WARNINGS**: 主目标达成，存在非阻塞性问题
- **TASK_REWORK_REQUIRED**: 问题可局部修复
- **TASK_REPLAN_REQUIRED**: task 定义有问题
- **TASK_ESCALATED**: 风险高或多轮失败

---

### 4.2 Milestone-Level Acceptance Gate

#### 最低通过门槛

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| AG-M-001 | 里程碑主要目标达成 | S2 | 目标检查 |
| AG-M-002 | 所有 required tasks 通过 task-level gate | S2 | 任务检查 |
| AG-M-003 | 关键验证通过（build/test/review） | S2 | 验证检查 |
| AG-M-004 | 无 critical/high security issue | S3 | 安全检查 |
| AG-M-005 | 用户侧文档已同步 | S2 | 文档检查 |
| AG-M-006 | acceptance criteria 覆盖度达到阈值（建议 80%+） | S1 | 需求覆盖 |

#### 按任务类型调整门槛

**architecture task**:

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| AG-M-ARCH-001 | design note 存在 | S2 | 架构任务 |
| AG-M-ARCH-002 | 接口/边界定义清楚 | S2 | 架构任务 |
| AG-M-ARCH-003 | 主要风险列出 | S1 | 架构任务 |
| AG-M-ARCH-004 | implementation 可执行 | S2 | 架构任务 |

**implementation task**:

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| AG-M-IMPL-001 | 代码改动存在 | S2 | 实现任务 |
| AG-M-IMPL-002 | 自检结果存在 | S1 | 实现任务 |
| AG-M-IMPL-003 | build/unit test/review 满足要求 | S2 | 实现任务 |

**test task**:

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| AG-M-TEST-001 | test report 存在 | S2 | 测试任务 |
| AG-M-TEST-002 | 覆盖范围说明清楚 | S1 | 测试任务 |
| AG-M-TEST-003 | pass/fail 结论明确 | S2 | 测试任务 |

**review task**:

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| AG-M-REV-001 | review report 存在 | S2 | 审查任务 |
| AG-M-REV-002 | 结论明确 | S2 | 审查任务 |
| AG-M-REV-003 | must-fix/optional issue 区分明确 | S1 | 审查任务 |

**docs task**:

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| AG-M-DOC-001 | 文档更新结果存在 | S2 | 文档任务 |
| AG-M-DOC-002 | 变更影响范围说明清楚 | S1 | 文档任务 |

**security task**:

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| AG-M-SEC-001 | security report 存在 | S2 | 安全任务 |
| AG-M-SEC-002 | severity 级别清楚 | S2 | 安全任务 |
| AG-M-SEC-003 | 是否可放行有明确结论 | S2 | 安全任务 |

**状态判定**:
- **MILESTONE_ACCEPTED**: 所有检查通过，风险可接受
- **MILESTONE_ACCEPTED_WITH_WARNINGS**: 主要目标达成，有次要遗留
- **MILESTONE_REWORK_REQUIRED**: 可局部弥补
- **MILESTONE_REPLANNING_REQUIRED**: 里程碑范围不合理
- **MILESTONE_ESCALATED**: 需要用户拍板

---

## 5. 项目级文档同步检查清单

> **来源**: `quality-gate.md` Section 5  
> **编号**: DG-*

### 5.1 Trigger Conditions（触发条件）

以下任一条件满足时，必须执行文档同步检查：

| ID | 触发条件 | 检查必要性 |
|----|----------|-----------|
| DG-TG-001 | feature 影响 role model（角色定义、角色边界、角色映射） | 必须 |
| DG-TG-002 | feature 影响 workflow / stage order（工作流程、阶段顺序、执行流程） | 必须 |
| DG-TG-003 | feature 影响 commands behavior（命令行为、输入输出契约、command 接口） | 必须 |
| DG-TG-004 | feature 影响 skills behavior（skill 职责、skill 接口、skill 分类） | 必须 |
| DG-TG-005 | feature 影响 migration strategy（迁移策略、过渡方案、弃用计划） | 必须 |
| DG-TG-006 | feature 影响 package-level usage expectations（使用方式、集成点、对外契约） | 必须 |

### 5.2 Required Documentation Checks（必须检查的文档）

#### Governance Documents

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| DG-GOV-001 | README.md - 项目概览、Quick Start、Workflow、Skills 目录结构 | S2 | 治理文档 |
| DG-GOV-002 | AGENTS.md - 开发规则、角色语义优先规则、全局约束 | S2 | 治理文档 |
| DG-GOV-003 | package-spec.md - 包规格、角色定义、skill 分类、I/O 契约 | S2 | 治理文档 |
| DG-GOV-004 | role-definition.md - 角色详细定义、角色边界、协作关系 | S2 | 治理文档 |

#### Check Items

| ID | 检查项 | 严重级别 | 说明 |
|----|--------|----------|------|
| DG-CHK-001 | 所有治理文档中的术语一致（role、skill、command、stage 等） | S2 | 术语一致性 |
| DG-CHK-002 | feature 引入的变更在所有相关文档中都有体现 | S2 | 变更同步 |
| DG-CHK-003 | 无矛盾的描述（一个文档说 X，另一个文档说 Y） | S3 | 描述一致性 |
| DG-CHK-004 | 迁移/过渡相关的说明在各文档中一致 | S2 | 迁移一致性 |
| DG-CHK-005 | 指向其他文档的链接有效 | S1 | 链接有效性 |

### 5.3 Pass/Fail Criteria

**Pass Conditions**:
- feature 不影响 package governance: 无需额外检查，通过
- feature 影响 package governance:
  - 所有 Required Documentation Checks 通过
  - 无 S2/S3 级别的不一致问题
  - reviewer 认文档同步完成

**Fail Conditions**:
- S3（Critical）: governance 文档之间存在根本性矛盾
- S2（Major）: feature 影响的变更未同步到某份 governance 文档
- S2（Major）: 术语混用导致理解偏差

---

## 6. Review Checklist（人工审查清单）

> **来源**: `quality-gate.md` Section 6  
> **编号**: RC-*

### 6.1 通用审查项

| ID | 检查项 | 说明 |
|----|--------|------|
| RC-001 | 该输出是否可直接交给下游角色？ | 下游可消费性 |
| RC-002 | 是否还需要补充澄清？ | 信息完整性 |
| RC-003 | 是否有高风险 assumption？ | 风险识别 |
| RC-004 | 是否存在应阻塞的冲突？ | 冲突检查 |
| RC-005 | traceability 是否完整？ | 追溯完整性 |

### 6.2 角色专属审查项

| ID | 检查项 | 适用角色 |
|----|--------|----------|
| RC-ROLE-001 | 设计是否可被 developer 直接采用？ | architect |
| RC-ROLE-002 | 实现是否满足 goal？是否超范围？ | developer |
| RC-ROLE-003 | 关键路径是否覆盖？失败是否分类？ | tester |
| RC-ROLE-004 | must-fix 是否清晰可执行？ | reviewer |
| RC-ROLE-005 | 用户侧文档是否同步？ | docs |
| RC-ROLE-006 | high/critical 问题是否识别？ | security |

---

## 7. 严重级别速查表

> **来源**: `quality-gate.md` Section 2.1

| 级别 | 名称 | 定义 | 处理 |
|------|------|------|------|
| S0 | Trivial | 不影响功能、不阻塞下游、用户不可见的微小问题 | 可忽略，后续迭代顺带修复 |
| S1 | Minor | 对下游影响较小，但有改进空间的问题 | 建议修复，不阻塞流程 |
| S2 | Major | 影响下游角色正常工作，或可能导致理解偏差的问题 | 必须修复，阻塞下游交接，触发 REWORK |
| S3 | Critical | 严重错误，必须阻塞，无法继续流程的问题 | 立即阻塞，触发 REWORK 或 ESCALATE |

---

## 附录 A: 检查项统计

| 类别 | 检查项数量 |
|------|-----------|
| 通用门禁 (UG) | 26 项 |
| architect Gate (RG-A) | 16 项 |
| developer Gate (RG-D) | 15 项 |
| tester Gate (RG-T) | 14 项 |
| reviewer Gate (RG-R) | 14 项 |
| docs Gate (RG-DOC) | 28 项 |
| security Gate (RG-S) | 13 项 |
| Task Acceptance (AG-T) | 5 项 |
| Milestone Acceptance (AG-M) | 21 项 |
| 文档同步 (DG) | 15 项 |
| 人工审查 (RC) | 11 项 |
| **总计** | **163 项** |

---

## 文档信息

- **文档 ID**: quality-gate-checklist-v1
- **版本**: 1.0.0
- **创建日期**: 2026-03-27
- **来源文档**: `quality-gate.md`
- **Feature**: 009-command-hardening (T-3.1)
- **对齐规则**: BR-003 - 检查清单必须与 quality-gate.md 完全对齐