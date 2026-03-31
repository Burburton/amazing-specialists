# Hook: nextjs-exclusions

## Hook Type
`policy-exclusion`

## Purpose

排除 Next.js 特定指令和模式从 docstring policy 验证，避免误判。

## Trigger

当 docstring policy 检查遇到以下模式时触发：
- `/// <reference types="next" />`
- `'use client'`
- `'use server'`

## Action

**Exclude**: 跳过这些 Next.js 指令的 docstring policy 验证。

**Patterns**:
```
^///\s*<reference
^'use client'
^'use server'
```

## Reason

Next.js 使用特殊指令来声明组件类型和行为：

| 指令 | 用途 |
|------|------|
| `/// <reference types="next" />` | 引入 Next.js 类型定义 |
| `'use client'` | 声明 Client Component |
| `'use server'` | 声明 Server Action |

这些是框架要求的合法语法，不是注释或 docstring。

## Configuration

在项目 hook 配置中添加此排除规则：

```json
{
  "hooks": {
    "docstring-policy": {
      "exclusions": [
        {
          "pattern": "^///\\s*<reference",
          "reason": "TypeScript triple-slash directive"
        },
        {
          "pattern": "^'use (client|server)'",
          "reason": "Next.js directive"
        }
      ]
    }
  }
}
```

## Examples

### 正确用法

```tsx
'use client';  // 不应触发 docstring 警告

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

```tsx
'use server';  // 不应触发 docstring 警告

import { revalidatePath } from 'next/cache';

export async function submitForm(formData: FormData) {
  // Server Action implementation
}
```

## References

- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- `plugins/vite-react-ts/hooks/docstring-exclusions.md` - 类似的排除规则