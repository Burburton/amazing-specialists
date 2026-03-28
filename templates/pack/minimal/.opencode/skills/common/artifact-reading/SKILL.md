# Skill: artifact-reading

## Purpose

统一读取 spec、design note、test report、review report 等工件，提取关键字段与约束，生成结构化摘要供当前角色使用。

解决的核心问题：
- 避免每个角色随意理解工件，导致上下游理解不一致
- 统一工件消费方式，确保 task 边界不漂移
- 为返工闭环提供一致的工件读取标准

## When to Use

必须使用时：
- 任何角色接收 dispatch payload 包含 `inputs` 字段时
- 需要读取上游角色产出的 artifact 时
- 需要验证当前实现与上游 spec/design 一致性时
- 返工时需要重新理解上一轮上下文时

推荐使用时：
- task 执行前，先统一加载所有相关工件
- 需要对比多个 artifact 版本时（如 spec v1 vs v2）
- 需要提取 artifact 中的关键约束条件时

## When Not to Use

不适用场景：
- 工件路径不明确或不存在（应先确认路径）
- 需要修改 artifact 内容时（这是写入操作，非读取）
- artifact 格式严重损坏无法解析（应标记 BLOCKED 并升级）
- 仅需读取代码文件而非结构化工件（使用文件工具即可）

## Required Inputs

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `artifact_paths` | string[] | 是 | 要读取的工件文件路径列表 |
| `artifact_types` | string[] | 是 | 工件类型标识 |
| `current_role` | string | 是 | 当前执行角色，决定读取侧重点 |

## Optional Inputs

| 字段 | 类型 | 说明 |
|------|------|------|
| `priority_order` | string[] | 工件读取优先级 |
| `required_fields` | string[] | 必须提取的字段 |
| `max_context_size` | number | 最大上下文 token 数 |

## Supported Artifact Types

| 类型 | 文件模式 | 关键字段 |
|------|----------|----------|
| `spec` | specs/*/spec.md | goal, scope, acceptance_criteria |
| `plan` | specs/*/plan.md | implementation_order, module_boundaries |
| `design_note` | artifacts/*/design-*.md | proposed_design, interface_contract |
| `task_list` | specs/*/tasks.md | tasks[], dependencies |
| `implementation_summary` | artifacts/*/impl-*.md | changed_files, self_check |
| `test_report` | artifacts/*/test-*.md | test_scope, pass_fail_summary |
| `review_report` | artifacts/*/review-*.md | overall_decision, must_fix_issues |

## Steps

### Step 1: 验证工件存在性
1. 遍历 `artifact_paths`，检查每个文件是否存在
2. 如有不存在，标记为 MISSING
3. 如关键工件缺失，返回 BLOCKED

### Step 2: 识别工件类型
1. 根据 `artifact_types` 或文件路径模式识别类型
2. 如类型无法识别，使用通用解析器

### Step 3: 按角色提取关键信息

不同角色关注不同字段：

**architect 关注：**
- requirement.goal, requirement.scope
- constraints
- acceptance_criteria
- risks

**developer 关注：**
- design_note.proposed_design
- design_note.interface_contract
- task_list.tasks[]
- implementation_summary.changed_files (返工时)

**tester 关注：**
- spec.acceptance_criteria
- design_note.assumptions
- implementation_summary.changed_files
- review_report.uncovered_gaps (返工时)

**reviewer 关注：**
- spec 完整内容
- design_note 完整内容
- implementation_summary
- test_report

**docs 关注：**
- implementation_summary.changed_files
- spec.user_facing_changes
- review_report.approval_status

**security 关注：**
- spec.security_requirements
- design_note.security_considerations
- changed_files 中涉及 auth/permission 的部分

### Step 4: 验证关键字段完整性
1. 检查 `required_fields` 是否都存在
2. 如有缺失，标记为 INCOMPLETE 并记录

### Step 5: 生成结构化摘要
输出统一格式的摘要对象

## Checklists

### 前置检查
- [ ] 所有 `artifact_paths` 已验证存在
- [ ] `artifact_types` 与路径数量匹配
- [ ] `current_role` 是有效角色值

### 过程检查
- [ ] 每个工件都成功解析
- [ ] 关键字段已提取
- [ ] 字段值非空（如有要求）

### 后置检查
- [ ] 摘要对象符合输出 schema
- [ ] 所有 `required_fields` 已包含
- [ ] 上下文大小未超限（如有设置）

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 工件不存在 | 文件路径无效 | 标记 MISSING，如为必需则 BLOCKED |
| 类型识别失败 | 无法匹配已知类型 | 使用通用解析器，标记为 GENERIC |
| 关键字段缺失 | required_fields 未找到 | 标记 INCOMPLETE，列出缺失字段 |
| 格式损坏 | markdown 结构混乱 | 标记 CORRUPTED，返回 BLOCKED |
| 上下文超限 | token 数超过限制 | 按优先级裁剪低优先级工件内容 |
| 版本不匹配 | 工件版本不符合要求 | 标记 VERSION_MISMATCH，建议升级 |

## Output Requirements

### 必须输出

```yaml
artifact_summary:
  dispatch_id: string
  artifacts_read: number
  artifacts_missing: string[]
  artifacts_corrupted: string[]
  
extracted_data:
  spec:
    goal: string
    scope: string
    acceptance_criteria: string[]
    constraints: string[]
    risks: string[]
  
  design_note:
    proposed_design: string
    module_boundary: string
    interface_contract: object
    assumptions: string[]
  
  task_list:
    tasks: object[]
    dependencies: object[]
  
  implementation_summary:
    changed_files: string[]
    implementation_summary: string
    unresolved_issues: string[]
  
  test_report:
    test_scope: string
    pass_fail_summary: string
    uncovered_gaps: string[]
  
  review_report:
    overall_decision: string
    must_fix_issues: string[]
    residual_risks: string[]

role_focused_summary:
  # 根据 current_role 生成角色定制化摘要
  key_points: string[]
  critical_constraints: string[]
  action_items: string[]
  risks_to_watch: string[]

status: SUCCESS | PARTIAL | BLOCKED
issues: string[]
```

### 可选输出

```yaml
version_info:
  artifact_versions: object
  version_mismatches: string[]

context_metrics:
  total_tokens: number
  compressed: boolean
  compression_ratio: number
```

## Examples

### 示例 1：developer 读取 spec + design_note

输入：
```yaml
artifact_paths:
  - specs/001-bootstrap/spec.md
  - specs/001-bootstrap/plan.md
  - artifacts/001-bootstrap/design-auth.md
artifact_types:
  - spec
  - plan
  - design_note
current_role: developer
required_fields:
  - spec.goal
  - design_note.proposed_design
```

输出摘要（role_focused_summary）：
```yaml
key_points:
  - "目标：实现用户认证模块的登录接口"
  - "范围：仅包含登录接口，不包含注册/找回密码"
  - "设计方案：使用 JWT token，有效期 24 小时"
  
critical_constraints:
  - "不能修改数据库 schema"
  - "必须保持现有 API path 不变"
  
action_items:
  - "实现 /api/v1/auth/login 接口"
  - "添加 JWT token 生成逻辑"
  - "实现错误码映射"
  
risks_to_watch:
  - "token 泄露风险（需后续 security 审查）"
```

### 示例 2：reviewer 读取完整上下文

输入：
```yaml
artifact_paths:
  - specs/001-bootstrap/spec.md
  - artifacts/001-bootstrap/design-auth.md
  - artifacts/001-bootstrap/impl-auth.md
  - artifacts/001-bootstrap/test-auth.md
artifact_types:
  - spec
  - design_note
  - implementation_summary
  - test_report
current_role: reviewer
```

输出摘要包含所有工件的完整对比视图，供 reviewer 检查实现是否符合 spec。

### 示例 3：工件缺失场景

输入：
```yaml
artifact_paths:
  - specs/001-bootstrap/spec.md
  - artifacts/001-bootstrap/design-auth.md
required_fields:
  - design_note.proposed_design
```

假设 design-auth.md 不存在：

输出：
```yaml
status: BLOCKED
artifacts_missing:
  - artifacts/001-bootstrap/design-auth.md
issues:
  - "Required artifact 'design_note' is missing"
  - "Cannot proceed without design_note.proposed_design"
```

## Notes

### 与 io-contract.md 的关系
本 skill 实现的工件读取规范应与 `io-contract.md` 中定义的 artifact schema 保持一致。

### 性能考虑
- 大项目可能有多个 artifact，建议设置 `max_context_size` 防止上下文膨胀
- 支持 `priority_order` 让高优先级工件内容优先保留

### 扩展性
如需支持新的 artifact 类型：
1. 在 Supported Artifact Types 表格中添加新行
2. 在 Step 3 中添加该类型对应的关注字段
3. 在 Output Requirements 的 extracted_data 中添加新结构
