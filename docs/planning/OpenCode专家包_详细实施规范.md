# OpenCode 专家包 MVP 详细实施规范

**版本**: v1.0  
**日期**: 2026-03-22  
**状态**: 实施规范文档

---

## 第一部分：Phase任务卡片

### Phase 1: 骨架搭建

#### M1-001: 创建目录结构

| 属性 | 说明 |
|------|------|
| **任务ID** | M1-001 |
| **任务名称** | 创建完整目录结构 |
| **预计时间** | 2小时 |
| **依赖** | 无 |
| **产出** | 完整目录树 |

**详细说明**:
按照`docs/infra/OpenCode专家包MVP目录骨架.md`中的结构创建以下目录：
- agents/
- skills/common/
- skills/architect/
- skills/developer/
- skills/tester/
- skills/reviewer/
- skills/docs/
- skills/security/
- commands/architect/
- commands/developer/
- commands/tester/
- commands/reviewer/
- commands/docs/
- commands/security/
- templates/
- rules/global/
- rules/coding/
- rules/testing/
- rules/review/
- rules/docs/
- schemas/
- examples/dispatch/
- examples/results/
- examples/artifacts/
- docs/

**验收标准**:
- [ ] 所有目录已创建
- [ ] 目录命名符合kebab-case规范
- [ ] 层级关系正确

---

#### M1-002: 编写README.md

| 属性 | 说明 |
|------|------|
| **任务ID** | M1-002 |
| **任务名称** | 编写项目入口文档 |
| **预计时间** | 1小时 |
| **依赖** | M1-001 |
| **产出** | README.md |

**详细说明**:
README.md必须包含以下部分：
1. 专家包定位（1-2段）
2. 支持的角色列表
3. 目录结构概览
4. 与OpenClaw的关系说明
5. MVP范围说明
6. 快速开始方式
7. 参考文档链接

**模板结构**:
```markdown
# OpenCode 专家包

## 定位
[专家包是什么，解决什么问题]

## 核心角色
| 角色 | 职责 |
|------|------|
| architect | ... |
| developer | ... |
| ... | ... |

## 目录结构
[目录树]

## 与OpenClaw的关系
[系统位置说明]

## MVP范围
[必做/可选/不做]

## 快速开始
[使用方式]

## 参考文档
[链接列表]
```

**验收标准**:
- [ ] 包含所有必要部分
- [ ] 字数控制在500-800字
- [ ] 格式清晰易读

---

#### M1-003: 编写opencode.jsonc

| 属性 | 说明 |
|------|------|
| **任务ID** | M1-003 |
| **任务名称** | 编写核心配置文件 |
| **预计时间** | 1小时 |
| **依赖** | M1-001 |
| **产出** | opencode.jsonc |

**详细说明**:
opencode.jsonc必须包含：
1. agent定义入口
2. command发现路径
3. skill发现路径
4. 必要默认设置

**模板结构**:
```jsonc
{
  // 专家包元信息
  "name": "opencode-expert-pack",
  "version": "1.0.0",
  "description": "OpenCode专家包 - 执行层角色化能力包",
  
  // Agent定义
  "agents": {
    "discoveryPath": "./agents",
    "roles": [
      "architect",
      "developer",
      "tester",
      "reviewer",
      "docs",
      "security"
    ]
  },
  
  // Skill配置
  "skills": {
    "discoveryPath": "./skills",
    "commonSkills": [
      "artifact-reading",
      "context-summarization",
      "failure-analysis",
      "execution-reporting"
    ]
  },
  
  // Command配置
  "commands": {
    "discoveryPath": "./commands"
  },
  
  // 默认设置
  "defaults": {
    "maxRetry": 2,
    "defaultRiskLevel": "medium"
  }
}
```

**验收标准**:
- [ ] JSON格式正确
- [ ] 所有路径正确
- [ ] 包含必要字段

---

#### M1-004: 编写AGENTS.md

| 属性 | 说明 |
|------|------|
| **任务ID** | M1-004 |
| **任务名称** | 编写角色总览文档 |
| **预计时间** | 1小时 |
| **依赖** | M1-001 |
| **产出** | AGENTS.md |

**详细说明**:
AGENTS.md必须包含：
1. 所有角色的职责摘要
2. 每个角色不做什么
3. 推荐协作流程
4. 高风险任务追加规则

**模板结构**:
```markdown
# OpenCode 专家角色总览

## 角色分工

### architect
- **职责**: 需求转技术方案、模块边界、接口契约、风险识别
- **不做**: 大规模业务代码实现、最终验收拍板

### developer
- **职责**: 功能实现、bug修复、局部重构、自检
- **不做**: 重新定义需求、自行决定milestone通过

[... 其他角色 ...]

## 协作流程

### 标准feature流
architect -> developer -> tester -> reviewer -> docs

### bugfix流
developer -> tester -> reviewer

### 高风险变更流
architect -> developer -> tester -> reviewer -> security -> docs

## 高风险任务追加规则
- 涉及auth/permission → 追加security
- 涉及用户可见变更 → 追加docs
- 涉及数据迁移 → 追加architect review
```

**验收标准**:
- [ ] 包含所有角色
- [ ] 协作流程清晰
- [ ] 追加规则明确

---

#### M1-005~007: 定义Schemas

这三个任务类似，统一说明：

| 任务ID | 产出 | 核心字段 |
|--------|------|----------|
| M1-005 | dispatch-payload.schema.yaml | dispatch_id, role, command, goal, constraints, expected_outputs |
| M1-006 | execution-result.schema.yaml | dispatch_id, status, summary, artifacts, recommendation |
| M1-007 | artifact.schema.yaml | artifact_id, artifact_type, title, path, summary |

**Schema验收标准**:
- [ ] 使用YAML格式
- [ ] 包含required字段列表
- [ ] 包含字段类型和描述
- [ ] 包含enum值定义（如有）
- [ ] 可被YAML校验工具使用

---

### Phase 2: 核心角色定义

#### 角色定义任务通用说明

每个角色定义文件（如architect.md）必须包含以下结构：

```markdown
# [角色名称]

## Role
[一句话定位]

## Responsibilities
[负责事项列表]

## Non-Responsibilities
[不负责事项列表]

## Inputs
[典型输入列表]

## Outputs
[必须输出列表]

## Default Skills
[默认挂载的skills]

## Preferred Commands
[优先使用的commands]

## Quality Gates
[进入下游前必须满足的条件]

## Escalation Conditions
[什么情况下必须升级]
```

---

#### M2-001: 编写architect.md

| 属性 | 说明 |
|------|------|
| **任务ID** | M2-001 |
| **任务名称** | 编写架构师角色定义 |
| **预计时间** | 2小时 |
| **依赖** | M1-001, M1-004 |
| **产出** | agents/architect.md |

**详细规范**:

```markdown
# architect

## Role
负责把需求转成技术实现路径的架构设计专家。

## Responsibilities
- 明确模块边界与接口契约
- 识别依赖关系与技术风险
- 给出实施路线与任务拆分建议
- 形成design note文档

## Non-Responsibilities
- 大规模业务代码实现
- 最终测试闭环执行
- 最终验收拍板决策
- 发布准备与上线操作

## Inputs
- requirement / spec（需求规格）
- 当前milestone目标
- 相关代码上下文
- 已知约束条件
- 风险提示信息

## Outputs
- design_note（设计文档）
- implementation_plan（实施计划）
- dependency_list（依赖列表）
- risk_list（风险列表）
- task_split_suggestion（任务拆分建议）

## Default Skills
- requirement-to-design（必须）
- tradeoff-analysis（必须）
- interface-contract-design（推荐）
- context-summarization（common）

## Preferred Commands
- design-task
- evaluate-tradeoff

## Quality Gates
- [ ] 设计目标明确
- [ ] 模块边界清晰
- [ ] 接口输入输出定义完整
- [ ] 依赖关系列出
- [ ] 风险识别完整
- [ ] 可直接交给developer实现

## Escalation Conditions
- 目标边界完全不清
- 约束条件相互冲突
- 缺少关键上下文无法设计
- 多个方案trade-off无法自动选择
```

**验收标准**:
- [ ] 包含所有必要部分
- [ ] 职责边界清晰
- [ ] 与质量保障规范对齐

---

#### M2-002: 编写developer.md

| 属性 | 说明 |
|------|------|
| **任务ID** | M2-002 |
| **任务名称** | 编写开发者角色定义 |
| **预计时间** | 2小时 |
| **依赖** | M1-001, M1-004 |
| **产出** | agents/developer.md |

**详细规范**:

```markdown
# developer

## Role
负责完成代码层面具体实现的执行主力。

## Responsibilities
- 功能实现与bug修复
- 局部重构与代码优化
- 配置和脚本补齐
- 代码自检与实现总结
- 按设计文档落地

## Non-Responsibilities
- 重新定义需求范围
- 自行决定milestone通过
- 跳过测试与review直接放行
- 高层产品决策

## Inputs
- task_payload（任务载荷）
- design_note（设计文档，若需要）
- 相关代码上下文
- change_constraints（变更约束）
- 上轮失败信息（若为返工）

## Outputs
- changed_files（改动文件列表）
- implementation_summary（实现总结）
- self_check_note（自检结果）
- unresolved_issues（未解决问题）
- risks（风险列表）

## Default Skills
- feature-implementation（必须）
- bugfix-workflow（必须）
- code-change-selfcheck（必须）
- artifact-reading（common）
- execution-reporting（common）

## Preferred Commands
- implement-task
- fix-task
- refactor-task

## Quality Gates
- [ ] 实现目标对齐
- [ ] 未超范围改动
- [ ] changed_files列表完整
- [ ] 实现范围说明清晰
- [ ] 自检完成并记录
- [ ] 未隐瞒风险

## Escalation Conditions
- 依赖上下文缺失
- 环境或工具阻塞
- 设计与现状明显冲突无法自行裁定
- 约束条件无法同时满足
```

---

#### M2-003: 编写tester.md

| 属性 | 说明 |
|------|------|
| **任务ID** | M2-003 |
| **任务名称** | 编写测试者角色定义 |
| **预计时间** | 2小时 |
| **依赖** | M1-001, M1-004 |
| **产出** | agents/tester.md |

**详细规范**:

```markdown
# tester

## Role
负责为实现结果建立验证闭环的测试专家。

## Responsibilities
- 单测与集成测试设计
- 测试执行与回归分析
- 边界条件覆盖
- 失败复现与分类
- 测试报告输出

## Non-Responsibilities
- 修改大规模业务代码
- 决定需求范围
- 审查代码风格与架构合理性
- 产品功能取舍决策

## Inputs
- spec / acceptance_criteria（验收标准）
- implementation_summary（实现总结）
- changed_files（改动文件）
- known_risks（已知风险）
- historical_failure_patterns（历史失败模式）

## Outputs
- test_files（测试文件）
- test_report（测试报告）
- regression_result（回归结果）
- edge_case_matrix（边界条件矩阵）
- retryable_failure_analysis（可重试失败分析）

## Default Skills
- unit-test-design（必须）
- regression-analysis（必须）
- edge-case-matrix（推荐）
- failure-analysis（common）
- execution-reporting（common）

## Preferred Commands
- test-task
- regression-task
- verify-edge-cases

## Quality Gates
- [ ] 关键路径已覆盖
- [ ] 测试范围说明清晰
- [ ] pass/fail结论明确
- [ ] gap分析完整
- [ ] failure已分类
- [ ] 未用"感觉没问题"替代测试结论

## Escalation Conditions
- 无法复现失败
- 测试环境阻塞
- 发现设计缺陷需返工architect
- 连续测试失败超过阈值
```

---

#### M2-004: 编写reviewer.md

| 属性 | 说明 |
|------|------|
| **任务ID** | M2-004 |
| **任务名称** | 编写审查者角色定义 |
| **预计时间** | 2小时 |
| **依赖** | M1-001, M1-004 |
| **产出** | agents/reviewer.md |

**详细规范**:

```markdown
# reviewer

## Role
负责对实现结果进行独立审查的质量把关者。

## Responsibilities
- 代码审查与spec比对
- 风险审查与可维护性检查
- 放行或拒绝建议
- 可执行修改意见输出

## Non-Responsibilities
- 主导新功能代码实现
- 大规模补代码
- 替代tester完成测试闭环
- 重写全部设计

## Inputs
- diff / changed_files（代码差异）
- spec（规格说明）
- design_note（设计文档）
- test_result（测试结果）
- known_risk_list（已知风险列表）

## Outputs
- review_report（审查报告）
- issues_list（问题列表）
- approval_status（审批状态）
- actionable_change_requests（可执行修改请求）
- residual_risks（残余风险）

## Default Skills
- code-review-checklist（必须）
- spec-implementation-diff（必须）
- reject-with-actionable-feedback（必须）
- artifact-reading（common）
- execution-reporting（common）

## Preferred Commands
- review-task
- compare-spec-vs-code
- risk-review

## Quality Gates
- [ ] 有明确approve/reject/warn结论
- [ ] 区分must-fix和建议项
- [ ] 风险说明清晰
- [ ] 拒绝原因具体
- [ ] 给出可执行action_items

## Escalation Conditions
- 发现重大设计缺陷
- 安全风险超出能力范围
- spec与实现存在根本冲突
- 无法判断风险等级
```

---

### Phase 3: Common Skills实现

#### Common Skill任务通用说明

每个SKILL.md必须包含以下9部分结构：

```markdown
# [Skill Name]

## Purpose
[这个skill解决什么问题]

## When to Use
[适用场景]

## When Not to Use
[不适用场景]

## Inputs
[需要什么输入]

## Steps
[推荐执行步骤]

## Checklists
[检查清单]

## Common Failure Modes
[常见失败模式]

## Output Requirements
[输出要求]

## Examples
[示例]
```

---

#### M3-001: 实现artifact-reading skill

| 属性 | 说明 |
|------|------|
| **任务ID** | M3-001 |
| **任务名称** | 实现工件读取skill |
| **预计时间** | 2小时 |
| **依赖** | M1-005~007, M2-001~004 |
| **产出** | skills/common/artifact-reading/SKILL.md |
| **复用建议** | 可半复用 |
| **适合skill creator** | ❌ 不适合 |

**详细规范**:

```markdown
# artifact-reading

## Purpose
统一读取spec、design note、implementation summary、test report、review report等工件，并抽取出当前task真正需要的信息，确保所有角色对工件的理解一致。

## When to Use
- 收到dispatch payload后需要理解上游工件
- 需要从多个artifact中提取关键信息
- 需要验证artifact完整性
- 返工时需要理解失败上下文

## When Not to Use
- 工件不存在或无法访问时（应报BLOCKED）
- 工件格式明显不符合schema时（应报FAILED_ESCALATE）
- 仅需要简单文件读取时

## Inputs
- artifact_id 或 artifact_path
- artifact_type（可选，用于验证）
- 必需字段列表（可选）
- 上下文裁剪提示（可选）

## Steps
1. **验证工件存在性**
   - 检查artifact路径是否有效
   - 验证artifact_id是否存在
   - 返回MISSING_ARTIFACT错误（如不存在）

2. **解析工件格式**
   - 读取工件文件
   - 解析YAML/Markdown/JSON格式
   - 返回INVALID_FORMAT错误（如格式错误）

3. **提取关键字段**
   - 根据artifact_type确定必需字段
   - 提取summary/goal/scope等核心信息
   - 记录缺失的非必需字段

4. **生成结构化摘要**
   - 按统一格式输出摘要
   - 保留关键约束和风险
   - 标注未验证部分

5. **验证完整性**
   - 检查必需字段是否完整
   - 验证字段值是否有效
   - 记录完整性报告

## Checklists
- [ ] 工件路径/ID有效
- [ ] 工件格式正确
- [ ] 必需字段完整
- [ ] 关键信息已提取
- [ ] 摘要格式符合规范
- [ ] 缺失字段已标注

## Common Failure Modes
| 模式 | 原因 | 处理 |
|------|------|------|
| 工件不存在 | artifact_id错误或工件未生成 | 返回BLOCKED |
| 格式不匹配 | artifact格式与type不一致 | 返回FAILED_ESCALATE |
| 字段缺失 | 必需字段未填写 | 返回INCOMPLETE_OUTPUT |
| 理解偏差 | 角色自行解读而非统一读取 | 强制使用此skill |

## Output Requirements
```yaml
artifact_id: string
artifact_type: enum
read_status: enum  # SUCCESS|PARTIAL|FAILED
summary: string
key_fields:
  - field_name: string
    value: any
    confidence: enum  # HIGH|MEDIUM|LOW
missing_fields: string[]
warnings: string[]
read_at: datetime
```

## Examples
### Example 1: 读取design_note
```yaml
# 输入
artifact_id: design-note-001
artifact_type: design_note

# 输出
artifact_id: design-note-001
artifact_type: design_note
read_status: SUCCESS
summary: "实现用户登录API，包含认证、错误处理和会话管理"
key_fields:
  - field_name: goal
    value: "完成用户登录接口基础能力"
    confidence: HIGH
  - field_name: module_boundary
    value: "auth模块，涉及login/logout/session"
    confidence: HIGH
  - field_name: risks
    value: ["密码明文传输风险", "会话固定攻击风险"]
    confidence: MEDIUM
missing_fields: []
warnings: []
```

### Example 2: 工件不存在
```yaml
# 输入
artifact_id: spec-999
artifact_type: spec

# 输出
artifact_id: spec-999
artifact_type: spec
read_status: FAILED
summary: "工件不存在"
missing_fields: ["all"]
warnings: ["artifact_id 'spec-999' not found in artifact store"]
```
```

**验收标准**:
- [ ] 包含完整9部分结构
- [ ] Steps可执行
- [ ] Checklists完整
- [ ] Common Failure Modes覆盖主要失败场景
- [ ] 有完整示例

---

#### M3-002: 实现context-summarization skill

| 属性 | 说明 |
|------|------|
| **任务ID** | M3-002 |
| **任务名称** | 实现上下文裁剪skill |
| **预计时间** | 2小时 |
| **依赖** | M3-001 |
| **产出** | skills/common/context-summarization/SKILL.md |
| **复用建议** | 可半复用 |
| **适合skill creator** | ❌ 不适合 |

**核心要点**:
必须保留：
- task goal
- constraints
- expected_outputs
- retry_context（如有）
- 关键artifact摘要

必须丢弃：
- 无关项目历史
- 已完成任务详情
- 重复信息
- 过时上下文

---

#### M3-003: 实现failure-analysis skill

| 属性 | 说明 |
|------|------|
| **任务ID** | M3-003 |
| **任务名称** | 实现失败分析skill |
| **预计时间** | 3小时 |
| **依赖** | M3-001 |
| **产出** | skills/common/failure-analysis/SKILL.md |
| **复用建议** | 可半复用 |
| **适合skill creator** | ❌ 不适合 |

**核心输出**:
```yaml
failure_type: enum  # BUILD|TEST|REVIEW|VERIFICATION
root_cause: string
is_retryable: boolean
required_fixes: string[]
non_goals: string[]  # 返工时不允许扩大的范围
recommendation: enum  # RETRY|REWORK|REPLAN|ESCALATE
```

---

#### M3-004: 实现execution-reporting skill

| 属性 | 说明 |
|------|------|
| **任务ID** | M3-004 |
| **任务名称** | 实现执行报告skill |
| **预计时间** | 2小时 |
| **依赖** | M1-006 |
| **产出** | skills/common/execution-reporting/SKILL.md |
| **复用建议** | **必须自定义** |
| **适合skill creator** | ❌ 不适合 |

**核心要求**:
- 必须与execution-result.schema.yaml完全对齐
- 必须输出status/recommendation/summary/artifacts
- 必须处理escalation输出
- 禁止伪造完成状态

---

### Phase 4: 角色Skills实现

#### Skill实现优先级与策略

| Skill | 优先级 | 复用建议 | 适合skill creator | 必须绑定项 |
|-------|--------|----------|-------------------|------------|
| requirement-to-design | P0 | 可半复用 | ✅ 是 | design_note模板 |
| tradeoff-analysis | P0 | 可直接复用 | ✅ 是 | trade-off输出格式 |
| feature-implementation | P0 | 可半复用 | ✅ 是 | constraints/changed_files/self-check |
| bugfix-workflow | P0 | 可半复用 | ✅ 是 | 修复摘要/影响范围/回归点 |
| code-change-selfcheck | P0 | **必须自定义** | ❌ 否 | developer gate |
| unit-test-design | P0 | 可半复用 | ✅ 是 | test_report模板 |
| regression-analysis | P0 | 可半复用 | ✅ 是 | changed_files/risks |
| code-review-checklist | P0 | 可半复用 | ✅ 是 | review_report模板 |
| spec-implementation-diff | P0 | **必须自定义** | ❌ 否 | spec/design note结构 |
| reject-with-actionable-feedback | P0 | 可半复用 | ✅ 是 | 返工机制 |

#### M4-D03: 实现code-change-selfcheck skill（详细规范）

这是**必须自定义**的skill，直接对应developer gate。

```markdown
# code-change-selfcheck

## Purpose
要求developer在交付前完成最小自检，确保代码变更符合约束和期望，防止超范围改动和质量问题进入下游。

## When to Use
- developer完成代码实现后
- 提交execution result前
- 返工修复后重新交付前

## When Not to Use
- 非developer角色
- 未进行任何代码改动时

## Inputs
- changed_files: 改动文件列表
- task_goal: 任务目标
- constraints: 约束条件
- expected_outputs: 期望输出
- design_note: 设计文档（可选）

## Steps
1. **实现目标对齐检查**
   - 对比changed_files与task_goal
   - 验证是否达成核心目标
   - 记录未完成部分

2. **改动范围检查**
   - 列出所有changed_files
   - 检查是否有超出预期的改动
   - 验证是否与constraints冲突
   - 标注超范围改动（如有）

3. **依赖引入检查**
   - 检查是否引入新依赖
   - 验证是否被允许
   - 记录依赖变更理由

4. **关键路径自读检查**
   - 读取关键改动代码
   - 验证逻辑正确性
   - 检查边界条件处理
   - 记录可疑点

5. **与design_note一致性检查**（如有design_note）
   - 对比实现与设计
   - 记录偏差及原因
   - 判断是否需要architect确认

6. **风险自评**
   - 识别潜在风险
   - 评估风险等级
   - 记录已知未解问题

## Checklists
### 必检项
- [ ] task_goal是否达成？
- [ ] 是否有未声明的changed_files？
- [ ] 是否违反constraints？
- [ ] 是否引入新依赖？
- [ ] 关键路径是否正确？
- [ ] 边界条件是否处理？
- [ ] 是否有未披露的风险？

### 与design_note对齐（可选）
- [ ] 实现与设计是否一致？
- [ ] 偏差是否合理？
- [ ] 是否需要重新确认？

## Common Failure Modes
| 模式 | 原因 | 处理 |
|------|------|------|
| 超范围改动 | 改了constraints之外的文件 | 返回FAILED_RETRYABLE |
| 引入未授权依赖 | 新增依赖未被允许 | 返回FAILED_RETRYABLE |
| 目标未达成 | 核心功能未实现 | 返回PARTIAL |
| 隐瞒风险 | 已知问题未披露 | 返回FAILED_ESCALATE |
| 跳过自检 | 没有执行自检流程 | 返回BLOCKED |

## Output Requirements
```yaml
selfcheck_status: enum  # PASS|PASS_WITH_WARNINGS|FAIL
checks:
  - name: string
    result: enum  # PASS|FAIL|SKIP
    details: string
    files_affected: string[]
scope_verification:
  declared_files: string[]
  actual_files: string[]
  out_of_scope: string[]
  is_within_scope: boolean
dependency_changes:
  - name: string
    change_type: enum  # ADD|REMOVE|UPDATE
    reason: string
    is_authorized: boolean
design_deviation:
  has_deviation: boolean
  deviations:
    - description: string
      reason: string
      requires_confirmation: boolean
unresolved_issues: string[]
risks:
  - description: string
    level: enum  # LOW|MEDIUM|HIGH
    mitigation: string
recommendation: enum  # CONTINUE|REWORK|ESCALATE
```

## Examples
### Example 1: 自检通过
```yaml
selfcheck_status: PASS
checks:
  - name: goal_alignment
    result: PASS
    details: "登录API核心功能已实现"
    files_affected: ["src/auth/login.ts"]
  - name: scope_check
    result: PASS
    details: "所有改动在约束范围内"
    files_affected: []
scope_verification:
  declared_files: ["src/auth/login.ts", "src/auth/types.ts"]
  actual_files: ["src/auth/login.ts", "src/auth/types.ts"]
  out_of_scope: []
  is_within_scope: true
dependency_changes: []
design_deviation:
  has_deviation: false
unresolved_issues: []
risks: []
recommendation: CONTINUE
```

### Example 2: 超范围改动
```yaml
selfcheck_status: FAIL
checks:
  - name: scope_check
    result: FAIL
    details: "发现超范围改动"
    files_affected: ["src/utils/logger.ts"]
scope_verification:
  declared_files: ["src/auth/login.ts"]
  actual_files: ["src/auth/login.ts", "src/utils/logger.ts"]
  out_of_scope: ["src/utils/logger.ts"]
  is_within_scope: false
unresolved_issues:
  - "logger.ts改动不在任务范围内，但日志格式需统一"
recommendation: REWORK
```
```

---

### Phase 5: Commands实现

#### Command实现通用说明

每个command文件必须包含：

```markdown
# [command-name]

## Purpose
[命令用途]

## Applicable Role
[适用角色]

## Use Cases
[使用场景列表]

## Required Inputs
[必需输入字段]

## Expected Outputs
[期望输出字段]

## Constraints
[约束条件]

## Recommended Next Step
[推荐的下一步动作]

## Example Usage
[使用示例]
```

---

#### M5-001: 实现design-task command

```markdown
# design-task

## Purpose
架构师执行架构设计任务的入口命令，用于将需求规格转化为可执行的技术设计文档。

## Applicable Role
architect

## Use Cases
- 新feature需要架构设计
- 中大型功能需要技术方案
- 需要评估多个技术方案的trade-off
- 模块重构前的结构规划

## Required Inputs
| 字段 | 类型 | 说明 |
|------|------|------|
| spec | object | 需求规格对象 |
| milestone_goal | string | 当前里程碑目标 |
| constraints | array | 已知约束条件 |
| code_context | object | 相关代码上下文（可选） |

## Expected Outputs
| 输出 | 类型 | 说明 |
|------|------|------|
| design_note | artifact | 设计文档 |
| task_split | object | 任务拆分建议 |
| risk_list | array | 风险列表 |
| implementation_order | array | 实施顺序建议 |

## Constraints
- 不得跳过风险识别
- 设计必须可执行
- 必须给出实施顺序
- 超出能力范围必须升级

## Recommended Next Step
- 若design_note完整 → 推荐派发给developer执行implement-task
- 若存在trade-off需决策 → 推荐执行evaluate-tradeoff
- 若缺少关键上下文 → 推荐升级请求更多信息

## Example Usage
```yaml
# 输入dispatch payload
dispatch_id: dsp-001
role: architect
command: design-task
title: 用户登录模块架构设计
goal: 完成用户登录模块的技术方案设计
context:
  spec_summary: "实现用户登录功能，支持用户名密码和OAuth登录"
  milestone_goal: "完成用户认证基础能力"
constraints:
  - 不修改现有用户表结构
  - 复用现有session管理模块
  - 支持多端登录

# 期望输出
status: SUCCESS
artifacts:
  - artifact_type: design_note
    title: 用户登录模块设计文档
    summary: "包含认证流程、接口定义、错误处理方案"
recommendation: SEND_TO_DEVELOPER
```
```

---

### Phase 6: Templates实现

#### Template实现通用说明

每个template文件必须包含：
1. 模板用途说明
2. 字段定义
3. 必填/可选标注
4. 字段示例值

---

#### M6-001: 实现design-note.md模板

```markdown
# Design Note

## 元信息
| 字段 | 值 |
|------|-----|
| 设计任务ID | {{task_id}} |
| 设计者 | {{created_by_role}} |
| 创建时间 | {{created_at}} |
| 版本 | {{version}} |

---

## 1. 设计目标
{{goal}}

## 2. 当前上下文
{{context_summary}}

## 3. 假设与约束
### 假设
{{assumptions}}

### 约束
{{constraints}}

---

## 4. 设计方案

### 4.1 模块边界
{{module_boundary}}

### 4.2 接口契约
{{interface_contract}}

### 4.3 数据流
{{data_flow}}

### 4.4 错误处理
{{error_handling}}

---

## 5. 依赖关系
{{dependencies}}

## 6. 风险识别
| 风险 | 等级 | 缓解措施 |
|------|------|----------|
{{risks}}

---

## 7. 实施顺序建议
{{implementation_order}}

## 8. 任务拆分建议
{{task_split_suggestion}}

---

## 附录
### A. 相关文档
{{related_docs}}

### B. 决策记录
{{decision_log}}
```

**字段说明**:

| 字段 | 必填 | 说明 |
|------|------|------|
| goal | ✅ 是 | 设计目标，来自task.goal |
| context_summary | ✅ 是 | 当前上下文摘要 |
| assumptions | ⬜ 否 | 设计假设，默认可写"无特殊假设" |
| constraints | ✅ 是 | 来自task.constraints |
| module_boundary | ✅ 是 | 模块边界定义 |
| interface_contract | ✅ 是 | 接口输入输出定义 |
| data_flow | ⬜ 否 | 数据流图或描述 |
| error_handling | ⬜ 否 | 错误处理策略 |
| dependencies | ✅ 是 | 依赖关系列表 |
| risks | ✅ 是 | 至少列出主要风险 |
| implementation_order | ✅ 是 | 实施步骤 |
| task_split_suggestion | ✅ 是 | 任务拆分建议 |

---

### Phase 7: Rules实现

#### Rule实现通用说明

每个rule文件必须包含：
1. 规则目的
2. 适用范围
3. 约束条件
4. 违反后果
5. 检查方式

---

#### M7-001: 实现execution-contract.md

```markdown
# Execution Contract

## 规则目的
确保所有角色输出统一格式的execution result，使OpenClaw管理层能够稳定intake和处理执行结果。

## 适用范围
所有OpenCode专家角色（architect/developer/tester/reviewer/docs/security）

## 约束条件

### 必须遵守
1. **输出统一result格式**
   - 必须包含dispatch_id/project_id/milestone_id/task_id
   - 必须包含status字段，值为枚举值之一
   - 必须包含summary，简要说明执行结果
   - 必须包含recommendation，建议后续动作

2. **不得伪造完成状态**
   - 禁止未验证就声称完成
   - 禁止隐瞒已知问题
   - 禁止跳过必要的检查步骤

3. **必须显式输出未完成部分**
   - 若有未完成项，必须在issues_found中列出
   - 若有风险，必须在risks中列出
   - 若需要后续动作，必须在followup_suggestions中说明

4. **遇到阻塞必须显式输出**
   - 若无法继续执行，status必须为BLOCKED或FAILED_*
   - 必须在escalation中说明阻塞原因
   - 必须给出recommended_next_steps

### 状态枚举
| 状态 | 含义 |
|------|------|
| SUCCESS | 执行成功，可进入下游 |
| SUCCESS_WITH_WARNINGS | 执行成功但有警告 |
| PARTIAL | 部分完成，需补充 |
| BLOCKED | 遇到阻塞，无法继续 |
| FAILED_RETRYABLE | 失败但可重试 |
| FAILED_ESCALATE | 失败需升级 |

### 推荐枚举
| 推荐 | 含义 |
|------|------|
| CONTINUE | 可继续下一阶段 |
| SEND_TO_TEST | 需进入测试 |
| SEND_TO_REVIEW | 需进入审查 |
| REWORK | 需要返工 |
| REPLAN | 需要重规划 |
| ESCALATE | 需要升级 |

## 违反后果
- 检测到违反时，result将被标记为无效
- 角色需重新提交符合规范的result
- 连续违反将触发角色质量审计

## 检查方式
1. Schema校验：使用execution-result.schema.yaml校验
2. 字段完整性检查：验证必填字段存在
3. 枚举值检查：验证status和recommendation为有效值
4. 一致性检查：验证dispatch_id与输入payload一致
```

---

## 第二部分：角色定义详细模板

### architect.md 完整模板

见上文M2-001。

### developer.md 完整模板

见上文M2-002。

### tester.md 完整模板

见上文M2-003。

### reviewer.md 完整模板

见上文M2-004。

---

## 第三部分：Command规范汇总

### architect commands

| Command | 用途 | 必需输入 | 期望输出 |
|---------|------|----------|----------|
| design-task | 执行架构设计 | spec, constraints | design_note, task_split |
| evaluate-tradeoff | 评估技术方案 | options, criteria | tradeoff_report |

### developer commands

| Command | 用途 | 必需输入 | 期望输出 |
|---------|------|----------|----------|
| implement-task | 执行功能实现 | task_goal, constraints | changed_files, summary |
| fix-task | 执行bug修复 | bug_info, context | changed_files, summary |
| refactor-task | 执行代码重构 | refactor_scope | changed_files, summary |

### tester commands

| Command | 用途 | 必需输入 | 期望输出 |
|---------|------|----------|----------|
| test-task | 执行测试 | test_scope, code_context | test_report |
| regression-task | 执行回归测试 | changed_files | regression_result |

### reviewer commands

| Command | 用途 | 必需输入 | 期望输出 |
|---------|------|----------|----------|
| review-task | 执行代码审查 | diff, spec | review_report |
| compare-spec-vs-code | 对比spec与实现 | spec, code | diff_report |

---

## 第四部分：Template字段定义汇总

### design-note.md

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| goal | string | ✅ | 设计目标 |
| context_summary | string | ✅ | 上下文摘要 |
| assumptions | string[] | ⬜ | 设计假设 |
| constraints | string[] | ✅ | 约束条件 |
| module_boundary | string | ✅ | 模块边界 |
| interface_contract | object | ✅ | 接口定义 |
| dependencies | string[] | ✅ | 依赖列表 |
| risks | object[] | ✅ | 风险列表 |
| implementation_order | string[] | ✅ | 实施顺序 |
| task_split_suggestion | object | ✅ | 任务拆分建议 |

### implementation-summary.md

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| implementation_goal | string | ✅ | 实现目标 |
| actual_changes | string | ✅ | 实际改动描述 |
| changed_files | string[] | ✅ | 改动文件列表 |
| design_deviation | string | ⬜ | 与设计偏差说明 |
| self_check_result | object | ✅ | 自检结果 |
| unresolved_issues | string[] | ⬜ | 未解决问题 |
| risks | string[] | ⬜ | 风险列表 |

### test-report.md

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| test_scope | string | ✅ | 测试范围 |
| tests_added | string[] | ✅ | 新增测试列表 |
| tests_run | object | ✅ | 执行测试统计 |
| pass_fail_summary | object | ✅ | 通过/失败统计 |
| uncovered_gaps | string[] | ✅ | 覆盖缺口 |
| edge_cases_checked | string[] | ⬜ | 边界条件列表 |
| retry_suggestion | string | ⬜ | 重试建议 |

### review-report.md

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| overall_decision | enum | ✅ | approve/reject/warn |
| must_fix_issues | object[] | ✅ | 必须修复问题 |
| non_blocking_issues | object[] | ⬜ | 非阻塞问题 |
| residual_risks | string[] | ⬜ | 残余风险 |
| action_items | string[] | ✅ | 可执行修改建议 |

---

## 第五部分：Rule约束条件汇总

### global/execution-contract.md
- 所有角色必须输出统一result格式
- 不得伪造完成状态
- 必须显式输出未完成部分
- 遇到阻塞必须显式输出

### global/artifact-format.md
- artifact命名规范：`{type}-{id}-{version}.{ext}`
- 路径规范：`artifacts/{type}/{filename}`
- summary必须简要准确

### global/escalation-rules.md
- 连续返工超限必须升级
- 高风险问题必须升级
- 无法自动决策必须升级
- 范围与目标冲突必须升级

### coding/change-scope-policy.md
- developer不得超范围改动
- 改动文件必须在changed_files中声明
- 超范围改动需返回FAILED_RETRYABLE

### coding/dependency-policy.md
- 新依赖引入需明确理由
- 高风险依赖需security review
- 未授权依赖不得引入

### testing/testing-policy.md
- 关键路径必须覆盖
- 失败必须分类
- gap必须说明

### review/review-bar.md
- must-fix必须明确
- 区分must-fix与建议项
- 拒绝必须给出可执行建议

### docs/documentation-policy.md
- 用户可见变更必须同步文档
- API变更必须更新文档
- 重要功能必须更新README

---

## 第六部分：Example示例规范

### dispatch示例规范

每个dispatch示例必须包含：
1. 完整的必填字段
2. 合理的任务描述
3. 清晰的约束条件
4. 明确的期望输出

### result示例规范

每个result示例必须包含：
1. 完整的状态信息
2. artifacts输出
3. recommendation建议
4. 真实场景模拟

### artifact示例规范

每个artifact示例必须：
1. 符合对应template格式
2. 内容真实可用
3. 作为可直接参考的样例