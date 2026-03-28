# Skill: execution-reporting

## Purpose

要求所有角色以统一格式输出 execution result 和 artifact summary，确保 OpenClaw 管理层能稳定 intake，不同角色的输出不会风格漂移。

解决的核心问题：
- 不同角色输出格式不一致，管理层难以解析
- 缺少必填字段导致下游无法继续
- 输出质量不可控，无法做自动化验收
- 与 io-contract.md 强绑定，必须严格遵循 schema

## When to Use

必须使用时：
- 任何角色完成 task 后输出结果时
- 返工后重新提交结果时
- 需要向上游汇报执行状态时
- 生成 artifact 引用时

推荐使用时：
- 执行过程中生成阶段性报告
- 批量输出多个 artifact 时
- 需要生成可机读的执行日志时

## When Not to Use

不适用场景：
- 纯内部思考过程（不应作为正式输出）
- 临时草稿状态（正式提交时才使用）
- 需要人类创意表达的场景（如用户文档）
- 紧急止血场景（先行动后补报告）

## Required Inputs

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `dispatch_payload` | object | 是 | 原始 dispatch 输入 |
| `execution_result` | object | 是 | 执行结果数据 |
| `artifacts_produced` | object[] | 是 | 产出的工件列表 |

## Optional Inputs

| 字段 | 类型 | 说明 |
|------|------|------|
| `validation_mode` | string | 验证模式：strict/lenient |
| `output_format` | string | 输出格式：yaml/json/markdown |

## Execution Result Schema（与 io-contract.md 对齐）

### 顶层字段

```yaml
dispatch_id: string              # 与输入一致
project_id: string               # 与输入一致
milestone_id: string             # 与输入一致
task_id: string                  # 与输入一致
role: enum                       # 与输入一致
command: string                  # 与输入一致

status: enum                     # 执行状态
summary: string                  # 简要说明
artifacts: object[]              # 产物列表
changed_files: object[]          # 文件改动列表
checks_performed: string[]       # 自检清单
issues_found: object[]           # 发现的问题
risks: object[]                  # 剩余风险
recommendation: enum             # 后续建议
needs_followup: boolean          # 是否需要跟进
followup_suggestions: string[]   # 跟进建议
escalation: object               # 升级信息
metadata: object                 # 扩展字段
```

### Status 枚举值

| 值 | 含义 | 使用场景 |
|----|------|----------|
| SUCCESS | 成功完成 | 满足所有要求，通过验证 |
| SUCCESS_WITH_WARNINGS | 成功但有警告 | 目标达成，存在非阻塞问题 |
| PARTIAL | 部分完成 | 部分目标达成，部分未完成 |
| BLOCKED | 被阻塞 | 外部原因无法继续 |
| FAILED_RETRYABLE | 失败但可返工 | 局部问题可修复 |
| FAILED_ESCALATE | 失败需升级 | 高风险或无法自动解决 |

### Recommendation 枚举值

| 值 | 含义 | 典型使用角色 |
|----|------|--------------|
| CONTINUE | 继续下一阶段 | reviewer approve 后 |
| SEND_TO_TEST | 发送给 tester | developer 完成后 |
| SEND_TO_REVIEW | 发送给 reviewer | tester 完成后 |
| REWORK | 返工 | reviewer reject 后 |
| REPLAN | 重规划 | 发现结构性问题时 |
| ESCALATE | 升级 | 需要用户决策时 |

## Steps

### Step 1: 收集执行数据
1. 从执行过程中收集所有必要字段
2. 验证 dispatch_payload 中的关联字段
3. 整理 artifacts_produced 列表

### Step 2: 确定 Status
根据执行结果选择合适的 status：

**判断流程：**
```
是否达成 goal?
  ├─ 否 -> 是否可修复?
  │       ├─ 是 -> FAILED_RETRYABLE
  │       └─ 否 -> FAILED_ESCALATE 或 REPLAN
  └─ 是 -> 是否有 issues?
          ├─ 是 -> SUCCESS_WITH_WARNINGS
          └─ 否 -> SUCCESS
```

### Step 3: 生成 Summary
必须包含三要素：
1. **做了什么**：简述完成的主要工作
2. **是否达成目标**：明确回答 goal 是否达成
3. **还缺什么**：如有未完成项，明确列出

**示例：**
```
实现了登录接口的错误码映射功能，包含 INVALID_CREDENTIALS、
USER_LOCKED、SYSTEM_ERROR 三种错误的处理和返回。
目标已达成，所有 acceptance criteria 已满足。
无未完成项。
```

### Step 4: 构建 Artifacts 列表
每个 artifact 必须包含：
- artifact_id: 唯一标识
- artifact_type: 类型（design_note / implementation_summary / ...）
- title: 人类可读标题
- path: 存储路径
- format: 格式
- summary: 内容摘要（100-300字）
- created_by_role: 创建角色
- related_task_id: 关联 task

### Step 5: 列出 Changed Files
每个改动文件必须包含：
- path: 文件路径
- change_type: added/modified/deleted/renamed
- diff_summary: 变更内容摘要

**如无改动，必须显式写空列表 []**

### Step 6: 填写 Checks Performed
至少一项自检，推荐包含：
- 实现目标对齐检查
- 改动范围检查
- 约束条件遵守检查
- 依赖引入检查
- 关键路径自读检查

### Step 7: 列出 Issues Found
每个问题必须包含：
- issue_id: 唯一标识
- severity: critical/high/medium/low
- description: 问题描述
- recommendation: 处理建议

**如无问题，必须显式写空列表 []**

### Step 8: 评估 Risks
每个风险必须包含：
- risk_id: 唯一标识
- level: high/medium/low
- description: 风险描述
- mitigation: 缓解措施

**如无新增风险，写"未发现明显新增风险"**

### Step 9: 确定 Recommendation
根据 status 和角色确定：

| 角色 | 成功时 | 失败时 |
|------|--------|--------|
| architect | SEND_TO_REVIEW | REWORK |
| developer | SEND_TO_TEST | REWORK |
| tester | SEND_TO_REVIEW | REWORK |
| reviewer | CONTINUE / REWORK | - |
| docs | CONTINUE | REWORK |
| security | CONTINUE / ESCALATE | ESCALATE |

### Step 10: 验证输出完整性
对照 Required Output Sections 检查：
- [ ] 所有 ID 字段存在
- [ ] status 有效
- [ ] summary 包含三要素
- [ ] artifacts 列表（或说明原因）
- [ ] changed_files 列表（或空列表）
- [ ] checks_performed 至少一项
- [ ] issues_found 列表（或空列表）
- [ ] risks 已说明
- [ ] recommendation 有效
- [ ] needs_followup 已设置

## Checklists

### 前置检查
- [ ] dispatch_payload 已加载
- [ ] execution_result 数据已收集
- [ ] artifacts_produced 已整理

### 过程检查
- [ ] status 选择正确
- [ ] summary 包含三要素
- [ ] 所有必填字段已填写

### 后置检查
- [ ] 输出符合 io-contract schema
- [ ] 所有列表字段非 null（空也要写 []）
- [ ] recommendation 与 status 一致

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 字段缺失 | 必填字段为空 | 补充缺失信息，重新生成 |
| status 与内容矛盾 | status=SUCCESS 但有 critical issues | 修正 status 为 SUCCESS_WITH_WARNINGS 或 FAILED_RETRYABLE |
| summary 不完整 | 缺少三要素之一 | 补充缺失要素 |
| artifacts 路径无效 | path 指向不存在的文件 | 确认文件已生成，修正路径 |
| recommendation 不当 | 失败时推荐 CONTINUE | 根据 status 修正 recommendation |

## Output Requirements

### 必须输出（YAML 格式示例）

```yaml
dispatch_id: "dsp-001"
project_id: "proj-001"
milestone_id: "ms-002"
task_id: "task-013"
role: "developer"
command: "implement-task"

status: "SUCCESS"

summary: |
  实现了登录接口的错误码映射功能，包含 INVALID_CREDENTIALS、
  USER_LOCKED、SYSTEM_ERROR 三种错误的处理和返回。
  目标已达成，所有 acceptance criteria 已满足。
  无未完成项。

artifacts:
  - artifact_id: "art-impl-013"
    artifact_type: "implementation_summary"
    title: "登录接口实现总结"
    path: "artifacts/001-bootstrap/impl-auth.md"
    format: "markdown"
    summary: "包含错误码映射实现、改动文件列表、自检结果"
    created_by_role: "developer"
    related_task_id: "task-013"
    created_at: "2026-03-22T10:00:00Z"

changed_files:
  - path: "src/api/auth.py"
    change_type: "modified"
    diff_summary: "添加错误码映射逻辑，新增 handle_login_error 函数"
  - path: "src/errors/codes.py"
    change_type: "modified"
    diff_summary: "添加 AUTH 模块错误码定义"

checks_performed:
  - "实现目标对齐检查：错误码映射与 spec 一致"
  - "改动范围检查：仅修改 auth 相关文件"
  - "约束遵守检查：未修改 schema，未引入新依赖"
  - "关键路径自读检查：错误处理逻辑已验证"

issues_found: []

risks:
  - risk_id: "risk-001"
    level: "low"
    description: "token 泄露风险"
    mitigation: "将在 security review 阶段专项审查"

recommendation: "SEND_TO_TEST"

needs_followup: false

metadata:
  execution_time_ms: 120000
  model_version: "claude-3.5-sonnet"
```

### 状态为 FAILED_RETRYABLE 的输出示例

```yaml
status: "FAILED_RETRYABLE"

summary: |
  实现了登录接口基础错误码映射，但遗漏了 USER_LOCKED 状态处理。
  目标未完全达成，acceptance criteria 中 lockout 场景未覆盖。
  缺少：lockout 检测逻辑和 USER_LOCKED 错误码返回。

artifacts:
  - artifact_id: "art-impl-013-v1"
    artifact_type: "implementation_summary"
    title: "登录接口实现总结（初版）"
    path: "artifacts/001-bootstrap/impl-auth-v1.md"
    ...

changed_files:
  - path: "src/api/auth.py"
    change_type: "modified"
    diff_summary: "基础错误处理，缺少 lockout 分支"

checks_performed:
  - "实现目标对齐检查：发现遗漏 lockout 场景"
  - "代码自检：发现错误码命名与规范不一致"

issues_found:
  - issue_id: "issue-001"
    severity: "high"
    description: "缺少 lockout 状态错误码映射"
    recommendation: "添加连续失败检测和 USER_LOCKED 返回"
  - issue_id: "issue-002"
    severity: "medium"
    description: "error_code 命名与规范不一致"
    recommendation: "改为 errorCode 驼峰命名"

risks: []

recommendation: "REWORK"

needs_followup: true
followup_suggestions:
  - "补充 lockout 检测逻辑"
  - "修正错误码字段命名"
```

### 状态为 FAILED_ESCALATE 的输出示例

```yaml
status: "FAILED_ESCALATE"

summary: |
  在现有约束（不改 schema）下无法实现权限系统需求。
  需求目标与数据库 schema 存在根本性冲突。
  两次尝试均失败，需要用户决策是否放宽约束。

artifacts: []

changed_files: []

checks_performed:
  - "方案可行性检查：发现 schema 约束冲突"
  - "备选方案评估：所有方案均与约束冲突"

issues_found:
  - issue_id: "issue-001"
    severity: "critical"
    description: "spec 约束与需求目标冲突"
    recommendation: "需用户决策：修改 schema 或降级需求"

risks:
  - risk_id: "risk-001"
    level: "high"
    description: "项目可能无法按期交付"
    mitigation: "待用户决策后调整计划"

recommendation: "ESCALATE"

needs_followup: true
followup_suggestions:
  - "向用户说明约束冲突"
  - "提供选项：A) 修改 schema B) 降级需求 C) 延迟实现"

escalation:
  escalation_id: "esc-001"
  reason_type: "CONFLICTING_CONSTRAINTS"
  summary: "spec 约束与需求目标存在根本性冲突"
  blocking_points:
    - "不能修改数据库 schema"
    - "权限系统需要 schema 支持多对多关系"
  attempted_actions:
    - "尝试在现有 schema 上实现权限系统（失败）"
    - "尝试使用 JSON 字段绕过 schema（与约束冲突）"
  recommended_next_steps:
    - "用户决策是否放宽约束"
    - "或调整需求目标"
  requires_user_decision: true
```

## Notes

### 与 artifact-reading 的关系
- execution-reporting 生成 artifact 引用
- artifact-reading 读取 artifact 内容
- 两者共同确保 artifact 可被追溯和消费

### 与 failure-analysis 的关系
- failure-analysis 决定 status 和 recommendation
- execution-reporting 负责按格式输出
- 典型流程：failure-analysis -> execution-reporting

### 严格性级别

**strict 模式：**
- 所有必填字段必须非空
- status 与内容必须一致
- 不符合则返回 BLOCKED

**lenient 模式：**
- 允许部分字段为空
- 自动推断缺失信息
- 适合快速迭代阶段

**生产环境必须使用 strict 模式。**
