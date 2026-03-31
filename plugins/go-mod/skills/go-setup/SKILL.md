# Skill: go-setup

## Metadata
```yaml
plugin_id: go-mod
plugin_version: 1.0.0
core_compatibility: >=1.0.0
```

## Purpose

指导开发者正确配置 Go 项目，遵循 Go 社区最佳实践。

核心能力：
- 项目结构组织
- 错误处理模式
- 测试最佳实践
- 依赖管理

## When to Use

- 新建 Go 项目
- 配置项目结构
- 实现错误处理
- 编写测试

## Implementation Process

### Step 1: 项目结构

```
project/
├── cmd/
│   └── myapp/
│       └── main.go
├── internal/
│   ├── handler/
│   ├── service/
│   └── repository/
├── pkg/
│   └── utils/
├── api/
│   └── openapi.yaml
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

### Step 2: 错误处理

```go
package errors

import "errors"

var (
    ErrNotFound    = errors.New("not found")
    ErrBadRequest  = errors.New("bad request")
    ErrInternal    = errors.New("internal error")
)

type AppError struct {
    Code    int
    Message string
    Err     error
}

func (e *AppError) Error() string {
    if e.Err != nil {
        return e.Message + ": " + e.Err.Error()
    }
    return e.Message
}

func (e *AppError) Unwrap() error {
    return e.Err
}
```

### Step 3: 测试模式

```go
package handler_test

import (
    "testing"
    "net/http/httptest"
)

func TestHandler(t *testing.T) {
    tests := []struct {
        name       string
        input      string
        wantStatus int
    }{
        {"valid input", "test", 200},
        {"invalid input", "", 400},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            req := httptest.NewRequest("GET", "/?q="+tt.input, nil)
            rec := httptest.NewRecorder()
            
            handler(rec, req)
            
            if rec.Code != tt.wantStatus {
                t.Errorf("got %d, want %d", rec.Code, tt.wantStatus)
            }
        })
    }
}
```

## Checklists

### 项目配置
- [ ] go.mod 初始化
- [ ] 目录结构符合 Go 约定
- [ ] Makefile 配置
- [ ] .gitignore 配置

### 代码质量
- [ ] 错误处理一致
- [ ] 单元测试覆盖
- [ ] go fmt 格式化
- [ ] go vet 静态检查