# Tester 角色示例

本文档展示 tester 角色的具体工作方式和 skill 使用。

---

## 角色定义

**tester** 负责测试验证，确保代码实现符合规格要求。

### MVP Skills
- `unit-test-design` - 单元测试设计
- `regression-analysis` - 回归分析
- `edge-case-matrix` - 边界条件矩阵

### M4 Skills (可选)
- `integration-test-design` - 集成测试设计
- `flaky-test-diagnosis` - 不稳定测试诊断

---

## 典型工作流程

### 输入
```yaml
dispatch_id: dsp-test-001
role: tester
command: test-task
title: 测试登录功能

inputs:
  - artifact_id: impl-login-v1
    artifact_type: implementation_summary
    path: artifacts/impl/impl-login-v1.md
    
  - artifact_id: spec-login-v1
    artifact_type: spec
    path: specs/login/spec.md

expected_outputs:
  - test_report
  - coverage_report
```

### 执行过程

#### Step 1: 分析需求
```
tester 使用 artifact-reading skill 读取 spec 和 implementation
提取: Acceptance Criteria, 接口契约, 边界条件
```

#### Step 2: 设计测试用例
```
使用 unit-test-design skill:
1. 正常路径测试
2. 错误路径测试
3. 边界条件测试
```

#### Step 3: 边界分析
```
使用 edge-case-matrix skill:
1. 输入边界: 空值, 最大长度, 特殊字符
2. 状态边界: 并发, 超时, 失败
3. 数据边界: 空数据, 大数据
```

#### Step 4: 执行测试
```
1. 运行单元测试
2. 运行集成测试
3. 收集覆盖率
```

### 输出
```yaml
status: SUCCESS
summary: 完成登录功能测试

artifacts:
  - artifact_id: test-report-login-v1
    artifact_type: test_report
    path: artifacts/test/test-report-login-v1.md

metrics:
  tests_run: 18
  tests_passed: 18
  coverage: 94%

recommendation: SEND_TO_REVIEW
```

---

## Skill 使用示例

### unit-test-design

**何时使用**: 实现完成后，需要设计测试用例

**输入**: spec.md, implementation

**输出**: 测试用例列表

**测试设计清单**:
```
1. 正常路径 (Happy Path)
   - 输入有效数据
   - 预期正确输出
   
2. 错误路径 (Error Path)
   - 输入无效数据
   - 预期错误响应
   
3. 边界条件 (Boundary)
   - 边界值输入
   - 极端情况
```

**示例输出**:
```markdown
## 测试用例设计

### 登录成功场景
| ID | 输入 | 预期输出 |
|----|------|----------|
| TC-001 | 有效用户名+密码 | 200 + Token |
| TC-002 | Token 包含 userId | 200 + 正确 payload |

### 登录失败场景
| ID | 输入 | 预期输出 |
|----|------|----------|
| TC-003 | 不存在用户 | 401 + 错误信息 |
| TC-004 | 错误密码 | 401 + 错误信息 |
| TC-005 | 空用户名 | 400 + 验证错误 |
| TC-006 | 空密码 | 400 + 验证错误 |

### 边界条件
| ID | 输入 | 预期输出 |
|----|------|----------|
| TC-007 | 用户名最大长度 | 200 或 400 |
| TC-008 | 密码最大长度 | 200 或 400 |
| TC-009 | 特殊字符用户名 | 正确处理 |
```

### edge-case-matrix

**何时使用**: 需要全面覆盖边界条件

**矩阵模板**:
```
| 维度 | 边界值 | 测试用例 | 预期结果 |
|------|--------|----------|----------|
| 输入长度 | 0 | 空输入 | 验证错误 |
| 输入长度 | 1 | 最小有效 | 正确处理 |
| 输入长度 | MAX | 最大有效 | 正确处理 |
| 输入长度 | MAX+1 | 超出限制 | 验证错误 |
| 并发 | 1 | 单请求 | 正确 |
| 并发 | 10 | 多请求 | 正确 |
| 状态 | 初始 | 无数据 | 正确处理 |
| 状态 | 满载 | 大数据 | 正确处理 |
```

### regression-analysis

**何时使用**: 修改现有功能后

**分析步骤**:
1. 识别受影响的测试用例
2. 重新运行相关测试
3. 对比修改前后结果
4. 报告回归情况

---

## 测试报告模板

```markdown
# Test Report: {feature-name}

## 测试概览
- 测试总数: X
- 通过: Y
- 失败: Z
- 跳过: W
- 覆盖率: N%

## 测试用例结果

### 通过的测试
| ID | 描述 | 耗时 |
|----|------|------|
| TC-001 | 登录成功 | 15ms |
| TC-002 | Token 格式正确 | 3ms |

### 失败的测试
| ID | 描述 | 错误信息 |
|----|------|----------|
| TC-XXX | XXX | XXX |

## 覆盖率报告
| 文件 | 语句 | 分支 | 函数 |
|------|------|------|------|
| AuthService.ts | 95% | 90% | 100% |

## AC 验证状态
| AC | 测试用例 | 状态 |
|----|----------|------|
| AC-001 | TC-001 | ✅ |
| AC-002 | TC-003 | ✅ |

## 建议
1. 增加并发测试
2. 补充性能测试
```

---

## 质量门禁

tester 输出必须满足:
- [ ] 所有 AC 有对应测试用例
- [ ] 测试覆盖率 >= 80%
- [ ] 无未处理的失败测试
- [ ] 边界条件已覆盖