# Hook: docstring-exclusions

## Hook Type
`policy-exclusion`

## Purpose

排除 TypeScript triple-slash directives (`/// <reference types="...">`) 从 docstring policy 验证，避免误判。

## Trigger

当 docstring policy 检查遇到以下模式时触发：
- `/// <reference types="vite/client" />`
- `/// <reference types="vitest/config" />`
- `/// <reference types="node" />`

## Action

**Exclude**: 跳过 triple-slash directive 的 docstring policy 验证。

**Pattern**: `^///\s*<reference`

## Reason

TypeScript triple-slash directive 是 TypeScript 编译器的合法语法，用于引入类型声明文件。这不是注释或 docstring，不应被 docstring policy 捕获。

### Triple-slash Directive 用途

| Directive | 用途 |
|-----------|------|
| `/// <reference types="vite/client" />` | 引入 Vite 类型（如 import.meta.env） |
| `/// <reference types="vitest/config" />` | 引入 Vitest 配置类型 |
| `/// <reference types="node" />` | 引入 Node.js 类型 |

### 与 Docstring 的区别

| 特征 | Docstring | Triple-slash Directive |
|------|-----------|------------------------|
| 格式 | `//` 或 `/* */` 注释 | `///` 特殊语法 |
| 目的 | 文档代码行为 | 引入类型声明 |
| 处理者 | 人类阅读 | TypeScript 编译器 |
| 验证要求 | 应有内容 | 无内容要求 |

## Configuration

在项目 hook 配置中添加此排除规则：

```json
{
  "hooks": {
    "docstring-policy": {
      "exclusions": [
        {
          "pattern": "^///\\s*<reference",
          "reason": "TypeScript triple-slash directive - required syntax for type references"
        }
      ]
    }
  }
}
```

## Examples

### 正确用法

```typescript
// vite-env.d.ts
/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}
```

```typescript
// vite.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
```

### 不应被捕获

以下代码不应触发 docstring policy 警告：
- `/// <reference types="vite/client" />`
- `/// <reference types="vitest/config" />`

## Implementation Notes

1. **Pattern 匹配**: 使用正则 `^///\s*<reference` 匹配行首的 triple-slash
2. **不执行代码**: Hook 仅配置排除规则，不执行任何代码
3. **仅补充**: 此 hook 补充核心 docstring policy，不替换

## References

- [TypeScript Triple-slash Directives](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html)
- `specs/029-real-world-validation/validation-report.md` - Core-001 发现
- `plugins/vite-react-ts/plugin.json` - Hook 配置引用