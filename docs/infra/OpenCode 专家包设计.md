# OpenCode 专家包设计

## 1. 文档目的

本文档定义“全自动产品研发闭环 MVP”中的 **OpenCode 专家包（Expert Pack）** 设计。  
它回答的问题包括：

- OpenCode 执行层应当包含哪些专家角色
- 每个角色的边界、职责、输入、输出是什么
- 每个角色需要哪些 skills
- 哪些 skills 应该是通用 skill，哪些应当是角色专属 skill
- 每个角色对外暴露什么接口
- 管理层（OpenClaw）应如何调用这些角色
- 专家包的目录结构、命名规范、配置组织方式是什么
- commands、templates、rules、artifacts 应如何设计
- 执行层如何实现稳定、可控、可复用的角色化执行能力

本文档与以下文档配套：

- 《系统状态机与对象模型设计》
- 《OpenClaw 管理层调度设计》

前两份定义了**系统怎么流转、管理层怎么调度**；本文件定义 **执行层具体长什么样、每个角色怎么工作、如何对外提供能力**。

---

## 2. 设计目标

OpenCode 专家包需要满足以下目标：

1. **角色清晰**
   - 不同角色有明确职责和边界，不混成一个万能 agent

2. **能力可复用**
   - 通过 skills、commands、templates 抽出可沉淀的能力

3. **可调度**
   - OpenClaw 能通过统一接口将 task 分派给任意专家角色

4. **可扩展**
   - MVP 先覆盖核心研发流程，后续可增加更多领域专家

5. **可控**
   - 每个角色可以拥有不同权限、不同规则、不同上下文加载策略

6. **可产品化**
   - 最终专家包应该能作为一套独立资产复用到不同项目

---

## 3. 专家包在系统中的位置

整体系统分为三层：

- **用户 / 产品输入层**
- **OpenClaw 管理层**
- **OpenCode 执行层（专家包）**

本文件聚焦第三层。

OpenCode 专家包本质上是：

> 一套围绕角色、skills、commands、rules、templates、artifacts 组织起来的“执行能力包”。

它不是简单 prompt 集合，而是一个可被调度、可被限制、可被演化的执行运行面。

---

## 4. 设计原则

## 4.1 角色不等于 skill

- **角色（Agent）** 代表“谁负责什么”
- **Skill** 代表“这个角色会怎么做”
- **Command** 代表“从什么入口触发一种固定执行动作”
- **Template** 代表“产物怎么组织”
- **Rule** 代表“做事时必须遵守什么规范”

如果把这些混在一起，后续会非常难维护。

## 4.2 执行层聚焦“产出”，不做高层产品决策

OpenCode 专家包要解决的是：
- 设计方案
- 代码实现
- 测试生成
- 审查与修复
- 文档同步
- 风险检查

它不负责：
- 商业优先级取舍
- 产品范围重新定义
- 多 milestone 之间的总体资源仲裁

这些应由 OpenClaw 管理层承担。

## 4.3 角色尽量单职责

一个角色可以有多个 skills，但角色本身应尽量聚焦一类主职责。

## 4.4 Skill 设计优先方法论，不优先堆知识

好的 skill 不只是“告诉模型一些概念”，而是要提供：
- 适用场景
- 操作步骤
- 检查清单
- 常见失败模式
- 输出模板

## 4.5 对外接口统一

不管内部角色怎么丰富，对外最好统一成：
- dispatch input
- execution result
- artifact output
- error / escalation output

---

## 5. 专家包总体结构

建议目录结构如下：

```text
opencode-expert-pack/
├─ opencode.jsonc
├─ README.md
├─ agents/
│  ├─ architect.md
│  ├─ developer.md
│  ├─ tester.md
│  ├─ reviewer.md
│  ├─ docs.md
│  ├─ security.md
│  ├─ performance.md
│  └─ release.md
├─ skills/
│  ├─ common/
│  │  ├─ artifact-reading/
│  │  │  └─ SKILL.md
│  │  ├─ context-summarization/
│  │  │  └─ SKILL.md
│  │  ├─ failure-analysis/
│  │  │  └─ SKILL.md
│  │  ├─ retry-strategy/
│  │  │  └─ SKILL.md
│  │  └─ execution-reporting/
│  │     └─ SKILL.md
│  ├─ architect/
│  │  ├─ requirement-to-design/
│  │  │  └─ SKILL.md
│  │  ├─ module-boundary-design/
│  │  │  └─ SKILL.md
│  │  ├─ interface-contract-design/
│  │  │  └─ SKILL.md
│  │  ├─ tradeoff-analysis/
│  │  │  └─ SKILL.md
│  │  └─ migration-planning/
│  │     └─ SKILL.md
│  ├─ developer/
│  │  ├─ feature-implementation/
│  │  │  └─ SKILL.md
│  │  ├─ bugfix-workflow/
│  │  │  └─ SKILL.md
│  │  ├─ refactor-safely/
│  │  │  └─ SKILL.md
│  │  ├─ dependency-minimization/
│  │  │  └─ SKILL.md
│  │  └─ code-change-selfcheck/
│  │     └─ SKILL.md
│  ├─ tester/
│  │  ├─ unit-test-design/
│  │  │  └─ SKILL.md
│  │  ├─ integration-test-design/
│  │  │  └─ SKILL.md
│  │  ├─ regression-analysis/
│  │  │  └─ SKILL.md
│  │  ├─ edge-case-matrix/
│  │  │  └─ SKILL.md
│  │  └─ flaky-test-diagnosis/
│  │     └─ SKILL.md
│  ├─ reviewer/
│  │  ├─ code-review-checklist/
│  │  │  └─ SKILL.md
│  │  ├─ spec-implementation-diff/
│  │  │  └─ SKILL.md
│  │  ├─ risk-review/
│  │  │  └─ SKILL.md
│  │  ├─ maintainability-review/
│  │  │  └─ SKILL.md
│  │  └─ reject-with-actionable-feedback/
│  │     └─ SKILL.md
│  ├─ docs/
│  │  ├─ readme-sync/
│  │  │  └─ SKILL.md
│  │  ├─ changelog-writing/
│  │  │  └─ SKILL.md
│  │  ├─ architecture-doc-sync/
│  │  │  └─ SKILL.md
│  │  └─ user-guide-update/
│  │     └─ SKILL.md
│  ├─ security/
│  │  ├─ auth-and-permission-review/
│  │  │  └─ SKILL.md
│  │  ├─ secret-handling-review/
│  │  │  └─ SKILL.md
│  │  ├─ input-validation-review/
│  │  │  └─ SKILL.md
│  │  └─ dependency-risk-review/
│  │     └─ SKILL.md
│  ├─ performance/
│  │  ├─ hotspot-analysis/
│  │  │  └─ SKILL.md
│  │  ├─ latency-checklist/
│  │  │  └─ SKILL.md
│  │  ├─ memory-footprint-review/
│  │  │  └─ SKILL.md
│  │  └─ performance-regression-check/
│  │     └─ SKILL.md
│  └─ release/
│     ├─ release-readiness-check/
│     │  └─ SKILL.md
│     ├─ rollout-risk-summary/
│     │  └─ SKILL.md
│     └─ release-note-generation/
│        └─ SKILL.md
├─ commands/
│  ├─ architect/
│  │  ├─ design-task.md
│  │  ├─ evaluate-tradeoff.md
│  │  └─ design-review.md
│  ├─ developer/
│  │  ├─ implement-task.md
│  │  ├─ fix-task.md
│  │  └─ refactor-task.md
│  ├─ tester/
│  │  ├─ test-task.md
│  │  ├─ regression-task.md
│  │  └─ verify-edge-cases.md
│  ├─ reviewer/
│  │  ├─ review-task.md
│  │  ├─ compare-spec-vs-code.md
│  │  └─ risk-review.md
│  ├─ docs/
│  │  ├─ sync-readme.md
│  │  ├─ update-docs.md
│  │  └─ write-changelog.md
│  ├─ security/
│  │  ├─ security-check.md
│  │  └─ permission-review.md
│  ├─ performance/
│  │  ├─ perf-check.md
│  │  └─ regression-check.md
│  └─ release/
│     ├─ release-readiness.md
│     └─ generate-release-notes.md
├─ templates/
│  ├─ design-note.md
│  ├─ implementation-summary.md
│  ├─ test-report.md
│  ├─ review-report.md
│  ├─ doc-update-report.md
│  ├─ security-report.md
│  ├─ performance-report.md
│  └─ release-readiness-report.md
├─ rules/
│  ├─ global/
│  │  ├─ execution-contract.md
│  │  ├─ artifact-format.md
│  │  └─ escalation-rules.md
│  ├─ coding/
│  │  ├─ coding-style.md
│  │  ├─ dependency-policy.md
│  │  └─ change-scope-policy.md
│  ├─ testing/
│  │  ├─ testing-policy.md
│  │  ├─ regression-policy.md
│  │  └─ flaky-test-policy.md
│  ├─ review/
│  │  ├─ review-bar.md
│  │  └─ rejection-policy.md
│  └─ docs/
│     └─ documentation-policy.md
└─ examples/
   ├─ dispatch-payloads/
   ├─ result-payloads/
   └─ sample-artifacts/
```

---

## 6. 角色矩阵设计

MVP 建议至少包含以下 6 个核心角色：

1. **architect**
2. **developer**
3. **tester**
4. **reviewer**
5. **docs**
6. **security**

增强版可再增加：
7. **performance**
8. **release**

---

## 7. 角色详细设计

## 7.1 architect

### 角色定位
负责把需求转成技术实现路径。  
重点不在写大量代码，而在于：

- 明确模块边界
- 设计接口契约
- 识别依赖与风险
- 给出实施路线
- 形成 design note

### 适用任务
- 新 feature 架构设计
- 中大型功能拆解
- 模块重构前的结构规划
- API / data contract 设计
- 迁移或演进方案设计

### 不适合承担的任务
- 大量落地实现
- 大规模测试编写
- 最终代码放行判断
- 发布准备

### 典型输入
- requirement / spec
- 当前 milestone 目标
- 相关代码上下文
- 已知约束
- 风险提示

### 典型输出
- design note
- implementation plan
- dependency / risk list
- recommended task split
- interface contract

### 推荐 skill
必备：
- requirement-to-design
- module-boundary-design
- interface-contract-design
- tradeoff-analysis

可选：
- migration-planning
- backward-compatibility-design
- failure-mode-analysis

### 对外接口
- `design_task`
- `evaluate_tradeoff`
- `review_architecture_change`

### 返回工件
- `design_note`
- `task_split_suggestion`
- `architecture_risk_summary`

---

## 7.2 developer

### 角色定位
负责完成代码层面的具体实现，是执行层的主力角色。

### 适用任务
- 功能实现
- bug 修复
- 局部重构
- 配置和脚本补齐
- 按设计文档落地

### 不适合承担的任务
- 高层范围取舍
- milestone 规划
- 验收是否通过的最终裁定

### 典型输入
- task payload
- design note
- 相关代码上下文
- 约束条件
- 上轮失败信息（若为返工）

### 典型输出
- code changes
- implementation summary
- self-check note
- changed file list
- unresolved risks

### 推荐 skill
必备：
- feature-implementation
- bugfix-workflow
- refactor-safely
- code-change-selfcheck

强烈推荐：
- dependency-minimization
- backward-compatibility-aware-change
- rollback-friendly-change-design

### 对外接口
- `implement_task`
- `fix_task`
- `refactor_task`

### 返回工件
- `implementation_summary`
- `code_diff_summary`
- `developer_selfcheck_report`

---

## 7.3 tester

### 角色定位
负责为实现结果建立验证闭环。

### 适用任务
- 单测设计
- 集成测试设计
- 回归测试
- 边界条件覆盖
- 失败复现与分类

### 不适合承担的任务
- 修改大规模业务代码
- 决定需求范围
- 审查代码风格与架构合理性

### 典型输入
- spec / acceptance criteria
- implementation summary
- changed files
- known risks
- historical failure patterns

### 典型输出
- test files
- test report
- regression result
- edge-case matrix
- retryable failure analysis

### 推荐 skill
必备：
- unit-test-design
- integration-test-design
- regression-analysis
- edge-case-matrix

可选：
- flaky-test-diagnosis
- test-gap-analysis
- scenario-coverage-audit

### 对外接口
- `test_task`
- `regression_task`
- `verify_edge_cases`

### 返回工件
- `test_report`
- `coverage_gap_summary`
- `regression_result`

---

## 7.4 reviewer

### 角色定位
负责对实现结果进行独立审查。  
reviewer 不以“补实现”为主，而以“发现问题、给出可执行审查意见”为主。

### 适用任务
- 代码审查
- spec 与实现比对
- 风险审查
- 可维护性检查
- 放行 / 拒绝建议

### 不适合承担的任务
- 主导新功能代码实现
- 替代 tester 完成测试闭环
- 重写全部设计

### 典型输入
- diff / changed_files
- spec
- design note
- test result
- known risk list

### 典型输出
- review report
- issues list
- approval status
- actionable change requests
- residual risks

### 推荐 skill
必备：
- code-review-checklist
- spec-implementation-diff
- risk-review
- reject-with-actionable-feedback

强烈推荐：
- maintainability-review
- boundary-condition-review
- regression-risk-review

### 对外接口
- `review_task`
- `compare_spec_vs_code`
- `risk_review`

### 返回工件
- `review_report`
- `approval_decision`
- `change_request_list`

---

## 7.5 docs

### 角色定位
负责让实现结果同步到文档体系中。  
这个角色在 MVP 可以是轻量角色，但很值得存在，因为文档同步是自动化闭环中最容易长期缺失的环节。

### 适用任务
- 更新 README
- 更新技术文档
- 更新变更说明
- 更新用户指南
- 输出阶段摘要

### 典型输入
- implementation summary
- design note
- review summary
- release summary
- changed files

### 典型输出
- updated docs
- changelog draft
- usage note
- architecture doc sync report

### 推荐 skill
必备：
- readme-sync
- architecture-doc-sync
- changelog-writing

可选：
- user-guide-update
- quickstart-sync

### 对外接口
- `sync_readme`
- `update_docs`
- `write_changelog`

### 返回工件
- `doc_update_report`
- `changelog_entry`
- `usage_doc_patch_summary`

---

## 7.6 security

### 角色定位
负责安全相关专项检查。  
在 MVP 阶段不要求它每次都参与，但高风险任务必须能接入它。

### 适用任务
- 认证与权限逻辑检查
- 输入校验检查
- secret / token 处理检查
- 依赖风险检查
- 高风险接口专项审查

### 典型输入
- changed files
- auth / permission related code
- external interface changes
- dependency changes
- review summary

### 典型输出
- security review report
- severity list
- must-fix items
- risk acceptance suggestion

### 推荐 skill
必备：
- auth-and-permission-review
- input-validation-review
- secret-handling-review
- dependency-risk-review

可选：
- insecure-default-detection
- sensitive-data-flow-review

### 对外接口
- `security_check`
- `permission_review`
- `dependency_risk_review`

### 返回工件
- `security_report`
- `security_issue_list`
- `security_gate_decision`

---

## 7.7 performance（增强）

### 角色定位
负责性能与资源使用专项检查。

### 适用任务
- 延迟敏感功能检查
- 高吞吐路径分析
- 内存占用变化检查
- 性能回归检查

### 推荐 skill
- hotspot-analysis
- latency-checklist
- memory-footprint-review
- performance-regression-check

### 对外接口
- `perf_check`
- `regression_check`

---

## 7.8 release（增强）

### 角色定位
负责发布准备与发布前检查。

### 适用任务
- 发布准备检查
- 风险汇总
- release notes 生成
- 上线前清单确认

### 推荐 skill
- release-readiness-check
- rollout-risk-summary
- release-note-generation

### 对外接口
- `release_readiness`
- `generate_release_notes`

---

## 8. skill 分层设计

建议将 skills 分成三层：

## 8.1 common skills

所有角色都可能用到的通用 skill。

### 推荐 common skills

#### artifact-reading
作用：
- 统一读取 spec、design note、test report、review report
- 提取关键字段与约束
- 生成结构化摘要

为什么需要：
- 避免每个角色自己“随便理解工件”
- 提高工件消费的一致性

#### context-summarization
作用：
- 从大量上下文中裁剪出当前 task 必需信息
- 生成当前角色的最小上下文摘要

为什么需要：
- 防止上下文膨胀
- 保证角色聚焦当前任务

#### failure-analysis
作用：
- 从 logs / review comments / failed tests 中抽出根因
- 区分可重试、需返工、需重规划

为什么需要：
- 返工质量高度依赖失败分析质量

#### retry-strategy
作用：
- 根据失败类型选择最小修复路径
- 避免粗暴重复尝试

#### execution-reporting
作用：
- 将当前执行结果按统一格式输出
- 确保管理层 intake 稳定

---

## 8.2 role-specific skills

角色专属 skill 应该解决该角色最核心的方法问题。  
下面给出建议矩阵。

| 角色 | 必备 skill |
|---|---|
| architect | requirement-to-design, module-boundary-design, interface-contract-design, tradeoff-analysis |
| developer | feature-implementation, bugfix-workflow, refactor-safely, code-change-selfcheck |
| tester | unit-test-design, integration-test-design, regression-analysis, edge-case-matrix |
| reviewer | code-review-checklist, spec-implementation-diff, risk-review, reject-with-actionable-feedback |
| docs | readme-sync, architecture-doc-sync, changelog-writing |
| security | auth-and-permission-review, input-validation-review, secret-handling-review, dependency-risk-review |

---

## 8.3 policy / rule-driven skills

这类 skill 不是角色专属，而是为“遵守规则”服务。

例如：

- change-scope-guard
- no-unapproved-dependency-introduction
- docs-required-on-user-facing-change
- security-review-required-on-auth-change
- regression-required-on-bugfix

这类 skill 可以作为 cross-cutting skill，被多个角色共享。

---

## 9. 每个 skill 建议包含的内容

每个 `SKILL.md` 建议采用统一格式：

```md
# Skill Name

## Purpose
这个 skill 解决什么问题

## When to Use
适用场景

## When Not to Use
不适用场景

## Inputs
需要什么输入

## Steps
推荐执行步骤

## Checklists
检查清单

## Common Failure Modes
常见失败模式

## Output Requirements
输出要求

## Examples
示例
```

### 为什么这么设计
因为 skill 的核心不是“塞背景知识”，而是沉淀：
- 场景判断
- 操作流程
- 检查逻辑
- 输出格式

---

## 10. command 设计

Command 是给执行层提供“稳定动作入口”的层。  
OpenClaw 调度时不一定直接写 prompt，而是更适合调用某个角色的某个 command。

## 10.1 command 的作用

- 固化执行入口
- 限制动作边界
- 降低 prompt 随机性
- 统一输入输出格式

## 10.2 command 分类建议

### architect commands
- `design-task`
- `evaluate-tradeoff`
- `design-review`

### developer commands
- `implement-task`
- `fix-task`
- `refactor-task`

### tester commands
- `test-task`
- `regression-task`
- `verify-edge-cases`

### reviewer commands
- `review-task`
- `compare-spec-vs-code`
- `risk-review`

### docs commands
- `sync-readme`
- `update-docs`
- `write-changelog`

### security commands
- `security-check`
- `permission-review`
- `dependency-risk-review`

---

## 11. 对外接口设计

专家包对外应尽量表现为一套标准执行 API。  
这里的“接口”不一定是 HTTP，也可以是 CLI、文件协议、函数调用协议；但数据契约应统一。

---

## 11.1 Dispatch 输入接口

### 统一输入结构

```yaml
dispatch_id:
project_id:
milestone_id:
task_id:
role:
command:
title:
goal:
description:
context:
constraints:
inputs:
expected_outputs:
verification_steps:
risk_level:
retry_context:
upstream_dependencies:
downstream_expectations:
metadata:
```

### 字段说明

- `dispatch_id`: 本次派发唯一 ID
- `project_id`: 项目 ID
- `milestone_id`: 当前 milestone
- `task_id`: 目标 task
- `role`: 目标角色
- `command`: 指定命令入口
- `title`: 任务标题
- `goal`: 该任务必须达成的结果
- `description`: 任务详细说明
- `context`: 摘要上下文
- `constraints`: 不能违反的条件
- `inputs`: 工件引用或上下文片段
- `expected_outputs`: 输出要求
- `verification_steps`: 后续验证方式
- `risk_level`: 风险等级
- `retry_context`: 返工相关信息
- `upstream_dependencies`: 上游依赖摘要
- `downstream_expectations`: 下游角色会如何消费结果
- `metadata`: 扩展字段

---

## 11.2 Execution Result 输出接口

### 统一输出结构

```yaml
dispatch_id:
project_id:
milestone_id:
task_id:
role:
command:
status:
summary:
artifacts:
changed_files:
checks_performed:
issues_found:
risks:
recommendation:
needs_followup:
followup_suggestions:
escalation:
metadata:
```

### status 枚举建议

- SUCCESS
- SUCCESS_WITH_WARNINGS
- PARTIAL
- BLOCKED
- FAILED_RETRYABLE
- FAILED_ESCALATE

### recommendation 枚举建议

- CONTINUE
- SEND_TO_TEST
- SEND_TO_REVIEW
- REWORK
- REPLAN
- ESCALATE

---

## 11.3 Artifact 输出接口

建议所有角色输出 artifact 时使用统一引用结构：

```yaml
artifact_id:
artifact_type:
title:
path:
format:
summary:
created_by_role:
related_task_id:
created_at:
metadata:
```

### artifact_type 建议

- design_note
- implementation_summary
- test_report
- review_report
- doc_update_report
- security_report
- performance_report
- release_readiness_report

---

## 11.4 Escalation 输出接口

当角色无法继续执行时，应输出统一升级结构：

```yaml
escalation_id:
dispatch_id:
task_id:
role:
reason_type:
summary:
blocking_points:
attempted_actions:
recommended_next_steps:
requires_user_decision:
created_at:
```

### reason_type 建议
- MISSING_CONTEXT
- CONFLICTING_CONSTRAINTS
- HIGH_RISK_CHANGE
- REPEATED_FAILURE
- OUT_OF_SCOPE_REQUEST
- TOOLING_BLOCKER

---

## 12. 各角色详细接口要求

## 12.1 architect 接口细化

### 输入最低要求
- requirement 或 spec 至少一份
- 当前目标模块或功能边界描述
- 至少一个约束条件
- 当前代码上下文或模块摘要

### 输出最低要求
- design summary
- module / interface 方案
- 风险列表
- 推荐 implementation steps

### 失败条件
- 目标边界完全不清
- 约束相互冲突
- 缺少关键上下文导致无法设计

---

## 12.2 developer 接口细化

### 输入最低要求
- task description
- design note（若需要）
- 相关代码上下文
- change constraints

### 输出最低要求
- changed files 或变更摘要
- implementation summary
- self-check
- unresolved issues

### 失败条件
- 依赖上下文缺失
- 环境 / 工具阻塞
- 设计与现状明显冲突无法自行裁定

---

## 12.3 tester 接口细化

### 输入最低要求
- spec / acceptance criteria
- 实现结果或 changed files
- 当前风险点或边界点

### 输出最低要求
- test design 或 test execution summary
- pass / fail 结果
- gap 分析
- retryable / non-retryable 结论

---

## 12.4 reviewer 接口细化

### 输入最低要求
- diff / changed files
- spec 或 design note
- 测试结果（若存在）

### 输出最低要求
- approve / reject / warning
- issue list
- 可执行修改建议
- 残余风险

---

## 12.5 docs 接口细化

### 输入最低要求
- 本轮实现总结
- 需要同步的文档类型
- 变更影响范围

### 输出最低要求
- 文档更新摘要
- changelog 文本
- 未覆盖的文档缺口

---

## 12.6 security 接口细化

### 输入最低要求
- 相关 changed files
- 风险区域说明
- 当前接口 / 权限变更点

### 输出最低要求
- security issue list
- severity 级别
- must-fix / can-defer 分类
- 是否可继续推进建议

---

## 13. 规则与权限边界设计

专家包不应只有能力，还要有边界。

## 13.1 角色权限边界建议

| 角色 | 读代码 | 改代码 | 跑测试 | 改文档 | 高风险专项 |
|---|---|---|---|---|---|
| architect | 是 | 尽量否 | 可选 | 可选 | 否 |
| developer | 是 | 是 | 可选 | 少量 | 否 |
| tester | 是 | 限测试代码 | 是 | 否 | 否 |
| reviewer | 是 | 尽量否 | 可选只读 | 否 | 否 |
| docs | 是 | 否 | 否 | 是 | 否 |
| security | 是 | 否 | 可选 | 否 | 是 |
| performance | 是 | 否 | 可选 | 否 | 是 |
| release | 是 | 少量发布文件 | 是 | 是 | 中 |

### 原则
- architect / reviewer / security 尽量不要直接改业务代码
- developer 不应决定验收通过
- tester 主要改测试资产，不主导业务实现
- docs 不应改业务逻辑

---

## 13.2 规则文件建议

### global/execution-contract.md
定义所有角色必须遵守：
- 必须输出统一结果格式
- 必须说明未完成部分
- 不允许假装验证已完成
- 遇到阻塞必须显式输出

### global/artifact-format.md
定义 artifact 命名、路径、摘要格式。

### global/escalation-rules.md
定义何时必须升级。

### coding/change-scope-policy.md
定义 developer 不可擅自扩大改动范围。

### testing/testing-policy.md
定义 tester 的基本验证要求。

### review/review-bar.md
定义 reviewer 的通过门槛。

---

## 14. 角色协作流设计

## 14.1 标准 feature 流

```text
architect
-> developer
-> tester
-> reviewer
-> docs
```

### 说明
- architect 先给 design note
- developer 按设计实现
- tester 建测试闭环
- reviewer 做独立审查
- docs 同步文档

---

## 14.2 bugfix 流

```text
developer
-> tester
-> reviewer
```

### 何时前置 architect
- bug 涉及系统性结构问题
- 修复方案存在多个 trade-off
- 可能引发架构层变化

---

## 14.3 高风险变更流

```text
architect
-> developer
-> tester
-> reviewer
-> security
-> docs
```

### 适用场景
- auth / permission
- secrets
- external API contract change
- migration
- data-sensitive feature

---

## 14.4 性能优化流（增强）

```text
performance
-> architect
-> developer
-> tester
-> reviewer
```

---

## 15. 产物设计

统一产物设计能显著提升系统稳定性。

## 15.1 architect 产物模板

### design_note
应包含：
- task goal
- current context
- assumptions
- proposed design
- module boundary
- interface contract
- risks
- recommended implementation order

## 15.2 developer 产物模板

### implementation_summary
应包含：
- 实现目标
- 实际改动
- changed files
- 对设计的偏离
- 自检结果
- 已知未解问题

## 15.3 tester 产物模板

### test_report
应包含：
- scope
- tests added / run
- pass/fail summary
- uncovered gaps
- edge cases checked
- retry suggestion

## 15.4 reviewer 产物模板

### review_report
应包含：
- overall decision
- critical issues
- non-critical issues
- maintainability notes
- residual risks
- action items

## 15.5 docs 产物模板

### doc_update_report
应包含：
- synced docs
- missing docs
- user-facing change summary
- internal change summary

## 15.6 security 产物模板

### security_report
应包含：
- scope checked
- issues by severity
- must-fix list
- acceptable residual risk
- gate recommendation

---

## 16. 命名规范建议

### agent 文件
- `architect.md`
- `developer.md`

### skill 目录
- 使用 `kebab-case`
- 例如：`feature-implementation`

### command 文件
- `verb-object.md`
- 例如：`implement-task.md`

### artifact type
- 使用 snake_case
- 例如：`implementation_summary`

---

## 17. 推荐的 MVP 专家包最小集合

如果你想尽快落地，第一版不要把所有角色都做满。  
建议最小可行集合如下：

## 17.1 必做角色
- architect
- developer
- tester
- reviewer

## 17.2 可选但推荐
- docs

## 17.3 高风险项目推荐加入
- security

## 17.4 每个角色最小 skill 集

### architect
- requirement-to-design
- interface-contract-design
- tradeoff-analysis

### developer
- feature-implementation
- bugfix-workflow
- code-change-selfcheck

### tester
- unit-test-design
- regression-analysis
- edge-case-matrix

### reviewer
- code-review-checklist
- spec-implementation-diff
- reject-with-actionable-feedback

### docs
- readme-sync
- changelog-writing

### security
- auth-and-permission-review
- input-validation-review

---

## 18. 推荐的调用协议

OpenClaw 调度到专家包时，建议有一个统一调用入口，例如逻辑层抽象：

```text
execute_role_task(role, command, dispatch_payload) -> execution_result
```

这样无论底层是：
- CLI 调用
- 文件协议
- SDK 函数
- 本地进程

对管理层都是统一的。

### 好处
- 替换底层实现不影响调度层
- 后续可做 mock / replay / testing
- 可支持不同 provider / model routing

---

## 19. 示例：一个 developer dispatch payload

```yaml
dispatch_id: dsp-001
project_id: proj-001
milestone_id: ms-002
task_id: task-013
role: developer
command: implement-task
title: 实现登录接口错误码映射
goal: 完成登录接口基础错误码与前端可识别返回结构
description: 按 design note 实现 auth login API 的错误码映射与统一返回格式
context:
  project_goal: 完成用户登录闭环
  milestone_goal: 提供可测试的登录能力
  task_scope: 仅修改 auth login 路径与相关错误码映射
constraints:
  - 不修改数据库 schema
  - 不引入新依赖
  - 保持现有 API path 不变
inputs:
  - spec-001-v1
  - design-note-004
  - auth-module-summary
expected_outputs:
  - code changes
  - implementation summary
  - self-check note
verification_steps:
  - build
  - unit_test
  - review
risk_level: medium
retry_context:
upstream_dependencies:
  - task-010
downstream_expectations:
  - tester 将基于错误码路径补测试
metadata:
  domain: auth
```

---

## 20. 示例：reviewer execution result

```yaml
dispatch_id: dsp-018
project_id: proj-001
milestone_id: ms-002
task_id: task-015
role: reviewer
command: review-task
status: FAILED_RETRYABLE
summary: 实现总体方向正确，但错误分支处理不完整，且有一个命名不一致问题
artifacts:
  - artifact_id: art-review-015
    artifact_type: review_report
    title: 登录接口 review 报告
    path: artifacts/review/review-015.md
    format: markdown
    summary: 包含 2 个必须修改项和 1 个建议项
    created_by_role: reviewer
    related_task_id: task-015
checks_performed:
  - spec vs implementation consistency
  - error handling path review
  - naming consistency check
issues_found:
  - 缺少 lockout 状态错误码映射
  - error_code 命名与既有规范不一致
risks:
  - 前端可能无法区分部分失败场景
recommendation: REWORK
needs_followup: true
followup_suggestions:
  - 回到 developer 补齐 lockout 分支并统一命名
escalation:
metadata:
```

---

## 21. 实现建议

## 21.1 不要一开始把 skill 写得太大
每个 skill 最好解决一种清晰方法问题。  
太大的 skill 最后会退化成“另一个 agent prompt”。

## 21.2 command 要稳定，少但精
command 数量不要过多。  
第一版每个角色 2 到 3 个入口就够。

## 21.3 优先把输出契约做稳定
比起先追求最复杂的智能，更重要的是：
- 输入统一
- 输出统一
- artifact 统一
- 升级统一

## 21.4 规则要可组合
不要把所有规则写进 agent 文件里。  
应该让：
- agent 定义角色
- rule 定义约束
- skill 定义方法
- command 定义动作

---

## 22. 验收标准

本文件对应的 OpenCode 专家包设计，在实现层至少应满足：

1. 明确定义 4 到 6 个核心角色
2. 每个角色有明确职责边界
3. 每个角色有最小必备 skill 集
4. 存在统一 dispatch 输入契约
5. 存在统一 execution result 输出契约
6. 存在统一 artifact 输出规范
7. 存在统一 escalation 输出规范
8. 可以通过 commands 固化核心动作入口
9. 可以通过 rules 控制角色边界与执行规范
10. 能被 OpenClaw 管理层稳定调度

---

## 23. 下一步建议

在这份文档之后，最适合继续拆的是：

**《验收与返工机制设计》**

因为现在已经明确了：

- 管理层怎么调度
- 执行层有哪些角色
- 每个角色怎么输出结果

下一步就应该把“什么时候算通过、失败怎么返工、什么情况下升级给用户”单独定成一份闭环机制文档。
