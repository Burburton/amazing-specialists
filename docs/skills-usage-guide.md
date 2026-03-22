# OpenCode 专家包 Skills 使用指南

## 概述

本指南介绍如何使用 OpenCode 专家包的 21 个 Skills 完成全自动产品研发闭环。

## 技能总览

### 已完成 Skills（21个）

| 类别 | 数量 | Skills |
|------|------|--------|
| **Common** | 5 | artifact-reading, context-summarization, failure-analysis, execution-reporting, retry-strategy |
| **Architect** | 3 | requirement-to-design, module-boundary-design, tradeoff-analysis |
| **Developer** | 3 | feature-implementation, bugfix-workflow, code-change-selfcheck |
| **Tester** | 3 | unit-test-design, regression-analysis, edge-case-matrix |
| **Reviewer** | 3 | code-review-checklist, spec-implementation-diff, reject-with-actionable-feedback |
| **Docs** | 2 | readme-sync, changelog-writing |
| **Security** | 2 | auth-and-permission-review, input-validation-review |

---

## 标准调用流程

### 完整 Feature 开发流程

```yaml
flow:
  phase_1_prepare:
    - artifact-reading
    - context-summarization
    
  phase_2_design:
    - requirement-to-design
    - module-boundary-design (可选)
    
  phase_3_implement:
    - feature-implementation
    - code-change-selfcheck
    
  phase_4_test:
    - edge-case-matrix
    - unit-test-design
    - regression-analysis
    
  phase_5_security:  # 高风险任务
    - auth-and-permission-review
    - input-validation-review
    
  phase_6_review:
    - code-review-checklist
    - spec-implementation-diff
    - reject-with-actionable-feedback
    
  phase_7_docs:
    - readme-sync
    - changelog-writing
    
  phase_8_report:
    - execution-reporting
    
  phase_9_recovery:  # 失败时
    - failure-analysis
    - retry-strategy
```

---

## Common Skills 使用指南

### 1. artifact-reading

**用途**: 统一读取 spec、design note、test report 等工件

**调用时机**: 任何任务开始前

**输入**:
```yaml
artifact_paths:
  - specs/001-bootstrap/spec.md
  - specs/001-bootstrap/plan.md
artifact_types:
  - spec
  - plan
current_role: developer
required_fields:
  - spec.goal
  - plan.architecture_summary
```

**输出**:
```yaml
artifact_summary:
  extracted_data:
    spec:
      goal: "实现用户登录"
      acceptance_criteria: [...]
  role_focused_summary:
    key_points: [...]
```

**使用示例**:
```yaml
# 在 dispatch payload 中调用
command: artifact-reading
inputs:
  artifact_paths:
    - specs/001-bootstrap/spec.md
    - specs/001-bootstrap/plan.md
  current_role: developer
```

---

### 2. context-summarization

**用途**: 裁剪上下文，防止 token 超限

**调用时机**: artifact-reading 之后

**输入**:
```yaml
raw_context: "<大量上下文>"
task_goal: "实现登录接口"
current_role: developer
max_context_size: 3000
```

**输出**:
```yaml
summarized_context:
  task_goal: "实现登录接口"
  constraints: [...]
  key_artifacts: [...]
```

---

### 3. failure-analysis

**用途**: 分析失败原因，分类失败类型

**调用时机**: 任务失败后

**输入**:
```yaml
failure_logs:
  - "REVIEW: reject"
  - "must_fix: 安全问题"
task_context:
  goal: "实现登录功能"
previous_attempts: [...]
```

**输出**:
```yaml
failure_analysis:
  failure_type: SECURITY_ISSUE
  root_cause: "硬编码密钥"
  recommendation: REWORK
```

---

### 4. execution-reporting

**用途**: 统一输出执行结果

**调用时机**: 任务完成后

**输入**:
```yaml
dispatch_payload: {...}
execution_result:
  status: SUCCESS
  changed_files: [...]
artifacts_produced: [...]
```

**输出**:
```yaml
execution_result:
  dispatch_id: "dsp-001"
  status: SUCCESS
  summary: "..."
  recommendation: COMPLETE
```

---

### 5. retry-strategy

**用途**: 制定返工策略

**调用时机**: failure-analysis 之后

**输入**:
```yaml
failure_analysis: {...}
retry_count: 1
max_retry: 2
```

**输出**:
```yaml
retry_strategy:
  strategy_type: DIRECT_FIX
  fix_plan:
    steps: [...]
  recommendation: PROCEED_WITH_RETRY
```

---

## Architect Skills 使用指南

### 6. requirement-to-design

**用途**: 需求转技术设计

**调用时机**: 新 feature 需要设计

**输入**:
```yaml
spec: {...}
codebase_context: {...}
constraints:
  - "不改 schema"
```

**输出**:
```yaml
design_note:
  summary: "分层架构..."
  module_boundaries: [...]
  interface_contracts: [...]
  implementation_plan: {...}
```

**使用示例**:
```yaml
command: requirement-to-design
inputs:
  spec: specs/001-bootstrap/spec.md
  constraints:
    - "使用 bcrypt"
    - "不改 schema"
```

---

### 7. module-boundary-design

**用途**: 细化模块划分

**调用时机**: requirement-to-design 后可选

**输入**:
```yaml
design_note: {...}
focus_area: "模块依赖"
```

**输出**:
```yaml
module_design:
  modules: [...]
  dependency_graph: "..."
```

---

### 8. tradeoff-analysis

**用途**: 技术方案对比

**调用时机**: 多方案选择时

**输入**:
```yaml
alternatives:
  - name: "REST"
    description: "传统 API"
  - name: "GraphQL"
    description: "查询语言"
evaluation_criteria:
  - criterion: "性能"
    weight: 0.3
```

**输出**:
```yaml
tradeoff_analysis:
  recommendation:
    selected_alternative: "REST"
    reasoning: "..."
```

---

## Developer Skills 使用指南

### 9. feature-implementation

**用途**: 功能实现

**调用时机**: 有明确实现任务

**输入**:
```yaml
task:
  goal: "实现登录接口"
design_note: {...}
constraints: [...]
```

**输出**:
```yaml
implementation_summary:
  goal_alignment: {...}
  changed_files: [...]
  new_dependencies: [...]
  recommendation: SEND_TO_TEST
```

---

### 10. bugfix-workflow

**用途**: Bug 修复

**调用时机**: 修复 bug

**输入**:
```yaml
bug_report:
  symptom: "登录失败"
  reproduction_steps: [...]
```

**输出**:
```yaml
bugfix_report:
  root_cause: {...}
  fix_details: {...}
  recommendation: CLOSE
```

---

### 11. code-change-selfcheck

**用途**: 代码自检

**调用时机**: 代码变更提交前

**输入**:
```yaml
changed_files: [...]
check_categories:
  - goal_alignment
  - security
```

**输出**:
```yaml
self_check_report:
  total_checks: 20
  passed: 18
  blockers: 2
  overall_status: FAIL_WITH_BLOCKERS
```

---

## Tester Skills 使用指南

### 12. edge-case-matrix

**用途**: 边界条件分析

**调用时机**: 测试设计前

**输入**:
```yaml
spec: {...}
changed_files: [...]
```

**输出**:
```yaml
edge_case_matrix:
  boundaries:
    - parameter: username
      boundaries: [...]
  coverage_summary:
    total_boundaries: 15
```

---

### 13. unit-test-design

**用途**: 单元测试设计

**调用时机**: edge-case-matrix 后

**输入**:
```yaml
target:
  module: AuthService
  functions: [...]
edge_cases: [...]
```

**输出**:
```yaml
test_design:
  test_cases:
    - id: TC-001
      name: "valid credentials"
      category: happy_path
```

---

### 14. regression-analysis

**用途**: 回归分析

**调用时机**: 代码变更后

**输入**:
```yaml
changed_files: [...]
previous_attempts: [...]
```

**输出**:
```yaml
regression_analysis:
  impact_analysis: {...}
  regression_strategy: {...}
```

---

## Reviewer Skills 使用指南

### 15. code-review-checklist

**用途**: 代码审查

**调用时机**: 实现完成后

**输入**:
```yaml
diff: [...]
spec: {...}
design_note: {...}
```

**输出**:
```yaml
review_report:
  summary:
    overall_decision: reject
  issues:
    - id: ISS-001
      severity: blocker
```

---

### 16. spec-implementation-diff

**用途**: 实现与 spec 对比

**调用时机**: reviewer 审查时

**输入**:
```yaml
spec: {...}
implementation: {...}
```

**输出**:
```yaml
spec_implementation_diff:
  gaps: [...]
  deviations: [...]
  recommendation: reject
```

---

### 17. reject-with-actionable-feedback

**用途**: 可执行反馈

**调用时机**: reviewer reject 时

**输入**:
```yaml
issues: [...]
deviations: [...]
```

**输出**:
```yaml
reject_feedback:
  must_fix: [...]
  should_fix: [...]
  re_review_instructions: {...}
```

---

## Docs Skills 使用指南

### 18. readme-sync

**用途**: README 同步

**调用时机**: milestone 完成

**输入**:
```yaml
implementation_summary: {...}
changed_files: [...]
previous_readme: README.md
```

**输出**:
```yaml
readme_sync_report:
  sections_updated: [...]
  sections_added: [...]
  recommendation: SYNC_COMPLETE
```

---

### 19. changelog-writing

**用途**: 变更日志

**调用时机**: 版本发布

**输入**:
```yaml
changes:
  - type: feature
    description: "用户登录"
version:
  previous: "1.0.0"
  bump: minor
```

**输出**:
```yaml
changelog_entry:
  version: "1.1.0"
  changes:
    added: [...]
    fixed: [...]
```

---

## Security Skills 使用指南

### 20. auth-and-permission-review

**用途**: 认证权限审查

**调用时机**: 高风险任务

**输入**:
```yaml
changed_files:
  - src/controllers/AuthController.ts
  - src/services/PermissionService.ts
risk_level: high
```

**输出**:
```yaml
security_review_report:
  findings:
    - id: SEC-001
      severity: critical
  gate_decision:
    decision: fail
```

---

### 21. input-validation-review

**用途**: 输入验证审查

**调用时机**: 涉及用户输入

**输入**:
```yaml
changed_files: [...]
inputs:
  - source: "POST /api/login"
    type: http_body
    parameter: username
```

**输出**:
```yaml
input_validation_review:
  findings:
    - id: VAL-001
      severity: critical
      category: sql_injection
  gate_decision:
    decision: fail
```

---

## 使用示例

### 示例 1：标准 Feature 开发

```yaml
# Step 1: 读取工件
$ artifact-reading
  inputs:
    - specs/feature/spec.md
    - specs/feature/plan.md

# Step 2: 架构设计
$ requirement-to-design
  inputs:
    spec: specs/feature/spec.md

# Step 3: 开发实现
$ feature-implementation
  inputs:
    design_note: artifacts/feature/design.md

# Step 4: 代码自检
$ code-change-selfcheck
  inputs:
    changed_files: [...]

# Step 5: 测试设计
$ edge-case-matrix
  inputs:
    spec: specs/feature/spec.md

$ unit-test-design
  inputs:
    target: AuthService
    edge_cases: [...]

# Step 6: 代码审查
$ code-review-checklist
  inputs:
    diff: [...]

# Step 7: 文档同步
$ readme-sync
  inputs:
    implementation_summary: [...]

$ changelog-writing
  inputs:
    changes: [...]

# Step 8: 输出结果
$ execution-reporting
  inputs:
    execution_result: {...}
```

### 示例 2：失败返工流程

```yaml
# Review 失败
$ code-review-checklist
  -> status: reject

# 分析失败
$ failure-analysis
  inputs:
    failure_logs: [...]
  -> failure_type: REVIEW_REJECTION
     recommendation: REWORK

# 制定策略
$ retry-strategy
  inputs:
    failure_analysis: {...}
  -> fix_plan: {...}

# 修复
$ feature-implementation
  inputs:
    retry_context: {...}

# 重新审查
$ code-review-checklist
  -> status: approve
```

### 示例 3：高风险任务（带 Security）

```yaml
# 标记高风险
$ dispatch_payload:
    risk_level: high

# 标准流程...

# Security Review（自动触发）
$ auth-and-permission-review
  inputs:
    changed_files: [...]

$ input-validation-review
  inputs:
    inputs: [...]

# Security Gate
if security_report.gate_decision == fail:
  $ failure-analysis
  $ retry-strategy
  # 修复后重新 Security Review

# 继续 Reviewer...
```

---

## 常见问题

### Q1: 如何确定调用哪个 skill？

**按角色**: 根据当前执行角色选择对应 skill  
**按阶段**: 按标准流程顺序调用  
**按任务类型**: 
- 新功能 → feature-implementation
- Bug 修复 → bugfix-workflow
- 架构设计 → requirement-to-design

### Q2: 什么时候需要 Security Review？

**必须 Security Review**:
- 涉及认证/登录
- 涉及权限控制
- 涉及用户输入
- 标记为 high/critical 风险

**自动触发条件**:
```yaml
risk_level: high | critical
domain: auth | security | payment
```

### Q3: 如何处理 skill 失败？

**流程**:
1. 调用 failure-analysis 分析原因
2. 调用 retry-strategy 制定策略
3. 根据策略返工
4. 重新执行相关 skills

**示例**:
```yaml
if review_report.summary.decision == reject:
  $ failure-analysis
  $ retry-strategy
  $ feature-implementation  # 返工
```

### Q4: Skill 输出如何传递给下一个 skill？

**通过 dispatch payload**:
```yaml
# Skill A 输出
output_a: {...}

# 作为 Skill B 输入
dispatch_payload:
  inputs:
    output_from_a: output_a
```

**通过 artifact**:
```yaml
# Skill A 生成 artifact
artifact:
  path: artifacts/design.md
  
# Skill B 读取
$ artifact-reading
  inputs:
    artifact_paths:
      - artifacts/design.md
```

### Q5: 可以跳过某些 skill 吗？

**推荐不跳过**:
- artifact-reading（基础数据）
- code-change-selfcheck（质量保证）
- execution-reporting（输出规范）

**可选跳过**:
- module-boundary-design（简单场景）
- tradeoff-analysis（无多方案选择）
- security review（低风险任务）

### Q6: 如何并行调用 skills？

**独立 skills 可并行**:
```yaml
# 这两个可以并行
$ edge-case-matrix
$ regression-analysis

# 这两个可以并行
$ auth-and-permission-review
$ input-validation-review
```

**依赖 skills 需顺序**:
```yaml
# 必须先 A 后 B
$ requirement-to-design
$ feature-implementation
```

---

## 快速参考卡片

### 角色 → Skills 映射

| 角色 | Skills |
|------|--------|
| Common | artifact-reading, context-summarization, failure-analysis, execution-reporting, retry-strategy |
| Architect | requirement-to-design, module-boundary-design, tradeoff-analysis |
| Developer | feature-implementation, bugfix-workflow, code-change-selfcheck |
| Tester | edge-case-matrix, unit-test-design, regression-analysis |
| Reviewer | code-review-checklist, spec-implementation-diff, reject-with-actionable-feedback |
| Docs | readme-sync, changelog-writing |
| Security | auth-and-permission-review, input-validation-review |

### 任务类型 → Skills

| 任务 | Skills |
|------|--------|
| 新功能 | artifact-reading → requirement-to-design → feature-implementation → ... → execution-reporting |
| Bug 修复 | artifact-reading → bugfix-workflow → ... → execution-reporting |
| 代码审查 | artifact-reading → code-review-checklist → execution-reporting |
| 安全审查 | artifact-reading → auth-and-permission-review → execution-reporting |
| 文档更新 | artifact-reading → readme-sync → changelog-writing → execution-reporting |

### 风险等级 → Security

| 风险 | Security Review |
|------|----------------|
| low | 可选 |
| medium | 推荐 |
| high | 必须 |
| critical | 必须 + 多轮 |

---

## 版本信息

- **Version**: 1.0.0
- **Updated**: 2026-03-22
- **Skills Count**: 21
- **MVP Stage**: M1 + M2 + M3 Complete
