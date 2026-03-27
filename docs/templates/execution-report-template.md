# Execution Report Template

**Version**: 1.0.0  
**Created**: 2026-03-27  
**Source Example**: `artifacts/001-bootstrap/batch-1-execution-report.md`  
**Producer Role**: `developer` (batch execution context)

---

## Purpose

This template provides the standard structure for creating an `execution-report` artifact. The execution-report documents batch execution results including task completion status, code changes, quality checks, and downstream readiness.

---

## Template Structure

Copy and fill in the sections below:

```markdown
# [Batch Name] Execution Report: [Task IDs]

**批次**: [Batch description]  
**执行时间**: [YYYY-MM-DD]  
**任务数**: [Number] 个（[T-XXX, T-YYY, ...])  
**执行角色**: [Role name]  
**状态**: ✅ COMPLETED / ⚠️ PARTIAL / ❌ FAILED  

---

## 执行摘要

[Brief summary of batch execution. Include:]
- Task completion status (✅/⚠️/❌ for each)
- Code output summary
- Test coverage summary (if applicable)
- Security implementation notes (if applicable)
- Time spent: estimated vs actual

---

## 详细执行记录

### [Task ID]: [Task Name] [Status]

**执行时间**: [Duration]  
**状态**: COMPLETED / PARTIAL / FAILED  

**产出文件**:
- `[File path]`

**关键实现**:
```
[Code snippet of key implementation]
```

**测试覆盖** (if applicable):
- ✅ [Test description]

**质量指标**:
- 代码行数: [Number]
- 测试用例: [Number]
- 测试覆盖率: [Percentage]

**Gate 检查**:
- [x] [Gate criterion 1]
- [x] [Gate criterion 2]

**Recommendation**: CONTINUE / REWORK / ESCALATE

---

(Repeat for each task)

---

## 代码统计

### 文件清单
```
[Directory structure with file paths and line counts]
```

### 代码行数统计
| 文件 | 行数 | 任务 |
|------|------|------|
| [File] | [Lines] | [Task ID] |
| **总计** | **[Total]** | - |

### 测试统计
| 测试文件 | 用例数 | 覆盖率 | 任务 |
|---------|--------|--------|------|
| [File] | [Count] | [Percentage] | [Task ID] |

---

## 质量检查

### 代码质量
- [x] TypeScript 类型完整
- [x] 错误处理完善
- [x] 安全实现 (if applicable)
- [x] 代码结构清晰

### 架构一致性
- [x] 符合 plan.md 的分层架构
- [x] [Other architecture checks]

### Spec 对齐
- [x] [AC-XXX: Requirement met]
- [x] [BR-XXX: Business rule satisfied]

---

## 风险与问题

### 已识别问题
1. **[Issue name]**
   - 状态: [Status]
   - 影响: [Impact level]
   - 处理: [How addressed]

### 风险监控
| 风险 | 级别 | 状态 | 缓解措施 |
|------|------|------|---------|
| [Risk] | 低/中/高 | 已缓解/监控中 | [Mitigation] |

---

## 下游就绪检查

### [Next Task ID] 就绪条件
- [x] [Prerequisite 1]
- [x] [Prerequisite 2]

### 阻塞检查
- [x] 无阻塞问题
- [x] 代码可编译
- [x] 接口已定义

---

## 推荐动作

**Recommendation**: CONTINUE / REWORK / ESCALATE

可以进入下一批次：
- **[Next Batch]**: [Task IDs]（[Description]）

**下一步**: 执行 [Next Task ID]

---

## 执行时间汇总

| 任务 | 预计 | 实际 | 偏差 |
|------|------|------|------|
| [Task ID] | [Time] | [Time] | [+/-] |
| **总计** | **[Total]** | **[Total]** | **[+/-]** |

**效率**: [Efficiency assessment]

---

## 文档更新

### 已更新文件
- `[File path]` - [Update description]

### 代码文件
- `[File path]` ✅

---

**报告生成时间**: [YYYY-MM-DDTHH:MM:SSZ]  
**执行角色**: [Role name]  
**批次状态**: COMPLETED ✅ / PARTIAL ⚠️ / FAILED ❌
```

---

## Required Sections

Per the example execution report, the following sections are expected:

| Section | Required | Purpose |
|---------|----------|---------|
| Header metadata | Yes | Batch identification |
| 执行摘要 | Yes | Quick overview |
| 详细执行记录 | Yes | Per-task details |
| 代码统计 | Yes | File and line counts |
| 质量检查 | Yes | Quality gate validation |
| 风险与问题 | Yes | Known issues and risks |
| 下游就绪检查 | Yes | Prerequisite verification |
| 推荐动作 | Yes | Next step recommendation |
| 执行时间汇总 | Yes | Time tracking |
| 文档更新 | Yes | Files modified |

---

## Header Format

```markdown
# [Batch Name] Execution Report: [Task IDs]

**批次**: [Batch description]  
**执行时间**: [Date]  
**任务数**: [Number] 个（[Task list])  
**执行角色**: [Role]  
**状态**: ✅ COMPLETED / ⚠️ PARTIAL / ❌ FAILED
```

---

## Task Detail Format

Each task should have:

1. **Task identification**: ID and name
2. **Execution metadata**: Time, status
3. **Output files**: List of files produced
4. **Key implementation**: Code snippet
5. **Test coverage**: If applicable
6. **Quality indicators**: Lines, tests, coverage
7. **Gate checks**: Checkbox list
8. **Recommendation**: CONTINUE / REWORK / ESCALATE

---

## Quality Gate Checklist Format

```markdown
**Gate 检查**:
- [x] [Criterion met]
- [x] [Criterion met]
```

Use `[x]` for passed, `[ ]` for not yet verified.

---

## Recommendation Values

| Value | Meaning | Next Action |
|-------|---------|-------------|
| `CONTINUE` | All tasks passed, proceed to next batch | Execute next tasks |
| `REWORK` | Issues found that need fixing | Return to failed tasks |
| `ESCALATE` | Blocking issue needs decision | Escalate to management |

---

## Status Indicators

| Indicator | Meaning |
|-----------|---------|
| ✅ | Completed successfully |
| ⚠️ | Completed with warnings |
| ❌ | Failed or blocked |

---

## Anti-Patterns to Avoid

- ❌ **Missing task details**: Every task must have its own section
- ❌ **No gate checks**: Must verify against quality gates
- ❌ **Hiding issues**: Risks and problems must be documented
- ❌ **No downstream readiness**: Must verify prerequisites for next tasks
- ❌ **Missing recommendation**: Must provide explicit next action

---

## Downstream Consumer Usage

### tester
- Use task outputs to determine test scope
- Reference code statistics for coverage targets

### reviewer
- Verify gate checks passed
- Review risks and problems section

### management
- Track execution time for efficiency
- Use recommendation for workflow decisions

---

## References

- Source Example: `artifacts/001-bootstrap/batch-1-execution-report.md`
- Plan Document: `specs/[feature]/plan.md`
- Tasks Document: `specs/[feature]/tasks.md`