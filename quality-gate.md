# Quality Gate

本文件定义 OpenCode 专家包的质量门禁体系，包括通用 gate、各角色专属 gate、以及验收层 gate。

---

## 1. 通用质量门禁 (Universal Gate)

### Gate Name
Universal Quality Gate

### Objective
检查所有角色输出必须满足的通用质量要求，确保输出完整性、一致性、可追溯性和可消费性。

### Completeness Checks（完整性检查）

#### 输出结构检查
- [ ] 必填字段全部存在（根据 I/O Contract）
- [ ] artifacts 列表存在（若无 artifact 已说明原因）
- [ ] changed_files 已列出（若无改动显式写空列表）
- [ ] checks_performed 已列出（至少一项自检）
- [ ] issues_found 已列出（若无问题显式写空列表）
- [ ] risks 已说明（若无风险显式说明）
- [ ] recommendation 已明确

#### 内容完整性检查
- [ ] summary 覆盖"做了什么、是否达成目标、还缺什么"
- [ ] assumptions 已记录（设计假设、前提条件）
- [ ] open questions 已记录（如有）
- [ ] scope / out-of-scope 已明确

### Consistency Checks（一致性检查）

#### 术语一致性
- [ ] 使用 canonical terms，不混用同义词
- [ ] 无未定义术语（首次出现的术语已解释）
- [ ] 术语含义前后一致

#### 逻辑一致性
- [ ] 无自相矛盾的规则或结论
- [ ] 输出与上游 spec / plan 不冲突
- [ ] status 与 summary 描述一致

### Traceability Checks（可追溯性检查）

- [ ] 关键结论有输入来源支撑
- [ ] 每个 artifact 注明来源（spec/plan/task）
- [ ] 需求能映射到设计（architect）
- [ ] 设计能映射到实现（developer）
- [ ] 实现能映射到验证（tester）

### Output Format Checks（输出格式检查）

- [ ] 使用统一的 schema 格式
- [ ] section 顺序符合模板要求
- [ ] 不存在空章节（未填写应标注"N/A"）
- [ ] 日期时间使用统一格式（ISO 8601）

### Pass Criteria（通过条件）
全部通用检查项通过，无 S3 级别问题。

### Fail Criteria（失败条件）
存在任一 S3 级别问题，或超过 3 个 S2 级别问题。

---

## 2. 严重程度分级 (Severity Levels)

### S0 - Trivial（可忽略）
**定义：** 不影响功能、不阻塞下游、用户不可见的微小问题。

**示例：**
- 错别字
- 格式轻微不统一
- 注释缺失

**处理：** 可忽略，或在后续迭代中顺带修复。

### S1 - Minor（建议修复）
**定义：** 对下游影响较小，但有改进空间的问题。

**示例：**
- summary 过于简略
- 缺少非关键字段
- 某些自检未记录

**处理：** 建议修复，但不阻塞流程。可在 rework 时顺带处理。

### S2 - Major（影响下游）
**定义：** 影响下游角色正常工作，或可能导致理解偏差的问题。

**示例：**
- 缺少关键字段（artifacts、risks）
- 术语混用导致歧义
- 与上游 spec 轻微冲突
- 自检缺失

**处理：** 必须修复，阻塞下游交接。触发返工（REWORK）。

### S3 - Critical（必须阻塞）
**定义：** 严重错误，必须阻塞，无法继续流程的问题。

**示例：**
- 伪造验证结果（未测试声称通过）
- 严重与 spec 冲突
- 隐瞒重大风险
- 输出无法被下游消费
- 超出约束范围执行

**处理：** 立即阻塞，触发返工或升级（ESCALATE）。

---

## 3. 角色专属质量门禁

### 3.1 architect Gate

#### Gate Name
Architect Output Quality Gate

#### Objective
确保 architect 输出的 design note 是可执行的，边界清晰，风险明确。

#### 必备输出检查
- [ ] design summary 存在且清晰
- [ ] module boundary 已明确划分
- [ ] interface / data contract 已定义（包含输入输出）
- [ ] assumptions 已记录
- [ ] risks 已列出（至少识别 top 3 风险）
- [ ] recommended implementation order 可执行

#### 设计质量检查
- [ ] 方案能把 requirement 转为可执行路径
- [ ] 模块边界清晰，无重叠或遗漏
- [ ] 接口契约完整，包含：输入参数、输出格式、错误处理
- [ ] 技术 trade-off 已说明（如有）

#### 常见低质量模式（Blockers）
- [ ] 方案过于抽象，无法落地
- [ ] 只写原则，不写边界
- [ ] 不写 assumptions
- [ ] 不写 trade-off
- [ ] 风险未暴露
- [ ] implementation steps 不可执行

#### Pass Criteria
全部必备输出存在，方案可被 developer 直接采用。

---

### 3.2 developer Gate

#### Gate Name
Developer Output Quality Gate

#### Objective
确保 developer 输出的代码变更是正确的、范围受控的、可测试的。

#### 必备输出检查
- [ ] changed_files 已列出（含变更类型）
- [ ] implementation summary 存在
- [ ] deviations from design 已说明（如有偏离）
- [ ] self-check result 已记录
- [ ] unresolved issues 已列出（如无显式写"无"）

#### 代码质量检查
- [ ] 满足 expected_outputs 所有要求
- [ ] 遵守 constraints（未超范围改动）
- [ ] 实现范围清晰（说明做了什么、没做什么）
- [ ] 未隐瞒风险

#### 自检最低要求
- [ ] 实现目标对齐检查
- [ ] 改动范围检查（确认未改不相关文件）
- [ ] 依赖引入检查（新依赖已说明必要性）
- [ ] 关键路径自读检查
- [ ] 与 design note 一致性检查（若有 design）

#### 常见低质量模式（Blockers）
- [ ] 代码写了，但无 summary
- [ ] 改了不相关文件（超范围）
- [ ] 与 design 偏离但未说明
- [ ] 自检缺失
- [ ] 失败路径没处理
- [ ] 假装测试已经通过

#### Pass Criteria
代码可编译/构建，实现满足 goal，具备进入 tester 的条件。

---

### 3.3 tester Gate

#### Gate Name
Tester Output Quality Gate

#### Objective
确保 tester 输出的测试报告能证明关键路径覆盖，失败分类清晰。

#### 必备输出检查
- [ ] test scope 已说明
- [ ] tests added / tests run 已记录
- [ ] pass/fail summary 明确（通过数/失败数/跳过数）
- [ ] uncovered gaps 已列出
- [ ] edge cases checked 已说明

#### 测试质量检查
- [ ] 覆盖 acceptance criteria 的关键路径
- [ ] pass/fail 结论明确（不是"感觉没问题"）
- [ ] gap 分析清楚（哪些没测、为什么）
- [ ] failure 分类清晰（可重试/不可重试）

#### 常见低质量模式（Blockers）
- [ ] 只跑 happy path
- [ ] 不写 coverage gap
- [ ] 失败不分类
- [ ] 不区分 test design 和 test execution
- [ ] 无法复现失败原因

#### Pass Criteria
关键路径有测试覆盖，失败（如有）已分类并给出修复建议。

---

### 3.4 reviewer Gate

#### Gate Name
Reviewer Output Quality Gate

#### Objective
确保 reviewer 输出的审查报告是独立的、可执行的、区分严重程度的。

#### 必备输出检查
- [ ] overall decision 明确（approve / reject / warn）
- [ ] must-fix issues 已列出（如无显式写"无"）
- [ ] non-blocking issues 已区分
- [ ] residual risks 已说明
- [ ] actionable suggestions 已给出

#### 审查质量检查
- [ ] spec 与实现对齐检查已完成
- [ ] must-fix 和 suggestion 已区分
- [ ] 每个 must-fix 都有具体修复建议
- [ ] 风险说明清晰

#### 常见低质量模式（Blockers）
- [ ] 只说"需要优化"但不说怎么改
- [ ] 不区分严重性
- [ ] 不对齐 spec / design
- [ ] 只看代码风格，不看目标达成
- [ ] 一边 review 一边偷偷补实现

#### Pass Criteria
结论明确，must-fix 可执行，建议具体可操作。

---

### 3.5 docs Gate

#### Gate Name
Docs Output Quality Gate

#### Objective
确保 docs 输出的文档同步报告完整，用户侧影响已同步。

#### 必备输出检查
- [ ] synced docs list 已列出
- [ ] missing docs 已说明（如无显式写"无"）
- [ ] user-facing summary 存在
- [ ] internal summary 存在（如适用）

#### 文档质量检查
- [ ] 明确更新了哪些文档
- [ ] 说明没覆盖的文档项
- [ ] 与实现结果对齐
- [ ] 避免写出未实现功能

#### 常见低质量模式（Blockers）
- [ ] changelog 空泛
- [ ] README 与实际不符
- [ ] 文档遗漏风险说明
- [ ] 文档提前描述未完成功能

#### Pass Criteria
用户侧可见的文档已同步，缺失文档已识别。

---

### 3.6 security Gate

#### Gate Name
Security Output Quality Gate

#### Objective
确保 security 输出的安全报告识别了风险，区分了严重程度，给出了 gate 建议。

#### 必备输出检查
- [ ] scope checked 已说明
- [ ] issues by severity 已分类（critical/high/medium/low）
- [ ] must-fix list 已列出
- [ ] residual risks 已说明
- [ ] gate recommendation 明确（通过/条件通过/阻断）

#### 安全质量检查
- [ ] 明确检查范围
- [ ] high / critical issue 已识别
- [ ] 区分 must-fix 与可延期项
- [ ] 给出放行建议

#### 常见低质量模式（Blockers）
- [ ] 只给"注意安全"类空话
- [ ] 不区分严重性
- [ ] 不说明检查范围
- [ ] 未识别权限 / secret / 输入校验类问题

#### Pass Criteria
检查范围明确，critical/high 问题已识别，gate 建议清晰。

---

## 4. 验收层质量门禁 (Acceptance Gate)

### 4.1 Task-Level Acceptance Gate

#### Objective
判断单个 task 是否可以进入下游或需要返工。

#### 检查项
- [ ] task 已完成（状态为 DONE/VERIFIED）
- [ ] required outputs 存在
- [ ] 通过对应角色的 role gate
- [ ] 无 must-fix 问题
- [ ] 风险在可接受范围内

#### 状态判定
- **TASK_ACCEPTED**: 所有检查通过
- **TASK_ACCEPTED_WITH_WARNINGS**: 主目标达成，存在非阻塞性问题
- **TASK_REWORK_REQUIRED**: 问题可局部修复
- **TASK_REPLAN_REQUIRED**: task 定义有问题
- **TASK_ESCALATED**: 风险高或多轮失败

---

### 4.2 Milestone-Level Acceptance Gate

#### Objective
判断 milestone 是否可以交付给用户验收。

#### 最低通过门槛
- [ ] 里程碑主要目标达成
- [ ] 所有 required tasks 通过 task-level gate
- [ ] 关键验证通过（build/test/review）
- [ ] 无 critical/high security issue
- [ ] 用户侧文档已同步
- [ ] acceptance criteria 覆盖度达到阈值（建议 80%+）

#### 按任务类型调整门槛

**architecture task:**
- [ ] design note 存在
- [ ] 接口/边界定义清楚
- [ ] 主要风险列出
- [ ] implementation 可执行

**implementation task:**
- [ ] 代码改动存在
- [ ] 自检结果存在
- [ ] build/unit test/review 满足要求

**test task:**
- [ ] test report 存在
- [ ] 覆盖范围说明清楚
- [ ] pass/fail 结论明确

**review task:**
- [ ] review report 存在
- [ ] 结论明确
- [ ] must-fix/optional issue 区分明确

**docs task:**
- [ ] 文档更新结果存在
- [ ] 变更影响范围说明清楚

**security task:**
- [ ] security report 存在
- [ ] severity 级别清楚
- [ ] 是否可放行有明确结论

#### 状态判定
- **MILESTONE_ACCEPTED**: 所有检查通过，风险可接受
- **MILESTONE_ACCEPTED_WITH_WARNINGS**: 主要目标达成，有次要遗留
- **MILESTONE_REWORK_REQUIRED**: 可局部弥补
- **MILESTONE_REPLANNING_REQUIRED**: 里程碑范围不合理
- **MILESTONE_ESCALATED**: 需要用户拍板

---

## 5. 项目级文档同步检查 (Project-Level Documentation Sync Gate)

### Gate Name
Project Documentation Sync Gate

### Objective
确保影响 package governance 的 feature 完成时，公共文档与治理文档保持一致，避免 governance drift。

### Trigger Conditions（触发条件）

以下任一条件满足时，必须执行文档同步检查：

- [ ] feature 影响 **role model**（角色定义、角色边界、角色映射）
- [ ] feature 影响 **workflow / stage order**（工作流程、阶段顺序、执行流程）
- [ ] feature 影响 **commands behavior**（命令行为、输入输出契约、command 接口）
- [ ] feature 影响 **skills behavior**（skill 职责、skill 接口、skill 分类）
- [ ] feature 影响 **migration strategy**（迁移策略、过渡方案、弃用计划）
- [ ] feature 影响 **package-level usage expectations**（使用方式、集成点、对外契约）

### Required Documentation Checks（必须检查的文档）

#### Governance Documents（治理文档）
- [ ] `README.md` - 项目概览、Quick Start、Workflow、Skills 目录结构
- [ ] `AGENTS.md` - 开发规则、角色语义优先规则、全局约束
- [ ] `package-spec.md` - 包规格、角色定义、skill 分类、I/O 契约
- [ ] `role-definition.md` - 角色详细定义、角色边界、协作关系

#### Check Items（检查项）
- [ ] 所有治理文档中的术语一致（role、skill、command、stage 等）
- [ ] feature 引入的变更在所有相关文档中都有体现
- [ ] 无矛盾的描述（一个文档说 X，另一个文档说 Y）
- [ ] 迁移/过渡相关的说明在各文档中一致
- [ ] 指向其他文档的链接有效

### Pass Criteria（通过条件）

- 如果 feature **不影响** package governance：无需额外检查，通过
- 如果 feature **影响** package governance：
  - [ ] 所有 Required Documentation Checks 通过
  - [ ] 无 S2/S3 级别的不一致问题
  - [ ] reviewer 确认文档同步完成

### Fail Criteria（失败条件）

存在以下任一情况，视为未通过：
- S3（Critical）： governance 文档之间存在根本性矛盾
- S2（Major）： feature 影响的变更未同步到某份 governance 文档
- S2（Major）： 术语混用导致理解偏差

### Completion Rule（完成规则）

> **重要**：对 package governance 有影响的 feature，如果公共文档和治理文档不一致，**不能视为完成**。
>
> 即使代码实现、测试、审查都已通过，文档不一致仍阻塞 milestone 验收。

---

## 6. Review Checklist（人工审查清单）

供 human/operator 或 auditor 审阅时使用：

### 通用审查项
- [ ] 该输出是否可直接交给下游角色？
- [ ] 是否还需要补充澄清？
- [ ] 是否有高风险 assumption？
- [ ] 是否存在应阻塞的冲突？
- [ ] traceability 是否完整？

### 角色专属审查项
- [ ] **architect**: 设计是否可被 developer 直接采用？
- [ ] **developer**: 实现是否满足 goal？是否超范围？
- [ ] **tester**: 关键路径是否覆盖？失败是否分类？
- [ ] **reviewer**: must-fix 是否清晰可执行？
- [ ] **docs**: 用户侧文档是否同步？
- [ ] **security**: high/critical 问题是否识别？

---

## 7. Remediation Rules（修复规则）

### 7.1 返工 (Rework)

**适用场景：**
- S2 级别问题（影响下游）
- S3 级别问题中的可修复项（如格式问题、缺失字段）

**返工要求：**
- 生成 ReworkRequest
- 明确 failed checks
- 明确 required fixes
- 明确 non-goals（返工范围限制）
- 记录 retry_count

### 7.2 冲突解决 (Conflict Resolution)

**适用场景：**
- 输出与上游 spec/plan 冲突
- 多个约束条件矛盾

**处理方式：**
- 记录 conflict report
- 明确冲突点
- 提出解决方案选项
- 升级给管理层或用户决策

### 7.3 升级人工审阅 (Escalation)

**适用场景：**
- S3 级别问题中的结构性问题
- 返工超过阈值（普通 task 超过 2 次）
- 角色无法判断的 trade-off

**升级方式：**
- 生成 Escalation
- 包含完整上下文
- 提供决策选项
- 阻塞自动流程直到决策完成

---

## 8. 质量度量指标

### 8.1 全局指标
- **task 一次通过率**: 首次执行即通过 gate 的比例
- **milestone 一次通过率**: milestone 首次验收通过的比例
- **自动返工收敛率**: 返工后通过的比例
- **escalation 触发率**: 需要升级处理的比例
- **artifact 完整率**: 输出包含所有必需 artifact 的比例

### 8.2 角色指标

#### architect
- design adopted rate（设计被直接采用率）
- design rework rate（设计返工率）
- boundary ambiguity rate（边界模糊率）

#### developer
- review reject rate（review 拒绝率）
- test fail rate（测试失败率）
- out-of-scope change rate（超范围改动率）

#### tester
- key-path coverage rate（关键路径覆盖率）
- reproducible failure rate（可复现失败率）
- false confidence rate（假阳性率）

#### reviewer
- actionable review rate（可执行审查意见率）
- must-fix miss rate（must-fix 漏检率）
- re-review pass rate（返工后审查通过率）

#### docs
- doc sync completeness（文档同步完整率）
- docs drift rate（文档与实际偏差率）

#### security
- severity classification accuracy（严重性分类准确率）
- blocker detection rate（阻断问题发现率）
