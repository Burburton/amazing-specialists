# Real-World Validation: amazing-specialist-face Project

## Validation ID
`029-real-world-validation`

## Status
`in-progress`

## Created
2026-03-30

## Purpose

通过 `amazing-specialist-face` 项目的实际开发，验证 `amazing_agent_specialist` 专家包在真实场景中的表现。

**设计原则**: 专家包是通用核心库，技术栈特定能力应通过可插拔 Plugin 机制提供。验证应区分：
- **核心层问题** → 专家包架构/流程缺陷，需修复核心
- **Plugin 需求** → 技术栈适配缺失，需开发对应 Plugin

## Methodology

| Task | Issue | Skills Used | Validation Focus |
|------|-------|-------------|------------------|
| T-005 | Layout Component | developer/feature-implementation | 实现指导、流程完整性、Plugin 需求识别 |

---

## Core Layer Findings (专家包核心问题)

### Core-001: Triple-Slash Directive Policy Over-Catching

**Category**: Policy Hook
**Severity**: Low
**Description**: Docstring policy hook 捕获了 triple-slash directives (`/// <reference types="...">`)。这些是 TypeScript 必要语法，不是可选注释。

**Impact**: 无实际影响（已正确处理），但增加了不必要的解释负担。

**Recommendation**: 排除 triple-slash directives 从 docstring policy 检查。

**Action**: 修改 `.opencode/hooks/` 或相关 policy 配置。

---

## Plugin Requirements (技术栈适配需求)

### Plugin-001: vite-react-ts Plugin

**Category**: Plugin Demand
**Severity**: Medium
**Description**: T-005 开发过程中发现 Vite + React + TypeScript 项目缺少技术栈特定指导：

**缺失内容**:
- TypeScript 配置最佳实践（tsconfig.*.json 分工）
- Vitest + Vite 配置（defineConfig 来源）
- CSS Module 类型声明设置
- CSS Module 测试模式

**Plugin Scope**:
```
plugins/vite-react-ts/
├── plugin-spec.md       # Plugin 规格定义
├── skills/
│   ├── vite-setup/      # Vite + Vitest + TS 配置
│   └── css-module-test/ # CSS Module 测试模式
├── templates/
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── tsconfig.test.json
│   └── vite-env.d.ts
└── hooks/
    └── exclude-triple-slash.md  # 排除 triple-slash 检查
```

**Impact**: 开发者需要额外时间排查配置问题，影响效率。

**Action**: 创建 `specs/030-plugin-architecture/` 设计 Plugin 机制，后续实现 `vite-react-ts` Plugin。

---

### Plugin-002: vue-vite Plugin (Future)

**Category**: Plugin Demand (Future)
**Severity**: Low
**Description**: Vue + Vite + TypeScript 项目可能有类似需求，待后续验证。

---

### Plugin-003: python-fastapi Plugin (Future)

**Category**: Plugin Demand (Future)
**Severity**: Low
**Description**: Python FastAPI 项目可能有特定需求（pytest 配置、type hints 等），待后续验证。

---

## What Worked Well (核心能力验证)

### Positive-001: feature-implementation Skill Effective

**Description**: `developer/feature-implementation` skill 提供了清晰的实现流程：准备 → 实现 → 验证 → 总结。四个阶段划分明确，checklist 有帮助。

**Verdict**: 核心层 skill 设计有效，流程指导清晰。

---

### Positive-002: TypeScript Strict Mode Recommendation

**Description**: 专家包推荐 TypeScript strict mode，在开发早期捕获了 CSS module 导入问题。

**Verdict**: 核心层质量标准有效。

---

### Positive-003: Role-based Workflow

**Description**: developer 角色的 skill 正确触发，实现流程符合 spec-driven 开发模式。

**Verdict**: 核心层角色模型有效。

---

## Architecture Insight (架构洞察)

### Insight-001: Plugin Architecture Needed

**Description**: 当前专家包将所有 skills 内置，但技术栈特定能力不适合放入核心：
- 不同项目使用不同技术栈（Vite, Next.js, Vue, Python, Go, Rust）
- 技术栈配置是"项目初始化"问题，不是"开发流程"问题
- 用户应按需选择 Plugin，而非接受完整包

**Proposed Architecture**:
```
amazing_agent_specialist (核心库)
├── core/                     # 核心能力（通用）
│   ├── architect/
│   ├── developer/
│   ├── tester/
│   ├── reviewer/
│   ├── docs/
│   └── security/
├── common/                   # 通用 skills
├── plugins/                  # Plugin 目录（可插拔）
│   ├── registry.json         # Plugin 注册表
│   ├── vite-react-ts/        # Vite + React + TS
│   ├── nextjs/               # Next.js
│   ├── vue-vite/             # Vue + Vite
│   ├── python-fastapi/       # Python FastAPI
│   └── go-mod/               # Go
│   └── rust-cargo/           # Rust Cargo
├── contracts/                # 契约定义（核心层）
├── templates/                # 项目模板（核心层）
└── adapters/                 # 外部适配器（核心层）
```

**Plugin Spec 需求**: 创建 `specs/030-plugin-architecture/` 定义：
- Plugin 目录结构
- Plugin 加载机制
- Plugin registry.json 格式
- Plugin 与核心 skills 的关系
- Plugin 安装/卸载流程

---

## Proposed Actions

| Action | Target | Type | Priority |
|--------|--------|------|----------|
| Fix triple-slash policy hook | amazing_agent_specialist | Core Fix | Low |
| Design Plugin architecture | specs/030-plugin-architecture | New Spec | High |
| Implement vite-react-ts Plugin | Future Feature | Plugin | Medium |
| Implement vue-vite Plugin | Future Feature | Plugin | Low |
| Implement python-fastapi Plugin | Future Feature | Plugin | Low |

---

## Validation Sessions

### Session-001: T-005 Layout Component (2026-03-30)

**Project**: amazing-specialist-face
**Issue**: T-005
**Technology Stack**: Vite + React + TypeScript + Vitest + CSS Modules
**Outcome**: Layout 组件实现完成，构建/测试通过
**Core Findings**: Core-001
**Plugin Requirements**: Plugin-001
**Verdict**: 核心层流程有效，技术栈配置需 Plugin 支持

---

## Next Validation

继续 T-007 ~ T-012 issues 开发，持续验证：
1. 核心层 skills 有效性
2. Plugin 需求识别
3. 角色协同流程完整性