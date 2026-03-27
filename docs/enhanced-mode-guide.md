# Enhanced Mode Guide

本文档说明如何使用 OpenCode 专家包的 **Enhanced Mode（增强模式）**。

---

## What is Enhanced Mode?

Enhanced Mode 启用 **M4 增强套件**，提供 12 个高级技能用于更深入的分析和审查：

| 角色 | M4 Skills |
|------|-----------|
| architect | `interface-contract-design`, `migration-planning` |
| developer | `refactor-safely`, `dependency-minimization` |
| tester | `integration-test-design`, `flaky-test-diagnosis` |
| reviewer | `maintainability-review`, `risk-review` |
| docs | `architecture-doc-sync`, `user-guide-update` |
| security | `secret-handling-review`, `dependency-risk-review` |

---

## How to Enable

### 方式 1: 命令行标志（推荐）

在任何 `/spec-*` 命令后添加 `--enhanced`：

```bash
/spec-start my-feature --enhanced
/spec-plan my-feature --enhanced
/spec-tasks my-feature --enhanced
/spec-implement my-feature T-001 --enhanced
/spec-audit my-feature --enhanced
```

### 方式 2: spec.md 元数据

在 feature spec 中设置 `enhanced: true`：

```yaml
---
feature_id: my-feature
version: 1.0.0
enhanced: true
---
```

后续命令将自动检测并继承 Enhanced Mode。

### 方式 3: 环境变量

```bash
export OPCODE_ENHANCED=true
```

---

## When to Use Enhanced Mode

### 推荐场景

1. **复杂迁移场景**
   - 数据库 schema 大规模变更
   - 系统升级或重构
   - 数据迁移

2. **大规模重构**
   - 遗留代码改造
   - 模块重组
   - 技术债务清理

3. **安全敏感项目**
   - 涉及认证/授权
   - 处理敏感数据
   - 外部服务集成

4. **需要全面审查的项目**
   - 重要功能上线
   - 架构变更
   - 性能敏感代码

### 不推荐场景

- 简单 feature（单文件变更）
- 快速原型开发
- 学习/演示项目

---

## M4 Skills Reference

### Architect Skills

#### interface-contract-design
**用途**: 设计 API/模块接口契约

**When to Use**:
- 新增 API endpoint
- 定义模块间接口
- 微服务边界定义

**输出**:
- 接口签名定义
- 错误响应格式
- 版本策略

#### migration-planning
**用途**: 规划数据/系统迁移策略

**When to Use**:
- 数据库 schema 变更
- 系统升级
- 数据迁移

**输出**:
- 迁移策略（大爆炸/渐进/并行）
- 回滚计划
- 分阶段执行计划

### Developer Skills

#### refactor-safely
**用途**: 安全重构代码

**When to Use**:
- 重构遗留代码
- 改善代码结构
- 提取公共逻辑

**输出**:
- 重构检查清单
- 测试覆盖验证

#### dependency-minimization
**用途**: 减少和优化依赖

**When to Use**:
- 依赖过多导致构建慢
- 存在未使用依赖
- 依赖版本冲突

**输出**:
- 依赖分析报告
- 优化建议

### Tester Skills

#### integration-test-design
**用途**: 设计集成测试

**When to Use**:
- 多模块集成
- API 端到端测试
- 数据库集成

**输出**:
- 集成测试场景
- 测试数据需求

#### flaky-test-diagnosis
**用途**: 诊断不稳定测试

**When to Use**:
- 测试间歇性失败
- CI/CD 不稳定
- 难以复现的 bug

**输出**:
- 不稳定因素分析
- 修复建议

### Reviewer Skills

#### maintainability-review
**用途**: 评估代码可维护性

**When to Use**:
- 大型 PR review
- 遗留代码改造
- 技术债务评估

**输出**:
- 可维护性评分（1-10）
- 改进建议

#### risk-review
**用途**: 评估技术风险

**When to Use**:
- 重要功能上线
- 架构变更
- 性能敏感代码

**输出**:
- 风险等级（low/medium/high/critical）
- 风险项清单

### Docs Skills

#### architecture-doc-sync
**用途**: 同步架构文档

**When to Use**:
- 架构变更后
- 新增重要模块
- 系统重构

**输出**:
- 架构文档更新
- ADR 同步

#### user-guide-update
**用途**: 更新用户指南

**When to Use**:
- 新功能发布
- API 变更
- 工作流变更

**输出**:
- 用户指南更新
- 版本化文档

### Security Skills

#### secret-handling-review
**用途**: 审查密钥和敏感信息处理

**When to Use**:
- 涉及认证代码
- 配置文件变更
- 新增外部服务集成

**输出**:
- 密钥处理审查报告
- 安全建议

#### dependency-risk-review
**用途**: 审查依赖安全风险

**When to Use**:
- 新增依赖
- 定期安全审计
- CVE 响应

**输出**:
- CVE 分析
- 依赖风险报告

---

## Examples

### Example 1: 新 API Feature

```bash
# 启用 Enhanced Mode
/spec-start api-v2 --enhanced

# 自动应用 interface-contract-design
# 生成 contracts/interface-contract.md

/spec-plan api-v2
# 自动检测 enhanced: true
# 应用 dependency-minimization

/spec-implement api-v2 T-001
# 应用 refactor-safely（如涉及重构）

/spec-audit api-v2
# 应用 maintainability-review, risk-review
# 应用 secret-handling-review（如涉及认证）
```

### Example 2: 数据库迁移

```bash
/spec-start db-migration --enhanced

# 自动应用 migration-planning
# 生成 migration-planning.md

/spec-plan db-migration
# 完善迁移策略

/spec-tasks db-migration
# 添加迁移验证任务

/spec-implement db-migration T-001
/spec-audit db-migration --enhanced
```

### Example 3: 部分增强

仅在审计阶段启用增强：

```bash
/spec-start simple-feature
/spec-plan simple-feature
/spec-tasks simple-feature
/spec-implement simple-feature T-001
/spec-audit simple-feature --enhanced
# 仅在审计时应用 M4 reviewer/security skills
```

---

## Best Practices

1. **在 spec-start 时启用** - 让后续命令自动继承
2. **根据场景选择** - 不是所有 feature 都需要增强
3. **与 MVP 结合** - Enhanced Mode 是补充，不是替代
4. **审查结果** - M4 skills 的输出是建议，需要人工判断

---

## References

- `docs/enhanced-mode-selector.md` - 技术实现细节
- `.opencode/skills/` - M4 skills 实现
- `specs/011-m4-enhancement-kit/spec.md` - M4 增强套件规格