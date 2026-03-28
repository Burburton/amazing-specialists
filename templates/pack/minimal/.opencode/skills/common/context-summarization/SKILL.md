# Skill: context-summarization

## Purpose

把大量项目上下文裁剪成当前角色执行当前 task 需要的最小上下文，防止上下文膨胀导致质量下降。

解决的核心问题：
- 大项目可能导致 dispatch payload 过大，需要裁剪
- 角色应聚焦当前任务，而非整个项目
- 保留 task goal、constraints、expected outputs，丢弃无关噪音

## When to Use

必须使用时：
- 接收到的上下文超过 `max_context_size` 限制
- 项目包含大量文件，但当前 task 只涉及部分
- 返工时需要重新聚焦，避免上一轮失败信息淹没当前目标
- 多角色协作时，需要向下游传递精简上下文

推荐使用时：
- 每个 task 执行前做一次上下文裁剪
- 里程碑切换时重新生成最小上下文
- 升级给用户时提供精简版上下文摘要

## When Not to Use

不适用场景：
- 上下文已经很小（< 1000 tokens）
- 需要完整历史记录做审计时
- 处于调试模式需要完整信息
- task 明确要求"完整上下文"时

## Required Inputs

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `raw_context` | string/object | 是 | 原始完整上下文 |
| `current_role` | string | 是 | 当前执行角色 |
| `task_goal` | string | 是 | 当前 task 目标 |

## Optional Inputs

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `max_context_size` | number | 最大 token 数 | 4000 |
| `priority_fields` | string[] | 必须保留的字段 | ["task_goal", "constraints"] |
| `previous_summary` | object | 上轮摘要（返工时用） | null |
| `compression_level` | string | 压缩级别：light/medium/heavy | medium |

## Steps

### Step 1: 分析上下文组成
1. 识别 raw_context 中的主要组成部分
2. 按来源分类：spec、code、history、artifacts
3. 评估每部分与 task_goal 的相关性

### Step 2: 按角色确定保留策略

不同角色的保留优先级：

**architect：**
- 高优先级：spec、design constraints、module boundaries
- 中优先级：code structure overview、existing patterns
- 低优先级：implementation details、test files

**developer：**
- 高优先级：task goal、design note、changed files、code context
- 中优先级：spec、test requirements
- 低优先级：full project structure、unrelated modules

**tester：**
- 高优先级：spec.acceptance_criteria、changed files、risk areas
- 中优先级：implementation summary、known issues
- 低优先级：design internals、unrelated code

**reviewer：**
- 高优先级：diff、spec、design note、test results
- 中优先级：implementation summary、risks
- 低优先级：full codebase、unrelated changes

**docs：**
- 高优先级：changed files、user-facing changes、implementation summary
- 中优先级：spec、review summary
- 低优先级：technical internals、test details

**security：**
- 高优先级：auth/permission changes、input handling、secret usage
- 中优先级：external interfaces、dependency changes
- 低优先级：business logic、UI changes

### Step 3: 执行裁剪

根据 compression_level：

**light（轻度）:**
- 只移除明显无关的内容
- 保留完整句子结构
- 适合：上下文略超限制

**medium（中度）:**
- 压缩描述性文本
- 列表保留关键项
- 适合：标准场景

**heavy（重度）:**
- 仅保留关键字段和值
- 使用结构化格式
- 适合：上下文严重膨胀

### Step 4: 验证关键信息保留
1. 检查 task_goal 完整保留
2. 检查 constraints 完整保留
3. 检查 expected_outputs 完整保留
4. 如有缺失，调整压缩级别重新裁剪

### Step 5: 生成结构化摘要
输出统一格式的精简上下文

## Checklists

### 前置检查
- [ ] raw_context 已加载且有效
- [ ] task_goal 已明确
- [ ] current_role 是有效角色

### 过程检查
- [ ] 已按角色策略分类上下文
- [ ] 裁剪后大小在限制内
- [ ] 关键字段已保留

### 后置检查
- [ ] 精简上下文包含 task_goal
- [ ] 精简上下文包含 constraints
- [ ] 输出符合 schema

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 关键信息丢失 | task_goal 被裁剪 | 提升关键字段优先级，重新裁剪 |
| 过度压缩 | 上下文无法理解 | 降低 compression_level |
| 压缩不足 | 仍超 max_context_size | 提升 compression_level |
| 角色策略错误 | 保留了无关信息 | 检查 current_role 配置 |
| 循环膨胀 | 返工后上下文累积 | 使用 previous_summary 去重 |

## Output Requirements

### 必须输出

```yaml
summarized_context:
  task_goal: string
  constraints: string[]
  key_artifacts:
    - type: string
      path: string
      summary: string
  relevant_code:
    - file: string
      relevant_lines: string
  critical_info: string[]
  
compression_metrics:
  original_size: number
  compressed_size: number
  compression_ratio: number
  removed_sections: string[]

status: SUCCESS | PARTIAL | FAILED
```

### 可选输出

```yaml
warnings:
  - "Section X was heavily compressed, may lose nuance"
  - "Limited code context due to size constraints"

suggestions:
  - "Consider splitting task into smaller subtasks"
  - "Load specific files on-demand instead of full context"
```

## Examples

### 示例 1：developer 上下文裁剪

输入：
```yaml
raw_context:
  # 包含完整项目结构（200+ 文件）
  # 包含完整 git history
  # 包含所有 specs
  # 包含上一轮 review comments
  
task_goal: "实现登录接口的错误码映射"
current_role: developer
max_context_size: 3000
```

输出：
```yaml
summarized_context:
  task_goal: "实现登录接口的错误码映射"
  
  constraints:
    - "不修改数据库 schema"
    - "不引入新依赖"
    - "保持现有 API path 不变"
    
  key_artifacts:
    - type: design_note
      path: artifacts/001-bootstrap/design-auth.md
      summary: "使用 JWT token，错误码映射表：INVALID_CREDENTIALS -> 4001"
    - type: spec
      path: specs/001-bootstrap/spec.md
      summary: "登录接口需支持 INVALID_CREDENTIALS, USER_LOCKED, SYSTEM_ERROR 三种错误"
      
  relevant_code:
    - file: src/api/auth.py
      relevant_lines: "def login() 函数框架，待实现错误处理"
    - file: src/errors/codes.py
      relevant_lines: "已有错误码定义，需添加 AUTH 相关"
      
  critical_info:
    - "错误码范围：4000-4099 保留给 auth 模块"
    - "前端已约定错误码格式：{code, message}"
    
compression_metrics:
  original_size: 15000
  compressed_size: 2800
  compression_ratio: 0.19
  removed_sections:
    - "完整项目文件列表"
    - "无关模块代码"
    - "历史 git commits"
```

### 示例 2：返工场景裁剪

输入：
```yaml
raw_context:
  # 包含原始 spec
  # 包含上一轮失败原因
  # 包含 review comments
  # 包含代码实现
  
task_goal: "修复登录接口缺少 lockout 状态处理"
current_role: developer
previous_summary:
  task_goal: "实现登录接口的错误码映射"
  key_changes: [...]
  failure_reason: "缺少 lockout 分支"
max_context_size: 3000
```

输出：
```yaml
summarized_context:
  task_goal: "修复登录接口缺少 lockout 状态处理"
  
  constraints:
    - "不能破坏已实现的错误码映射"
    
  key_artifacts:
    - type: review_report
      path: artifacts/001-bootstrap/review-auth.md
      summary: "必须修复：缺少 lockout 状态错误码映射"
    - type: spec
      path: specs/001-bootstrap/spec.md
      summary: "登录接口需支持 USER_LOCKED 错误码 (4002)"
      
  relevant_code:
    - file: src/api/auth.py
      relevant_lines: "login() 函数现有实现，需添加 lockout 分支"
      
  critical_info:
    - "USER_LOCKED 触发条件：连续 5 次失败"
    - "lockout 时长：30 分钟"
    
compression_metrics:
  original_size: 8000
  compressed_size: 1500
  compression_ratio: 0.19
  
# 注意：previous_summary 中的无关信息已被去除，保留核心失败原因
```

## Notes

### 与 artifact-reading 的关系
- artifact-reading 负责"读取"工件
- context-summarization 负责"裁剪"已读取的内容
- 典型流程：artifact-reading -> context-summarization -> role execution

### 性能考虑
- 裁剪操作本身消耗 tokens，应在必要时才执行
- 可缓存裁剪结果，相同上下文复用
- heavy 压缩会损失信息，谨慎使用

### 扩展性
如需支持新角色：
1. 在 Step 2 添加该角色的保留策略
2. 定义该角色的 priority_fields
3. 在 Examples 中添加该角色的示例
