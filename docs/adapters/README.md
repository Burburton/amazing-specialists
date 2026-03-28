# Adapter Design Documents

本目录包含 Later adapters 和 Future adapters 的设计文档，为未来实现提供架构蓝图。

---

## Purpose

设计文档遵循以下原则：
- **设计先行**：在实现前完成详细设计
- **接口契约优先**：基于 io-contract.md 定义接口
- **可追溯性**：映射表指向 ADAPTERS.md 规范

---

## Document Index

| Document | Adapter Type | Priority | Status |
|----------|--------------|----------|--------|
| [github-issue-adapter-design.md](github-issue-adapter-design.md) | Orchestrator | Later | Design Only |
| [github-pr-adapter-design.md](github-pr-adapter-design.md) | Workspace | Later | Design Only |
| [openclaw-adapter-design.md](openclaw-adapter-design.md) | Orchestrator | Later | Design Only |
| [external-adapter-design.md](external-adapter-design.md) | Workspace | Future | Design Only |

---

## Document Structure

每个设计文档包含以下必需章节：

1. **Adapter Classification** - 类型、优先级、接口
2. **Input/Output Mapping Tables** - 外部格式 ↔ 内部格式的转换映射
3. **Escalation Mapping** - 升级请求的处理方式
4. **Retry Strategy** - 重试策略配置
5. **Interface Requirements** - 接口实现要求
6. **Implementation Considerations** - 实现注意事项

---

## Relationship to Architecture

设计文档与主架构文档的关系：

```
ADAPTERS.md (Main Architecture)
    ├── Orchestrator Adapter Definition
    │   ├── CLI/Local (Must-Have) → adapters/cli-local/
    │   ├── GitHub Issue (Later) → docs/adapters/github-issue-adapter-design.md
    │   └── OpenClaw (Later) → docs/adapters/openclaw-adapter-design.md
    │
    └── Workspace Adapter Definition
        ├── Local Repo (Must-Have) → adapters/local-repo/
        ├── GitHub PR (Later) → docs/adapters/github-pr-adapter-design.md
        └── External (Future) → docs/adapters/external-adapter-design.md
```

---

## Contract References

所有设计文档引用以下契约：

| Contract | Section | Purpose |
|----------|---------|---------|
| `io-contract.md` | §1 | Dispatch Payload Schema |
| `io-contract.md` | §2 | Execution Result Schema |
| `io-contract.md` | §3 | Artifact Schema |
| `io-contract.md` | §4 | Escalation Schema |
| `io-contract.md` | §8 | Adapter Interface Contract |
| `ADAPTERS.md` | Full | Adapter Architecture |

---

## Implementation Roadmap

| Phase | Adapter | Priority | Estimated Implementation |
|-------|---------|----------|-------------------------|
| MVP (v1.0) | CLI/Local | Must-Have | ✅ Complete |
| MVP (v1.0) | Local Repo | Must-Have | ✅ Complete |
| v1.1 | GitHub Issue | Later | 🔴 Planned |
| v1.1 | GitHub PR | Later | 🔴 Planned |
| v1.2 | OpenClaw | Later | 🔴 Planned |
| v2.0 | External System | Future | 🔴 Planned |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial design documents created (Feature 020) |