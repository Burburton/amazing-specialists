# Skill: feature-implementation

## Purpose

指导 developer 按 task 描述和 design note 完成代码实现，输出可交付的代码变更和实现总结。

解决的核心问题：
- 实现偏离设计或需求
- 改动范围失控
- 代码质量不达标
- 缺乏自检和总结

## When to Use

必须使用时：
- 有明确的 feature implementation task
- 需要按 design note 落地代码
- 需要输出代码变更和实现总结

推荐使用时：
- 实现前做准备工作
- 实现过程中做自检
- 实现后做总结

## When Not to Use

不适用场景：
- bugfix（使用 bugfix-workflow）
- 纯重构（使用 refactor-safely）
- 无明确需求（应先澄清需求）
- 纯配置或文档变更

## Implementation Process

### Phase 1: 准备 (Preparation)

#### Step 1: 理解任务
1. 仔细阅读 task goal 和 description
2. 使用 artifact-reading 读取相关工件
- spec
- design note
- task list
3. 提取关键信息
- 必须实现的功能
- 约束条件
- 验收标准

#### Step 2: 评估现状
1. 查看现有代码结构
2. 识别需要修改的文件
3. 识别新增文件位置
4. 评估工作量

#### Step 3: 制定计划
1. 分解实现步骤
2. 确定文件改动顺序
3. 识别依赖关系
4. 设置检查点

### Phase 2: 实现 (Implementation)

#### Step 4: 准备工作
1. 确保分支/环境就绪
2. 运行现有测试确保基线通过
3. 准备开发工具

#### Step 5: 按步骤实现
对每个实现步骤：
1. 编写代码
2. 即时自测（编译/类型检查）
3. 提交中间状态（可选）
4. 检查约束遵守情况

#### Step 6: 持续自检
- [ ] 是否偏离 design note？
- [ ] 是否超出 task scope？
- [ ] 是否引入不必要的依赖？
- [ ] 代码风格是否一致？
- [ ] 是否有明显 bug？

### Phase 3: 验证 (Verification)

#### Step 7: 本地验证
1. 编译/构建
2. 运行单元测试
3. 手动测试关键路径
4. 检查 lint/format

#### Step 8: 范围检查
1. 对比 design note 检查实现完整性
2. 检查是否有多余改动
3. 确保没有遗漏文件

### Phase 4: 总结 (Summary)

#### Step 9: 生成实现总结
1. 列出所有改动文件
2. 描述实现内容
3. 记录与 design 的偏离（如有）
4. 记录已知问题和风险
5. 生成 self-check report

#### Step 10: 准备提交
1. 最终代码审查
2. 生成 commit message
3. 准备 execution result

## Output Requirements

```yaml
implementation_summary:
  dispatch_id: string
  task_id: string
  
  goal_alignment:
    goal: string
    achieved: boolean
    deviations: string[]  # 如有偏离，说明原因
    
  implementation:
    approach: string
    key_decisions:
      - decision: string
        reason: string
        
  changed_files:
    - path: string
      change_type: added | modified | deleted
      description: string
      lines_changed:
        added: number
        deleted: number
        
  new_dependencies:
    - name: string
      version: string
      reason: string
      
  tests:
    - type: unit | integration
      files: string[]
      coverage: string
      
  self_check:
    - check: string
      passed: boolean
      notes: string
      
  known_issues:
    - issue: string
      severity: low | medium | high
      planned_fix: string | null
      
  risks:
    - risk: string
      level: low | medium | high
      mitigation: string
      
  performance_notes: string | null
  
  documentation_updated:
    - file: string
      type: code_comment | readme | api_doc
      
  recommendation: SEND_TO_TEST | REWORK | ESCALATE
  
  time_spent_minutes: number
  blockers_encountered: string[]
```

## Examples

### 示例 1：实现登录功能

```yaml
implementation_summary:
  goal_alignment:
    goal: "实现用户登录功能，包括 JWT Token 生成"
    achieved: true
    deviations: []
    
  implementation:
    approach: "按 design note 三层架构实现"
    key_decisions:
      - decision: "使用 jsonwebtoken 库生成 JWT"
        reason: "标准库，社区广泛使用"
      - decision: "Token payload 包含 user_id 和 roles"
        reason: "减少后续查询"
        
  changed_files:
    - path: "src/controllers/AuthController.ts"
      change_type: added
      description: "登录接口控制器"
      lines_changed:
        added: 45
        deleted: 0
        
    - path: "src/services/AuthService.ts"
      change_type: added
      description: "认证业务逻辑"
      lines_changed:
        added: 78
        deleted: 0
        
    - path: "src/utils/JwtTokenService.ts"
      change_type: added
      description: "JWT Token 生成工具"
      lines_changed:
        added: 32
        deleted: 0
        
  new_dependencies:
    - name: "jsonwebtoken"
      version: "^9.0.0"
      reason: "JWT Token 生成"
    - name: "@types/jsonwebtoken"
      version: "^9.0.0"
      reason: "TypeScript 类型支持"
      
  tests:
    - type: unit
      files:
        - "tests/unit/AuthService.test.ts"
        - "tests/unit/JwtTokenService.test.ts"
      coverage: "92%"
    - type: integration
      files:
        - "tests/integration/login.test.ts"
      coverage: "85%"
      
  self_check:
    - check: "实现目标对齐"
      passed: true
      notes: "所有 acceptance criteria 已实现"
    - check: "改动范围检查"
      passed: true
      notes: "仅添加 auth 相关文件"
    - check: "约束遵守检查"
      passed: true
      notes: "使用 bcrypt，未改 schema"
    - check: "代码风格检查"
      passed: true
      notes: "通过 ESLint"
      
  known_issues: []
  
  risks:
    - risk: "JWT Token 泄露"
      level: medium
      mitigation: "将在 security review 评估 refresh token 机制"
      
  recommendation: SEND_TO_TEST
  time_spent_minutes: 240
  blockers_encountered: []
```

### 示例 2：实现过程中发现问题

```yaml
implementation_summary:
  goal_alignment:
    goal: "实现登录功能"
    achieved: partial
    deviations:
      - "发现 bcrypt 异步 API 导致代码复杂，改为同步 API"
      - "设计中的 rate limiting 暂未实现，计划后续添加"
      
  known_issues:
    - issue: "rate limiting 未实现"
      severity: medium
      planned_fix: "下一 task 补充"
      
  recommendation: SEND_TO_TEST
  # 虽然有 partial 实现，但核心功能完成，可进入测试
```

## Checklists

### 准备阶段
- [ ] 已读取 spec 和 design note
- [ ] 已识别需要改动的文件
- [ ] 已制定实现计划

### 实现阶段
- [ ] 按设计实现
- [ ] 持续自检
- [ ] 代码风格一致

### 验证阶段
- [ ] 编译/构建通过
- [ ] 测试通过
- [ ] lint 检查通过

### 总结阶段
- [ ] 列出所有改动
- [ ] 记录与设计的偏离
- [ ] 记录已知问题
- [ ] 完成 self-check

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 偏离设计 | 实现与设计不符 | 对照 design note 检查 |
| 范围失控 | 改动超出 task | 回滚多余改动 |
| 测试缺失 | 无测试或覆盖低 | 补充测试 |
| 依赖膨胀 | 引入不必要依赖 | 移除或替换 |
| 技术债务 | 临时方案未标记 | 记录为 known issue |

## Notes

### 与 code-change-selfcheck 的关系
- feature-implementation 是主流程
- code-change-selfcheck 是独立自检 skill
- 可在实现过程中多次调用 self-check

### 与 bugfix-workflow 的区别
- feature-implementation：新功能实现
- bugfix-workflow：修复已有问题
- 两者输出格式类似但流程不同

### 与 execution-reporting 的关系
- feature-implementation 生成 implementation_summary
- execution-reporting 将其格式化为 execution result
- 两个 skill 通常连续使用
