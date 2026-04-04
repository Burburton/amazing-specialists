# Tasks: Template Pack Content Fix

## Metadata
- Feature ID: 040-template-pack-content-fix
- Version: 1.0.0
- Based on: plan.md v1.0.0
- Created: 2026-04-04

---

## Task List

### Phase 1: CLI 脚本复制

| Task ID | Description | Role | Status | Acceptance Criteria |
|---------|-------------|------|--------|---------------------|
| T-1.1 | 创建 templates/pack/minimal/templates/cli/ 目录 | developer | ✅ COMPLETED | 目录存在 |
| T-1.2 | 复制 init.js, install.js, doctor.js 到模板包 | developer | ✅ COMPLETED | AC-001 |

### Phase 2: Examples 复制

| Task ID | Description | Role | Status | Acceptance Criteria |
|---------|-------------|------|--------|---------------------|
| T-2.1 | 创建 templates/pack/minimal/examples/01-quick-start/ 目录 | developer | ✅ COMPLETED | 目录存在 |
| T-2.2 | 复制 minimal-example.md 到模板包 | developer | ✅ COMPLETED | AC-002 |

### Phase 3: Docs 复制

| Task ID | Description | Role | Status | Acceptance Criteria |
|---------|-------------|------|--------|---------------------|
| T-3.1 | 创建 templates/pack/minimal/docs/ 目录结构 | developer | ✅ COMPLETED | 目录存在 |
| T-3.2 | 复制 skills-usage-guide.md, enhanced-mode-guide.md | developer | ✅ COMPLETED | AC-003 |
| T-3.3 | 复制 adapters/adapter-usage-guide.md | developer | ✅ COMPLETED | AC-003 |
| T-3.4 | 复制 plugin-usage-guide.md | developer | ✅ COMPLETED | AC-003 |

### Phase 4: 配置更新

| Task ID | Description | Role | Status | Acceptance Criteria |
|---------|-------------|------|--------|---------------------|
| T-4.1 | 更新 content-index.json 添加新文件 | docs | ✅ COMPLETED | 配置正确 |
| T-4.2 | 更新 doctor.js 添加新检查项 | developer | ✅ COMPLETED | AC-004 |

### Phase 5: 同步与验证

| Task ID | Description | Role | Status | Acceptance Criteria |
|---------|-------------|------|--------|---------------------|
| T-5.1 | 复制所有内容到 full profile | developer | ✅ COMPLETED | 文件存在 |
| T-5.2 | 测试初始化后项目完整性 | tester | ✅ COMPLETED | AC-005 |
| T-5.3 | 验证所有链接有效 | reviewer | ✅ COMPLETED | AC-003 |
| T-5.4 | 创建 verification-report.md | docs | ✅ COMPLETED | - |

---

## Task Details

### T-1.1 & T-1.2: CLI 脚本复制

**输入**:
- `templates/cli/init.js`
- `templates/cli/install.js`
- `templates/cli/doctor.js`

**处理步骤**:
1. 创建 `templates/pack/minimal/templates/cli/` 目录
2. 复制三个 JS 文件到目标目录

**输出**:
- `templates/pack/minimal/templates/cli/init.js`
- `templates/pack/minimal/templates/cli/install.js`
- `templates/pack/minimal/templates/cli/doctor.js`

**验证**:
- AC-001: 初始化后可运行 doctor.js

---

### T-2.1 & T-2.2: Examples 复制

**输入**:
- `examples/01-quick-start/minimal-example.md`

**处理步骤**:
1. 创建 `templates/pack/minimal/examples/01-quick-start/` 目录
2. 复制 minimal-example.md 到目标目录

**输出**:
- `templates/pack/minimal/examples/01-quick-start/minimal-example.md`

**验证**:
- AC-002: 初始化后 examples 目录存在

---

### T-3.1 ~ T-3.4: Docs 复制

**输入**:
- `docs/skills-usage-guide.md`
- `docs/enhanced-mode-guide.md`
- `docs/adapters/adapter-usage-guide.md`
- `docs/plugin-usage-guide.md`

**处理步骤**:
1. 创建 `templates/pack/minimal/docs/` 目录
2. 创建 `templates/pack/minimal/docs/adapters/` 目录
3. 复制文件到目标目录

**输出**:
- `templates/pack/minimal/docs/skills-usage-guide.md`
- `templates/pack/minimal/docs/enhanced-mode-guide.md`
- `templates/pack/minimal/docs/adapters/adapter-usage-guide.md`
- `templates/pack/minimal/docs/plugin-usage-guide.md`

**验证**:
- AC-003: README 链接有效

---

### T-4.1: 更新 content-index.json

**处理步骤**:
1. 在 `required.files` 添加新文件路径
2. 在 `required.directories` 添加新目录

**新增内容**:
```json
{
  "files": [
    "templates/cli/init.js",
    "templates/cli/install.js",
    "templates/cli/doctor.js",
    "examples/01-quick-start/minimal-example.md",
    "docs/skills-usage-guide.md",
    "docs/enhanced-mode-guide.md",
    "docs/adapters/adapter-usage-guide.md",
    "docs/plugin-usage-guide.md"
  ],
  "directories": [
    "templates/cli/",
    "examples/01-quick-start/",
    "docs/",
    "docs/adapters/"
  ]
}
```

---

### T-4.2: 更新 doctor.js 检查项

**处理步骤**:
1. 添加 CLI 目录检查
2. 添加 Examples 目录检查
3. 添加 Docs 目录检查

**新增检查项**:
```javascript
{
  id: 'C011',
  name: 'CLI scripts present',
  severity: 'high',
  check: (root) => fs.existsSync(path.join(root, 'templates', 'cli', 'doctor.js'))
},
{
  id: 'C012',
  name: 'Examples directory present',
  severity: 'medium',
  check: (root) => fs.existsSync(path.join(root, 'examples', '01-quick-start'))
},
{
  id: 'C013',
  name: 'Docs directory present',
  severity: 'medium',
  check: (root) => fs.existsSync(path.join(root, 'docs'))
}
```

---

### T-5.2: 测试初始化后项目

**处理步骤**:
1. 运行 `node templates/cli/init.js ./test-project`
2. 进入 test-project 目录
3. 运行 `node templates/cli/doctor.js`
4. 验证 examples 目录存在
5. 验证 docs 目录存在
6. 验证 README 链接有效

---

## Execution Order

```
T-1.1 (developer) ─────► T-1.2 (developer)
                              │
T-2.1 (developer) ───────────►│
                              │
T-2.2 (developer) ───────────►│
                              │
T-3.1 (developer) ───────────►│
                              │
T-3.2~T-3.4 (developer) ─────►│
                              │
T-4.1 (docs) ────────────────►│
                              │
T-4.2 (developer) ───────────►│
                              │
T-5.1 (developer) ───────────►│
                              ▼
                       T-5.2~T-5.4 (tester + reviewer + docs)
```

**并行可能性**:
- T-1.x, T-2.x, T-3.x 可并行执行（不同目录）
- T-4.x 依赖 T-1.x~T-3.x 完成

---

## Summary

| Phase | Tasks | Parallelizable | Estimated Time |
|-------|-------|----------------|----------------|
| Phase 1 | 2 | Yes | 10 min |
| Phase 2 | 2 | Yes | 10 min |
| Phase 3 | 4 | Yes | 15 min |
| Phase 4 | 2 | No | 20 min |
| Phase 5 | 4 | No | 25 min |
| **Total** | **14** | **Partially** | **80 min** |

---

## Next Command

执行 `/spec-implement 040-template-pack-content-fix T-1.1` 开始实现。