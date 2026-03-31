# Hook: vue-exclusions

## Hook Type
`policy-exclusion`

## Purpose

排除 Vue 特定指令和模式从 docstring policy 验证，避免误判。

## Trigger

当 docstring policy 检查遇到以下模式时触发：
- `/// <reference types="vite/client" />`
- Vue SFC `<script setup>` 指令

## Action

**Exclude**: 跳过这些 Vue 指令的 docstring policy 验证。

**Patterns**:
```
^///\s*<reference
^<script\s+setup
```

## Reason

Vue 3 使用特殊语法：

| 语法 | 用途 |
|------|------|
| `/// <reference types="vite/client" />` | 引入 Vite 类型定义 |
| `<script setup>` | Vue 3 Composition API 语法糖 |

这些是框架要求的合法语法，不是注释或 docstring。

## Configuration

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
          "pattern": "^<script\\s+setup",
          "reason": "Vue 3 Composition API syntax"
        }
      ]
    }
  }
}
```

## References

- [Vue 3 Script Setup](https://vuejs.org/api/sfc-script-setup.html)
- `plugins/vite-react-ts/hooks/docstring-exclusions.md`