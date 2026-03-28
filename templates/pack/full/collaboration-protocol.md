# Collaboration Protocol

本文件定义 OpenCode 专家包与 OpenClaw 管理层之间的协作协议，包括角色间交接规则、阻塞条件、重试规则和升级流程。

---

## Protocol Name
OpenCode Expert Pack Collaboration Protocol

## Purpose
定义该专家包如何与 OpenClaw 管理层协作，确保任务在管理层与执行层之间顺畅流转，明确交接条件、阻塞场景和升级路径。

---

## Upstream Inputs（上游输入）

专家包从以下上游接收输入：

### 1. OpenClaw 管理层 - Dispatch Coordinator
**提供内容：**
- Dispatch Payload（统一任务包）
- requirement / spec / milestone / task 对象
- 执行上下文和约束条件
- 失败时的 Rework Request

**交接触发：**
- task 状态为 READY / TODO / ASSIGNED
- task 依赖已满足
- 无阻塞标记（BLOCKED / ESCALATED）

### 2. OpenClaw 管理层 - Acceptance & Recovery Coordinator
**提供内容：**
- Rework Request（返工请求）
- Replan Request（重规划请求）
- Escalation Response（升级响应）

**交接触发：**
- 上一轮执行失败
- 需要返工或重规划
- 用户做出决策后恢复执行

---

## Downstream Outputs（下游输出）

专家包向以下下游输出结果：

### 1. OpenClaw 管理层 - Acceptance & Recovery Coordinator
**接收内容：**
- Execution Result（执行结果）
- Artifacts（工件）
- Escalation（升级请求）

**消费方式：**
- 根据 status 和 recommendation 做流程决策
- 验证 artifacts 是否满足验收标准
- 处理 escalation

### 2. 下游角色（角色间协作）
**architect -> developer:**
- 输出：design_note, interface contract
- 触发：design 通过 quality gate

**developer -> tester:**
- 输出：code changes, implementation_summary
- 触发：代码完成并通过自检

**developer/tester -> reviewer:**
- 输出：code diff, test_report
- 触发：测试完成

**reviewer -> developer (返工):**
- 输出：review_report, change request
- 触发：review 发现 must-fix 问题

**reviewer -> docs:**
- 输出：review_report（通过状态）
- 触发：review approve

**security -> acceptance:**
- 输出：security_report
- 触发：高风险任务安全检查完成

---

## Hand-off Rules（交接规则）

### 通用交接规则

1. **必须通过 quality gate**
   - 输出必须通过对应角色的 role gate
   - 无 S3 级别问题
   - S2 级别问题不超过 2 个

2. **必须包含完整上下文**
   - 上游 artifacts 已引用
   - assumptions 已记录
   - risks 已说明

3. **必须有明确 recommendation**
   - CONTINUE / SEND_TO_TEST / SEND_TO_REVIEW / REWORK / REPLAN / ESCALATE

### 具体角色交接规则

#### architect -> developer
**交接条件：**
- [ ] design note 通过 architect gate
- [ ] module boundary 清晰
- [ ] interface contract 完整
- [ ] risks 已识别
- [ ] implementation order 可执行

**交接产物：**
- design_note artifact
- interface contract
- risk list

#### developer -> tester
**交接条件：**
- [ ] 代码变更完成
- [ ] 通过 developer gate
- [ ] 自检结果已记录
- [ ] build 通过（如适用）

**交接产物：**
- implementation_summary
- code_diff_summary
- changed_files list

#### developer/tester -> reviewer
**交接条件：**
- [ ] 测试执行完成
- [ ] 通过 tester gate
- [ ] test_report 存在
- [ ] pass/fail 结论明确

**交接产物：**
- test_report
- code changes
- implementation_summary

#### reviewer -> 下游 (approve)
**交接条件：**
- [ ] review 通过 reviewer gate
- [ ] overall decision 为 approve 或 warn
- [ ] must-fix issues 为空或已修复
- [ ] 风险可接受

**交接产物：**
- review_report
- approval decision
- residual risks

#### reviewer -> developer (reject)
**交接条件：**
- [ ] overall decision 为 reject
- [ ] must-fix issues 已列出
- [ ] actionable suggestions 已给出

**交接产物：**
- Rework Request
- review_report
- change request list

---

## Blocking Conditions（阻塞条件）

以下情况必须阻塞，不得进入下游：

### 输入阻塞
- [ ] **缺少 spec**: 没有 requirement 或 spec
- [ ] **缺少 design**: 需要 architect 但未输出 design note
- [ ] **plan 与 spec 冲突**: 实现方案与规格冲突
- [ ] **task 缺少 requirement traceability**: 无法追溯到需求
- [ ] **高风险 assumption 未确认**: critical assumption 未验证

### 输出阻塞
- [ ] **artifact 缺失**: 缺少必需工件
- [ ] **output 格式不合规**: 不符合 schema
- [ ] **未生成 expected outputs**: 承诺的输出未完成
- [ ] **S3 级别问题存在**: critical 质量问题
- [ ] **超过 3 个 S2 级别问题**: 影响下游的严重问题

### 流程阻塞
- [ ] **依赖未满足**: 上游 task 未完成
- [ ] **task 状态为 BLOCKED**: 被标记为阻塞
- [ ] **project 状态为 PAUSED**: 项目暂停
- [ ] **存在未处理 Escalation**: 升级未解决

### 安全阻塞
- [ ] **critical security issue**: 存在 critical 级别安全问题
- [ ] **high security issue 未修复**: 未修复 high 级别安全问题（除非明确接受风险）
- [ ] **涉及认证/权限但未过 security**: 高风险任务缺少 security 检查

---

## Retry Rules（重试规则）

### 返工次数限制

| task 类型 | 最大返工次数 | 说明 |
|-----------|-------------|------|
| 普通 task | 2 | 第 3 次失败必须升级 |
| 中风险 task | 1 | 第 2 次失败必须升级 |
| 高风险 task | 1 | 优先升级 |
| critical task | 0-1 | 建议直接升级 |

### 返工范围限制

**允许的最小返工：**
1. artifact 缺失或格式问题
2. 单点逻辑错误
3. 边界条件和回归缺陷
4. 文档同步问题

**触发重规划的情况：**
1. task 拆分不合理
2. 架构设计与实现冲突
3. 验收标准不可实现
4. 依赖结构不合理

### 返工必须携带

返工派发给专家角色时，必须包含：
- [ ] 原 task payload
- [ ] 原 execution result
- [ ] failed checks（失败的检查项）
- [ ] review comments / test logs
- [ ] required fixes（必须修复项）
- [ ] non-goals（返工范围限制）
- [ ] retry_count（已返工次数）

### 返工禁止

返工时禁止：
- [ ] 擅自扩大范围（超出 non-goals）
- [ ] 修改不相关文件
- [ ] 隐瞒上一轮失败原因
- [ ] 超过最大返工次数继续尝试

---

## Escalation Flow（升级流程）

### 升级触发条件

#### 升级到 OpenClaw 管理层（INTERNAL）
- [ ] 当前角色不合适，需要换角色
- [ ] 需要增加 reviewer / tester / architect 补位
- [ ] 需要局部新增 task
- [ ] 需要局部重排依赖
- [ ] task role 选错

#### 升级到用户（USER）
- [ ] retry_count 超限
- [ ] high / critical security issue
- [ ] role 无法判断 trade-off
- [ ] 范围与目标冲突
- [ ] 当前结果是否继续需要用户拍板
- [ ] 商业目标改变
- [ ] 预算 / 成本 / 质量三者不可兼得

### 升级路径

```
Role Execution Failure
  -> Role Self-Report Escalation
    -> OpenClaw Internal Evaluation
      -> INTERNAL Resolution
        OR
      -> USER Escalation
        -> User Decision
          -> Resume / Replan / Cancel
```

### 升级包内容

升级必须包含：
- escalation_id
- reason_type（升级原因类型）
- summary（情况摘要）
- blocking_points（阻塞点）
- evidence（证据：artifacts, logs, failure history）
- attempted_actions（已尝试的解决动作）
- recommended_next_steps（推荐方案）
- options（可选方案，如适用）
- required_decision（需要的具体决策）

### 升级响应

**管理层响应选项：**
- 接受升级，重新分派
- 拒绝升级，要求继续尝试
- 触发重规划
- 暂停项目

**用户响应选项：**
- 批准继续
- 要求返工
- 触发重规划
- 调整范围
- 暂停/取消项目

---

## Ownership Boundaries（职责边界）

### 角色职责边界

| 角色 | 负责 | 不负责 |
|------|------|--------|
| **architect** | 技术方案、模块边界、接口契约、风险识别 | 大规模业务代码实现、最终验收拍板 |
| **developer** | 功能实现、bug 修复、代码变更、自检 | 重新定义需求、决定 milestone 通过 |
| **tester** | 测试设计、测试执行、回归分析、失败分类 | 业务功能实现、架构正确性裁定 |
| **reviewer** | 独立审查、spec 比对、风险审查、放行建议 | 主导实现、替代 tester 验证 |
| **docs** | README 同步、文档更新、changelog | 改业务逻辑、决定功能通过 |
| **security** | 安全检查、风险识别、gate 建议 | 普通功能实现、产品 trade-off |

### OpenClaw 管理层职责
- 需求澄清与规格化
- milestone 规划与任务拆分
- 角色选择与任务分派
- 验收判断与流程推进
- 失败处理与升级决策

### OpenCode 专家包职责
- 按 dispatch payload 执行专业任务
- 输出符合契约的执行结果
- 暴露问题与风险
- 不越权决策

---

## Collaboration Examples（协作示例）

### 示例 1：正常 Feature 开发流转

**场景：** 实现用户登录功能

**流程：**
```
1. OpenClaw 派发 architect task
   -> architect 输出 design_note
   -> 通过 architect gate
   
2. OpenClaw 派发 developer task
   -> developer 消费 design_note
   -> developer 输出 code changes + implementation_summary
   -> 通过 developer gate
   
3. OpenClaw 派发 tester task
   -> tester 消费 code changes
   -> tester 输出 test_report
   -> 通过 tester gate
   
4. OpenClaw 派发 reviewer task
   -> reviewer 消费 code + test_report
   -> reviewer 输出 review_report (approve)
   -> 通过 reviewer gate
   
5. OpenClaw 派发 docs task
   -> docs 更新 README 和 changelog
   -> 通过 docs gate
   
6. Milestone 验收
   -> OpenClaw 生成 AcceptanceReport
   -> 用户验收通过
   -> Milestone 完成
```

**成功要素：**
- 每个角色输出通过 gate
- 上下文通过 artifacts 传递
- 无阻塞条件触发

---

### 示例 2：阻塞案例 - Review Reject

**场景：** developer 实现后 reviewer 发现严重问题

**流程：**
```
1. OpenClaw 派发 developer task
   -> developer 输出 code changes
   -> 通过 developer gate
   
2. OpenClaw 派发 tester task
   -> tester 输出 test_report (pass)
   -> 通过 tester gate
   
3. OpenClaw 派发 reviewer task
   -> reviewer 发现 must-fix issues
   -> reviewer 输出 review_report (reject)
   -> 触发阻塞条件：must-fix 未修复
   
4. **阻塞**：无法进入 docs 或验收
   
5. OpenClaw 生成 ReworkRequest
   -> 明确 required fixes
   -> 设置 retry_count = 1
   
6. 重新派发 developer task（返工）
   -> developer 修复 must-fix issues
   -> 重新输出 code changes
   
7. 重新走 tester -> reviewer 流程
   -> reviewer 输出 review_report (approve)
   
8. 继续 downstream 流程
```

**关键处理：**
- reviewer 明确 reject 和 must-fix 清单
- OpenClaw 生成 ReworkRequest 保留上下文
- 返工范围限制在局部修复
- retry_count 控制避免无限循环

---

### 示例 3：升级案例 - Security Critical Issue

**场景：** 登录功能涉及权限，security 发现 critical 问题

**流程：**
```
1. architect -> developer -> tester -> reviewer 均完成
   -> reviewer 输出 approve
   
2. OpenClaw 派发 security task（高风险场景）
   -> security 检查登录权限实现
   -> 发现 critical security issue
   -> security 输出 security_report
   -> 建议 gate recommendation: BLOCK
   
3. **触发阻塞**：critical security issue
   
4. OpenClaw 评估
   -> 判断为 high risk
   -> 需要用户决策（是否接受风险或调整需求）
   
5. OpenClaw 生成 Escalation (level: USER)
   -> reason_type: HIGH_RISK_CHANGE
   -> 提供选项：修复 / 调整需求 / 接受风险
   
6. 用户决策
   -> 选择"修复权限问题"
   
7. 生成 ReworkRequest
   -> 派发 developer 修复 security issue
   -> 重新走 reviewer -> security 流程
```

**关键处理：**
- security 识别 critical 问题
- 自动阻塞 milestone 推进
- 升级给用户做 trade-off 决策
- 用户决策后恢复流程

---

## 协作协议总结

### 核心原则
1. **契约优先**：所有交互通过标准契约进行
2. **显式交接**：交接时必须满足明确条件
3. **阻塞透明**：阻塞原因必须显式说明
4. **有限返工**：返工有次数限制和范围限制
5. **升级兜底**：自动流程无法处理时升级给用户

### 成功指标
- 任务一次交接成功率 > 80%
- 返工收敛率 > 90%（返工后通过）
- 升级率 < 10%（大多数问题在角色层解决）
- 下游消费成功率 > 95%
