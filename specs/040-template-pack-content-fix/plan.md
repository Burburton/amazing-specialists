# Implementation Plan: Template Pack Content Fix

## Metadata
- Feature ID: 040-template-pack-content-fix
- Version: 1.0.0
- Based on: spec.md v1.0.0
- Created: 2026-04-04

---

## Implementation Strategy

**策略**: 文件复制 + 配置更新，无代码修改

- 复制文件到模板包目录
- 更新 content-index.json 配置
- 更新 doctor.js 检查项
- 低风险变更：仅添加内容，不修改现有逻辑

---

## Phases

### Phase 1: CLI 脚本复制
- 目标：将 templates/cli/*.js 复制到模板包
- 风险：低
- 角色：developer

### Phase 2: Examples 复制
- 目标：将 examples/01-quick-start/ 复制到模板包
- 风险：低
- 角色：developer

### Phase 3: Docs 复制
- 目标：将关键 docs 文件复制到模板包
- 风险：低
- 角色：developer

### Phase 4: 配置更新
- 目标：更新 content-index.json 和 doctor.js
- 风险：低
- 角色：developer + docs

### Phase 5: 验证
- 目标：测试初始化后项目完整性
- 风险：低
- 角色：tester + reviewer

---

## Architecture Summary

### 文件变更清单

| 源文件 | 目标位置 | 操作 |
|--------|----------|------|
| `templates/cli/init.js` | `templates/pack/minimal/templates/cli/init.js` | 复制 |
| `templates/cli/install.js` | `templates/pack/minimal/templates/cli/install.js` | 复制 |
| `templates/cli/doctor.js` | `templates/pack/minimal/templates/cli/doctor.js` | 复制 |
| `examples/01-quick-start/minimal-example.md` | `templates/pack/minimal/examples/01-quick-start/minimal-example.md` | 复制 |
| `docs/skills-usage-guide.md` | `templates/pack/minimal/docs/skills-usage-guide.md` | 复制 |
| `docs/enhanced-mode-guide.md` | `templates/pack/minimal/docs/enhanced-mode-guide.md` | 复制 |
| `docs/adapters/adapter-usage-guide.md` | `templates/pack/minimal/docs/adapters/adapter-usage-guide.md` | 复制 |
| `docs/plugin-usage-guide.md` | `templates/pack/minimal/docs/plugin-usage-guide.md` | 复制 |
| `templates/pack/content-index.json` | - | 修改 |
| `templates/pack/minimal/templates/cli/doctor.js` | - | 修改（检查项） |

### 同步到 full profile

所有 minimal 的文件同步复制到 full profile。

---

## Tasks

### T-1.1: 创建模板包目录结构
- 角色: developer
- 输入: spec.md
- 输出: 目录创建
- 验收: 目录存在

### T-1.2: 复制 CLI 脚本
- 角色: developer
- 输入: templates/cli/*.js
- 输出: templates/pack/minimal/templates/cli/
- 验收: AC-001

### T-2.1: 复制 Examples
- 角色: developer
- 输入: examples/01-quick-start/minimal-example.md
- 输出: templates/pack/minimal/examples/
- 验收: AC-002

### T-3.1: 复制 Docs 文件
- 角色: developer
- 输入: docs/skills-usage-guide.md 等
- 输出: templates/pack/minimal/docs/
- 验收: AC-003

### T-4.1: 更新 content-index.json
- 角色: docs
- 输入: 新增文件列表
- 输出: content-index.json
- 验收: 配置正确

### T-4.2: 更新 doctor.js 检查项
- 角色: developer
- 输入: 新增目录
- 输出: doctor.js（修改后）
- 验收: AC-004

### T-5.1: 同步到 full profile
- 角色: developer
- 输入: minimal 内容
- 输出: templates/pack/full/
- 验收: 文件存在

### T-5.2: 测试初始化后项目
- 角色: tester
- 输入: 初始化命令
- 输出: 验证结果
- 验收: AC-005

### T-5.3: 创建 verification-report.md
- 角色: reviewer
- 输入: 测试结果
- 输出: verification-report.md
- 验收: AC-001~AC-005

---

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| `templates/cli/*.js` | 存在 | ✅ 确认存在 |
| `examples/01-quick-start/minimal-example.md` | 存在 | ✅ 确认存在 |
| `docs/skills-usage-guide.md` | 存在 | ✅ 确认存在 |
| `docs/enhanced-mode-guide.md` | 存在 | ✅ 确认存在 |
| `docs/adapters/adapter-usage-guide.md` | 存在 | ✅ 确认存在 |
| `docs/plugin-usage-guide.md` | 存在 | ✅ 确认存在 |

---

## Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| 文件遗漏 | Low | Low | 检查清单验证 |
| 链接失效 | Low | Low | 验证所有链接 |
| 文件数量过多 | Low | Low | 仅复制关键文档 |

---

## Estimated Effort

| Task | Effort | Complexity |
|------|--------|------------|
| T-1.1 | 5 min | Low |
| T-1.2 | 5 min | Low |
| T-2.1 | 5 min | Low |
| T-3.1 | 10 min | Low |
| T-4.1 | 10 min | Low |
| T-4.2 | 10 min | Low |
| T-5.1 | 10 min | Low |
| T-5.2 | 15 min | Low |
| T-5.3 | 10 min | Low |
| **Total** | **80 min** | **Low** |

---

## Rollback Plan

如果变更导致问题：
1. 删除模板包中新增的文件
2. 恢复 content-index.json 和 doctor.js

---

## Next Command

执行 `/spec-tasks 040-template-pack-content-fix` 生成详细任务列表。