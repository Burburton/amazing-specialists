# Skill: edge-case-matrix

## Purpose

生成边界条件矩阵，确保测试不只看 happy path，覆盖各种边界和异常情况。

解决的核心问题：
- 只测正常场景，遗漏边界
- 边界条件考虑不全
- 异常处理未测试
- 缺乏系统性边界分析

## Business Rules Compliance

### BR-003: Every Verification Report Must State Coverage Boundaries
This skill explicitly documents:
- What boundaries were tested (in scope)
- What boundaries were NOT tested (out of scope)
- Why certain boundaries were excluded (rationale)

### BR-005: Edge Cases Are Mandatory, Not Optional Polish
**Critical Requirement**: Tester must assess edge and invalid scenarios appropriate to the change.
- Happy-path-only testing is **incomplete by default**
- Boundary coverage assessment is **mandatory**, not optional
- P0 boundaries must have tests before verification can pass

### BR-004: Failure Classification
Edge case test failures must be classified:
- **Implementation issue**: Boundary handling bug
- **Test issue**: Incorrect boundary expectation
- **Design/spec issue**: Unclear boundary requirements
- **Environment issue**: Cannot test boundary (setup limitation)

## Integration with Other Skills

### With unit-test-design
- **edge-case-matrix** generates boundary conditions
- **unit-test-design** creates test cases for those boundaries
- **Workflow**: Run edge-case-matrix FIRST, then unit-test-design

### With regression-analysis
- Edge cases identified here inform regression scope
- Boundary-related historical bugs should be considered

## Downstream Artifact References
- `specs/005-tester-core/contracts/verification-report-contract.md` - edge_cases_checked field receives output from this skill
- `specs/005-tester-core/contracts/test-scope-report-contract.md` - Boundary coverage informs test_strategy

## When to Use

必须使用时：
- 设计测试时需要识别边界
- 验收前检查边界覆盖
- 高风险功能需要全面边界分析

推荐使用时：
- 任何功能测试设计前
- 安全相关功能
- 涉及数值计算的功能
- 涉及用户输入的功能

## When Not to Use

不适用场景：
- 纯内部工具，无外部输入
- 无状态函数（纯计算）
- 边界已充分覆盖

## Edge Case Categories

### 1. 输入边界

#### 1.1 数值边界
| 类型 | 边界值 | 说明 |
|------|--------|------|
| 最小值 | 0, 1, MIN_INT | 最小有效值 |
| 最大值 | MAX_INT, limit | 最大有效值 |
| 超小值 | -1, MIN_INT-1 | 小于最小值 |
| 超大值 | MAX_INT+1 | 大于最大值 |
| 零值 | 0 | 特殊值 |
| 负数 | -1, -N | 负值处理 |

#### 1.2 字符串边界
| 类型 | 边界值 | 说明 |
|------|--------|------|
| 空字符串 | "" | 无内容 |
| 空白字符串 | " " | 只有空白 |
| 最小长度 | 1 char | 最小有效 |
| 最大长度 | max chars | 最大有效 |
| 超长 | max+1 | 超出限制 |
| 特殊字符 | !@#$% | 特殊符号 |
| Unicode | 中文, emoji | 多字节字符 |
| 换行 | \n, \r\n | 换行符 |
| Null | null | null 值 |

#### 1.3 集合边界
| 类型 | 边界值 | 说明 |
|------|--------|------|
| 空集合 | [] | 无元素 |
| 单元素 | [x] | 一个元素 |
| 满集合 | full | 达到容量 |
| 超容量 | full+1 | 超出容量 |
| 重复元素 | [x, x] | 重复值 |
| Null 元素 | [null] | 包含 null |

### 2. 状态边界

#### 2.1 时间边界
| 类型 | 边界值 | 说明 |
|------|--------|------|
| 最小时间 | epoch | 时间起点 |
| 最大时间 | max_date | 时间终点 |
| 闰年 | Feb 29 | 闰年日期 |
| 时区 | UTC+/-12 | 边界时区 |
| 夏令时 | DST change | 时间变更 |
| 无效时间 | 25:00 | 无效时间 |

#### 2.2 权限边界
| 类型 | 边界值 | 说明 |
|------|--------|------|
| 无权限 | guest | 未登录 |
| 最小权限 | read-only | 只读 |
| 满权限 | admin | 全权限 |
| 权限边界 | edge role | 边界角色 |
| 权限升级 | escalation | 提权 |

### 3. 环境边界

| 类型 | 边界值 | 说明 |
|------|--------|------|
| 无网络 | offline | 网络断开 |
| 慢网络 | 2G | 低速网络 |
| 超时 | timeout | 响应超时 |
| 磁盘满 | disk full | 存储满 |
| 内存满 | OOM | 内存溢出 |
| 高并发 | max conn | 最大连接 |

## Steps

### Step 1: 识别输入参数
1. 列出所有输入参数
2. 识别参数类型
3. 识别参数约束

### Step 2: 分析边界
对每个参数，分析：
- 数值边界
- 字符串边界
- 集合边界
- 特殊值

### Step 3: 识别状态边界
分析：
- 对象状态
- 系统状态
- 时间边界
- 权限边界

### Step 4: 识别环境边界
分析：
- 网络边界
- 资源边界
- 并发边界

### Step 5: 生成边界矩阵
将边界条件组织成矩阵

### Step 6: 确定测试优先级
- P0: 必须测试
- P1: 应该测试
- P2: 可以测试

### Step 7: 输出 Edge Case Matrix

## Output Format

```yaml
edge_case_matrix:
  dispatch_id: string
  task_id: string
  
  input_parameters:
    - name: string
      type: string
      constraints: string
      
  boundary_analysis:
    - parameter: string
      category: numeric | string | collection | state | environment
      boundaries:
        - type: string
          value: any
          description: string
          priority: P0 | P1 | P2
          expected_behavior: string
          
  combination_matrix:
    - scenario: string
      parameters:
        - name: string
          value: any
      priority: P0 | P1 | P2
      risk: high | medium | low
      reason: string
      
  test_cases:
    - id: string
      name: string
      parameters:
        - name: string
          value: any
      expected: string
      priority: P0 | P1 | P2
      
  coverage_summary:
    total_boundaries: number
    p0_boundaries: number
    p1_boundaries: number
    p2_boundaries: number
    
  risk_areas:
    - area: string
      boundaries: string[]
      mitigation: string
```

## Examples

### 示例 1：登录功能边界矩阵

```yaml
edge_case_matrix:
  input_parameters:
    - name: username
      type: string
      constraints: "3-50 字符，字母数字下划线"
    - name: password
      type: string
      constraints: "6-128 字符"
    - name: remember_me
      type: boolean
      constraints: "可选"
      
  boundary_analysis:
    - parameter: username
      category: string
      boundaries:
        - type: empty
          value: """
          description: "空用户名"
          priority: P0
          expected_behavior: "返回 ValidationError"
          
        - type: too_short
          value: "ab"
          description: "2 字符（最小 3）"
          priority: P0
          expected_behavior: "返回 ValidationError"
          
        - type: min_valid
          value: "abc"
          description: "3 字符（最小值）"
          priority: P0
          expected_behavior: "正常处理"
          
        - type: max_valid
          value: "a" * 50
          description: "50 字符（最大值）"
          priority: P0
          expected_behavior: "正常处理"
          
        - type: too_long
          value: "a" * 51
          description: "51 字符（超最大值）"
          priority: P0
          expected_behavior: "返回 ValidationError"
          
        - type: whitespace_only
          value: "   "
          description: "只有空白"
          priority: P1
          expected_behavior: "返回 ValidationError"
          
        - type: leading_trailing_space
          value: "  username  "
          description: "首尾空格"
          priority: P1
          expected_behavior: "trim 后处理或报错"
          
        - type: special_chars
          value: "user@email.com"
          description: "特殊字符 @"
          priority: P1
          expected_behavior: "根据约束决定"
          
        - type: unicode
          value: "用户名123"
          description: "中文字符"
          priority: P1
          expected_behavior: "根据约束决定"
          
        - type: null
          value: null
          description: "null 值"
          priority: P0
          expected_behavior: "返回 ValidationError"
          
        - type: sql_injection
          value: "' OR '1'='1"
          description: "SQL 注入尝试"
          priority: P0
          expected_behavior: "安全处理，不执行"
          
    - parameter: password
      category: string
      boundaries:
        - type: empty
          value: ""
          description: "空密码"
          priority: P0
          expected_behavior: "返回 ValidationError"
          
        - type: too_short
          value: "12345"
          description: "5 字符（最小 6）"
          priority: P0
          expected_behavior: "返回 ValidationError"
          
        - type: min_valid
          value: "123456"
          description: "6 字符（最小值）"
          priority: P0
          expected_behavior: "正常验证"
          
        - type: max_valid
          value: "a" * 128
          description: "128 字符（最大值）"
          priority: P1
          expected_behavior: "正常验证"
          
        - type: too_long
          value: "a" * 129
          description: "129 字符（超最大值）"
          priority: P1
          expected_behavior: "返回 ValidationError"
          
        - type: common_password
          value: "password123"
          description: "常见弱密码"
          priority: P1
          expected_behavior: "可能警告（根据策略）"
          
  combination_matrix:
    - scenario: "正常登录"
      parameters:
        - name: username
          value: "valid_user"
        - name: password
          value: "valid_password"
      priority: P0
      risk: low
      reason: "核心 happy path"
      
    - scenario: "空用户名+空密码"
      parameters:
        - name: username
          value: ""
        - name: password
          value: ""
      priority: P0
      risk: low
      reason: "双重边界，应返回错误"
      
    - scenario: "超长用户名+正常密码"
      parameters:
        - name: username
          value: "a" * 100
        - name: password
          value: "valid_password"
      priority: P0
      risk: medium
      reason: "边界组合"
      
  test_cases:
    - id: EC-001
      name: "正常登录"
      parameters:
        - name: username
          value: "john.doe"
        - name: password
          value: "correctPassword"
      expected: "返回 token 和用户"
      priority: P0
      
    - id: EC-002
      name: "空用户名"
      parameters:
        - name: username
          value: ""
        - name: password
          value: "anyPassword"
      expected: "ValidationError: username is required"
      priority: P0
      
    - id: EC-003
      name: "用户名太短"
      parameters:
        - name: username
          value: "ab"
        - name: password
          value: "anyPassword"
      expected: "ValidationError: username too short"
      priority: P0
      
    - id: EC-004
      name: "密码错误"
      parameters:
        - name: username
          value: "john.doe"
        - name: password
          value: "wrongPassword"
      expected: "InvalidCredentialsError"
      priority: P0
      
    - id: EC-005
      name: "用户名不存在"
      parameters:
        - name: username
          value: "nonexistent"
        - name: password
          value: "anyPassword"
      expected: "InvalidCredentialsError"
      priority: P0
      
    - id: EC-006
      name: "SQL 注入尝试"
      parameters:
        - name: username
          value: "' OR '1'='1"
        - name: password
          value: "any"
      expected: "安全拒绝，无异常"
      priority: P0
      
  coverage_summary:
    total_boundaries: 15
    p0_boundaries: 8
    p1_boundaries: 5
    p2_boundaries: 2
    
  risk_areas:
    - area: "输入验证"
      boundaries: ["sql_injection", "null", "empty"]
      mitigation: "使用参数化查询，严格校验"
```

### 示例 2：分页查询边界

```yaml
edge_case_matrix:
  input_parameters:
    - name: page
      type: number
      constraints: ">= 1"
    - name: page_size
      type: number
      constraints: "10-100"
      
  boundary_analysis:
    - parameter: page
      category: numeric
      boundaries:
        - type: min_valid
          value: 1
          description: "第一页"
          priority: P0
          
        - type: invalid_zero
          value: 0
          description: "第 0 页（无效）"
          priority: P0
          expected_behavior: "返回 ValidationError"
          
        - type: invalid_negative
          value: -1
          description: "负页码"
          priority: P0
          expected_behavior: "返回 ValidationError"
          
        - type: large_number
          value: 999999
          description: "超大页码"
          priority: P1
          expected_behavior: "返回空列表"
          
    - parameter: page_size
      category: numeric
      boundaries:
        - type: min_valid
          value: 10
          description: "最小 page_size"
          priority: P0
          
        - type: max_valid
          value: 100
          description: "最大 page_size"
          priority: P0
          
        - type: too_small
          value: 9
          description: "小于最小值"
          priority: P0
          expected_behavior: "返回 ValidationError"
          
        - type: too_large
          value: 101
          description: "大于最大值"
          priority: P0
          expected_behavior: "返回 ValidationError"
```

## Checklists

### 分析阶段
- [ ] 所有输入参数已识别
- [ ] 数值边界已分析
- [ ] 字符串边界已分析
- [ ] 集合边界已分析
- [ ] 状态边界已识别
- [ ] 环境边界已识别

### 规划阶段
- [ ] 边界条件已分类
- [ ] 优先级已分配
- [ ] 组合场景已识别
- [ ] 测试用例已生成

### 验证阶段
- [ ] P0 边界已测试
- [ ] 边界处理符合预期
- [ ] 安全风险已覆盖

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 边界遗漏 | 生产环境发现边界问题 | 使用标准边界清单 |
| 优先级错误 | 低优先级边界出问题 | 重新评估风险 |
| 组合爆炸 | 边界组合过多 | 聚焦高风险组合 |
| 边界误用 | 混淆有效/无效边界 | 明确约束定义 |

## Notes

### 与 unit-test-design 的关系
- edge-case-matrix 生成边界场景
- unit-test-design 为这些场景设计测试
- 通常先 edge-case-matrix 再 unit-test-design

### 标准边界清单
为常见类型维护边界清单：
- 用户名字段边界
- 密码字段边界
- ID 字段边界
- 分页参数边界
- 金额字段边界

### 安全边界
特别关注安全相关边界：
- 注入攻击尝试
- XSS 尝试
- 权限边界
- 资源耗尽尝试

### 自动化生成
- 从 schema 自动生成数值边界
- 从类型定义生成 null 边界
- 从约束生成范围边界
