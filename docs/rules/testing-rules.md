# Testing Rules

**Version:** 1.0.0  
**Last Updated:** 2026-03-27  
**Owner:** tester  
**Source:** `.opencode/skills/tester/unit-test-design/SKILL.md`, `specs/005-tester-core/contracts/test-scope-report-contract.md`

---

## Purpose

本文件定义 tester 角色在测试设计与执行过程中必须遵守的规则，确保测试覆盖完整性、失败分类清晰、边界条件充分覆盖。

---

## 1. 测试命名规范

### 1.1 测试文件命名

| 测试类型 | 命名规范 | 示例 |
|----------|----------|------|
| 单元测试 | `<module>.test.<ext>` | `AuthService.test.ts` |
| 集成测试 | `<module>.integration.test.<ext>` | `AuthService.integration.test.ts` |
| E2E测试 | `<feature>.e2e.test.<ext>` | `auth.e2e.test.ts` |
| 性能测试 | `<feature>.perf.test.<ext>` | `auth.perf.test.ts` |

### 1.2 测试用例命名

**推荐格式**: Should-When 或 Given-When-Then

| 格式 | 示例 |
|------|------|
| Should-When | `should return user when credentials are valid` |
| Given-When-Then | `given valid credentials, when login, then returns token` |
| 中文描述 | `正确的用户名密码返回用户对象` |

### 1.3 禁止模式

- ❌ 无意义命名（如 `test1`, `test2`）
- ❌ 方法名直接作为测试名（如 `testValidateUser`）
- ❌ 过长的测试名（超过50字符）

---

## 2. 测试覆盖率要求

### 2.1 最小覆盖门槛

| 覆盖类型 | 最低要求 | 关键路径要求 |
|----------|----------|--------------|
| 语句覆盖 | > 80% | 95% |
| 分支覆盖 | > 70% | 90% |
| 函数覆盖 | > 90% | 100% |

### 2.2 优先级覆盖标准

> **对齐**: `test-scope-report-contract.md` Section Field Specifications

| 优先级 | 定义 | 最小覆盖要求 |
|--------|------|--------------|
| **critical** | 核心业务逻辑，数据完整性 | 95% 语句，90% 分支 |
| **high** | 重要用户功能 | 85% 语句，75% 分支 |
| **medium** | 支撑功能 | 70% 语句，60% 分支 |
| **low** | 工具类或低风险代码 | 50% 语句 |

### 2.3 必须覆盖路径

```
- [ ] 核心业务逻辑
- [ ] 错误处理路径
- [ ] 边界条件
- [ ] 并发代码
```

---

## 3. 测试分类规则

### 3.1 测试层次（测试金字塔）

```
    /\
   /  \  E2E Tests (少量)
  /____\
 /      \  Integration Tests (中等)
/________\
          Unit Tests (大量)
```

| 测试类型 | 目的 | 占比建议 |
|----------|------|----------|
| 单元测试 | 验证单个函数/类 | 70% |
| 集成测试 | 验证模块间交互 | 20% |
| E2E测试 | 验证完整流程 | 10% |

### 3.2 测试级别定义

| 级别 | 定义 | Mock程度 |
|------|------|----------|
| unit | 单函数/类，大量mock | Mock全部外部依赖 |
| integration | 模块交互，少量mock | Mock外部系统，内部真实 |
| e2e | 完整流程，无mock | 无mock，真实环境 |
| manual | 人工验证 | 适用于复杂场景 |

### 3.3 测试类型选择

| 场景 | 推荐测试类型 |
|------|--------------|
| 纯逻辑函数 | 单元测试 |
| 数据库交互 | 集成测试 |
| API接口 | 集成测试 + E2E测试 |
| 用户流程 | E2E测试 |
| 性能验证 | 性能测试 |

---

## 4. 测试数据管理

### 4.1 测试数据类型

| 类型 | 定义 | 使用场景 |
|------|------|----------|
| test_data | 固定测试数据集 | 单元测试 |
| mock_data | 模拟数据 | 外部依赖 mock |
| production_subset | 生产数据子集 | 集成测试（需脱敏） |

### 4.2 测试数据要求

```
- [ ] 数据可重复使用
- [ ] 数据不依赖外部状态
- [ ] 数据覆盖典型场景
- [ ] 数据覆盖边界条件
- [ ] 生产数据已脱敏
```

### 4.3 测试环境要求

| 要求 | 说明 |
|------|------|
| 工具版本明确 | 测试工具版本需锁定 |
| 数据准备指令 | 提供数据 setup 指令 |
| 服务状态声明 | 外部服务可用性声明 |

---

## 5. 边界条件测试规则

### 5.1 FIRST 原则

| 原则 | 定义 | 要求 |
|------|------|------|
| **F**ast | 测试应快速运行 | 单元测试 < 100ms |
| **I**ndependent | 测试相互独立 | 不依赖其他测试结果 |
| **R**epeatable | 测试可重复运行 | 结果一致 |
| **S**elf-Validating | 测试自验证 | 布尔结果（pass/fail） |
| **T**imely | 及时编写 | 实现前或同时 |

### 5.2 边界条件矩阵

> **对齐**: `tester/edge-case-matrix` skill

| 边界类型 | 示例 |
|----------|------|
| 最小值 | `username: "a"` |
| 最大值 | `username: "a" * 50` |
| 超出边界 | `username: "a" * 51` |
| 空值 | `username: ""` |
| null | `username: null` |
| 特殊字符 | `username: "user@email.com"` |
| Unicode | `password: "密码123"` |

### 5.3 测试场景类型

#### 5.3.1 正常路径 (Happy Path)

```
Given: 有效输入
When: 执行被测代码
Then: 返回预期结果
```

#### 5.3.2 失败路径 (Error Path)

```
Given: 无效输入或错误条件
When: 执行被测代码
Then: 返回错误/抛出异常
```

#### 5.3.3 边界条件 (Boundary)

```
Given: 边界值输入
When: 执行被测代码
Then: 正确处理边界情况
```

#### 5.3.4 特殊场景

```
Given: 并发/资源耗尽/时序问题
When: 执行被测代码
Then: 正确处理特殊情况
```

---

## 6. 失败分类规则

> **对齐**: `unit-test-design/SKILL.md` BR-004

### 6.1 失败类型分类

| 类型 | 定义 | 处理方式 |
|------|------|----------|
| **Implementation issue** | 代码逻辑错误 | 修复代码 |
| **Test issue** | 测试设计/执行问题 | 修复测试 |
| **Environment issue** | 测试环境阻塞 | 解决环境问题 |
| **Design/spec issue** | 需求不明确 | 澄清需求 |
| **Dependency/upstream issue** | 外部依赖失败 | 修复依赖或 mock |

### 6.2 失败处理流程

```
1. 分类失败类型
2. 记录失败详情
3. 确定修复责任方
4. 提供修复建议
5. 跟踪修复进度
```

---

## 7. 与 Tester Skills 对齐说明

### 7.1 Skills 映射

| 规则类别 | 对齐 Skill |
|----------|------------|
| 测试命名规范 | `tester/unit-test-design` |
| 测试覆盖率要求 | `tester/unit-test-design` |
| 测试分类规则 | `tester/unit-test-design` |
| 测试数据管理 | `tester/unit-test-design` |
| 边界条件测试规则 | `tester/edge-case-matrix`, `tester/unit-test-design` |
| 失败分类规则 | `tester/regression-analysis` |

### 7.2 测试范围报告格式

遵循 `test-scope-report-contract.md` 的输出格式：

```yaml
test_scope_report:
  dispatch_id: string
  task_id: string
  
  goal_under_test:
    original_goal: string
    test_interpretation: string
    acceptance_targets: []
    
  changed_surface:
    files: []
    
  in_scope_items: []
  out_of_scope_items: []
  
  recommendation: PROCEED | BLOCKED | ESCALATE
```

### 7.3 测试设计输出格式

遵循 `unit-test-design` skill 的输出格式：

```yaml
test_design:
  target:
    module: string
    functions: []
    
  test_suite:
    test_cases: []
    
  coverage_plan:
    statement_coverage: number
    branch_coverage: number
```

---

## References

- `.opencode/skills/tester/unit-test-design/SKILL.md` - 单元测试设计 skill
- `.opencode/skills/tester/edge-case-matrix/SKILL.md` - 边界条件矩阵 skill
- `.opencode/skills/tester/regression-analysis/SKILL.md` - 回归分析 skill
- `specs/005-tester-core/contracts/test-scope-report-contract.md` - 测试范围报告契约
- `specs/005-tester-core/contracts/verification-report-contract.md` - 验证报告契约
- `quality-gate.md` Section 3.3 - Tester Gate