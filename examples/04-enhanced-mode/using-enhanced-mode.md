# Enhanced 模式使用示例

本文档展示如何使用 `--enhanced` 标志启用 M4 增强技能。

---

## 概述

### 什么是 Enhanced 模式？

Enhanced 模式启用 **12 个 M4 增强技能**，补充 MVP 核心技能的高级能力。

### MVP vs Enhanced

| 维度 | MVP 模式 | Enhanced 模式 |
|------|----------|---------------|
| Skills 数量 | 21 | 33 (21 + 12) |
| 适用场景 | 标准开发 | 复杂/高风险项目 |
| 默认模式 | ✅ | 需显式启用 |

---

## 启用方式

### 方式 1: 命令行标志

```bash
# 启用 Enhanced 模式
/spec-start --enhanced user-auth-feature

# 后续命令自动继承
/spec-plan user-auth-feature    # 自动继承 enhanced
/spec-tasks user-auth-feature   # 自动继承 enhanced
/spec-implement user-auth-feature
/spec-audit user-auth-feature
```

### 方式 2: Spec 元数据

在 `spec.md` 中设置：
```yaml
---
enhanced: true
---
```

后续 `/spec-*` 命令自动识别并启用 M4 技能。

### 方式 3: 环境变量

```bash
export OPCODE_ENHANCED=true
/spec-start user-auth-feature
```

---

## M4 Skills 清单

| 角色 | M4 Skill | 用途 |
|------|----------|------|
| architect | interface-contract-design | API 契约设计 |
| architect | migration-planning | 迁移策略规划 |
| developer | refactor-safely | 安全重构 |
| developer | dependency-minimization | 依赖最小化 |
| tester | integration-test-design | 集成测试设计 |
| tester | flaky-test-diagnosis | 不稳定测试诊断 |
| reviewer | maintainability-review | 可维护性审查 |
| reviewer | risk-review | 风险评估 |
| docs | architecture-doc-sync | 架构文档同步 |
| docs | user-guide-update | 用户指南更新 |
| security | secret-handling-review | 密钥处理审查 |
| security | dependency-risk-review | 依赖风险审查 |

---

## 使用场景

### 场景 1: 高安全项目

```bash
/spec-start --enhanced payment-gateway
```

**启用的额外技能**:
- `secret-handling-review` - 审查密钥处理
- `dependency-risk-review` - 审查依赖安全
- `risk-review` - 风险评估

**收益**:
- 更深入的安全审查
- 依赖漏洞检测
- 风险早期识别

### 场景 2: 重构项目

```bash
/spec-start --enhanced legacy-refactor
```

**启用的额外技能**:
- `refactor-safely` - 安全重构方法论
- `migration-planning` - 迁移规划
- `maintainability-review` - 可维护性评估

**收益**:
- 重构风险评估
- 回滚策略
- 可维护性改进建议

### 场景 3: 系统集成项目

```bash
/spec-start --enhanced api-integration
```

**启用的额外技能**:
- `interface-contract-design` - API 契约设计
- `integration-test-design` - 集成测试设计
- `dependency-risk-review` - 第三方依赖审查

---

## 命令行为对比

### /spec-start

| MVP 模式 | Enhanced 模式 |
|----------|---------------|
| 创建 spec.md | 创建 spec.md |
| 定义 Goal, Scope, AC | + interface-contract-design (如涉及 API) |
| | + migration-planning (如涉及迁移) |

### /spec-implement

| MVP 模式 | Enhanced 模式 |
|----------|---------------|
| 实现功能 | 实现功能 |
| 自检 | + refactor-safely 检查 |
| 运行测试 | + integration-test-design (如需要) |

### /spec-audit

| MVP 模式 | Enhanced 模式 |
|----------|---------------|
| 完整性检查 | 完整性检查 |
| Canonical 对齐 | + maintainability-review |
| 路径验证 | + risk-review |
| 状态验证 | + secret-handling-review (如涉及) |
| | + dependency-risk-review |

---

## 示例: 使用 Enhanced 模式开发支付功能

### Step 1: 启动
```bash
/spec-start --enhanced payment-service
```

**输出包含**:
- spec.md (标准)
- interface-contracts/ (M4: interface-contract-design)
  - payment-api.yaml
  - webhook-contract.yaml

### Step 2: 规划
```bash
/spec-plan payment-service
```

**输出包含**:
- plan.md (标准)
- migration-plan.md (M4: migration-planning)
  - 数据迁移策略
  - 回滚方案

### Step 3: 实现
```bash
/spec-implement payment-service
```

**额外检查**:
- refactor-safely: 重构安全性检查
- dependency-minimization: 依赖优化建议

### Step 4: 审计
```bash
/spec-audit payment-service
```

**额外审查**:
- maintainability-review: 可维护性评分
- risk-review: 风险清单
- secret-handling-review: 密钥处理审查
- dependency-risk-review: 依赖安全审查

---

## 何时使用 Enhanced 模式？

### 推荐使用

- ✅ 金融/支付相关功能
- ✅ 安全敏感功能
- ✅ 大规模重构
- ✅ 系统迁移项目
- ✅ 第三方集成
- ✅ 生产核心模块

### 可选使用

- 简单 CRUD 功能
- 低风险修改
- 快速原型开发

---

## 注意事项

1. **性能影响**: Enhanced 模式会增加审查时间
2. **资源消耗**: 更多的 skill 调用
3. **适用性评估**: 根据 feature 复杂度决定是否启用

---

## 相关文档

- [docs/enhanced-mode-guide.md](../../docs/enhanced-mode-guide.md) - 完整使用指南
- [docs/enhanced-mode-selector.md](../../docs/enhanced-mode-selector.md) - 检测逻辑说明