# Skill: vite-setup

## Metadata
```yaml
plugin_id: vite-react-ts
plugin_version: 1.0.0
core_compatibility: >=1.0.0
```

## Purpose

指导开发者正确配置 Vite + Vitest + TypeScript 项目结构，解决常见配置问题。

解决的核心问题：
- TypeScript 配置分离不清晰
- defineConfig 导入来源错误
- triple-slash directive 被误判为 docstring
- 测试环境配置不当
- 类型声明缺失

## When to Use

必须使用时：
- 新建 Vite + React + TypeScript 项目
- 配置 Vitest 测试环境
- 修复 TypeScript 配置错误
- 解决 Vite 类型声明问题

推荐使用时：
- 项目初始化阶段
- 遇到 TypeScript/Vite 配置错误
- 添加 Vitest 测试支持

## When Not to Use

不适用场景：
- 纯 JavaScript 项目（不使用 TypeScript）
- 非 Vite 构建工具（Webpack, Rollup 等）
- 纯后端 Node.js 项目
- Next.js 项目（使用 nextjs plugin）

## Implementation Process

### Step 1: tsconfig 分离策略

Vite + TypeScript 项目需要分离配置文件：

| 文件 | 用途 | 包含范围 |
|------|------|----------|
| `tsconfig.app.json` | 应用代码 | src/\*.ts, src/\*.tsx |
| `tsconfig.node.json` | Node/Vite 配置 | vite.config.ts |
| `tsconfig.test.json` | 测试环境 | src/__tests__/\*.ts |
| `tsconfig.json` | 引用汇总 | 引用上述三个配置 |

**配置示例**:

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/vite-env.d.ts"],
  "exclude": ["src/__tests__"]
}

// tsconfig.node.json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["node", "vitest"]
  },
  "include": ["vite.config.ts"]
}

// tsconfig.test.json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "types": ["vite/client", "node", "vitest/globals"]
  },
  "include": ["src/__tests__/**/*.ts", "src/vite-env.d.ts"]
}
```

### Step 2: defineConfig 导入来源

**关键点**: Vitest 配置必须从 `vitest/config` 导入 defineConfig。

```typescript
// ❌ 错误 - 从 vite 导入
import { defineConfig } from 'vite'

// ✅ 正确 - 从 vitest/config 导入
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
```

**原因**: Vitest 扩展了 Vite 的 defineConfig，添加了 `test` 配置选项。如果从 `vite` 导入，`test` 选项不被识别。

### Step 3: triple-slash directives

Triple-slash directives 是 TypeScript 的合法语法，用于引入类型声明：

```typescript
/// <reference types="vite/client" />
/// <reference types="vitest/config" />
```

**用途**:
- `vite/client`: 提供 Vite 特定的类型（如 import.meta.env）
- `vitest/config`: 提供 Vitest 配置类型

**注意**: 这些是 TypeScript 指令，不是 docstring。如果 docstring policy hook 捕获这些，应配置排除规则。

### Step 4: vite-env.d.ts

创建 `src/vite-env.d.ts` 提供类型声明：

```typescript
/// <reference types="vite/client" />

// CSS Module 类型声明
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

// 图片资源类型声明
declare module '*.svg' {
  const content: string
  export default content
}
```

### Step 5: vite.config.ts 配置

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',  // 或 'jsdom' 用于 DOM 测试
    globals: true,        // 启用全局测试 API
  },
})
```

### Step 6: 验证配置

运行以下命令验证配置正确：

```bash
# TypeScript 编译检查
npx tsc --noEmit

# 构建检查
npm run build

# 测试检查
npm test
```

## Output Requirements

配置完成后应输出：

```yaml
setup_summary:
  status: success | partial | failed
  
  files_created:
    - path: string
      purpose: string
      
  files_modified:
    - path: string
      changes: string[]
      
  configuration_issues_resolved:
    - issue: string
      resolution: string
      
  remaining_issues:
    - issue: string
      severity: low | medium | high
      
  validation_results:
    typescript_check: pass | fail
    build_check: pass | fail
    test_check: pass | fail
```

## Examples

### 示例 1：新建项目配置

开发者创建 Vite + React + TS 项目，遇到 TypeScript 错误。

**问题**: `defineConfig is not defined`

**解决**:
```typescript
// 添加 triple-slash directive
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
```

### 示例 2：CSS Module 类型缺失

**问题**: `Cannot find module '*.module.css'`

**解决**: 在 vite-env.d.ts 添加 CSS Module 声明：
```typescript
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}
```

### 示例 3：测试文件 TypeScript 错误

**问题**: 测试文件报 `describe is not defined`

**解决**:
1. 确保 tsconfig.test.json 包含 `types: ["vitest/globals"]`
2. 确保 vite.config.ts 包含 `globals: true`

## Checklists

### 配置前检查
- [ ] 确认项目使用 Vite + React + TypeScript
- [ ] 确认需要 Vitest 测试支持
- [ ] 确认当前配置问题

### 配置过程检查
- [ ] tsconfig 文件正确分离
- [ ] defineConfig 导入来源正确
- [ ] triple-slash directives 已添加
- [ ] vite-env.d.ts 已创建
- [ ] vite.config.ts 配置正确

### 配置后验证
- [ ] TypeScript 编译通过
- [ ] 构建成功
- [ ] 测试运行成功
- [ ] 无类型错误

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| defineConfig 来源错误 | TypeScript 报错 | 从 vitest/config 导入 |
| tsconfig 未分离 | 类型混乱 | 创建分离配置文件 |
| 类型声明缺失 | Cannot find module | 更新 vite-env.d.ts |
| globals 未启用 | describe 未定义 | 设置 globals: true |

## Notes

### 与 core skills 的关系
- vite-setup 是技术栈特定配置 skill
- 与 developer/feature-implementation 配合使用
- 配置完成后使用 tester/unit-test-design 编写测试

### triple-slash directive 说明
Triple-slash directives (`/// <reference types="...">`) 是 TypeScript 的合法语法，不是注释或 docstring。某些 docstring policy hook 可能误判，需要配置排除规则（见 hooks/docstring-exclusions.md）。