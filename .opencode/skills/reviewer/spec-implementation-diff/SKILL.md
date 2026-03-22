# Skill: spec-implementation-diff

## Purpose

检查 spec / design 与 implementation 是否一致，识别偏离和遗漏，确保实现符合原始需求。

解决的核心问题：
- 实现偏离 spec 不自知
- 需求遗漏未被发现
- design 与实现不一致
- 变更未同步更新文档

## When to Use

必须使用时：
- reviewer 审查实现时
- 验收前验证一致性
- 发现实现与预期不符时

推荐使用时：
- 任何代码审查时
- milestone 完成前
- 发布前最终检查

## When Not to Use

不适用场景：
- 无 spec 的快速原型
- 纯技术重构
- 已明确是设计变更

## Diff Categories

### 1. 功能对齐 (Functional Alignment)

#### 1.1 需求覆盖
| 检查项 | 描述 |
|--------|------|
| 已实现 | spec 中的需求已实现 |
| 部分实现 | spec 中的需求部分实现 |
| 未实现 | spec 中的需求未实现 |
| 超出实现 | 实现了 spec 外的功能 |

#### 1.2 Acceptance Criteria
- 每个 acceptance criterion 是否满足？
- 如何验证满足？
- 是否有遗漏的 criteria？

### 2. 接口对齐 (Interface Alignment)

#### 2.1 API 契约
- 端点路径是否一致？
- 请求参数是否一致？
- 响应格式是否一致？
- 错误码是否一致？

#### 2.2 函数签名
- 函数名是否一致？
- 参数类型是否一致？
- 返回值是否一致？
- 异常类型是否一致？

### 3. 行为对齐 (Behavioral Alignment)

#### 3.1 正常行为
- happy path 行为是否一致？
- 状态转换是否一致？
- 副作用是否一致？

#### 3.2 异常行为
- 错误处理是否一致？
- 边界处理是否一致？
- 超时处理是否一致？

### 4. 数据对齐 (Data Alignment)

#### 4.1 数据结构
- 数据模型是否一致？
- 字段命名是否一致？
- 数据类型是否一致？

#### 4.2 数据约束
- 必填字段是否一致？
- 数据校验是否一致？
- 默认值是否一致？

### 5. 非功能对齐 (Non-Functional Alignment)

#### 5.1 性能
- 性能要求是否满足？
- 资源限制是否遵守？

#### 5.2 安全
- 安全要求是否满足？
- 权限控制是否一致？

#### 5.3 兼容性
- 兼容性要求是否满足？
- 向后兼容是否保持？

## Steps

### Step 1: 收集文档
1. 读取 spec
2. 读取 design note
3. 读取 implementation summary
4. 读取 changed_files

### Step 2: 逐条对比
对 spec 中的每条需求：
1. 在实现中查找对应
2. 对比预期 vs 实际
3. 标记一致性
4. 记录差异

### Step 3: 识别偏离
检查：
- 实现偏离 design
- 新增未设计的功能
- 遗漏设计的功能
- 简化的功能

### Step 4: 评估影响
对每项偏离：
1. 评估影响范围
2. 评估风险等级
3. 确定是否可接受
4. 记录理由

### Step 5: 生成 Diff Report
输出 spec-implementation diff report

## Output Format

```yaml
spec_implementation_diff:
  dispatch_id: string
  task_id: string
  
  summary:
    overall_status: aligned | partial_aligned | not_aligned
    alignment_percentage: number
    
  spec_reference:
    spec_version: string
    design_version: string
    
  comparison:
    - category: string
      items:
        - spec_item: string
          spec_description: string
          implementation_status: implemented | partial | not_implemented | exceeded
          implementation_location: string
          alignment: aligned | deviation | gap
          
          deviation:
            type: omission | addition | modification
            description: string
            reason: string
            severity: high | medium | low
            acceptable: boolean
            
          verification:
            method: string
            result: pass | fail | not_tested
            
  gaps:
    - gap: string
      description: string
      impact: string
      mitigation: string
      
  deviations:
    - deviation: string
      description: string
      reason: string
      impact: string
      acceptable: boolean
      requires_approval: boolean
      
  additions:
    - addition: string
      description: string
      reason: string
      in_scope: boolean
      
  verification_coverage:
    test_coverage: number
    untested_items: string[]
    
  recommendation:
    action: approve | reject | request_changes | escalate
    must_fix: string[]
    should_fix: string[]
    acceptable_deviations: string[]
```

## Examples

### 示例 1：完全对齐

```yaml
spec_implementation_diff:
  summary:
    overall_status: aligned
    alignment_percentage: 100
    
  comparison:
    - category: 功能需求
      items:
        - spec_item: "FR-001: 用户登录"
          spec_description: "支持用户名密码登录"
          implementation_status: implemented
          implementation_location: "AuthController.login"
          alignment: aligned
          verification:
            method: "集成测试"
            result: pass
            
        - spec_item: "FR-002: JWT Token"
          spec_description: "登录成功返回 JWT Token"
          implementation_status: implemented
          implementation_location: "JwtTokenService.generate"
          alignment: aligned
          verification:
            method: "单元测试"
            result: pass
            
    - category: 错误处理
      items:
        - spec_item: "ERR-001: 密码错误"
          spec_description: "密码错误返回 401"
          implementation_status: implemented
          implementation_location: "AuthService.validateUser"
          alignment: aligned
          verification:
            method: "单元测试"
            result: pass
            
  gaps: []
  deviations: []
  additions: []
  
  verification_coverage:
    test_coverage: 95
    untested_items: []
    
  recommendation:
    action: approve
    must_fix: []
    acceptable_deviations: []
```

### 示例 2：存在偏离

```yaml
spec_implementation_diff:
  summary:
    overall_status: partial_aligned
    alignment_percentage: 85
    
  comparison:
    - category: 功能需求
      items:
        - spec_item: "FR-001: 用户登录"
          spec_description: "支持用户名密码登录"
          implementation_status: implemented
          alignment: aligned
          
        - spec_item: "FR-002: JWT Token"
          spec_description: "登录成功返回 JWT Token，有效期 24 小时"
          implementation_status: partial
          alignment: deviation
          deviation:
            type: modification
            description: "Token 有效期为 1 小时而非 24 小时"
            reason: "性能考虑，短 token 更安全"
            severity: medium
            acceptable: true
            requires_approval: true
            
        - spec_item: "FR-003: 记住我功能"
          spec_description: "支持记住我，延长 token 有效期"
          implementation_status: not_implemented
          alignment: gap
          
    - category: 错误处理
      items:
        - spec_item: "ERR-001: 密码错误"
          spec_description: "密码错误返回 401"
          implementation_status: implemented
          alignment: aligned
          
        - spec_item: "ERR-002: 账号锁定"
          spec_description: "连续 5 次失败锁定账号 30 分钟"
          implementation_status: not_implemented
          alignment: gap
          
  gaps:
    - gap: "记住我功能未实现"
      description: "FR-003 记住我功能不在实现中"
      impact: "用户每次都需要重新登录"
      mitigation: "计划在下一 milestone 实现"
      
    - gap: "账号锁定未实现"
      description: "ERR-002 账号锁定功能未实现"
      impact: "存在暴力破解风险"
      mitigation: "security review 评估后决定"
      
  deviations:
    - deviation: "Token 有效期改为 1 小时"
      description: "spec 要求 24 小时，实现为 1 小时"
      reason: "安全考虑，短 token 降低泄露风险"
      impact: "用户需要更频繁重新登录"
      acceptable: true
      requires_approval: true
      
  additions:
    - addition: "登录日志记录"
      description: "记录了每次登录尝试"
      reason: "安全审计需要"
      in_scope: false
      
  recommendation:
    action: request_changes
    must_fix:
      - "实现账号锁定功能（ERR-002）"
    should_fix:
      - "评估记住我功能是否必须"
    acceptable_deviations:
      - "Token 有效期 1 小时（需产品确认）"
```

### 示例 3：严重偏离

```yaml
spec_implementation_diff:
  summary:
    overall_status: not_aligned
    alignment_percentage: 60
    
  comparison:
    - category: 架构
      items:
        - spec_item: "ARC-001: 分层架构"
          spec_description: "Controller-Service-Repository 分层"
          implementation_status: implemented
          alignment: aligned
          
    - category: 接口
      items:
        - spec_item: "API-001: 登录端点"
          spec_description: "POST /api/auth/login"
          implementation_status: implemented
          alignment: deviation
          deviation:
            type: modification
            description: "实现为 POST /api/login（缺少 /auth 路径）"
            reason: "未说明"
            severity: high
            acceptable: false
            requires_approval: true
            
        - spec_item: "API-002: Token 响应"
          spec_description: "返回 {token, user}"
          implementation_status: implemented
          alignment: deviation
          deviation:
            type: modification
            description: "返回 {accessToken, refreshToken, userData}"
            reason: "扩展了 token 机制"
            severity: medium
            acceptable: true
            requires_approval: true
            
    - category: 数据结构
      items:
        - spec_item: "DATA-001: 用户模型"
          spec_description: "User {id, username, email, created_at}"
          implementation_status: exceeded
          alignment: deviation
          deviation:
            type: addition
            description: "添加了 roles, lastLogin 字段"
            reason: "扩展需求"
            severity: low
            acceptable: true
            requires_approval: false
            
  gaps:
    - gap: "密码加密使用 bcrypt"
      description: "spec 要求 bcrypt，实现使用 sha256"
      impact: "安全性降低"
      mitigation: "必须改为 bcrypt"
      
  deviations:
    - deviation: "API 路径改变"
      description: "/api/login vs /api/auth/login"
      reason: "未说明"
      impact: "破坏 API 契约"
      acceptable: false
      requires_approval: false
      
    - deviation: "响应格式改变"
      description: "字段名不一致"
      reason: "扩展需求"
      impact: "前端需要适配"
      acceptable: true
      requires_approval: true
      
  recommendation:
    action: reject
    must_fix:
      - "恢复 API 路径为 /api/auth/login"
      - "密码加密改为 bcrypt"
    should_fix:
      - "文档化响应格式变更"
    acceptable_deviations:
      - "扩展字段（需文档更新）"
```

## Checklists

### 对比前
- [ ] spec 已读取
- [ ] design 已读取
- [ ] implementation 已读取

### 对比中
- [ ] 每条需求已检查
- [ ] 偏离已识别
- [ ] 影响已评估
- [ ] 偏离已分类

### 对比后
- [ ] gap 已记录
- [ ] deviation 已评估
- [ ] 建议已生成
- [ ] 决策已明确

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 遗漏对比 | 未检查所有需求 | 使用需求跟踪表 |
| 过度宽容 | 接受严重偏离 | 明确 blocker 标准 |
| 文档滞后 | spec 未更新 | 同步更新文档 |
| 沟通不足 | 偏离未沟通 | 要求文档化理由 |

## Notes

### 与 code-review-checklist 的关系
- spec-implementation-diff 检查"做什么"对齐
- code-review-checklist 检查"怎么做"质量
- 两者互补

### 偏离处理原则
1. 功能偏离：通常 reject
2. 技术偏离：评估合理性
3. 扩展功能：评估 scope
4. 简化功能：评估影响

### 文档同步
偏离必须文档化：
- 偏离原因
- 偏离影响
- 批准状态

### 工具支持
- 需求跟踪工具
- 代码覆盖率
- API 对比工具
