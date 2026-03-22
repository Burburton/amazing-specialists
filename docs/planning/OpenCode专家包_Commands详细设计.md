# OpenCode 专家包 Commands 详细设计

**版本**: v1.0  
**日期**: 2026-03-22  
**状态**: 设计规范

---

## 第一部分：Commands设计总纲

### 1. Command的核心作用

Command是执行层的**稳定动作入口**，解决以下问题：

| 问题 | Command如何解决 |
|------|------------------|
| Prompt随机性 | 固化执行入口，减少每次自由prompt调用造成的不稳定 |
| 边界不清 | 每个command有明确的输入输出边界 |
| 调度复杂 | OpenClaw通过command名称即可调度，无需构造复杂prompt |
| 质量不可控 | 每个command有固定的质量gate |

### 2. Command与Skill的关系

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Dispatch Payload                            │
│                    (来自OpenClaw管理层)                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            Command                                   │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  作用：                                                       │    │
│  │  1. 解析dispatch payload                                     │    │
│  │  2. 验证输入完整性                                            │    │
│  │  3. 调用相关skills执行                                        │    │
│  │  4. 组装输出结果                                              │    │
│  │  5. 执行质量gate检查                                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                  │                                   │
│                                  ▼                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                   │
│  │   Skill 1   │ │   Skill 2   │ │   Skill 3   │                   │
│  │  (方法论)    │ │  (方法论)    │ │  (方法论)    │                   │
│  └─────────────┘ └─────────────┘ └─────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Execution Result                              │
│                      (返回给管理层)                                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Command与Skill的分工

| 维度 | Command | Skill |
|------|---------|-------|
| **职责** | 动作入口、流程编排 | 方法论、具体如何做 |
| **数量** | 每角色2-3个 | 每角色可有多個 |
| **粒度** | 一个动作 | 一个方法/技巧 |
| **稳定性** | 高，很少变化 | 可迭代优化 |
| **调用方** | OpenClaw管理层 | Command内部调用 |

### 4. 设计原则

#### 4.1 少而精
- 每个角色**不超过3个command**
- 每个command解决一类核心场景
- 避免command爆炸

#### 4.2 命名规范
- 格式：`{verb}-{noun}` 或 `{verb}-{noun}-{modifier}`
- 例如：`design-task`, `implement-task`, `test-task`
- 使用kebab-case

#### 4.3 输入输出统一
- 所有command接收统一dispatch payload
- 所有command输出统一execution result
- 通过command字段区分不同动作

#### 4.4 边界清晰
- 每个command有明确的constraints
- 每个command有明确的禁止行为
- 超出边界必须升级

---

## 第二部分：Commands总清单

### 5. 按角色分类的Commands

#### 5.1 architect commands

| Command | 用途 | 优先级 | 调用场景 |
|---------|------|--------|----------|
| `design-task` | 执行架构设计任务 | P0 | 新feature需要设计方案时 |
| `evaluate-tradeoff` | 评估多个技术方案的trade-off | P0 | 存在多个备选方案时 |
| `review-architecture` | 审查架构变更 | P1 | 重大架构改动后 |

#### 5.2 developer commands

| Command | 用途 | 优先级 | 调用场景 |
|---------|------|--------|----------|
| `implement-task` | 执行功能实现 | P0 | 新功能开发时 |
| `fix-task` | 执行bug修复 | P0 | bug修复时 |
| `refactor-task` | 执行代码重构 | P1 | 代码重构时 |

#### 5.3 tester commands

| Command | 用途 | 优先级 | 调用场景 |
|---------|------|--------|----------|
| `test-task` | 执行测试设计与执行 | P0 | 验证实现结果时 |
| `regression-task` | 执行回归测试 | P0 | 改动后验证影响范围 |

#### 5.4 reviewer commands

| Command | 用途 | 优先级 | 调用场景 |
|---------|------|--------|----------|
| `review-task` | 执行代码审查 | P0 | 实现完成后审查时 |
| `compare-spec-vs-code` | 对比spec与实现差异 | P0 | 验证实现是否符合spec |

#### 5.5 docs commands

| Command | 用途 | 优先级 | 调用场景 |
|---------|------|--------|----------|
| `update-docs` | 更新文档 | P1 | 文档同步时 |

#### 5.6 security commands

| Command | 用途 | 优先级 | 调用场景 |
|---------|------|--------|----------|
| `security-check` | 执行安全检查 | P1 | 高风险改动时 |

---

### 6. Commands按场景分类

#### 6.1 标准Feature开发流

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Feature Development Flow                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐              │
│   │ architect    │────▶│ developer    │────▶│ tester       │              │
│   │ design-task  │     │ implement-   │     │ test-task    │              │
│   │              │     │ task         │     │              │              │
│   └──────────────┘     └──────────────┘     └──────────────┘              │
│          │                                          │                       │
│          │                                          ▼                       │
│          │                                  ┌──────────────┐              │
│          │                                  │ reviewer     │              │
│          │                                  │ review-task  │              │
│          │                                  └──────────────┘              │
│          │                                          │                       │
│          │                                          ▼                       │
│          │                                  ┌──────────────┐              │
│          │                                  │ docs         │              │
│          │                                  │ update-docs  │              │
│          │                                  └──────────────┘              │
│          │                                                               │
│          ▼                                                               │
│   ┌──────────────────────────────────────────────────────────┐           │
│   │ 返回结果给OpenClaw管理层                                  │           │
│   └──────────────────────────────────────────────────────────┘           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 6.2 Bug修复流

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Bug Fix Flow                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐              │
│   │ developer    │────▶│ tester       │────▶│ reviewer     │              │
│   │ fix-task     │     │ test-task    │     │ review-task  │              │
│   └──────────────┘     └──────────────┘     └──────────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 6.3 高风险变更流

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         High-Risk Change Flow                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐              │
│   │ architect    │────▶│ developer    │────▶│ tester       │              │
│   │ design-task  │     │ implement-   │     │ test-task    │              │
│   │              │     │ task         │     │              │              │
│   └──────────────┘     └──────────────┘     └──────────────┘              │
│                                                      │                       │
│                                                      ▼                       │
│                                              ┌──────────────┐              │
│                                              │ reviewer     │              │
│                                              │ review-task  │              │
│                                              └──────────────┘              │
│                                                      │                       │
│                                                      ▼                       │
│                                              ┌──────────────┐              │
│                                              │ security     │              │
│                                              │ security-    │              │
│                                              │ check        │              │
│                                              └──────────────┘              │
│                                                      │                       │
│                                                      ▼                       │
│                                              ┌──────────────┐              │
│                                              │ docs         │              │
│                                              │ update-docs  │              │
│                                              └──────────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 6.4 技术方案评估流

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Trade-off Evaluation Flow                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐                                                          │
│   │ architect    │                                                          │
│   │ evaluate-    │◀─────────────────────────────────────────┐               │
│   │ tradeoff     │                                          │               │
│   └──────────────┘                                          │               │
│          │                                                  │               │
│          │ 方案确定后                                        │               │
│          ▼                                                  │               │
│   ┌──────────────┐                                          │               │
│   │ architect    │                                          │               │
│   │ design-task  │───▶ 继续标准Feature流 ───────────────────┘               │
│   └──────────────┘                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 第三部分：Command详细规范

### 7. architect/design-task

#### 7.1 基本信息卡片

| 属性 | 值 |
|------|-----|
| **Command ID** | `architect/design-task` |
| **适用角色** | architect |
| **用途** | 执行架构设计任务，将需求规格转化为可执行的技术设计 |
| **优先级** | P0 必做 |
| **调用频率** | 高（每个新feature都需要） |

#### 7.2 触发条件

- 收到type为`ARCHITECTURE`的task
- spec已存在且状态为`SPEC_DEFINED`
- milestone已规划

#### 7.3 输入规范

**必需输入**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `spec` | object/string | 需求规格对象或artifact引用 |
| `milestone_goal` | string | 当前里程碑目标 |
| `constraints` | string[] | 已知约束条件 |
| `code_context` | object | 相关代码上下文（可选） |

**可选输入**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `existing_design` | string | 已有设计artifact引用 |
| `known_risks` | string[] | 已知风险提示 |
| `reference_implementations` | string[] | 参考实现 |

#### 7.4 执行流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        design-task 执行流程                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. 输入验证                                                                │
│      ├── 检查spec是否存在                                                    │
│      ├── 检查约束是否清晰                                                    │
│      └── 如缺失关键信息 → 返回BLOCKED                                        │
│                                                                              │
│   2. 读取工件                                                                │
│      ├── 调用artifact-reading skill读取spec                                  │
│      ├── 调用context-summarization skill裁剪上下文                           │
│      └── 读取相关代码上下文                                                  │
│                                                                              │
│   3. 设计分析                                                                │
│      ├── 调用requirement-to-design skill                                     │
│      ├── 调用interface-contract-design skill                                 │
│      └── 调用tradeoff-analysis skill（如需要）                               │
│                                                                              │
│   4. 生成设计文档                                                            │
│      ├── 生成design_note                                                     │
│      ├── 生成task_split_suggestion                                          │
│      └── 生成risk_list                                                       │
│                                                                              │
│   5. 质量gate检查                                                            │
│      ├── 检查设计目标是否明确                                                 │
│      ├── 检查模块边界是否清晰                                                 │
│      ├── 检查接口定义是否完整                                                 │
│      ├── 检查风险识别是否完整                                                 │
│      └── 检查是否可直接交给developer                                          │
│                                                                              │
│   6. 输出组装                                                                │
│      ├── 组装execution result                                                │
│      └── 给出recommendation                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 7.5 输出规范

**成功输出**:

```yaml
status: SUCCESS
summary: "完成[设计目标]的架构设计，包含模块边界、接口契约、实施顺序和风险识别"
artifacts:
  - artifact_type: design_note
    title: "[设计任务名称] 设计文档"
    path: "artifacts/design/design-note-{id}.md"
    summary: "包含设计目标、模块边界、接口定义、风险和实施顺序"
changed_files: []
checks_performed:
  - "设计目标对齐检查"
  - "模块边界清晰度检查"
  - "接口定义完整性检查"
  - "风险识别完整性检查"
issues_found: []
risks:
  - description: "[识别的风险]"
    level: MEDIUM
    mitigation: "[缓解措施]"
recommendation: CONTINUE
followup_suggestions:
  - "建议派发给developer执行implement-task"
```

**失败输出示例**:

```yaml
status: BLOCKED
summary: "缺少关键上下文，无法完成设计"
issues_found:
  - "缺少数据库schema信息"
  - "现有认证模块接口未明确"
risks:
  - description: "设计可能需要返工"
    level: HIGH
recommendation: ESCALATE
escalation:
  reason_type: MISSING_CONTEXT
  summary: "缺少数据库schema和认证模块接口信息"
  blocking_points:
    - "数据库schema文档"
    - "认证模块API文档"
  recommended_next_steps:
    - "获取数据库schema artifact"
    - "获取认证模块接口文档"
```

#### 7.6 约束条件

| 约束 | 说明 |
|------|------|
| 不跳过风险识别 | 必须识别并记录至少主要风险 |
| 设计必须可执行 | implementation_order必须具体可操作 |
| 超出能力范围必须升级 | 无法自行决策时返回ESCALATE |
| 不得编写大量代码 | 仅允许示例代码/伪代码 |

#### 7.7 推荐下一步

| 场景 | 推荐动作 |
|------|----------|
| design_note完整 | 派发给developer执行`implement-task` |
| 存在trade-off需决策 | 执行`evaluate-tradeoff` |
| 缺少关键上下文 | 升级请求更多信息 |

#### 7.8 调用的Skills

| Skill | 用途 | 必需 |
|-------|------|------|
| artifact-reading | 读取spec等工件 | ✅ |
| context-summarization | 裁剪上下文 | ✅ |
| requirement-to-design | 需求转设计 | ✅ |
| interface-contract-design | 接口设计 | ⬜ |
| tradeoff-analysis | 方案评估 | ⬜ |
| execution-reporting | 输出报告 | ✅ |

---

### 8. architect/evaluate-tradeoff

#### 8.1 基本信息卡片

| 属性 | 值 |
|------|-----|
| **Command ID** | `architect/evaluate-tradeoff` |
| **适用角色** | architect |
| **用途** | 评估多个技术方案的trade-off |
| **优先级** | P0 必做 |
| **调用频率** | 中（存在多个备选方案时） |

#### 8.2 触发条件

- 存在多个技术方案需要评估
- design-task中发现需要决策的trade-off
- 用户/管理层请求方案对比

#### 8.3 输入规范

**必需输入**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `options` | object[] | 备选方案列表 |
| `criteria` | string[] | 评估维度 |
| `decision_context` | string | 决策背景 |

**每个option的结构**:

```yaml
- name: string              # 方案名称
  description: string       # 方案描述
  pros: string[]           # 优点
  cons: string[]           # 缺点
  effort: enum             # LOW|MEDIUM|HIGH
  risk_level: enum         # LOW|MEDIUM|HIGH
```

#### 8.4 执行流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     evaluate-tradeoff 执行流程                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. 输入验证                                                                │
│      ├── 检查options数量 >= 2                                                │
│      ├── 检查criteria是否完整                                                │
│      └── 如不足 → 返回BLOCKED                                                │
│                                                                              │
│   2. 调用tradeoff-analysis skill                                             │
│      ├── 按criteria逐一评估每个option                                        │
│      ├── 生成评分矩阵                                                        │
│      └── 识别关键决策点                                                      │
│                                                                              │
│   3. 生成trade-off报告                                                       │
│      ├── 方案对比表                                                          │
│      ├── 推荐方案及理由                                                      │
│      └── 风险与注意事项                                                      │
│                                                                              │
│   4. 决策判断                                                                │
│      ├── 若有明确最优方案 → 返回推荐                                         │
│      ├── 若需用户决策 → 返回ESCALATE                                         │
│      └── 若信息不足 → 返回BLOCKED                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 8.5 输出规范

**成功输出**:

```yaml
status: SUCCESS
summary: "完成[方案对比目标]的trade-off评估，推荐方案：[方案名]"
artifacts:
  - artifact_type: tradeoff_report
    title: "[评估目标] 方案对比报告"
    path: "artifacts/design/tradeoff-{id}.md"
    summary: "对比了N个方案，推荐[方案名]，理由：..."
checks_performed:
  - "方案完整性检查"
  - "评估维度覆盖检查"
issues_found: []
risks:
  - description: "[选型风险]"
    level: MEDIUM
recommendation: CONTINUE
followup_suggestions:
  - "建议采用[推荐方案]继续design-task"
```

**需用户决策输出**:

```yaml
status: FAILED_ESCALATE
summary: "多个方案各有优劣，需要用户决策"
issues_found:
  - "方案A性能更优但实现复杂"
  - "方案B实现简单但扩展性受限"
recommendation: ESCALATE
escalation:
  reason_type: UNRESOLVED_TRADEOFF
  summary: "存在多个可行方案，需要业务决策"
  options:
    - name: "方案A"
      summary: "高性能方案"
      recommendation_score: 0.6
    - name: "方案B"
      summary: "快速实现方案"
      recommendation_score: 0.4
  recommended_option: "方案A"
  required_user_decision: true
```

#### 8.6 调用的Skills

| Skill | 用途 | 必需 |
|-------|------|------|
| tradeoff-analysis | 方案评估 | ✅ |
| execution-reporting | 输出报告 | ✅ |

---

### 9. developer/implement-task

#### 9.1 基本信息卡片

| 属性 | 值 |
|------|-----|
| **Command ID** | `developer/implement-task` |
| **适用角色** | developer |
| **用途** | 执行功能实现任务 |
| **优先级** | P0 必做 |
| **调用频率** | 高（核心command） |

#### 9.2 触发条件

- 收到type为`IMPLEMENTATION`的task
- design_note已存在（如需要）
- 依赖任务已完成

#### 9.3 输入规范

**必需输入**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `task_goal` | string | 任务目标 |
| `constraints` | string[] | 变更约束 |
| `expected_outputs` | string[] | 期望输出 |

**可选输入**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `design_note` | string | 设计文档artifact引用 |
| `code_context` | object | 相关代码上下文 |
| `retry_context` | object | 返工上下文（如为返工） |

#### 9.4 执行流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       implement-task 执行流程                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. 输入验证                                                                │
│      ├── 检查task_goal是否清晰                                               │
│      ├── 检查constraints是否明确                                             │
│      └── 如缺失 → 返回BLOCKED                                                │
│                                                                              │
│   2. 读取工件                                                                │
│      ├── 调用artifact-reading skill读取design_note                           │
│      ├── 调用context-summarization skill                                     │
│      └── 读取相关代码                                                        │
│                                                                              │
│   3. 执行实现                                                                │
│      ├── 调用feature-implementation skill                                    │
│      ├── 遵守constraints                                                     │
│      └── 生成代码变更                                                        │
│                                                                              │
│   4. 自检                                                                    │
│      ├── 调用code-change-selfcheck skill                                     │
│      ├── 检查是否超范围                                                       │
│      ├── 检查是否满足expected_outputs                                        │
│      └── 生成self_check_result                                               │
│                                                                              │
│   5. 质量gate检查                                                            │
│      ├── 检查实现目标是否达成                                                 │
│      ├── 检查changed_files是否完整                                           │
│      ├── 检查是否违反constraints                                             │
│      └── 检查是否完成自检                                                    │
│                                                                              │
│   6. 输出组装                                                                │
│      ├── 生成implementation_summary                                          │
│      ├── 列出changed_files                                                   │
│      └── 给出recommendation                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 9.5 输出规范

**成功输出**:

```yaml
status: SUCCESS
summary: "完成[实现目标]的功能实现"
artifacts:
  - artifact_type: implementation_summary
    title: "[实现任务名称] 实现总结"
    path: "artifacts/implementation/summary-{id}.md"
    summary: "实现了[功能描述]，改动文件N个"
changed_files:
  - "src/auth/login.ts"
  - "src/auth/types.ts"
checks_performed:
  - "实现目标对齐检查"
  - "改动范围检查"
  - "约束遵守检查"
  - "自检完成检查"
issues_found: []
risks: []
recommendation: SEND_TO_TEST
followup_suggestions:
  - "建议派发给tester执行test-task"
```

**返工输出示例**:

```yaml
status: FAILED_RETRYABLE
summary: "实现基本完成，但存在需修复的问题"
artifacts:
  - artifact_type: implementation_summary
    title: "[实现任务名称] 实现总结"
    summary: "部分完成，需修复[具体问题]"
changed_files:
  - "src/auth/login.ts"
issues_found:
  - "错误处理分支未覆盖"
  - "命名与既有规范不一致"
risks:
  - description: "边界条件处理不完整"
    level: MEDIUM
recommendation: REWORK
followup_suggestions:
  - "修复上述问题后重新提交"
```

#### 9.6 约束条件

| 约束 | 说明 |
|------|------|
| 不超范围改动 | 仅改动constraints允许的范围 |
| 不擅自引入依赖 | 新依赖需明确理由 |
| 必须完成自检 | 未自检不得声称完成 |
| 必须记录偏差 | 与design_note偏离必须说明 |

#### 9.7 推荐下一步

| 场景 | 推荐动作 |
|------|----------|
| 实现完成且自检通过 | 派发给tester执行`test-task` |
| 存在问题需修复 | 返回REWORK，重新派发给自己 |
| 约束无法满足 | 返回ESCALATE |

#### 9.8 调用的Skills

| Skill | 用途 | 必需 |
|-------|------|------|
| artifact-reading | 读取design_note | ✅ |
| context-summarization | 裁剪上下文 | ✅ |
| feature-implementation | 功能实现 | ✅ |
| code-change-selfcheck | 代码自检 | ✅ |
| execution-reporting | 输出报告 | ✅ |

---

### 10. developer/fix-task

#### 10.1 基本信息卡片

| 属性 | 值 |
|------|-----|
| **Command ID** | `developer/fix-task` |
| **适用角色** | developer |
| **用途** | 执行bug修复任务 |
| **优先级** | P0 必做 |
| **调用频率** | 高 |

#### 10.2 触发条件

- 收到type为`BUGFIX`的task
- bug信息已明确（现象、复现步骤、预期行为）

#### 10.3 输入规范

**必需输入**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `bug_description` | string | bug描述 |
| `reproduction_steps` | string[] | 复现步骤 |
| `expected_behavior` | string | 预期行为 |
| `constraints` | string[] | 修复约束 |

**可选输入**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `logs` | string | 相关日志 |
| `error_stack` | string | 错误堆栈 |
| `related_code` | string[] | 相关代码文件 |

#### 10.4 执行流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          fix-task 执行流程                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. 问题理解                                                                │
│      ├── 读取bug_description                                                │
│      ├── 理解复现步骤                                                        │
│      └── 确认预期行为                                                        │
│                                                                              │
│   2. 问题定位                                                                │
│      ├── 调用bugfix-workflow skill                                           │
│      ├── 分析相关代码                                                        │
│      └── 确定问题根因                                                        │
│                                                                              │
│   3. 修复实施                                                                │
│      ├── 最小化修复                                                          │
│      ├── 遵守constraints                                                    │
│      └── 生成代码变更                                                        │
│                                                                              │
│   4. 自检                                                                    │
│      ├── 调用code-change-selfcheck skill                                     │
│      └── 验证修复是否完整                                                    │
│                                                                              │
│   5. 回归提示                                                                │
│      ├── 识别可能影响范围                                                    │
│      ├── 列出需回归测试的点                                                  │
│      └── 标注潜在风险                                                        │
│                                                                              │
│   6. 输出组装                                                                │
│      ├── 生成fix_summary                                                     │
│      └── 给出recommendation                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 10.5 输出规范

**成功输出**:

```yaml
status: SUCCESS
summary: "修复了[bug描述]"
artifacts:
  - artifact_type: implementation_summary
    title: "[bug名称] 修复总结"
    summary: "修复了[问题描述]，根因：[根因]，方案：[修复方案]"
changed_files:
  - "src/auth/login.ts"
checks_performed:
  - "问题根因定位"
  - "修复方案验证"
  - "影响范围评估"
  - "自检完成"
issues_found: []
risks:
  - description: "[潜在回归风险]"
    level: LOW
recommendation: SEND_TO_TEST
followup_suggestions:
  - "建议执行regression-task验证影响范围"
```

#### 10.6 调用的Skills

| Skill | 用途 | 必需 |
|-------|------|------|
| artifact-reading | 读取bug信息 | ✅ |
| bugfix-workflow | bug修复流程 | ✅ |
| code-change-selfcheck | 代码自检 | ✅ |
| failure-analysis | 失败分析（如有历史） | ⬜ |
| execution-reporting | 输出报告 | ✅ |

---

### 11. developer/refactor-task

#### 11.1 基本信息卡片

| 属性 | 值 |
|------|-----|
| **Command ID** | `developer/refactor-task` |
| **适用角色** | developer |
| **用途** | 执行代码重构任务 |
| **优先级** | P1 推荐 |
| **调用频率** | 中 |

#### 11.2 触发条件

- 收到type为`REFACTOR`的task
- 重构范围和目标已明确

#### 11.3 输入规范

| 字段 | 类型 | 说明 |
|------|------|------|
| `refactor_scope` | string | 重构范围 |
| `refactor_goals` | string[] | 重构目标 |
| `constraints` | string[] | 重构约束 |
| `preserve_behavior` | boolean | 是否保持行为不变 |

#### 11.4 执行流程

```
1. 理解重构范围和目标
2. 分析现有代码结构
3. 制定重构方案
4. 执行重构（保持行为不变）
5. 验证重构结果
6. 自检并输出
```

#### 11.5 输出规范

```yaml
status: SUCCESS
summary: "完成[重构范围]的重构"
artifacts:
  - artifact_type: implementation_summary
    title: "[重构名称] 重构总结"
changed_files:
  - "src/xxx.ts"
checks_performed:
  - "行为不变验证"
  - "代码质量提升检查"
issues_found: []
risks: []
recommendation: SEND_TO_TEST
```

#### 11.6 调用的Skills

| Skill | 用途 | 必需 |
|-------|------|------|
| refactor-safely | 安全重构 | ✅ |
| code-change-selfcheck | 代码自检 | ✅ |
| execution-reporting | 输出报告 | ✅ |

---

### 12. tester/test-task

#### 12.1 基本信息卡片

| 属性 | 值 |
|------|-----|
| **Command ID** | `tester/test-task` |
| **适用角色** | tester |
| **用途** | 执行测试设计与执行 |
| **优先级** | P0 必做 |
| **调用频率** | 高 |

#### 12.2 触发条件

- 实现任务完成后
- 收到type为`TEST_DESIGN`或`TEST_EXECUTION`的task

#### 12.3 输入规范

**必需输入**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `test_scope` | string | 测试范围 |
| `acceptance_criteria` | string[] | 验收标准 |
| `changed_files` | string[] | 改动文件 |

**可选输入**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `implementation_summary` | string | 实现总结 |
| `known_risks` | string[] | 已知风险 |
| `historical_failures` | string[] | 历史失败模式 |

#### 12.4 执行流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         test-task 执行流程                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. 测试范围确认                                                            │
│      ├── 读取acceptance_criteria                                            │
│      ├── 读取changed_files                                                  │
│      └── 确认测试边界                                                        │
│                                                                              │
│   2. 测试设计                                                                │
│      ├── 调用unit-test-design skill                                         │
│      ├── 设计测试用例                                                        │
│      └── 覆盖关键路径和边界条件                                              │
│                                                                              │
│   3. 测试执行                                                                │
│      ├── 运行测试                                                            │
│      ├── 记录结果                                                            │
│      └── 捕获失败信息                                                        │
│                                                                              │
│   4. 结果分析                                                                │
│      ├── 调用regression-analysis skill                                       │
│      ├── 分析失败原因                                                        │
│      └── 生成gap分析                                                         │
│                                                                              │
│   5. 质量gate检查                                                            │
│      ├── 检查关键路径覆盖                                                    │
│      ├── 检查pass/fail结论明确                                               │
│      └── 检查失败分类完整                                                    │
│                                                                              │
│   6. 输出组装                                                                │
│      ├── 生成test_report                                                     │
│      └── 给出recommendation                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 12.5 输出规范

**成功输出**:

```yaml
status: SUCCESS
summary: "测试通过，覆盖关键路径"
artifacts:
  - artifact_type: test_report
    title: "[测试任务名称] 测试报告"
    path: "artifacts/test/test-report-{id}.md"
    summary: "执行测试N个，通过N个，失败0个"
changed_files:
  - "tests/auth/login.test.ts"
checks_performed:
  - "关键路径覆盖检查"
  - "边界条件覆盖检查"
  - "验收标准对齐检查"
issues_found: []
risks: []
recommendation: SEND_TO_REVIEW
followup_suggestions:
  - "建议派发给reviewer执行review-task"
```

**失败输出示例**:

```yaml
status: FAILED_RETRYABLE
summary: "测试失败，需返工修复"
artifacts:
  - artifact_type: test_report
    title: "[测试任务名称] 测试报告"
    summary: "执行测试N个，通过M个，失败K个"
changed_files:
  - "tests/auth/login.test.ts"
checks_performed:
  - "关键路径覆盖检查"
issues_found:
  - "测试用例X失败：[失败原因]"
  - "边界条件Y未覆盖"
risks:
  - description: "边界条件处理不完整"
    level: MEDIUM
recommendation: REWORK
followup_suggestions:
  - "返回developer修复失败用例"
```

#### 12.6 调用的Skills

| Skill | 用途 | 必需 |
|-------|------|------|
| artifact-reading | 读取实现总结 | ✅ |
| unit-test-design | 单测设计 | ✅ |
| regression-analysis | 回归分析 | ✅ |
| edge-case-matrix | 边界条件 | ⬜ |
| execution-reporting | 输出报告 | ✅ |

---

### 13. tester/regression-task

#### 13.1 基本信息卡片

| 属性 | 值 |
|------|-----|
| **Command ID** | `tester/regression-task` |
| **适用角色** | tester |
| **用途** | 执行回归测试 |
| **优先级** | P0 必做 |
| **调用频率** | 中 |

#### 13.2 触发条件

- bug修复后验证影响范围
- 重构后验证行为不变
- 收到type为`REGRESSION`的task

#### 13.3 输入规范

| 字段 | 类型 | 说明 |
|------|------|------|
| `changed_files` | string[] | 改动文件 |
| `regression_scope` | string | 回归范围 |
| `baseline_results` | object | 基线结果 |

#### 13.4 输出规范

```yaml
status: SUCCESS
summary: "回归测试通过，未发现新问题"
artifacts:
  - artifact_type: test_report
    title: "[回归任务名称] 回归报告"
    summary: "回归测试N个用例，全部通过"
changed_files: []
checks_performed:
  - "影响范围分析"
  - "相关用例执行"
  - "基线对比"
issues_found: []
risks: []
recommendation: SEND_TO_REVIEW
```

#### 13.5 调用的Skills

| Skill | 用途 | 必需 |
|-------|------|------|
| regression-analysis | 回归分析 | ✅ |
| execution-reporting | 输出报告 | ✅ |

---

### 14. reviewer/review-task

#### 14.1 基本信息卡片

| 属性 | 值 |
|------|-----|
| **Command ID** | `reviewer/review-task` |
| **适用角色** | reviewer |
| **用途** | 执行代码审查 |
| **优先级** | P0 必做 |
| **调用频率** | 高 |

#### 14.2 触发条件

- 测试通过后
- 收到type为`REVIEW`的task

#### 14.3 输入规范

**必需输入**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `diff` | string | 代码差异 |
| `spec` | string | 规格说明（artifact引用） |
| `test_result` | string | 测试结果（artifact引用） |

**可选输入**:

| 字段 | 类型 | 说明 |
|------|------|------|
| `design_note` | string | 设计文档 |
| `known_risks` | string[] | 已知风险 |

#### 14.4 执行流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         review-task 执行流程                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. 工件读取                                                                │
│      ├── 读取diff                                                            │
│      ├── 读取spec                                                            │
│      └── 读取test_result                                                     │
│                                                                              │
│   2. spec对齐检查                                                            │
│      ├── 调用spec-implementation-diff skill                                  │
│      ├── 对比实现与spec                                                      │
│      └── 记录偏差                                                            │
│                                                                              │
│   3. 代码审查                                                                │
│      ├── 调用code-review-checklist skill                                     │
│      ├── 检查代码质量                                                        │
│      └── 识别潜在问题                                                        │
│                                                                              │
│   4. 问题分类                                                                │
│      ├── 区分must-fix和non-blocking                                          │
│      ├── 评估风险等级                                                        │
│      └── 生成可执行修改建议                                                  │
│                                                                              │
│   5. 决策判断                                                                │
│      ├── 若无must-fix → APPROVE                                              │
│      ├── 若有must-fix → REJECT                                               │
│      └── 若有警告 → WARN                                                     │
│                                                                              │
│   6. 输出组装                                                                │
│      ├── 生成review_report                                                   │
│      └── 给出recommendation                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 14.5 输出规范

**通过输出**:

```yaml
status: SUCCESS
summary: "审查通过，代码质量良好"
artifacts:
  - artifact_type: review_report
    title: "[审查任务名称] 审查报告"
    path: "artifacts/review/review-report-{id}.md"
    summary: "审查通过，无must-fix问题"
changed_files: []
checks_performed:
  - "spec对齐检查"
  - "代码质量检查"
  - "风险审查"
  - "可维护性检查"
issues_found: []
risks: []
recommendation: CONTINUE
followup_suggestions:
  - "建议派发给docs更新文档"
```

**拒绝输出示例**:

```yaml
status: FAILED_RETRYABLE
summary: "审查未通过，存在must-fix问题"
artifacts:
  - artifact_type: review_report
    title: "[审查任务名称] 审查报告"
    summary: "发现N个must-fix问题"
changed_files: []
checks_performed:
  - "spec对齐检查"
  - "代码质量检查"
issues_found:
  - type: MUST_FIX
    description: "[问题描述]"
    file: "src/auth/login.ts"
    line: 42
    suggestion: "[修改建议]"
  - type: MUST_FIX
    description: "[问题描述]"
    file: "src/auth/types.ts"
    line: 15
    suggestion: "[修改建议]"
risks:
  - description: "[残余风险]"
    level: MEDIUM
recommendation: REWORK
followup_suggestions:
  - "返回developer修复must-fix问题"
```

#### 14.6 调用的Skills

| Skill | 用途 | 必需 |
|-------|------|------|
| artifact-reading | 读取工件 | ✅ |
| code-review-checklist | 代码审查 | ✅ |
| spec-implementation-diff | spec对比 | ✅ |
| reject-with-actionable-feedback | 拒绝反馈 | ✅ |
| execution-reporting | 输出报告 | ✅ |

---

### 15. reviewer/compare-spec-vs-code

#### 15.1 基本信息卡片

| 属性 | 值 |
|------|-----|
| **Command ID** | `reviewer/compare-spec-vs-code` |
| **适用角色** | reviewer |
| **用途** | 对比spec与实现差异 |
| **优先级** | P0 必做 |
| **调用频率** | 中 |

#### 15.2 触发条件

- 需要验证实现是否符合spec
- review-task的子任务

#### 15.3 输入规范

| 字段 | 类型 | 说明 |
|------|------|------|
| `spec` | string | spec artifact引用 |
| `implementation` | string | 实现代码或artifact引用 |
| `acceptance_criteria` | string[] | 验收标准 |

#### 15.4 执行流程

```
1. 读取spec并解析验收标准
2. 读取实现代码
3. 逐一对比验收标准与实现
4. 记录偏差和缺失
5. 生成diff_report
```

#### 15.5 输出规范

```yaml
status: SUCCESS
summary: "spec对比完成，发现N处偏差"
artifacts:
  - artifact_type: diff_report
    title: "[任务名称] Spec-Implementation对比报告"
    summary: "对比N个验收标准，M个完全对齐，K个有偏差"
checks_performed:
  - "验收标准逐一对比"
issues_found:
  - criteria: "[验收标准]"
    expected: "[预期]"
    actual: "[实际]"
    deviation_type: MISSING|PARTIAL|WRONG
risks: []
recommendation: "[取决于偏差严重程度]"
```

#### 15.6 调用的Skills

| Skill | 用途 | 必需 |
|-------|------|------|
| spec-implementation-diff | spec对比 | ✅ |
| execution-reporting | 输出报告 | ✅ |

---

### 16. docs/update-docs

#### 16.1 基本信息卡片

| 属性 | 值 |
|------|-----|
| **Command ID** | `docs/update-docs` |
| **适用角色** | docs |
| **用途** | 更新文档 |
| **优先级** | P1 推荐 |
| **调用频率** | 中 |

#### 16.2 触发条件

- 实现完成后需要同步文档
- 收到type为`DOCS`的task

#### 16.3 输入规范

| 字段 | 类型 | 说明 |
|------|------|------|
| `implementation_summary` | string | 实现总结 |
| `doc_types` | string[] | 需更新的文档类型 |
| `user_facing_changes` | boolean | 是否有用户可见变更 |

#### 16.4 执行流程

```
1. 读取implementation_summary
2. 确定需要更新的文档类型
3. 调用readme-sync skill更新README
4. 调用changelog-writing skill更新changelog
5. 生成doc_update_report
```

#### 16.5 输出规范

```yaml
status: SUCCESS
summary: "文档更新完成"
artifacts:
  - artifact_type: doc_update_report
    title: "[文档更新任务名称] 文档更新报告"
    summary: "更新了N个文档"
changed_files:
  - "README.md"
  - "CHANGELOG.md"
checks_performed:
  - "README一致性检查"
  - "changelog完整性检查"
issues_found: []
risks: []
recommendation: CONTINUE
```

#### 16.6 调用的Skills

| Skill | 用途 | 必需 |
|-------|------|------|
| readme-sync | README同步 | ✅ |
| changelog-writing | changelog编写 | ✅ |
| execution-reporting | 输出报告 | ✅ |

---

### 17. security/security-check

#### 17.1 基本信息卡片

| 属性 | 值 |
|------|-----|
| **Command ID** | `security/security-check` |
| **适用角色** | security |
| **用途** | 执行安全检查 |
| **优先级** | P1 推荐（高风险必做） |
| **调用频率** | 低（高风险任务） |

#### 17.2 触发条件

- 高风险改动（auth/permission/secrets等）
- 收到type为`SECURITY_CHECK`的task

#### 17.3 输入规范

| 字段 | 类型 | 说明 |
|------|------|------|
| `changed_files` | string[] | 改动文件 |
| `risk_areas` | string[] | 风险区域说明 |
| `auth_changes` | boolean | 是否涉及认证变更 |

#### 17.4 执行流程

```
1. 读取changed_files
2. 调用auth-and-permission-review skill
3. 调用input-validation-review skill
4. 识别安全问题
5. 分类严重程度
6. 生成security_report
```

#### 17.5 输出规范

```yaml
status: SUCCESS
summary: "安全检查完成，发现N个问题"
artifacts:
  - artifact_type: security_report
    title: "[安全检查任务名称] 安全报告"
    summary: "检查N个文件，发现K个问题"
changed_files: []
checks_performed:
  - "认证权限检查"
  - "输入校验检查"
  - "secret处理检查"
issues_found:
  - severity: HIGH
    description: "[安全问题]"
    file: "src/auth/login.ts"
    recommendation: "[修复建议]"
risks: []
recommendation: "[取决于问题严重程度]"
```

#### 17.6 调用的Skills

| Skill | 用途 | 必需 |
|-------|------|------|
| auth-and-permission-review | 认证权限检查 | ✅ |
| input-validation-review | 输入校验检查 | ✅ |
| execution-reporting | 输出报告 | ✅ |

---

## 第四部分：Command调用协议

### 18. 调用入口

OpenClaw管理层通过统一入口调用command：

```typescript
/**
 * 执行角色任务
 * @param dispatch - 派发载荷
 * @returns 执行结果
 */
async function execute_role_task(dispatch: DispatchPayload): Promise<ExecutionResult> {
  // 1. 验证dispatch payload
  validate_dispatch(dispatch);
  
  // 2. 查找角色定义
  const agent = await find_agent(dispatch.role);
  if (!agent) {
    return build_error_result(dispatch, 'ROLE_NOT_FOUND');
  }
  
  // 3. 查找command定义
  const command = await find_command(dispatch.role, dispatch.command);
  if (!command) {
    return build_error_result(dispatch, 'COMMAND_NOT_FOUND');
  }
  
  // 4. 加载角色skills
  const skills = await load_skills(agent.default_skills);
  
  // 5. 执行command
  try {
    const result = await execute_command(command, skills, dispatch);
    return result;
  } catch (error) {
    return build_error_result(dispatch, 'EXECUTION_ERROR', error);
  }
}
```

### 19. Command发现机制

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Command发现机制                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   目录结构：                                                                 │
│   commands/                                                                  │
│   ├── architect/                                                             │
│   │   ├── design-task.md                                                    │
│   │   └── evaluate-tradeoff.md                                              │
│   ├── developer/                                                             │
│   │   ├── implement-task.md                                                 │
│   │   ├── fix-task.md                                                       │
│   │   └── refactor-task.md                                                  │
│   └── ...                                                                    │
│                                                                              │
│   发现规则：                                                                 │
│   1. 按 commands/{role}/{command}.md 路径查找                                │
│   2. command文件名即为command ID                                              │
│   3. 每个command文件包含完整定义                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 20. Command执行生命周期

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Command执行生命周期                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐                                                          │
│   │ 1. 接收      │ ← dispatch payload                                       │
│   │    dispatch  │                                                          │
│   └──────────────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐                                                          │
│   │ 2. 验证      │ ← 检查必需字段、role与command匹配                         │
│   │    输入      │                                                          │
│   └──────────────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐                                                          │
│   │ 3. 加载      │ ← 加载角色默认skills + command指定skills                   │
│   │    skills    │                                                          │
│   └──────────────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐                                                          │
│   │ 4. 执行      │ ← 按command定义的流程执行                                  │
│   │    流程      │                                                          │
│   └──────────────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐                                                          │
│   │ 5. 质量gate  │ ← 执行command定义的quality gate检查                        │
│   │    检查      │                                                          │
│   └──────────────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐                                                          │
│   │ 6. 组装      │ ← 生成execution result                                    │
│   │    输出      │                                                          │
│   └──────────────┘                                                          │
│          │                                                                   │
│          ▼                                                                   │
│   ┌──────────────┐                                                          │
│   │ 7. 返回      │ → 返回给OpenClaw管理层                                    │
│   │    结果      │                                                          │
│   └──────────────┘                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 21. 错误处理规范

#### 21.1 错误分类

| 错误类型 | status | 说明 |
|----------|--------|------|
| ROLE_NOT_FOUND | BLOCKED | 角色不存在 |
| COMMAND_NOT_FOUND | BLOCKED | command不存在 |
| INVALID_INPUT | BLOCKED | 输入验证失败 |
| MISSING_ARTIFACT | BLOCKED | 必需工件缺失 |
| EXECUTION_ERROR | FAILED_ESCALATE | 执行过程错误 |
| CONSTRAINT_VIOLATION | FAILED_RETRYABLE | 违反约束 |
| QUALITY_GATE_FAILED | FAILED_RETRYABLE | 质量gate未通过 |

#### 21.2 错误输出格式

```yaml
status: BLOCKED
summary: "无法执行，缺少关键输入"
issues_found:
  - "[具体错误描述]"
risks:
  - description: "执行被阻塞"
    level: HIGH
recommendation: ESCALATE
escalation:
  reason_type: MISSING_CONTEXT
  summary: "[错误详情]"
  blocking_points:
    - "[阻塞项1]"
    - "[阻塞项2]"
  recommended_next_steps:
    - "[建议动作]"
  requires_user_decision: false
```

---

## 第五部分：Command与Skill映射矩阵

### 22. 映射总表

| Command | 调用的Skills | 必需Skills |
|---------|--------------|------------|
| architect/design-task | artifact-reading, context-summarization, requirement-to-design, interface-contract-design, tradeoff-analysis, execution-reporting | artifact-reading, requirement-to-design, execution-reporting |
| architect/evaluate-tradeoff | tradeoff-analysis, execution-reporting | tradeoff-analysis, execution-reporting |
| developer/implement-task | artifact-reading, context-summarization, feature-implementation, code-change-selfcheck, execution-reporting | artifact-reading, feature-implementation, code-change-selfcheck, execution-reporting |
| developer/fix-task | artifact-reading, bugfix-workflow, code-change-selfcheck, failure-analysis, execution-reporting | artifact-reading, bugfix-workflow, code-change-selfcheck, execution-reporting |
| developer/refactor-task | refactor-safely, code-change-selfcheck, execution-reporting | refactor-safely, code-change-selfcheck, execution-reporting |
| tester/test-task | artifact-reading, unit-test-design, regression-analysis, edge-case-matrix, execution-reporting | artifact-reading, unit-test-design, execution-reporting |
| tester/regression-task | regression-analysis, execution-reporting | regression-analysis, execution-reporting |
| reviewer/review-task | artifact-reading, code-review-checklist, spec-implementation-diff, reject-with-actionable-feedback, execution-reporting | artifact-reading, code-review-checklist, spec-implementation-diff, execution-reporting |
| reviewer/compare-spec-vs-code | spec-implementation-diff, execution-reporting | spec-implementation-diff, execution-reporting |
| docs/update-docs | readme-sync, changelog-writing, execution-reporting | readme-sync, execution-reporting |
| security/security-check | auth-and-permission-review, input-validation-review, execution-reporting | auth-and-permission-review, execution-reporting |

### 23. Skill复用分析

| Skill | 被调用次数 | 调用的Commands |
|-------|------------|----------------|
| artifact-reading | 7 | design-task, implement-task, fix-task, test-task, review-task, compare-spec-vs-code, security-check |
| execution-reporting | 11 | 所有commands |
| context-summarization | 2 | design-task, implement-task |
| code-change-selfcheck | 3 | implement-task, fix-task, refactor-task |
| failure-analysis | 1 | fix-task |
| unit-test-design | 1 | test-task |
| regression-analysis | 2 | test-task, regression-task |
| code-review-checklist | 1 | review-task |
| spec-implementation-diff | 2 | review-task, compare-spec-vs-code |
| tradeoff-analysis | 2 | design-task, evaluate-tradeoff |

---

## 第六部分：命名与约定

### 24. Command命名规范

| 规范 | 示例 | 说明 |
|------|------|------|
| 格式：`{verb}-{noun}` | design-task, implement-task | 动词在前，名词在后 |
| 使用kebab-case | fix-task | 全小写，用连字符分隔 |
| 避免缩写 | implement-task (不是impl-task) | 使用完整单词 |
| 保持一致性 | 所有*-task后缀 | 同类command使用相同后缀 |

### 25. 动词约定

| 动词 | 含义 | 适用场景 |
|------|------|----------|
| design | 设计 | 创建设计方案 |
| implement | 实现 | 编写功能代码 |
| fix | 修复 | 修复bug |
| refactor | 重构 | 代码重构 |
| test | 测试 | 测试设计与执行 |
| review | 审查 | 代码审查 |
| compare | 对比 | 对比分析 |
| update | 更新 | 更新内容 |
| check | 检查 | 专项检查 |
| evaluate | 评估 | 方案评估 |

### 26. 文件命名约定

```
commands/
├── {role}/
│   └── {verb}-{noun}.md

示例：
commands/architect/design-task.md
commands/developer/implement-task.md
commands/tester/test-task.md
```

---

## 附录A：快速参考卡

### Command快速查找表

| 我要做什么 | 调用哪个Command |
|------------|-----------------|
| 设计新功能架构 | architect/design-task |
| 评估技术方案 | architect/evaluate-tradeoff |
| 实现新功能 | developer/implement-task |
| 修复bug | developer/fix-task |
| 重构代码 | developer/refactor-task |
| 执行测试 | tester/test-task |
| 回归测试 | tester/regression-task |
| 代码审查 | reviewer/review-task |
| 对比spec与实现 | reviewer/compare-spec-vs-code |
| 更新文档 | docs/update-docs |
| 安全检查 | security/security-check |

### 输入输出快速参考

**通用输入字段**（所有command都有）:
- dispatch_id, project_id, milestone_id, task_id
- role, command, title, goal, description
- context, constraints, inputs
- expected_outputs, verification_steps
- risk_level

**通用输出字段**（所有command都有）:
- dispatch_id, status, summary
- artifacts, changed_files
- checks_performed, issues_found, risks
- recommendation, followup_suggestions

### Status枚举速查

| Status | 含义 | 后续动作 |
|--------|------|----------|
| SUCCESS | 成功 | 继续下一步 |
| SUCCESS_WITH_WARNINGS | 成功但有警告 | 继续但注意风险 |
| PARTIAL | 部分完成 | 补充或返工 |
| BLOCKED | 阻塞 | 解决阻塞后重试 |
| FAILED_RETRYABLE | 可重试失败 | 返工后重试 |
| FAILED_ESCALATE | 需升级 | 交由上级决策 |

### Recommendation枚举速查

| Recommendation | 含义 |
|---------------|------|
| CONTINUE | 继续下一阶段 |
| SEND_TO_TEST | 发送给tester |
| SEND_TO_REVIEW | 发送给reviewer |
| REWORK | 返工 |
| REPLAN | 重新规划 |
| ESCALATE | 升级 |