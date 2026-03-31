# Skill: rust-setup

## Metadata
```yaml
plugin_id: rust-cargo
plugin_version: 1.0.0
core_compatibility: >=1.0.0
```

## Purpose

指导开发者正确配置 Rust 项目，遵循 Rust 社区最佳实践。

核心能力：
- 项目结构组织
- Result 错误处理
- 异步编程模式
- 测试最佳实践

## When to Use

- 新建 Rust 项目
- 配置 Cargo 项目
- 实现错误处理
- 编写测试

## Implementation Process

### Step 1: 项目结构

```
project/
├── Cargo.toml
├── Cargo.lock
├── src/
│   ├── main.rs
│   ├── lib.rs
│   └── modules/
│       └── mod.rs
├── tests/
│   └── integration_test.rs
├── benches/
│   └── benchmark.rs
└── examples/
    └── example.rs
```

### Step 2: 错误处理

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Invalid input: {0}")]
    InvalidInput(String),
}

pub type Result<T> = std::result::Result<T, AppError>;
```

### Step 3: 异步模式

```rust
use tokio::main;
use reqwest::Client;

#[main]
async fn main() -> Result<()> {
    let client = Client::new();
    
    let response = client
        .get("https://api.example.com/data")
        .send()
        .await?;
    
    let data = response.json::<Data>().await?;
    
    Ok(())
}
```

### Step 4: 测试

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_addition() {
        assert_eq!(2 + 2, 4);
    }

    #[tokio::test]
    async fn test_async_operation() {
        let result = async_function().await;
        assert!(result.is_ok());
    }
}
```

## Checklists

### 项目配置
- [ ] Cargo.toml 配置
- [ ] 目录结构符合 Rust 约定
- [ ] .gitignore 配置

### 代码质量
- [ ] 错误处理使用 Result
- [ ] 单元测试覆盖
- [ ] cargo fmt 格式化
- [ ] cargo clippy 静态检查