# Implementation Plan: README Command Reference and Adapter Quick Command

## Metadata
- Feature ID: 039-readme-command-reference-and-adapter-quick
- Version: 1.0.0
- Based on: spec.md v1.0.0
- Created: 2026-04-04

---

## Implementation Strategy

**策略**: 文档优化 + 功能增强，保持向后兼容

- README 修改：添加"核心命令参考"章节，不删除现有内容
- CLI Adapter 修改：新增 `quick` 子命令，保留现有功能
- 低风险变更：无破坏性修改

---

## Phases

### Phase 1: README 命令参考添加
- 目标：在 README 中添加"核心命令参考"章节
- 风险：低（纯新增）
- 角色：docs

### Phase 2: CLI Adapter Quick 子命令
- 目标：添加简化调用的 quick 子命令
- 风险：低（新增功能，不影响现有功能）
- 角色：developer

### Phase 3: 文档更新
- 目标：更新 adapter-usage-guide.md
- 风险：低
- 角色：docs

### Phase 4: 验证
- 目标：验证 AC-001~AC-004
- 风险：低
- 角色：reviewer

---

## Architecture Summary

### 文件变更清单

| 文件 | 变更类型 | 变更内容 |
|------|----------|----------|
| `README.md` | modified | 添加"核心命令参考"章节（约 40 行） |
| `adapters/cli-local/index.js` | modified | 添加 `quick` 子命令 |
| `docs/adapters/adapter-usage-guide.md` | modified | 添加 quick 子命令说明 |

### README 结构变更

```diff
## 文档导航
...

+ ## 核心命令参考
+ 
+ 专家包提供 5 个核心命令，用于 spec-driven 开发流程：
+ 
+ | 命令 | 用途 | 参数 | 输出 |
+ |------|------|------|------|
+ | `/spec-start` | 创建 feature spec | `<feature-id>` | `specs/<feature>/spec.md` |
+ | `/spec-plan` | 创建实现计划 | `<feature-id>` | `specs/<feature>/plan.md` |
+ | `/spec-tasks` | 创建任务列表 | `<feature-id>` | `specs/<feature>/tasks.md` |
+ | `/spec-implement` | 执行实现 | `<feature-id> <task-id>` | 代码变更 |
+ | `/spec-audit` | 执行审计 | `<feature-id>` | `verification-report.md` |
+ 
+ 详细定义见 [.opencode/commands/](.opencode/commands/)。
```

### CLI Adapter Quick 子命令设计

**简化调用**：
```bash
# 当前方式（复杂）
node adapters/cli-local/index.js --project myapp --milestone m1 --task t001 \
  --role developer --command implement-task "标题" "目标"

# Quick 方式（简化）
node adapters/cli-local/index.js quick --role developer "实现登录功能"
```

**参数映射**：

| Quick 参数 | 映射到 | 默认值 |
|------------|--------|--------|
| `--role <role>` | dispatch.role | 必填 |
| `--project <id>` | dispatch.project_id | `default` |
| `--milestone <id>` | dispatch.milestone_id | `m-current` |
| `--task <id>` | dispatch.task_id | `t-quick` |
| `--enhanced` | 启用 M4 skills | false |
| `<title>` | dispatch.title | 必填 |
| `<goal>` | dispatch.goal | 同 title |

**Quick 子命令输出**：
- 输出 Dispatch Payload JSON
- 显示执行建议

---

## Tasks

### T-1.1: README 命令参考章节添加
- 角色: docs
- 输入: spec.md, .opencode/commands/*.md
- 输出: README.md（新增章节）
- 验收: AC-001

### T-2.1: CLI Adapter quick 子命令实现
- 角色: developer
- 输入: spec.md, 现有 index.js
- 输出: index.js（新增 quick 功能）
- 验收: AC-002, AC-003

### T-3.1: adapter-usage-guide 更新
- 角色: docs
- 输入: quick 子命令实现
- 输出: adapter-usage-guide.md
- 验收: AC-004

### T-4.1: 验证功能正确性
- 角色: reviewer
- 输入: README.md, index.js, adapter-usage-guide.md
- 输出: verification-report.md
- 验收: AC-001~AC-004

---

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| `.opencode/commands/spec-*.md` | 存在 | ✅ 确认存在 |
| `adapters/cli-local/index.js` | 存在 | ✅ 确认存在 |
| `docs/adapters/adapter-usage-guide.md` | 存在 | ✅ 确认存在 |

---

## Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| 命令说明与实际不一致 | Low | Medium | 审计时对比验证 |
| Quick 子命令参数解析错误 | Low | Low | 充分测试 |
| 文档遗漏 | Low | Low | 检查清单验证 |

---

## Estimated Effort

| Task | Effort | Complexity |
|------|--------|------------|
| T-1.1 | 15 min | Low |
| T-2.1 | 30 min | Medium |
| T-3.1 | 10 min | Low |
| T-4.1 | 15 min | Low |
| **Total** | **70 min** | **Low-Medium** |

---

## Rollback Plan

如果变更导致问题：
1. 使用 git revert 撤销变更
2. Quick 子命令是新增功能，可单独移除
3. README 变更是纯新增，删除即可回滚

---

## Next Command

执行 `/spec-tasks 039-readme-command-reference-and-adapter-quick` 生成详细任务列表。