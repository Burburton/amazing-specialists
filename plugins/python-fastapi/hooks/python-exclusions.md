# Hook: python-exclusions

## Hook Type
`policy-exclusion`

## Purpose

排除 Python 特定模式从 docstring policy 验证。

## Patterns
```
^#\s*type:\s*ignore
^from\s+__future__\s+import
```

## Reason

- `# type: ignore` - MyPy 类型忽略指令
- `from __future__ import` - Python 未来特性导入