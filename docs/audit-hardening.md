# Audit Hardening Specification

## 文档元数据

| 字段 | 值 |
|------|-----|
| **版本** | 1.0.0 |
| **状态** | Active |
| **创建日期** | 2026-03-24 |
| **适用范围** | 所有 Feature Audit、Spec Audit、Review Audit |
| **治理级别** | Repository-Level |

---

## 1. 背景与目标

### 1.1 问题背景

`003-architect-core` feature 暴露出现有审计体系的以下漏检问题：

1. **Feature-level completion vs Repository-level consistency**: 审计过于关注 feature 内部完成度，忽略了与仓库级治理基线的一致性
2. **文档间状态漂移**: completion-report 承认 partial gap，但 README 等对外文档未同步
3. **路径声明真实性**: tasks/plan/spec 中声明的路径与实际文件位置不一致
4. **跨文档术语冲突**: 同一术语在不同文档中定义不一致
5. **Reviewer 职责边界**: reviewer 只做 spec-implementation diff，不做 governance baseline check

### 1.2 目标

在不重构整个项目的前提下，最小范围补强审计规范，使后续 feature 审计具备：
- 强制性 canonical 文档对照能力
- 跨文档一致性检查能力
- 路径声明真实性验证能力
- 完成状态真实性验证能力
- README 治理文档同步检查能力

---

## 2. Mandatory Canonical Comparison Set（强制性规范对照集）

### 2.1 定义

**Canonical Documents（规范文档）** 是仓库级治理的权威来源，所有 feature 文档必须与这些文档保持一致。

### 2.2 Canonical Document List

| 文档 | 治理职责 | 冲突时的权威级别 |
|------|----------|------------------|
| `role-definition.md` | 角色定义、角色边界、角色映射 | **最高** - 所有角色相关描述必须对齐 |
| `package-spec.md` | 包规格、技能分类、I/O 契约 | **最高** - 所有技能/契约相关描述必须对齐 |
| `io-contract.md` | 输入输出契约格式、字段定义 | **最高** - 所有 payload/artifact 格式必须对齐 |
| `quality-gate.md` | 质量门禁、严重级别定义、验收规则 | **最高** - 所有 gate/severity 定义必须对齐 |
| `README.md` | 仓库状态、流程定义、对外承诺 | **高** - 对外可见的状态说明必须对齐 |

### 2.3 Audit Rule: Canonical Comparison

**规则 ID**: AH-001

**规则**: 所有 `/spec-audit` 必须显式检查 feature 文档与上述 canonical 文档是否存在冲突。

**检查项**:
- [ ] Feature 文档中定义的流程顺序与 canonical 文档一致
- [ ] Feature 文档中使用的术语与 canonical 文档一致
- [ ] Feature 文档中声明的角色边界与 `role-definition.md` 一致
- [ ] Feature 文档中引用的 I/O 契约与 `io-contract.md` 一致
- [ ] Feature 文档中使用的严重级别与 `quality-gate.md` 一致
- [ ] Feature 的完成状态描述与 `README.md` 一致

**冲突处理**:
- 若 canonical 文档与 feature 文档冲突，必须报告为 finding
- 不允许静默忽略或假设 canonical 文档会更新
- Canonical 文档是**当前状态**的权威来源，不是"将来应该"的状态

---

## 3. Cross-Document Consistency Audit Rules（跨文档一致性审计规则）

### 3.1 检查维度

**规则 ID**: AH-002

**规则**: 审计必须检查以下跨文档一致性维度：

#### 3.1.1 流程顺序一致性 (Flow Order Consistency)

| 检查项 | 描述 | 示例 |
|--------|------|------|
| Workflow sequence | 流程步骤顺序一致 | spec 说 A→B→C，plan 也说 A→B→C |
| Stage order | 阶段顺序一致 | feature 文档与 README 的阶段描述一致 |
| Command flow | 命令调用顺序一致 | `.opencode/commands/` 定义的流程与 spec 一致 |

**Finding 标准**: 
- 流程顺序冲突 = **major** (至少)

#### 3.1.2 角色边界一致性 (Role Boundary Consistency)

| 检查项 | 描述 | 来源文档 |
|--------|------|----------|
| Role responsibilities | 每个角色的职责边界一致 | `role-definition.md` 是权威来源 |
| Role interactions | 角色间协作方式一致 | `collaboration-protocol.md` |
| Skill-to-role mapping | 技能归属与角色定义一致 | `package-spec.md` + `role-definition.md` |

**Finding 标准**:
- 角色边界冲突 = **major** (至少)
- 技能归属错误 = **major**

#### 3.1.3 阶段状态一致性 (Stage Status Consistency)

| 检查项 | 描述 | 示例 |
|--------|------|------|
| Feature status | Feature 在各文档中的状态一致 | spec 说 "进行中"，README 不能说 "已完成" |
| Phase status | 阶段状态描述一致 | plan 说 "阶段 3"，completion-report 也说 "阶段 3" |
| Milestone status | 里程碑状态一致 | 跨文档引用的 milestone 状态一致 |

**Finding 标准**:
- 状态描述冲突 = **major** (至少)
- 特别是 "已完成" vs "进行中" 的冲突 = **blocker**

#### 3.1.4 文件路径声明一致性 (Path Declaration Consistency)

| 检查项 | 描述 | 示例 |
|--------|------|------|
| Artifact paths | 工件声明的路径与实际位置一致 | spec 说 `docs/guide.md`，实际存在 |
| Skill paths | 技能声明的路径与实际位置一致 | spec 说 `.opencode/skills/x/`，实际存在 |
| Output paths | 输出声明的路径与实际位置一致 | tasks 说输出到 `y.md`，实际存在 |

**Finding 标准**:
- 路径声明错误（文件存在但路径写错）= **major**
- 路径声明缺失（文件不存在）= **major**

#### 3.1.5 完成状态表述一致性 (Completion Status Narrative Consistency)

| 状态类型 | 定义 | 允许使用的表述 | 禁止使用的表述 |
|----------|------|----------------|----------------|
| **a) Fully Complete** | 所有 acceptance criteria 通过，无已知 gap | "✅ 已完成", "COMPLETE", "全部达成" | "大部分完成", "基本完成" |
| **b) Substantially Complete with Known Gaps** | 主要目标达成，有明确记录的 gap | "COMPLETE with known gaps", "✅ 主体完成 (gap 见 X)", "COMPLETE (AC-003 PARTIAL)" | "✅ 全部完成", "无遗留问题", "完全符合" |
| **c) Incomplete** | 主要目标未达成 | "进行中", "PARTIAL", "待完成" | "即将完成", "很快完成" |

**Finding 标准**:
- 把 b) 误报成 a) = **major**
- partial gap 未同步披露 = **major**

---

## 4. Path Resolution Audit Rules（路径解析审计规则）

### 4.1 规则定义

**规则 ID**: AH-003

**规则**: `spec.md`、`plan.md`、`tasks.md`、`completion-report.md` 中所有声明的关键交付路径，都必须能 resolve 到仓库中的真实文件或真实目录。

### 4.2 检查范围

| 文档类型 | 检查内容 | 验证方式 |
|----------|----------|----------|
| `spec.md` | 声明的输出路径、依赖路径 | 检查文件/目录是否存在 |
| `plan.md` | 阶段输出路径、artifact 路径 | 检查文件/目录是否存在 |
| `tasks.md` | 任务输出路径、交付物路径 | 检查文件/目录是否存在 |
| `completion-report.md` | 完成的文件路径、证据路径 | 检查文件/目录是否存在 |

### 4.3 Path Finding Severity

| 场景 | Severity | 说明 |
|------|----------|------|
| 文件实际存在，但路径声明错误（如大小写、拼写） | **major** | 会导致引用失效 |
| 文件应存在但实际不存在 | **major** | 未交付声明的产出 |
| 路径是相对路径但基准不明确 | **minor** | 可能造成理解偏差 |
| 使用绝对路径而非相对路径 | **minor** | 可移植性问题 |

### 4.4 验证命令示例

```bash
# 检查路径是否存在
if [ ! -f "$declared_path" ] && [ ! -d "$declared_path" ]; then
    report_finding("Path resolution failed: $declared_path")
fi

# 检查路径拼写（大小写敏感）
if [ -f "${declared_path,,}" ] && [ ! -f "$declared_path" ]; then
    report_finding("Path case mismatch: declared=$declared_path, actual=$(ls ${declared_path,,})")
fi
```

---

## 5. Status Truthfulness Audit Rules（状态真实性审计规则）

### 5.1 规则定义

**规则 ID**: AH-004

**规则**: 如果 completion-report 中存在 partial / known gap，则 README、feature 状态、阶段说明中不得使用会误导读者的 "fully complete" / "all done" 叙事。

### 5.2 Truthfulness Matrix

| completion-report 状态 | README 允许状态 | README 禁止状态 | Severity if Violated |
|------------------------|-----------------|-----------------|----------------------|
| "COMPLETE with known gaps" | "COMPLETE with known gaps"<br>"主体完成，详见 gap 清单" | "✅ 已完成"<br>"全部完成"<br>"无遗留" | **major** |
| "PARTIAL" | "进行中"<br>"PARTIAL" | "✅ 已完成"<br>"COMPLETE" | **blocker** |
| "COMPLETE" | "✅ 已完成"<br>"COMPLETE" | "部分完成" | **minor** (过度谦虚) |

### 5.3 Required Disclosure

当存在 known gaps 时，必须在以下位置同步披露：

1. **completion-report.md**: 显式列出所有 gaps
2. **README.md**: 在 feature 状态处标注 "with known gaps" 或引用 gap 清单
3. **spec.md**: 更新 acceptance criteria 状态（如果适用）

**Finding 标准**:
- partial gap 未在 README 同步披露 = **major**
- partial gap 未在 completion-report 披露 = **blocker** (隐瞒)

---

## 6. README Governance Status（README 治理地位）

### 6.1 规则定义

**规则 ID**: AH-005

**规则**: README 不只是介绍页。当 README 承担流程定义、阶段状态、角色模型、命令入口说明时，它属于治理文档的一部分，必须纳入审计范围。

### 6.2 README 治理职责检查

| README 内容类型 | 治理职责 | 审计检查 |
|-----------------|----------|----------|
| 阶段状态表 | 仓库级状态叙事 | 与 completion-report 一致 |
| 角色列表 | 角色模型宣传 | 与 `role-definition.md` 一致 |
| 流程说明 | 流程定义 | 与 `package-spec.md` 一致 |
| 命令入口 | 命令契约 | 与 `.opencode/commands/` 一致 |
| Feature 状态 | 项目进度叙事 | 与 `specs/<feature>/completion-report.md` 一致 |

### 6.3 README Audit Rule

**规则**: Feature 审计必须检查 README 是否因本次交付而需要同步更新。

**检查项**:
- [ ] 如果 feature 改变了角色定义，README 中的角色描述是否同步？
- [ ] 如果 feature 改变了流程，README 中的流程说明是否同步？
- [ ] 如果 feature 完成，README 中的 feature 状态是否更新？
- [ ] 如果 feature 有 known gaps，README 是否标注？

**Finding 标准**:
- README 与仓库真实状态冲突 = **major**
- Feature 完成但 README 未更新状态 = **major**

---

## 7. Enhanced Reviewer Responsibilities（增强 Reviewer 职责）

### 7.1 当前职责边界

当前 reviewer 主要执行：
- spec 与实现对比
- code quality 检查
- risk identification

### 7.2 增强后的职责

**规则 ID**: AH-006

**规则**: Reviewer 在需要时必须额外检查以下治理对齐项：

#### 7.2.1 Governance Alignment Checks

| 检查项 | 来源文档 | 检查内容 |
|--------|----------|----------|
| Spec vs Implementation | `spec.md` + code | 实现是否符合 spec |
| Feature vs Canonical Governance | `role-definition.md` 等 | feature 是否违反治理基线 |
| Completion-Report vs README | `completion-report.md` + `README.md` | 状态叙事是否一致 |
| Tasks Outputs vs Actual Repository | `tasks.md` + actual files | 交付物是否真实存在 |

#### 7.2.2 Cross-Feature Consistency

Reviewer 必须检查：
- 新 feature 是否与既有 feature 的术语一致
- 新 feature 是否遵循既定的 artifact 格式
- 新 feature 的输出是否可以被既有流程消费

### 7.3 Reviewer Finding Categories

Reviewer 必须区分以下 finding 类型：

| Finding 类型 | 定义 | 示例 |
|--------------|------|------|
| **Implementation Gap** | 实现未满足 spec | spec 要求 A，实现没做 A |
| **Governance Drift** | feature 偏离治理基线 | feature 定义新角色，但未更新 `role-definition.md` |
| **Documentation Inconsistency** | 文档间不一致 | completion-report 说 partial，README 说 complete |
| **Path Mismatch** | 路径声明错误 | tasks 说输出到 `x.md`，实际在 `y.md` |

---

## 8. Findings Severity Levels（审计结果严重级别）

### 8.1 严重级别定义

| 级别 | 定义 | 处理要求 |
|------|------|----------|
| **blocker** | 必须修复，否则会阻塞 milestone 验收 | 必须修复后才能继续 |
| **major** | 影响下游或造成理解偏差，建议修复 | 必须修复或有明确接受理由 |
| **minor** | 轻微问题，有改进空间 | 建议修复，但不阻塞 |
| **note** | 信息性备注，供参考 | 记录但不强制处理 |

### 8.2 严重级别映射表

| 问题类型 | Severity | Rationale |
|----------|----------|-----------|
| Canonical 流程顺序冲突 | **major** | 影响跨 feature 协作 |
| 角色边界冲突 | **major** | 影响角色职责划分 |
| README 状态误导（partial 报成 complete） | **major** | 误导用户和管理层 |
| Tasks 路径声明错误 | **major** | 导致引用失效 |
| Partial gap 未同步披露 | **major** | 信息不对称 |
| Spec 与实现严重偏离 | **blocker** | 未满足需求 |
| 伪造验证结果 | **blocker** | 诚信问题 |
| 术语轻微不统一但不影响理解 | **minor** | 美观问题 |
| 格式建议 | **note** | 参考性建议 |

---

## 9. Audit Checklist Template（审计检查清单模板）

### 9.1 Feature Audit Checklist

```markdown
# Feature Audit Checklist: <feature-id>

## 1. Feature 内部完整性检查

### 1.1 Required Documents
- [ ] `specs/<feature>/spec.md` 存在且完整
- [ ] `specs/<feature>/plan.md` 存在且完整
- [ ] `specs/<feature>/tasks.md` 存在且完整
- [ ] `specs/<feature>/completion-report.md` 存在且完整

### 1.2 Acceptance Criteria
- [ ] 每个 AC 都有对应的实现证据
- [ ] AC 状态（PASS/FAIL/PARTIAL）已明确标注
- [ ] 未通过的 AC 有说明理由

### 1.3 Artifacts
- [ ] 声明的 artifact 都存在
- [ ] Artifact 格式符合 `io-contract.md`
- [ ] Artifact 路径可 resolve

## 2. Canonical 对齐检查

### 2.1 Role Definition Alignment
- [ ] Feature 中使用的角色与 `role-definition.md` 一致
- [ ] Feature 中定义的角色边界与 canonical 一致
- [ ] 无未定义角色出现

### 2.2 Package Spec Alignment
- [ ] Feature 中使用的术语与 `package-spec.md` 一致
- [ ] Skill 归属与 canonical 一致
- [ ] I/O 契约引用与 `io-contract.md` 一致

### 2.3 Quality Gate Alignment
- [ ] Feature 中使用的严重级别与 `quality-gate.md` 一致
- [ ] Gate 定义与 canonical 一致
- [ ] 验收标准与 canonical 不冲突

### 2.4 IO Contract Alignment
- [ ] Payload 格式与 `io-contract.md` 一致
- [ ] Artifact 格式与 `io-contract.md` 一致
- [ ] Escalation 格式与 `io-contract.md` 一致

## 3. Cross-Document Consistency

### 3.1 Flow Order Consistency
- [ ] Spec 定义的流程顺序与 Plan 一致
- [ ] Plan 定义的流程顺序与 Tasks 一致
- [ ] 与 `README.md` 中的流程说明一致

### 3.2 Role Boundary Consistency
- [ ] Feature 内角色职责与 `role-definition.md` 一致
- [ ] 无角色越权描述
- [ ] 技能归属正确

### 3.3 Stage Status Consistency
- [ ] Spec 中的阶段描述与 Plan 一致
- [ ] Plan 中的阶段与 Tasks 一致
- [ ] Completion-report 中的阶段与实际一致

### 3.4 Terminology Consistency
- [ ] 术语在 feature 内各文档中一致
- [ ] 术语与 canonical 文档一致
- [ ] 无未定义术语

## 4. Path Resolution

### 4.1 Spec Path Validation
- [ ] `spec.md` 中声明的 artifact 路径可 resolve
- [ ] `spec.md` 中引用的文档路径可 resolve

### 4.2 Plan Path Validation
- [ ] `plan.md` 中声明的输出路径可 resolve
- [ ] `plan.md` 中引用的依赖路径可 resolve

### 4.3 Tasks Path Validation
- [ ] `tasks.md` 中声明的交付物路径可 resolve
- [ ] `tasks.md` 中引用的输入路径可 resolve

### 4.4 Completion-Report Path Validation
- [ ] `completion-report.md` 中声明的完成文件路径可 resolve
- [ ] 证据链接可 resolve

## 5. Truthfulness of Completion State

### 5.1 Completion-Report Assessment
- [ ] 诚实标注了 PARTIAL/known gaps（如有）
- [ ] Gap 描述具体，非泛泛而谈
- [ ] 未通过的 AC 诚实说明

### 5.2 README Synchronization
- [ ] 如果存在 gaps，README 同步标注
- [ ] Feature 状态与 completion-report 一致
- [ ] 无 "COMPLETE" 但实际有未解决问题的情况

### 5.3 Status Narrative Consistency
- [ ] "Fully Complete" 仅用于无 gap 的情况
- [ ] "Substantially Complete with Known Gaps" 用于有明确 gap 的情况
- [ ] 无误导性表述

## 6. README Governance Sync

### 6.1 Role Model Sync
- [ ] README 中的角色列表与 `role-definition.md` 一致
- [ ] 新角色（如有）已在 README 中说明

### 6.2 Workflow Sync
- [ ] README 中的流程说明与 `package-spec.md` 一致
- [ ] 新流程（如有）已在 README 中说明

### 6.3 Feature Status Sync
- [ ] README 中的 feature 状态表已更新
- [ ] 本 feature 的状态与 completion-report 一致

### 6.4 Command Sync
- [ ] README 中描述的命令与 `.opencode/commands/` 一致
- [ ] 新命令（如有）已在 README 中说明

## 7. Findings Summary

| ID | Severity | Category | Description | Status |
|----|----------|----------|-------------|--------|
| F-001 | | | | |

### 7.1 Blocker Findings
<!-- 列出所有 blocker -->

### 7.2 Major Findings
<!-- 列出所有 major -->

### 7.3 Minor Findings
<!-- 列出所有 minor -->

### 7.4 Notes
<!-- 列出所有 note -->

## 8. Final Recommendation

### 8.1 Audit Conclusion
- [ ] PASS - 所有 blocker 和 major 已解决或接受
- [ ] PASS_WITH_WARNINGS - 存在 minor 问题，但不影响使用
- [ ] FAIL - 存在未解决的 blocker/major

### 8.2 Required Actions
<!-- 必须执行的动作 -->

### 8.3 Optional Improvements
<!-- 建议但不强制的改进 -->

### 8.4 Release/Closure Recommendation
- **推荐**: RELEASE / CONDITIONAL_RELEASE / HOLD
- **理由**: 
```

### 9.2 Quick Audit Command Reference

```bash
# 运行完整 audit
/spec-audit <feature-id> --canonical-check --cross-doc-check --path-check --truthfulness-check

# 仅检查 canonical 对齐
/spec-audit <feature-id> --canonical-check

# 仅检查路径解析
/spec-audit <feature-id> --path-check

# 仅检查状态真实性
/spec-audit <feature-id> --truthfulness-check
```

---

## 10. Integration with Existing Commands

### 10.1 `/spec-audit` Command Enhancement

**现有行为**: 检查 feature 内部一致性

**新增行为**:
1. 自动加载 canonical documents 进行对照
2. 检查 feature 文档与 canonical 的冲突
3. 验证所有声明路径可 resolve
4. 检查 completion-report 与 README 状态一致性
5. 输出新的 findings severity 分级

**新增 flags**:
- `--canonical-check`: 启用 canonical 文档对照
- `--cross-doc-check`: 启用跨文档一致性检查
- `--path-check`: 启用路径解析验证
- `--truthfulness-check`: 启用状态真实性检查
- `--full-governance-audit`: 启用全部 governance 检查（等价于以上全部）

### 10.2 Reviewer Skill Enhancement

**spec-implementation-diff skill** 增强:
1. 新增 governance baseline check 步骤
2. 对比 feature output 与 canonical 文档
3. 检查 README 同步状态
4. 输出 findings 时标注 severity

---

## 11. Compliance Verification

### 11.1 如何验证本规范已生效

1. 运行 `/spec-audit 003-architect-core --full-governance-audit`
2. 检查是否报告以下 findings：
   - completion-report 标注 "AC-003 PARTIAL" 但 README 显示 "✅ 已完成"
   - 术语 "spec-writer" 在 feature 中是否被标记为 legacy
   - 示例数量不足是否被标注为 gap

### 11.2 Expected Findings for 003-architect-core

运行增强后的 audit，应报告：

| Finding ID | Severity | Category | Description |
|------------|----------|----------|-------------|
| 003-001 | **major** | Status Truthfulness | completion-report 显示 "AC-003 PARTIAL"，但 README 显示 "✅ 已完成" |
| 003-002 | **minor** | Documentation | 示例数量不足 spec 要求（已知 gap，已记录） |
| 003-003 | **note** | Legacy Terminology | 使用 "spec-writer" 等 3-skill 术语，但已标注 legacy（合规） |

---

## 12. References

- `quality-gate.md` - 质量门禁和严重级别定义
- `role-definition.md` - 角色定义和边界
- `package-spec.md` - 包规格和技能分类
- `io-contract.md` - I/O 契约格式
- `AGENTS.md` - 项目级执行规则
- `specs/003-architect-core/completion-report.md` - 暴露问题的参考案例
