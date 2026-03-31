# Hook: go-exclusions

## Hook Type
`policy-exclusion`

## Purpose

排除 Go 特定模式从 docstring policy 验证。

## Patterns
```
^//\s*go:generate
^//\s*go:build
```

## Reason

- `//go:generate` - Go 代码生成指令
- `//go:build` - Go 构建约束