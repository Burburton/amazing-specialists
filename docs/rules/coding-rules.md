# Coding Rules

**Version:** 1.0.0  
**Last Updated:** 2026-03-27  
**Owner:** developer  
**Source:** `.opencode/skills/developer/code-change-selfcheck/SKILL.md`

---

## Purpose

本文件定义 developer 角色在代码实现过程中必须遵守的规则，确保代码质量、范围控制和变更可追溯性。

---

## 1. 代码风格规范

### 1.1 基本原则

- **可理解性优先**: 代码应易于理解，避免晦涩的写法
- **命名清晰**: 变量、函数、类名应清晰表达其用途
- **单一职责**: 函数和类应专注于单一功能
- **避免重复**: 不应有重复代码，应提取为公共函数

### 1.2 格式规范

| 规则 | 要求 |
|------|------|
| 代码注释 | 复杂逻辑必须有注释说明 |
| 函数长度 | 建议不超过 50 行，过长应拆分 |
| 缩进风格 | 遵循项目统一风格（2空格或4空格） |
| 空行使用 | 逻辑块之间使用空行分隔 |
| 括号位置 | 遵循项目统一风格 |

### 1.3 禁止模式

- ❌ 无意义的变量名（如 `a`, `b`, `tmp`）
- ❌ 过深的嵌套（超过3层）
- ❌ 魔法数字（应提取为常量）
- ❌ 死代码（未使用的变量、函数）
- ❌ 过长的参数列表（超过5个参数）

---

## 2. 命名约定

### 2.1 变量命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 常量 | UPPER_CASE | `MAX_CONNECTIONS` |
| 变量 | camelCase | `currentUser` |
| 私有变量 | 前缀 `_` 或 `#` | `_internalState` |
| Boolean变量 | 前缀 `is/has/can` | `isValid`, `hasPermission` |

### 2.2 函数命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 普通函数 | camelCase | `calculateTotal()` |
| 动词开头 | 表达行为 | `getUserById()` |
| Boolean返回 | `is/has/can`开头 | `isValidUser()` |
| 事件处理 | `on`开头 | `onSubmit()` |

### 2.3 类命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 类名 | PascalCase | `UserService` |
| 接口 | PascalCase，可选 `I`前缀 | `IRepository` 或 `Repository` |
| 抽象类 | PascalCase | `BaseHandler` |
| 异常类 | 后缀 `Error/Exception` | `ValidationError` |

---

## 3. 错误处理规范

### 3.1 异常处理原则

- **不静默失败**: 错误必须被处理或抛出
- **错误信息清晰**: 用户/开发者能理解错误原因
- **恢复机制**: 关键操作应有恢复机制

### 3.2 错误处理检查项

```
- [ ] 错误是否被正确处理？
- [ ] 异常是否被捕获？
- [ ] 错误信息是否清晰？
- [ ] 是否有静默失败？
- [ ] 恢复机制是否存在？
```

### 3.3 错误分类与处理

| 错误类型 | 处理方式 |
|----------|----------|
| 输入验证错误 | 返回明确错误信息，不抛异常 |
| 业务逻辑错误 | 抛出业务异常，记录日志 |
| 系统错误 | 抛出系统异常，触发告警 |
| 外部依赖错误 | 重试或降级处理 |

### 3.4 禁止模式

- ❌ 空的 `catch` 块
- ❌ 捕获后不处理也不抛出
- ❌ 错误信息模糊（如 "Error occurred"）
- ❌ 忽略关键错误

---

## 4. 依赖管理规则

### 4.1 依赖引入检查

```
- [ ] 是否引入新依赖？
- [ ] 新依赖是否已批准？
- [ ] 依赖版本是否合理？
- [ ] 是否有循环依赖？
```

### 4.2 依赖引入决策

| 检查项 | 要求 |
|--------|------|
| 必要性证明 | 新依赖必须说明必要性 |
| 版本选择 | 使用稳定版本，避免 alpha/beta |
| 安全检查 | 检查依赖安全漏洞 |
| 许可证合规 | 检查许可证兼容性 |
| 循环依赖 | 禁止循环依赖 |

### 4.3 依赖分类

| 类型 | 处理方式 |
|------|----------|
| 生产依赖 | 必须经过审批流程 |
| 开发依赖 | 测试/构建工具类，较宽松 |
| peer依赖 | 明确版本范围 |

---

## 5. 代码变更自检规则

> **对齐 Skill**: `.opencode/skills/developer/code-change-selfcheck/SKILL.md`

### 5.1 自检时机

**必须执行自检**:
- 任何代码变更提交前
- 完成 feature-implementation 后
- 完成 bugfix-workflow 后
- 作为 quality gate 的一部分

**推荐执行自检**:
- 每次 commit 前
- push 前最终检查
- review 前自检

### 5.2 自检类别

#### 5.2.1 目标对齐检查 (Goal Alignment)

```
- [ ] 实现是否符合 task goal？
- [ ] 是否满足 acceptance criteria？
- [ ] 是否遗漏关键功能？
- [ ] 是否有超出 scope 的改动？
```

#### 5.2.2 设计一致检查 (Design Consistency)

```
- [ ] 是否符合 design note？
- [ ] 模块边界是否尊重？
- [ ] 接口契约是否遵守？
- [ ] 如有偏离，是否记录原因？
```

#### 5.2.3 范围控制检查 (Scope Control)

```
- [ ] 改动范围是否最小？
- [ ] 是否有无关文件改动？
- [ ] 删除的代码是否必要？
- [ ] 注释/空行修改是否必要？
```

#### 5.2.4 约束遵守检查 (Constraint Compliance)

```
- [ ] 是否遵守技术约束？
- [ ] 是否遵守性能约束？
- [ ] 是否遵守安全约束？
- [ ] 是否遵守依赖约束？
```

#### 5.2.5 代码质量检查 (Code Quality)

```
- [ ] 代码是否可理解？
- [ ] 命名是否清晰？
- [ ] 是否有明显逻辑错误？
- [ ] 是否有未处理的异常？
- [ ] 是否有死代码？
```

#### 5.2.6 测试覆盖检查 (Test Coverage)

```
- [ ] 新增代码是否有测试？
- [ ] 修改代码是否更新测试？
- [ ] 测试是否通过？
- [ ] 覆盖率是否达标？
```

### 5.3 问题严重程度分类

| 级别 | 定义 | 处理要求 |
|------|------|----------|
| **Blocker** | 必须修复，否则不能提交 | 立即修复，修复后重新检查 |
| **Warning** | 建议修复，但不强制 | 记录问题，可选修复 |
| **Info** | 仅供参考 | 不强制处理 |

### 5.4 快速检查清单

对于简单改动，使用快速检查：

```yaml
quick_check:
  - "代码能编译/运行吗？"
  - "改动符合预期吗？"
  - "测试通过吗？"
  - "有敏感信息泄露吗？"
  - "有 console.log 忘记删除吗？"
```

---

## 6. 与 Developer Skills 对齐说明

### 6.1 Skills 映射

| 规则类别 | 对齐 Skill |
|----------|------------|
| 代码风格规范 | `developer/feature-implementation` |
| 命名约定 | `developer/feature-implementation` |
| 错误处理规范 | `developer/feature-implementation`, `developer/bugfix-workflow` |
| 依赖管理规则 | `developer/feature-implementation` |
| 代码变更自检规则 | `developer/code-change-selfcheck` |

### 6.2 自检输出格式

遵循 `developer/code-change-selfcheck` skill 的输出格式：

```yaml
self_check_report:
  dispatch_id: string
  task_id: string
  timestamp: string
  
  summary:
    total_checks: number
    passed: number
    failed: number
    blockers: number
    warnings: number
    
  overall_status: PASS | FAIL_WITH_BLOCKERS | PASS_WITH_WARNINGS
  recommendation: PROCEED | FIX_BLOCKERS | ESCALATE
```

### 6.3 自检时间投入

| 改动类型 | 建议时间 |
|----------|----------|
| 简单改动 | 5-10 分钟 |
| 中等改动 | 15-30 分钟 |
| 复杂改动 | 30-60 分钟 |

> 自检投入的时间会在 review 阶段节省更多时间。

---

## References

- `.opencode/skills/developer/code-change-selfcheck/SKILL.md` - 自检 skill 定义
- `.opencode/skills/developer/feature-implementation/SKILL.md` - 功能实现 skill
- `.opencode/skills/developer/bugfix-workflow/SKILL.md` - Bug 修复 skill
- `quality-gate.md` Section 3.2 - Developer Gate
- `specs/004-developer-core/spec.md` - Developer 角色规格