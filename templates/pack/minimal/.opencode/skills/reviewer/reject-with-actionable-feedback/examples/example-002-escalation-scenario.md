# Example 002: Escalation Scenario When Rejection Isn't Appropriate

## Scenario

A developer implements a role-based access control (RBAC) system. The reviewer discovers that the implementation conflicts with existing architectural constraints, and the issue cannot be resolved through simple code fixes - it requires product/business decision.

## Original Task Specification

```yaml
task:
  id: "TASK-RBAC-001"
  description: "实现角色权限系统"
  requirements:
    - "用户可以有多个角色"
    - "角色可以有多个权限"
    - "支持动态角色分配"
  constraints:
    - "不修改现有数据库 schema"
    - "不引入新的外部依赖"
```

## Original Code Under Review

```typescript
// RoleService.ts
export class RoleService {
  // 问题：现有 schema 只有 users 表，没有 roles 或 user_roles 表
  // 开发者尝试用 JSON 字段存储角色
  async assignRole(userId: string, role: string) {
    const user = await this.db.query(
      'UPDATE users SET roles = JSON_ARRAY_APPEND(roles, "$", ?) WHERE id = ?',
      [role, userId]
    );
    // ...
  }
  
  async checkPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.db.query(
      'SELECT roles FROM users WHERE id = ?',
      [userId]
    );
    
    const roles = JSON.parse(user.roles);
    // 问题：权限定义在哪里？没有 permissions 表
    // 硬编码了权限检查
    const rolePermissions = {
      admin: ['read', 'write', 'delete'],
      editor: ['read', 'write'],
      viewer: ['read']
    };
    
    return roles.some(role => 
      rolePermissions[role]?.includes(permission)
    );
  }
}
```

## Reviewer's Analysis

### Issues Identified

1. **Schema Constraint Violation**: The constraint says "不修改现有数据库 schema", but proper RBAC requires:
   - `roles` table
   - `permissions` table
   - `user_roles` junction table
   - `role_permissions` junction table

2. **Hardcoded Permissions**: The `rolePermissions` object is hardcoded, violating the "dynamic role assignment" requirement.

3. **JSON Field Approach Limitations**:
   - Cannot enforce referential integrity
   - Cannot efficiently query by role
   - Cannot track role history
   - Violates database normalization

### Decision: Escalate Instead of Reject

The reviewer realizes this is NOT a code quality issue - it's an **architectural constraint conflict**. Rejection would be inappropriate because:

- There's no "fix" the developer can make
- The constraint itself is the blocker
- Product/business input is needed

## Reviewer's Escalation Report

```yaml
escalation_report:
  dispatch_id: "DIS-2024-002"
  task_id: "TASK-RBAC-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-03-26T14:00:00Z"
  
  decision:
    verdict: escalate
    reason: "任务需求与架构约束存在根本性冲突，需要产品决策"
    
  conflict_analysis:
    requirement: "多对多用户-角色-权限关系"
    constraint: "不修改数据库 schema"
    conflict: |
      现有数据库 schema 不支持多对多关系：
      - 无 roles 表
      - 无 permissions 表
      - 无 user_roles 关联表
      - 无 role_permissions 关联表
      
      开发者尝试使用 JSON 字段存储角色，但这带来以下问题：
      1. 无法保证数据完整性
      2. 无法高效按角色查询用户
      3. 权限定义硬编码，无法动态管理
      4. 违反数据库规范化原则
      
  attempted_solutions:
    - approach: "JSON 字段存储角色"
      issues:
        - "无法保证完整性"
        - "查询性能差"
        - "无法动态管理权限"
      verdict: "不满足需求"
      
    - approach: "内存缓存权限映射"
      issues:
        - "重启丢失"
        - "多实例不一致"
        - "仍需要存储结构"
      verdict: "不可行"
      
    - approach: "使用现有字段扩展"
      issues:
        - "现有 users 表只有单一 roles 字符串字段"
        - "无法表达多角色多权限"
      verdict: "结构不支持"
      
  options_for_decision:
    - id: "OPTION-A"
      title: "放宽约束，修改 schema"
      description: "创建 roles, permissions, user_roles, role_permissions 表"
      pros:
        - "完整实现 RBAC"
        - "数据完整性保证"
        - "标准解决方案"
      cons:
        - "需要数据库迁移"
        - "违反原始约束"
      impact: "需要 2-3 天完成 schema 变更和迁移"
      
    - id: "OPTION-B"
      title: "降级需求，简化权限模型"
      description: "只支持单角色，使用现有 roles 字段"
      pros:
        - "不修改 schema"
        - "快速实现"
      cons:
        - "不满足'用户可以有多个角色'需求"
        - "权限仍需硬编码"
      impact: "需要重新定义需求范围"
      
    - id: "OPTION-C"
      title: "延迟实现"
      description: "等待架构重构后再实现"
      pros:
        - "不破坏现有结构"
        - "未来可实现完整方案"
      cons:
        - "当前无法交付"
        - "时间不确定"
      impact: "需要产品确认优先级"
      
  recommendation:
    preferred_option: "OPTION-A"
    rationale: |
      虽然 OPTION-A 违反"不修改 schema"约束，但：
      1. 这是实现完整 RBAC 的唯一可行方案
      2. JSON 方案的技术债务会随时间累积
      3. 早期投入 schema 变更比后期重构成本低
      
    alternatives_if_preferred_option_rejected:
      - "如预算/时间紧急，选择 OPTION-B 作为临时方案"
      - "如架构重构计划已排期，选择 OPTION-C"
      
  blocking_issues:
    - "无法在不修改 schema 的情况下实现多对多角色权限关系"
    - "当前所有技术方案都无法同时满足需求和约束"
    
  required_decision:
    from: "产品负责人 / 架构师"
    question: "以下选项中选择一个："
    options:
      - "A: 放宽约束，允许修改 schema"
      - "B: 降级需求，接受单角色限制"
      - "C: 延迟实现，等待架构重构"
    deadline: "建议 2 个工作日内决策"
    
  timeline_if_decided:
    option_a:
      schema_design: "4 小时"
      migration_script: "4 小时"
      implementation: "1 天"
      testing: "4 小时"
      total: "2-3 天"
    option_b:
      implementation: "4 小时"
      testing: "2 小时"
      total: "1 天"
    option_c:
      waiting_time: "不确定"
      
  next_steps:
    if_option_a: "架构师设计 schema 变更方案，开发者实现"
    if_option_b: "产品确认需求降级范围，开发者实现简化版"
    if_option_c: "取消当前任务，等待架构重构里程碑"
```

## Why This Is Escalation, Not Rejection

### Rejection Would Be Wrong Because:

1. **No code fix exists**: The developer cannot fix this by changing code
2. **Constraint is the blocker**: The task constraint itself creates impossibility
3. **Decision needed**: Product/business must choose between:
   - Relaxing the constraint
   - Reducing requirements
   - Delaying implementation

### When to Escalate vs Reject

| Situation | Action |
|-----------|--------|
| Code can be improved | Reject with actionable feedback |
| Developer made mistakes | Reject with remediation steps |
| Requirements conflict with constraints | Escalate to decision-maker |
| Need architectural guidance | Escalate to architect |
| Security concerns beyond code | Escalate to security team |
| Scope creep detected | Escalate to product owner |

### The Escalation Decision Tree

```
Issue Found
    │
    ├─ Can developer fix by changing code?
    │   ├─ YES → Reject with actionable feedback
    │   └─ NO ↓
    │
    ├─ Is it a technical constraint conflict?
    │   ├─ YES → Escalate (architectural decision needed)
    │   └─ NO ↓
    │
    ├─ Is it a requirements conflict?
    │   ├─ YES → Escalate (product decision needed)
    │   └─ NO ↓
    │
    ├─ Is it a security policy issue?
    │   ├─ YES → Escalate (security team decision)
    │   └─ NO ↓
    │
    └─ Is it a process/policy issue?
        ├─ YES → Escalate (process owner decision)
        └─ NO → Document and proceed with best judgment
```

## Key Takeaways

1. **Rejection is for fixable issues**: If there's a code change that solves the problem, reject with guidance.

2. **Escalation is for decision-points**: If the blocker is a constraint, policy, or requirement conflict, escalate.

3. **Provide options, not just problems**: A good escalation presents viable options with trade-offs.

4. **Clear decision needed**: State exactly what decision is required, from whom, and by when.

5. **Blocking issues documented**: Clearly state what's blocking and why it cannot be resolved at the developer level.