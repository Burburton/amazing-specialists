# Gate Validation Method

> **版本**: 1.0.0  
> **来源**: `quality-gate.md` Section 1-7  
> **用途**: 定义质量门禁验证的执行方法、流程和规则  
> **对齐文档**: `quality-gate.md`, `quality-gate-checklist.md`

---

## 1. 概述

### 1.1 目的
本文档定义质量门禁验证的标准化执行方法，确保：
- 所有角色输出经过一致的质量评估
- 验证流程可追溯、可审计
- 失败处理有明确的规则和路径

### 1.2 适用范围
- 所有执行层角色输出（architect/developer/tester/reviewer/docs/security）
- Task-level 和 Milestone-level 验收
- 文档同步检查
- 人工审查

### 1.3 验证类型

| 类型 | 适用场景 | 执行者 |
|------|----------|--------|
| 自检 (Self-Check) | 角色输出完成后 | 输出角色自身 |
| 角色门禁 (Role Gate) | 角色交接前 | 接收角色或系统 |
| 验收检查 (Acceptance) | task/milestone 完成时 | reviewer/operator |
| 文档同步 (Doc Sync) | governance 影响时 | docs/operator |

---

## 2. 验证执行流程

### 2.1 通用验证流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    验证执行流程                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: 识别验证上下文                                          │
│  ├─ 确定输出所属角色                                             │
│  ├─ 确定验证时机（task/milestone/交接）                          │
│  └─ 确定触发条件（是否需文档同步检查）                            │
│                                                                 │
│  Step 2: 准备验证材料                                            │
│  ├─ 获取输出文档/artifact                                        │
│  ├─ 获取上游 spec/plan/task                                     │
│  ├─ 准备检查清单（quality-gate-checklist.md）                    │
│  └─ 准备验证记录表                                               │
│                                                                 │
│  Step 3: 执行检查                                                │
│  ├─ 执行通用门禁检查（UG-* 检查项）                               │
│  ├─ 执行角色专属检查（RG-* 检查项）                               │
│  ├─ 执行验收层检查（如适用，AG-* 检查项）                         │
│  ├─ 执行文档同步检查（如适用，DG-* 检查项）                       │
│  └─ 记录每项检查结果（Pass/Fail + 严重级别）                      │
│                                                                 │
│  Step 4: 汇总结果                                                │
│  ├─ 统计各级别问题数量                                           │
│  ├─ 判定总体状态                                                 │
│  └─ 生成验证报告                                                 │
│                                                                 │
│  Step 5: 处理结果                                                │
│  ├─ Pass: 标记通过，允许下游交接                                  │
│  ├─ Fail: 触发返工/升级流程                                      │
│  └─ 记录验证历史                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 各验证类型执行步骤

#### 2.2.1 自检 (Self-Check) 流程

**执行时机**: 角色完成输出后，提交前

**步骤**:
1. 角色完成输出（设计/代码/测试/审查/文档/安全报告）
2. 获取对应角色专属检查清单
3. 逐项检查输出是否满足检查项
4. 记录检查结果（checks_performed 字段）
5. 识别问题，修复或记录为 open issues
6. 确认无 S3 blocker 后提交

**产出**: self-check result 记录在输出文档中

---

#### 2.2.2 角色门禁 (Role Gate) 流程

**执行时机**: 角色交接前（architect → developer, developer → tester 等）

**步骤**:
1. 接收角色获取上游角色输出
2. 执行通用门禁检查（UG-*）
3. 执行角色专属检查（上游角色对应的 RG-*）
4. 汇总检查结果
5. **Pass**: 接收输出，开始本角色工作
6. **Fail**: 生成 ReworkRequest，返回上游角色

**产出**: 门禁验证记录（记录在交接文档或 execution report）

---

#### 2.2.3 Task-Level Acceptance 流程

**执行时机**: task 完成后，进入下一个 task 或 milestone 前

**步骤**:
1. 确认 task 状态为 DONE/VERIFIED
2. 检查 required outputs 存在
3. 检查角色门禁通过
4. 检查无 must-fix 问题
5. 检查风险在可接受范围
6. 判定状态（见 Section 3.1）
7. 记录验证结果

**产出**: task-level acceptance status

---

#### 2.2.4 Milestone-Level Acceptance 流程

**执行时机**: milestone 所有 task 完成后

**步骤**:
1. 确认里程碑主要目标达成
2. 检查所有 required tasks 通过 task-level gate
3. 检查关键验证通过（build/test/review）
4. 检查无 critical/high security issue
5. 检查用户侧文档已同步
6. 检查 acceptance criteria 覆盖度（80%+）
7. 按任务类型执行专项检查（architecture/implementation/test/review/docs/security）
8. 判定状态（见 Section 3.2）
9. 记录验证结果

**产出**: milestone-level acceptance status

---

#### 2.2.5 文档同步检查流程

**执行时机**: feature 完成时，检查是否影响 governance

**步骤**:
1. 检查触发条件（DG-TG-*）
2. 如无触发条件，标记"无需检查"，通过
3. 如有触发条件，执行 Governance Documents 检查
4. 检查术语一致性（DG-CHK-001）
5. 检查变更同步（DG-CHK-002）
6. 检查描述一致性（DG-CHK-003）
7. 检查迁移一致性（DG-CHK-004）
8. 检查链接有效性（DG-CHK-005）
9. 判定 Pass/Fail
10. 如 Fail，阻止 milestone 验收

**产出**: 文档同步检查报告

---

## 3. 状态判定规则

### 3.1 Task-Level 状态判定

| 状态 | 条件 | 后续动作 |
|------|------|----------|
| **TASK_ACCEPTED** | 所有检查通过 | 进入下一个 task 或 milestone 验收 |
| **TASK_ACCEPTED_WITH_WARNINGS** | 主目标达成，存在非阻塞性问题（S1/S0） | 进入下游，记录 warnings |
| **TASK_REWORK_REQUIRED** | 存在 S2 问题，可局部修复 | 生成 ReworkRequest，返回原角色 |
| **TASK_REPLAN_REQUIRED** | task 定义有问题（如 goal 不清晰、scope 错误） | 生成 ReplanRequest，升级规划层 |
| **TASK_ESCALATED** | 风险高、S3 问题、或多轮返工失败（>2次） | 生成 Escalation，升级决策层 |

### 3.2 Milestone-Level 状态判定

| 状态 | 条件 | 后续动作 |
|------|------|----------|
| **MILESTONE_ACCEPTED** | 所有检查通过，风险可接受 | 进入用户验收阶段 |
| **MILESTONE_ACCEPTED_WITH_WARNINGS** | 主要目标达成，有次要遗留（非阻塞） | 进入用户验收，记录 warnings |
| **MILESTONE_REWORK_REQUIRED** | 存在可局部弥补的问题 | 返回执行层修复 |
| **MILESTONE_REPLANNING_REQUIRED** | 里程碑范围不合理 | 升级规划层重新规划 |
| **MILESTONE_ESCALATED** | 存在需要用户决策的问题 | 升级用户，等待决策 |

---

## 4. 失败处理规则

### 4.1 返工 (Rework) 触发条件

| 触发条件 | 严重级别 | 返工类型 |
|----------|----------|----------|
| 缺少关键字段（artifacts、risks） | S2 | 标准 Rework |
| 术语混用导致歧义 | S2 | 标准 Rework |
| 与上游 spec 轻微冲突 | S2 | 标准 Rework |
| 自检缺失 | S2 | 标准 Rework |
| 缺少必备输出 | S2 | 标准 Rework |
| 格式问题导致无法消费 | S3（可修复） | 标准 Rework |

### 4.2 返工请求格式 (ReworkRequest)

```markdown
# ReworkRequest

## 基本信息
- **Request ID**: RR-[task-id]-[sequence]
- **Task ID**: [原 task id]
- **触发时间**: [ISO 8601 时间]
- **接收角色**: [返工接收者角色]

## Failed Checks
| Check ID | Description | Severity | Evidence |
|----------|-------------|----------|----------|
| [检查项ID] | [问题描述] | [S2/S3] | [具体证据/位置] |

## Required Fixes
- [ ] [必须修复项 1]
- [ ] [必须修复项 2]
- [ ] [必须修复项 3]

## Non-Goals（返工范围限制）
- 不要改动 [不在范围内的内容]
- 不引入 [不应引入的变更]

## Retry Count
- 当前返工次数: [N]
- 上限: 2（普通 task）

## 预期交付
- 修复后重新提交的输出
- 返工完成时间: [预期时间]
```

### 4.3 升级 (Escalation) 触发条件

| 触发条件 | 说明 |
|----------|------|
| S3 级别结构性问题 | 如伪造验证结果、严重与 spec 冲突 |
| 返工超过阈值 | 普通 task 超过 2 次返工仍未通过 |
| 角色无法判断的 trade-off | 需要决策层介入 |
| governance 文档根本性矛盾 | S3 级别文档不一致 |
| 风险超出可接受范围 | 需要用户拍板 |

### 4.4 升级请求格式 (Escalation)

```markdown
# Escalation

## 基本信息
- **Escalation ID**: ESC-[task-id]-[sequence]
- **来源 Task**: [原 task id]
- **触发时间**: [ISO 8601 时间]
- **升级层级**: [决策层/管理层/用户]

## 问题概述
[简要描述为什么需要升级，无法自动处理的原因]

## 上下文
- 输出文档: [链接]
- 上游 spec/plan: [链接]
- 相关 artifacts: [链接]
- 返工历史: [如有多轮返工，列出历史]

## 决策选项
### Option A: [选项名称]
- 描述: [选项描述]
- 代价: [代价评估]
- 推荐度: [高/中/低]

### Option B: [选项名称]
- 描述: [选项描述]
- 代价: [代价评估]
- 推荐度: [高/中/低]

### Option C: [选项名称]
- 描述: [选项描述]
- 代价: [代价评估]
- 推荐度: [高/中/低]

## 阻塞影响
- 受阻塞的下游任务: [列出]
- 时间影响: [评估]
- 其他影响: [评估]

## 建议
[验证者的建议，包括推荐选项和理由]

## 等待决策
- 决策者: [角色/人]
- 截止时间: [如有]
```

---

## 5. 验证报告格式

### 5.1 验证报告模板

```markdown
# Gate Validation Report

## 基本信息
- **Report ID**: VR-[验证对象]-[日期]
- **验证对象**: [task-id / milestone-id / artifact-id]
- **验证类型**: [自检/角色门禁/验收/文档同步]
- **验证时间**: [ISO 8601 时间]
- **验证者**: [角色或系统]

## 验证范围
- 输出文档: [文档链接]
- 上游依赖: [spec/plan/task 链接]
- 检查清单版本: quality-gate-checklist-v1

## 检查结果汇总

### 通用门禁 (Universal Gate)
| 类别 | Pass | Fail (S1) | Fail (S2) | Fail (S3) |
|------|------|-----------|-----------|-----------|
| Completeness | [N] | [N] | [N] | [N] |
| Consistency | [N] | [N] | [N] | [N] |
| Traceability | [N] | [N] | [N] | [N] |
| Format | [N] | [N] | [N] | [N] |
| **合计** | **[N]** | **[N]** | **[N]** | **[N]** |

### 角色专属检查 (Role Gate)
| 角色 | Pass | Fail (S1) | Fail (S2) | Fail (S3) |
|------|------|-----------|-----------|-----------|
| [角色名] | [N] | [N] | [N] | [N] |

### 验收层检查 (Acceptance Gate)
- Task-Level: [状态]
- Milestone-Level: [状态]

### 文档同步检查 (Doc Sync)
- 触发条件: [是/否]
- 检查结果: [Pass/Fail/N/A]

## 详细问题列表

### S3 级别问题 (Critical)
| ID | 检查项 | 问题描述 | 位置 | 处理建议 |
|----|--------|----------|------|----------|
| [ID] | [名称] | [问题] | [位置] | [建议] |

### S2 级别问题 (Major)
| ID | 检查项 | 问题描述 | 位置 | 处理建议 |
|----|--------|----------|------|----------|
| [ID] | [名称] | [问题] | [位置] | [建议] |

### S1 级别问题 (Minor)
| ID | 检查项 | 问题描述 | 位置 | 处理建议 |
|----|--------|----------|------|----------|
| [ID] | [名称] | [问题] | [位置] | [建议] |

## 状态判定
- **判定结果**: [TASK_ACCEPTED / TASK_REWORK_REQUIRED / ...]
- **判定依据**: [基于哪些条件做出判定]

## 后续动作
- [动作 1]
- [动作 2]

## 验证历史
| 序号 | 时间 | 验证结果 | 验证者 |
|------|------|----------|--------|
| 1 | [时间] | [结果] | [角色] |

---
- **验证者签名**: [角色名]
- **验证完成时间**: [ISO 8601 时间]
```

### 5.2 简化报告格式（自检用）

```markdown
# Self-Check Result

## 基本信息
- **Task ID**: [task-id]
- **角色**: [角色名]
- **检查时间**: [ISO 8601 时间]

## Checks Performed
- [x] UG-001: 必填字段全部存在
- [x] UG-002: artifacts 列表存在
- [x] RG-A-001: design summary 存在且清晰
- [ ] RG-A-010: 技术 trade-off 已说明 → **缺失，已补充**

## Issues Found
- 无 S3/S2 级别问题
- S1 问题 1: trade-off 未说明 → 已在补充 section 中修复

## Recommendation
- 输出完整，可提交下游
```

---

## 6. 验证时机

### 6.1 验证时机矩阵

| 验证时机 | 验证类型 | 执行者 | 强制性 |
|----------|----------|--------|--------|
| 角色输出完成后 | 自检 | 输出角色 | 必须 |
| 角色交接前 | 角色门禁 | 接收角色 | 必须 |
| task 状态转为 DONE 后 | Task Acceptance | reviewer | 必须 |
| milestone 所有 task 完成后 | Milestone Acceptance | reviewer | 必须 |
| feature 完成前 | 文档同步检查 | docs/reviewer | 条件性（如触发） |

### 6.2 验证时机详细说明

#### Task-Level 验证时机

1. **自检时机**: developer 完成 implementation 后，提交前
2. **角色门禁时机**: architect → developer 交接前
3. **验收时机**: task 状态更新为 DONE 后，进入下一个 task 前

#### Milestone-Level 验证时机

1. **所有 required tasks 完成后**
2. **关键验证通过后**（build/test/review）
3. **文档同步完成后**（如需要）
4. **进入用户验收前**

---

## 7. 与 quality-gate.md 对齐说明

### 7.1 来源映射

| 本文档 Section | quality-gate.md 来源 |
|----------------|----------------------|
| Section 2 验证执行流程 | Section 1, 3, 4, 5 |
| Section 3 状态判定规则 | Section 4.1, 4.2 |
| Section 4 失败处理规则 | Section 7 |
| Section 5 验证报告格式 | Section 6 (Review Checklist) |
| Section 6 验证时机 | Section 4.1, 4.2 |
| Section 7 对齐说明 | 全文档 |

### 7.2 术语对齐

| 本文档术语 | quality-gate.md 定义 |
|-----------|---------------------|
| S0/S1/S2/S3 | Section 2.1 执行层严重级别 |
| blocker/major/minor/note | Section 2.2 审计层严重级别 |
| TASK_ACCEPTED 等 | Section 4.1 状态判定 |
| MILESTONE_ACCEPTED 等 | Section 4.2 状态判定 |
| ReworkRequest | Section 7.1 返工 |
| Escalation | Section 7.3 升级人工审阅 |

### 7.3 检查清单引用

- 所有检查项编号引用 `quality-gate-checklist.md`
- UG-* → 通用门禁检查
- RG-* → 角色专属检查
- AG-* → 验收层检查
- DG-* → 文档同步检查
- RC-* → 人工审查检查

---

## 8. 验证度量指标

> **来源**: `quality-gate.md` Section 8

### 8.1 全局指标

| 指标 | 定义 | 目标 |
|------|------|------|
| task 一次通过率 | 首次执行即通过 gate 的比例 | >80% |
| milestone 一次通过率 | milestone 首次验收通过的比例 | >90% |
| 自动返工收敛率 | 返工后通过的比例 | >95% |
| escalation 触发率 | 需要升级处理的比例 | <5% |
| artifact 完整率 | 输出包含所有必需 artifact 的比例 | 100% |

### 8.2 角色指标

| 角色 | 指标 | 定义 |
|------|------|------|
| architect | design adopted rate | 设计被直接采用率 |
| architect | design rework rate | 设计返工率 |
| architect | boundary ambiguity rate | 边界模糊率 |
| developer | review reject rate | review 拒绝率 |
| developer | test fail rate | 测试失败率 |
| developer | out-of-scope change rate | 超范围改动率 |
| tester | key-path coverage rate | 关键路径覆盖率 |
| tester | reproducible failure rate | 可复现失败率 |
| tester | false confidence rate | 假阳性率 |
| reviewer | actionable review rate | 可执行审查意见率 |
| reviewer | must-fix miss rate | must-fix 漏检率 |
| reviewer | re-review pass rate | 返工后审查通过率 |
| docs | doc sync completeness | 文档同步完整率 |
| docs | docs drift rate | 文档与实际偏差率 |
| security | severity classification accuracy | 严重性分类准确率 |
| security | blocker detection rate | 阻断问题发现率 |

---

## 附录 A: 返工次数上限

| Task 类型 | 返工上限 | 说明 |
|-----------|----------|------|
| 普通 task | 2 次 | 超过 2 次触发升级 |
| 高风险 task | 1 次 | 安全相关、架构关键 task |
| 中高风险 task | 1 次 | 核心功能实现 |

---

## 附录 B: 验证角色职责

| 角色 | 验证职责 |
|------|----------|
| architect | 自检设计输出，验证设计可执行性 |
| developer | 自检实现输出，验证代码正确性 |
| tester | 自检测试输出，验证测试覆盖 |
| reviewer | 执行验收检查，生成验证报告 |
| docs | 执行文档同步检查，验证文档一致性 |
| security | 自检安全输出，验证安全问题识别 |

---

## 文档信息

- **文档 ID**: gate-validation-method-v1
- **版本**: 1.0.0
- **创建日期**: 2026-03-27
- **来源文档**: `quality-gate.md`
- **关联清单**: `quality-gate-checklist.md`
- **Feature**: 009-command-hardening (T-3.2)