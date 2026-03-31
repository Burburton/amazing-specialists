# Hook: rust-exclusions

## Hook Type
`policy-exclusion`

## Purpose

排除 Rust 特定模式从 docstring policy 验证。

## Patterns
```
^#!?\[allow\(
^#!?\[deny\(
```

## Reason

- `#![allow(...)]` - Rust lint 允许指令
- `#![deny(...)]` - Rust lint 拒绝指令