# Tasks: README Command Reference and Adapter Quick Command

## Metadata
- Feature ID: 039-readme-command-reference-and-adapter-quick
- Version: 1.0.0
- Based on: plan.md v1.0.0
- Created: 2026-04-04

---

## Task List

### Phase 1: README 命令参考

| Task ID | Description | Role | Status | Acceptance Criteria |
|---------|-------------|------|--------|---------------------|
| T-1.1 | 在 README "文档导航" 之后添加 "核心命令参考" 章节 | docs | ✅ COMPLETED | AC-001 |
| T-1.2 | 验证命令说明与 .opencode/commands/*.md 一致 | reviewer | ✅ COMPLETED | AC-001 |

### Phase 2: CLI Adapter Quick 子命令

| Task ID | Description | Role | Status | Acceptance Criteria |
|---------|-------------|------|--------|---------------------|
| T-2.1 | 实现 quick 子命令参数解析 | developer | ✅ COMPLETED | AC-002 |
| T-2.2 | 实现 quick 子命令 Dispatch Payload 生成 | developer | ✅ COMPLETED | AC-003 |
| T-2.3 | 测试 quick 子命令功能 | tester | ✅ COMPLETED | AC-002, AC-003 |

### Phase 3: 文档更新

| Task ID | Description | Role | Status | Acceptance Criteria |
|---------|-------------|------|--------|---------------------|
| T-3.1 | 更新 adapter-usage-guide.md 添加 quick 子命令说明 | docs | ✅ COMPLETED | AC-004 |

### Phase 4: 验证

| Task ID | Description | Role | Status | Acceptance Criteria |
|---------|-------------|------|--------|---------------------|
| T-4.1 | 验证 README 命令参考完整 | reviewer | ✅ COMPLETED | AC-001 |
| T-4.2 | 验证 quick 子命令可用 | reviewer | ✅ COMPLETED | AC-002, AC-003 |
| T-4.3 | 验证文档更新完整 | reviewer | ✅ COMPLETED | AC-004 |
| T-4.4 | 创建 verification-report.md | docs | ✅ COMPLETED | - |

---

## Task Details

### T-1.1: README 命令参考章节添加

**输入**:
- `README.md` 当前内容
- `.opencode/commands/spec-*.md` 命令定义

**处理步骤**:
1. 定位 README.md 中 "文档导航" 章节结束位置
2. 在其后插入 "核心命令参考" 章节
3. 内容包含：
   - 5 个命令的表格
   - 每个命令的用途、参数、输出
   - 链接到详细定义

**输出**:
- README.md（新增约 40 行）

**验证**:
- AC-001: README 包含完整的命令参考

---

### T-2.1: Quick 子命令参数解析

**输入**:
- `adapters/cli-local/index.js` 当前实现
- spec.md 中 quick 子命令设计

**处理步骤**:
1. 检测 `quick` 子命令
2. 解析简化参数：`--role`, `--project`, `--milestone`, `--task`, `--enhanced`
3. 解析位置参数：`<title>`, `<goal>`

**输出**:
- index.js（参数解析逻辑）

**验证**:
- AC-002: 能正确解析 quick 子命令参数

---

### T-2.2: Quick 子命令 Dispatch Payload 生成

**输入**:
- 解析后的参数
- Dispatch Payload 格式（io-contract.md）

**处理步骤**:
1. 构建标准 Dispatch Payload
2. 填充默认值
3. 输出 JSON 格式
4. 显示执行建议

**输出**:
- index.js（Payload 生成逻辑）

**验证**:
- AC-003: 输出正确的 Dispatch Payload

---

### T-3.1: adapter-usage-guide 更新

**输入**:
- quick 子命令实现
- `docs/adapters/adapter-usage-guide.md` 当前内容

**处理步骤**:
1. 在 "CLI/Local Orchestrator Adapter" 章节添加 "Quick 子命令" 小节
2. 包含：用法、参数、示例
3. 与现有内容保持一致风格

**输出**:
- adapter-usage-guide.md（新增约 30 行）

**验证**:
- AC-004: 文档包含 quick 子命令说明

---

## Execution Order

```
T-1.1 (docs) ──────────────────────────────► T-1.2 (reviewer)
                                                    │
T-2.1 (developer) ─────────────────────────────────►│
                                                    │
T-2.2 (developer) ─────────────────────────────────►│
                                                    │
T-2.3 (tester) ────────────────────────────────────►│
                                                    │
T-3.1 (docs) ──────────────────────────────────────►│
                                                    ▼
                                           T-4.1~T-4.4 (reviewer + docs)
```

**并行可能性**:
- T-1.1 和 T-2.1/T-2.2 可并行（不同文件）
- T-3.1 依赖 T-2.1/T-2.2 完成

---

## Summary

| Phase | Tasks | Parallelizable | Estimated Time |
|-------|-------|----------------|----------------|
| Phase 1 | 2 | No | 20 min |
| Phase 2 | 3 | Yes (with Phase 1) | 40 min |
| Phase 3 | 1 | No | 15 min |
| Phase 4 | 4 | No | 20 min |
| **Total** | **10** | **Partially** | **95 min** |

---

## Next Command

执行 `/spec-implement 039-readme-command-reference-and-adapter-quick T-1.1` 开始实现。