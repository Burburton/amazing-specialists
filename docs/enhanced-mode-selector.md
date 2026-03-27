# Enhanced Mode Selector

本文档定义 Enhanced Mode 的检测逻辑、继承规则和 M4 skills 激活场景。

---

## 1. Enhanced Mode 检测逻辑

### 1.1 检测优先级

Enhanced Mode 按以下优先级检测：

1. **命令行标志** (最高优先级)
   ```bash
   /spec-start my-feature --enhanced
   ```

2. **spec.md 元数据**
   ```yaml
   ---
   enhanced: true
   ---
   ```

3. **环境变量**
   ```bash
   OPCODE_ENHANCED=true
   ```

4. **默认值**: `false` (标准 MVP 模式)

### 1.2 检测流程

```
用户执行命令
    │
    ▼
检查命令参数是否包含 --enhanced
    │
    ├─ 是 → Enhanced Mode
    │
    └─ 否 → 检查 spec.md 是否有 enhanced: true
                │
                ├─ 是 → Enhanced Mode
                │
                └─ 否 → 检查环境变量 OPCODE_ENHANCED
                            │
                            ├─ true → Enhanced Mode
                            │
                            └─ false/未设置 → Standard Mode
```

---

## 2. spec.md Metadata 继承规则

### 2.1 自动继承

当使用 `--enhanced` 标志执行 `/spec-start` 时：
- 自动在 `spec.md` frontmatter 添加 `enhanced: true`
- 后续命令（spec-plan, spec-tasks, spec-implement, spec-audit）自动检测并继承

### 2.2 手动覆盖

即使 `spec.md` 有 `enhanced: true`，也可通过以下方式禁用：
- 命令行使用 `--no-enhanced` 标志
- 环境变量 `OPCODE_ENHANCED=false`

### 2.3 示例

```yaml
# specs/my-feature/spec.md
---
feature_id: my-feature
version: 1.0.0
status: draft
enhanced: true  # 自动继承 Enhanced Mode
---
```

---

## 3. M4 Skills 激活场景

### 3.1 按命令激活

| 命令 | 激活的 M4 Skills | 触发条件 |
|------|------------------|----------|
| `/spec-start --enhanced` | `interface-contract-design`, `migration-planning` | 涉及 API/迁移 |
| `/spec-plan --enhanced` | `migration-planning`, `dependency-minimization` | 迁移/新增依赖 |
| `/spec-tasks --enhanced` | `integration-test-design`, `dependency-risk-review` | 集成测试需求 |
| `/spec-implement --enhanced` | `refactor-safely`, `integration-test-design` | 重构/集成测试 |
| `/spec-audit --enhanced` | `maintainability-review`, `risk-review`, `secret-handling-review`, `dependency-risk-review` | 全面审计 |

### 3.2 按场景激活

#### interface-contract-design (architect)
**触发条件**:
- 新增 API endpoint
- 定义模块间接口
- 微服务边界定义

**输出**:
- `contracts/interface-contract.md`
- 接口签名定义
- 错误响应格式

#### migration-planning (architect)
**触发条件**:
- 数据库 schema 变更
- 系统升级
- 数据迁移

**输出**:
- `migration-planning.md`
- 迁移策略
- 回滚计划

#### refactor-safely (developer)
**触发条件**:
- 重构现有代码
- 改善代码结构
- 提取公共逻辑

**输出**:
- 重构检查清单
- 测试覆盖验证

#### dependency-minimization (developer)
**触发条件**:
- 新增依赖
- 依赖过多
- 版本冲突

**输出**:
- 依赖分析报告
- 优化建议

#### integration-test-design (tester)
**触发条件**:
- 多模块集成
- API 端到端测试
- 数据库集成

**输出**:
- 集成测试场景
- 测试数据需求

#### flaky-test-diagnosis (tester)
**触发条件**:
- 测试间歇性失败
- CI/CD 不稳定

**输出**:
- 不稳定测试分析
- 修复建议

#### maintainability-review (reviewer)
**触发条件**:
- 大型 PR review
- 遗留代码改造
- 技术债务评估

**输出**:
- 可维护性评分
- 改进建议

#### risk-review (reviewer)
**触发条件**:
- 重要功能上线
- 架构变更
- 性能敏感代码

**输出**:
- 风险评估报告
- 风险等级

#### architecture-doc-sync (docs)
**触发条件**:
- 架构变更
- 新增重要模块
- 系统重构

**输出**:
- 架构文档更新
- ADR 同步

#### user-guide-update (docs)
**触发条件**:
- 新功能发布
- API 变更
- 工作流变更

**输出**:
- 用户指南更新
- 版本化文档

#### secret-handling-review (security)
**触发条件**:
- 涉及认证代码
- 配置文件变更
- 新增外部服务集成

**输出**:
- 密钥处理审查报告
- 安全建议

#### dependency-risk-review (security)
**触发条件**:
- 新增依赖
- 定期安全审计
- CVE 响应

**输出**:
- 依赖风险报告
- CVE 分析

---

## 4. 使用示例

### 标准流程（MVP 模式）
```bash
/spec-start my-feature
/spec-plan my-feature
/spec-tasks my-feature
/spec-implement my-feature T-001
/spec-audit my-feature
```

### 增强流程（Enhanced 模式）
```bash
/spec-start my-feature --enhanced
# 自动在 spec.md 添加 enhanced: true
# 后续命令自动继承

/spec-plan my-feature
# 自动检测 enhanced: true，应用 M4 skills

/spec-tasks my-feature
/spec-implement my-feature T-001
/spec-audit my-feature
```

### 部分增强
```bash
# 仅在审计时使用增强
/spec-start my-feature          # 标准模式
/spec-plan my-feature           # 标准模式
/spec-tasks my-feature          # 标准模式
/spec-implement my-feature T-001 # 标准模式
/spec-audit my-feature --enhanced  # 增强模式
```

---

## 5. 注意事项

### 5.1 MVP 优先原则
- Enhanced Mode 是 MVP 的**补充**，不是替代
- 所有 M4 skills 都依赖 MVP skills 的基础能力
- 不使用 `--enhanced` 时，流程与之前完全一致

### 5.2 性能考虑
- Enhanced Mode 会增加额外的分析步骤
- 建议在复杂项目或安全敏感场景使用
- 简单项目可使用标准模式

### 5.3 兼容性
- Enhanced Mode 完全向后兼容
- 已有 feature 不受影响
- 可随时启用或禁用

---

## References

- `specs/011-m4-enhancement-kit/spec.md` - M4 增强套件规格
- `docs/enhanced-mode-guide.md` - Enhanced Mode 使用指南
- `.opencode/commands/spec-*.md` - 已更新的命令文件