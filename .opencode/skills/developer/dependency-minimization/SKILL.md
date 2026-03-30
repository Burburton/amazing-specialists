# Skill: dependency-minimization

## Purpose

指导 developer 分析和优化项目依赖，减少依赖数量和体积，提升构建速度和安全性。

解决的核心问题：
- 依赖过多导致构建慢
- 未使用依赖占用空间
- 依赖版本冲突
- 安全漏洞依赖
- 依赖树难以理解

## When to Use

必须使用时：
- 依赖过多导致构建时间过长
- 存在明显未使用的依赖
- 依赖版本冲突导致问题
- 安全审计发现危险依赖

推荐使用时：
- 定期依赖健康检查
- 版本升级前的依赖清理
- 新项目初始化后的依赖审计

## When Not to Use

不适用场景：
- 功能开发（使用 feature-implementation）
- 紧急安全修复（使用 security 的相关技能）
- 无明确依赖问题的预防性清理

## Dependency Optimization Process

### Phase 0: Issue 准备 (Issue Preparation)

> **触发条件**: 以下情况必须执行此 Phase：
> - dispatch payload 包含 `issue_id` 字段
> - 从 `/spec-start` 命令启动的 GitHub Issue 驱动流程
> - 任务明确要求 "GitHub Issue 驱动方式"
>
> **跳过条件**: 以下情况可跳过此 Phase：
> - 从 CLI 直接触发，无 Issue ID
> - 任务明确指定不使用 Issue 驱动
> - 紧急修复场景（后续补充 Issue）

#### Step 0: 检查 GitHub Issues

**目的**: 确保依赖优化任务在 GitHub Issues 中正确管理，避免创建重复 Issue。

1. **列出现有 Issues**
   ```bash
   gh issue list --state all --limit 100
   ```

2. **搜索相关 Issue**
   - 使用关键词搜索（依赖名称、优化类型、模块名称）
   - 检查 Issue 状态（open, closed, closed-as-completed）
   - 检查 Issue 内容是否与当前依赖优化任务匹配

3. **决策分支**

   | 情况 | 处理方式 |
   |------|----------|
   | 找到匹配的 open Issue | 使用现有 Issue，直接进入 Phase 1 |
   | 找到匹配的 closed Issue（已完成） | 检查是否需要新 Issue（如新依赖问题） |
   | 找到匹配的 closed Issue（未完成） | 重新打开 Issue 或创建新 Issue |
   | 未找到匹配 Issue | 创建新 Issue，进入 Phase 1 |

4. **创建 Issue（如需要）**
   ```bash
   gh issue create --title "[Deps] <dependency-description>" --body "..."
   ```

**Checklist - Phase 0**:
- [ ] 已列出并检查现有 GitHub Issues
- [ ] 已搜索与依赖优化任务相关的 Issue
- [ ] 已确认 Issue 状态（使用现有或创建新的）
- [ ] 已记录 Issue ID 用于后续关联

**常见错误**:
- ❌ 未检查现有 Issue，直接创建新 Issue → 导致重复 Issue
- ❌ 未记录 Issue ID → 后续无法关联 PR 和 Issue

---

### Phase 1: 分析 (Analysis)

#### Step 1: 依赖树分析
1. 生成完整依赖树
2. 识别直接依赖 vs 间接依赖
3. 识别依赖层级深度
4. 识别循环依赖（如有）

#### Step 2: 未使用依赖识别
1. 静态分析代码 import/require
2. 对比 package.json 依赖列表
3. 识别声明但未使用的依赖
4. 识别间接但无路径可达的依赖

#### Step 3: 重复依赖识别
1. 检查功能重复的依赖
2. 检查版本重复（同一依赖多版本）
3. 检查可替代的依赖
4. 评估合并可能性

#### Step 4: 安全风险识别
1. 运行安全审计（npm audit / yarn audit）
2. 识别已知漏洞依赖
3. 识别高风险依赖类型
4. 评估修复优先级

### Phase 2: 优化 (Optimization)

#### Step 5: 制定优化计划
1. 分类优化项（删除/替换/升级/合并）
2. 评估每项影响
3. 设置优先级
4. 制定分步执行计划

#### Step 6: 执行优化
对每个优化项：
1. 执行单一优化动作
2. 运行构建验证
3. 运行测试验证
4. 提交可工作的状态

#### Step 7: 持续验证
- [ ] 构建成功
- [ ] 测试通过
- [ ] 功能无影响
- [ ] 性能改善（预期）

### Phase 3: 验证 (Verification)

#### Step 8: 最终验证
1. 全量构建测试
2. 全量测试运行
3. Bundle 体积对比（如适用）
4. 构建时间对比

#### Step 9: 文档更新
1. 更新依赖文档
2. 记录优化决策
3. 记录已知限制
4. 更新维护指南

### Phase 4: 总结 (Summary)

#### Step 10: 生成优化总结
1. 列出所有依赖变更
2. 描述优化效果
3. 记录风险和问题
4. 提供后续建议

## Output Requirements

```yaml
dependency_optimization_summary:
  dispatch_id: string
  task_id: string
  
  analysis:
    dependency_count:
      before: number
      after: number
    unused_dependencies: string[]
    duplicate_dependencies: string[]
    security_issues: number
    
  optimizations:
    removed:
      - name: string
        reason: string          # 为什么删除
        impact_verification: string
        
    replaced:
      - old: string
        new: string
        reason: string
        reduction: string       # 如体积减少
        
    upgraded:
      - name: string
        old_version: string
        new_version: string
        reason: string
        
    merged:
      - into: string
        from: string[]
        reason: string
        
  verification:
    build_status: pass | fail
    test_status: pass | fail
    bundle_size_before: string | null
    bundle_size_after: string | null
    build_time_before: string | null
    build_time_after: string | null
    
  known_issues:
    - issue: string
      severity: low | medium | high
      planned_fix: string | null
      
  risks:
    - risk: string
      level: low | medium | high
      mitigation: string
      
  recommendation: SEND_TO_TEST | ROLLBACK | ESCALATE
  
  time_spent_minutes: number
```

## Dependency Analysis Commands

### npm/yarn 生态

| 命令 | 用途 | 输出 |
|------|------|------|
| `npm ls` | 查看依赖树 | 层级结构 |
| `npm ls --depth=0` | 仅直接依赖 | 简洁列表 |
| `npm audit` | 安全审计 | 漏洞报告 |
| `depcheck` | 未使用依赖检测 | 未使用列表 |
| `npm dedupe` | 去重依赖 | 合并结果 |

### 分析工具

| 工具 | 用途 | 安装 |
|------|------|------|
| `depcheck` | 未使用依赖检测 | `npm i -g depcheck` |
| `npm-check` | 依赖健康检查 | `npm i -g npm-check` |
| `bundlephobia` | 体积分析 | Web 服务 |
| `webpack-bundle-analyzer` | Bundle 分析 | 项目依赖 |

## Examples

### 示例 1：清理未使用依赖

```yaml
dependency_optimization_summary:
  dispatch_id: "dispatch-deps-001"
  task_id: "T-DEPS-001"
  
  analysis:
    dependency_count:
      before: 42
      after: 35
    unused_dependencies:
      - "left-pad"          # 已被原生 String.padStart 替代
      - "moment"            # 已迁移到 date-fns
      - "request"           # 已迁移到 axios
      - "lodash"            # 仅使用 2 个方法，可用原生替代
    duplicate_dependencies: []
    security_issues: 0
    
  optimizations:
    removed:
      - name: "left-pad"
        reason: "String.padStart available since Node 8"
        impact_verification: "Tests pass, no imports found"
        
      - name: "moment"
        reason: "Project migrated to date-fns"
        impact_verification: "Tests pass, no moment imports"
        
      - name: "request"
        reason: "Project uses axios for HTTP"
        impact_verification: "Tests pass, no request imports"
        
      - name: "lodash"
        reason: "Only used _.cloneDeep and _.merge - replaced with native implementations"
        impact_verification: "Tests pass, manual cloneDeep review"
        
  verification:
    build_status: pass
    test_status: pass
    bundle_size_before: "2.1 MB"
    bundle_size_after: "1.4 MB"
    build_time_before: "45s"
    build_time_after: "32s"
    
  known_issues: []
  
  risks:
    - risk: "Native cloneDeep may have edge case differences"
      level: low
      mitigation: "Added unit tests for cloneDeep scenarios"
      
  recommendation: SEND_TO_TEST
  time_spent_minutes: 60
```

## Checklists

### 分析阶段
- [ ] 生成依赖树
- [ ] 运行 depcheck
- [ ] 运行安全审计
- [ ] 识别优化项

### 优化阶段
- [ ] 每项独立优化
- [ ] 构建验证
- [ ] 测试验证
- [ ] 提交验证

### 验证阶段
- [ ] 全量构建
- [ ] 全量测试
- [ ] Bundle 体积对比
- [ ] 构建时间对比

### 总结阶段
- [ ] 列出所有变更
- [ ] 描述优化效果
- [ ] 记录风险
- [ ] 更新文档

## Common Failure Modes

| 失误模式 | 表现 | 处理建议 |
|----------|------|----------|
| 删除被用依赖 | 构建或测试失败 | 回滚，重新分析 |
| 替代不兼容 | 功能异常 | 回滚，选其他替代 |
| 版本升级冲突 | 依赖冲突 | 逐个升级，解决冲突 |
| 安全修复引入问题 | 功能异常 | 测试先行，评估替代 |

## Notes

### 与 feature-implementation 的关系
- dependency-minimization：清理依赖
- feature-implementation：可能添加新依赖

### 安全优先级
- 高危漏洞：立即修复
- 中危漏洞：计划修复
- 低危漏洞：评估修复

### 依赖添加原则
1. 是否真的需要？
2. 是否有轻量替代？
3. 是否维护良好？
4. 是否有安全记录？
5. 是否体积合理？

### 定期维护建议
- 每月：depcheck 扫描
- 每季度：安全审计
- 每半年：依赖健康评估