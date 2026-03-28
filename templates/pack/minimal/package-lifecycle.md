# Package Lifecycle

本文件定义 OpenCode 专家包的版本管理策略、生命周期阶段、变更触发条件和发布流程。

---

## Package Name
OpenCode 专家包 - 全自动产品研发闭环执行层

## Current Version
0.1.0-MVP

---

## Versioning Strategy（版本策略）

本专家包采用语义化版本控制（Semantic Versioning）：

### 版本号格式
```
MAJOR.MINOR.PATCH[-prerelease]

示例：
- 0.1.0-MVP      # MVP 初始版本
- 0.2.0          # 新增角色或技能
- 1.0.0          # 第一个稳定版本
- 1.1.0          # 新增功能（向后兼容）
- 1.1.1          # 修复问题
- 2.0.0-alpha.1  # 2.0 预发布版本
```

### MAJOR（主版本）- 不兼容变更
**何时升级：**
- 职责边界重新定义（如角色合并或拆分）
- I/O 契约不兼容变化（schema 字段删除或类型变更）
- 角色移除
- 关键 command 移除

**示例：**
- 移除 architect 角色
- Dispatch Payload schema 删除必填字段
- Execution Result status 枚举值变更

### MINOR（次版本）- 向后兼容的功能新增
**何时升级：**
- 新增角色（如添加 performance 角色）
- 新增 skill（向后兼容）
- 新增 command（向后兼容）
- I/O 契约新增可选字段
- quality gate 收紧（新增检查项）
- 协作协议增强

**示例：**
- 新增 performance 角色
- architect 新增 migration-planning skill
- Dispatch Payload 新增可选字段

### PATCH（补丁版本）- 问题修复
**何时升级：**
- skill 描述修正
- template 格式调整
- 文档错误修复
- 轻微规则调整（不影响核心逻辑）
- bug 修复

**示例：**
- 修正 skill.md 中的错别字
- 调整 artifact template 格式
- 修复 gate checklist 中的描述错误

### Prerelease（预发布）
**标签：**
- `-MVP`: MVP 阶段版本
- `-alpha.N`: 早期测试版本
- `-beta.N`: 公开测试版本
- `-rc.N`: 发布候选版本

---

## Change Triggers（变更触发条件）

### 必须升级版本的情况

#### MAJOR 升级触发
- [ ] 新增或移除核心角色（architect/developer/tester/reviewer/docs/security）
- [ ] 修改 Dispatch Payload 必填字段
- [ ] 修改 Execution Result 必填字段
- [ ] 修改 Artifact 必需结构
- [ ] 删除或重命名 command
- [ ] 修改角色核心职责边界

#### MINOR 升级触发
- [ ] 新增非核心角色（如 performance/release）
- [ ] 新增 skill（向后兼容）
- [ ] 新增 command（向后兼容）
- [ ] I/O 契约新增可选字段
- [ ] quality gate 新增检查项
- [ ] 新增协作协议规则
- [ ] 新增 artifact type

#### PATCH 升级触发
- [ ] skill 内容修正
- [ ] template 调整
- [ ] 文档更新
- [ ] 示例更新
- [ ] bug 修复
- [ ] 性能优化（不改变行为）

### 无需升级版本的情况
- 纯文档格式调整（如换行、空格）
- 注释添加
- README 更新（不涉及接口变更）
- 内部重构（不改变外部行为）

---

## Backward Compatibility Policy（向后兼容策略）

### 兼容性保证

#### MAJOR 版本内
- 所有 MINOR 和 PATCH 版本保持向后兼容
- 新增字段为可选
- 不删除已有字段
- 不修改字段类型

#### 跨 MAJOR 版本
- 允许不兼容变更
- 必须提供迁移指南
- 保留旧版本文档至少一个周期

### 具体措施

#### 老 Command 名称保留
- 重命名 command 时，保留旧名称一个版本周期
- 旧名称标记为 deprecated，给出新名称提示

```yaml
# 示例
commands:
  spec-start:
    aliases:
      - start-spec  # 旧名称，deprecated
    deprecation_notice: "请使用 spec-start 替代"
```

#### 老输出格式兼容层
- schema 变更时，提供兼容层转换
- 支持新旧两种格式输出

#### 关键字段保留
- 核心字段（dispatch_id, status, artifacts）不可直接删除
- 如需移除，先标记 deprecated，下一 MAJOR 版本再移除

---

## Deprecation Rules（弃用规则）

### 弃用流程

#### 1. 标记弃用（当前版本）
- 在文档中标记为 deprecated
- 添加弃用警告
- 给出替代方案

```markdown
## Command: old-command-name

> **DEPRECATED**: 该命令将在 v2.0.0 中移除
> 
> 请使用 `new-command-name` 替代
> 
> 迁移指南：[migration-guide.md](migration-guide.md)
```

#### 2. 维护兼容（当前 MAJOR 版本剩余周期）
- 功能继续可用
- 每次使用输出 deprecation 警告
- 提供迁移工具和文档

#### 3. 正式移除（下一 MAJOR 版本）
- 彻底移除弃用功能
- 更新文档
- 提供错误提示（如使用旧接口）

### 弃用时间窗口

| 变更类型 | 弃用周期 | 说明 |
|---------|---------|------|
| command 重命名 | 1 个 MINOR 版本 | 保留 alias |
| 字段删除 | 1 个 MAJOR 版本 | 标记 deprecated |
| 角色移除 | 1 个 MAJOR 版本 | 提前公告 |
| skill 合并 | 1 个 MINOR 版本 | 保留旧 skill 入口 |

---

## Migration Notes（迁移说明）

### v0.x -> v1.0 迁移

#### 目录结构调整
```
# v0.x 结构
.opencode/skills/
  ├── spec-writer/
  ├── architect-auditor/
  └── task-executor/

# v1.0 结构（按角色组织）
opencode-expert-pack/
  ├── skills/
  │   ├── architect/
  │   ├── developer/
  │   ├── tester/
  │   ├── reviewer/
  │   ├── docs/
  │   └── security/
```

#### AGENTS.md 更新
- 更新角色列表
- 更新命令路径
- 更新 skill 引用

#### command 参数格式更新
```yaml
# v0.x
/spec-implement <feature> <task-id>

# v1.0  
/spec-implement --feature=<feature> --task=<task-id>
```

### 版本升级检查清单

#### MINOR 版本升级
- [ ] 更新版本号
- [ ] 更新 CHANGELOG
- [ ] 更新相关文档
- [ ] 验证向后兼容
- [ ] 更新 examples（如需要）

#### MAJOR 版本升级
- [ ] 更新版本号
- [ ] 编写迁移指南
- [ ] 更新所有接口文档
- [ ] 验证新版本功能
- [ ] 更新所有 examples
- [ ] 公告弃用功能
- [ ] 提供兼容层（如适用）

---

## Release Checklist（发布检查清单）

### 发布前检查

#### 文档完整性
- [ ] README.md 已更新
- [ ] package-spec.md 已更新
- [ ] role-definition.md 已更新
- [ ] io-contract.md 已更新
- [ ] quality-gate.md 已更新
- [ ] collaboration-protocol.md 已更新
- [ ] package-lifecycle.md 已更新（版本号）

#### 功能完整性
- [ ] 所有命令文件存在且格式正确
- [ ] 所有 skill 文件存在且格式正确
- [ ] 所有模板文件存在
- [ ] examples 目录已更新

#### 质量检查
- [ ] quality gate 定义完整
- [ ] collaboration protocol 最新
- [ ] 无已知 S3 级别问题

#### 兼容性检查
- [ ] 与上一版本兼容性已验证（MAJOR 版本除外）
- [ ] 迁移指南已编写（MAJOR 版本）
- [ ] 弃用功能已标记

#### 下游验证
- [ ] 与 OpenClaw 管理层接口已验证
- [ ] dispatch payload schema 已对齐
- [ ] execution result schema 已对齐

### 发布流程

1. **准备阶段**
   - 完成所有代码和文档修改
   - 通过所有测试
   - 更新版本号

2. **审查阶段**
   - 代码审查
   - 文档审查
   - 兼容性审查

3. **发布阶段**
   - 打 tag
   - 发布 release notes
   - 更新 CHANGELOG

4. **验证阶段**
   - 验证发布包完整性
   - 验证 examples 可运行
   - 验证文档可访问

---

## Rollback Strategy（回滚策略）

### 回滚触发条件
- 发布后发现有 critical bug
- 兼容性破坏
- 关键功能不可用

### 回滚步骤

#### 1. 评估影响
- 确定影响范围
- 确定受影响版本
- 评估数据兼容性

#### 2. 执行回滚
- 回滚代码到上一稳定版本
- 恢复上一版本文档
- 更新版本号（PATCH 级别修复）

#### 3. 通知用户
- 发布公告
- 说明回滚原因
- 提供临时解决方案

#### 4. 修复问题
- 在分支修复问题
- 验证修复
- 重新发布

### 版本回滚示例
```bash
# 假设 v1.2.0 有问题，回滚到 v1.1.5

# 1. 从 v1.1.5 创建修复分支
git checkout -b hotfix/rollback v1.1.5

# 2. 应用紧急修复（如有）
# ... 修复代码 ...

# 3. 发布 v1.2.1（包含回滚和修复）
git tag v1.2.1
git push origin v1.2.1
```

---

## Lifecycle Stages（生命周期阶段）

### 阶段定义

#### 1. MVP (0.1.x)
**特征：**
- 核心 6 角色已实现
- 基础 skills 可用
- 基本命令可用
- 示例可运行

**目标：**
- 验证 spec-driven 流程
- 验证角色化执行
- 验证管理层协作

#### 2. Alpha (0.2.x - 0.9.x)
**特征：**
- 新增增强角色（performance/security 增强）
- 丰富 skills 库
- 优化命令体验

**目标：**
- 功能完善
- 稳定性提升
- 用户反馈收集

#### 3. Beta (0.10.x - 0.99.x)
**特征：**
- 功能冻结
- 专注 bug 修复
- 性能优化

**目标：**
- 达到生产可用标准
- 文档完善
- 社区反馈处理

#### 4. Stable (1.0.0+)
**特征：**
- API 稳定
- 向后兼容保证
- 长期支持

**目标：**
- 企业级应用
- 长期维护
- 版本迭代

### 当前阶段
**当前：** MVP (0.1.x)

**下一目标：** Alpha (0.2.0)

**里程碑：**
- [ ] 核心 6 角色 skills 完整实现
- [ ] 与 OpenClaw 管理层完整对接
- [ ] 示例项目闭环跑通
- [ ] 文档完善
