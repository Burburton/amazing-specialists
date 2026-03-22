# Skill: changelog-writing

## Purpose

按结构化方式记录项目变更，让用户和开发者了解版本更新内容。

解决的核心问题：
- 变更记录缺失或不完整
- 变更描述不清晰
- 版本号管理混乱
- 无法追溯历史变更

## When to Use

必须使用时：
- milestone 完成时
- 版本发布时
- 有用户可见的变更时

推荐使用时：
- 每次 PR 合并时
- 每次发布时
- 定期汇总变更

## When Not to Use

不适用场景：
- 纯内部重构无外部影响
- 紧急热修复（事后补）
- 未发布的功能

## Changelog Format

### 版本号 (Semantic Versioning)
```
MAJOR.MINOR.PATCH

MAJOR - 不兼容的 API 变更
MINOR - 向后兼容的功能添加
PATCH - 向后兼容的问题修复
```

### Changelog 结构

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2026-03-22

### Added
- 新功能

### Changed
- 变更

### Deprecated
- 废弃功能

### Removed
- 删除功能

### Fixed
- 修复

### Security
- 安全修复
```

## Categories

| 类别 | 含义 | 示例 |
|------|------|------|
| **Added** | 新功能 | 新增登录接口 |
| **Changed** | 现有功能变更 | API 响应格式变更 |
| **Deprecated** | 废弃功能 | 某接口标记废弃 |
| **Removed** | 删除功能 | 删除旧版接口 |
| **Fixed** | Bug 修复 | 修复内存泄露 |
| **Security** | 安全修复 | 修复 SQL 注入 |

## Steps

### Step 1: 收集变更
1. 读取 implementation summary
2. 读取 changed_files
3. 读取 review summary
4. 读取 commit history

### Step 2: 分类变更
对每个变更：
1. 判断类型（Added/Changed/Fixed...）
2. 判断是否用户可见
3. 判断是否 breaking change
4. 确定重要程度

### Step 3: 撰写条目
每个条目应包含：
1. 变更简述（一句话）
2. 详细描述（可选）
3. 关联 issue/PR
4. 迁移说明（如需要）

### Step 4: 确定版本号
根据变更确定：
- MAJOR: 有 breaking change
- MINOR: 有新功能
- PATCH: 只有修复

### Step 5: 验证格式
1. 检查格式规范
2. 检查链接有效
3. 检查日期正确
4. 检查版本号顺序

### Step 6: 输出 Changelog Entry

## Output Format

```yaml
changelog_entry:
  dispatch_id: string
  task_id: string
  
  version:
    new_version: string
    previous_version: string
    bump_type: major | minor | patch
    bump_reason: string
    
  release_date: string
  
  changes:
    added:
      - description: string
        detail: string
        breaking: boolean
        migration: string
        references: string[]
        
    changed:
      - description: string
        detail: string
        breaking: boolean
        migration: string
        references: string[]
        
    deprecated:
      - description: string
        detail: string
        removal_version: string
        alternative: string
        
    removed:
      - description: string
        detail: string
        breaking: boolean
        migration: string
        
    fixed:
      - description: string
        detail: string
        references: string[]
        
    security:
      - description: string
        detail: string
        severity: critical | high | medium | low
        cve: string
        references: string[]
        
  contributors:
    - name: string
      changes: string[]
      
  stats:
    commits: number
    files_changed: number
    insertions: number
    deletions: number
    
  migration_guide:
    required: boolean
    steps: string[]
    breaking_changes: string[]
    
  full_changelog: string  # Markdown 格式完整内容
```

## Examples

### 示例 1：Minor 版本发布

```yaml
changelog_entry:
  version:
    new_version: "1.1.0"
    previous_version: "1.0.0"
    bump_type: minor
    bump_reason: "新增登录功能"
    
  release_date: "2026-03-22"
  
  changes:
    added:
      - description: "新增用户登录功能"
        detail: |
          支持用户名/密码登录，返回 JWT Token。
          包含密码强度验证和账号锁定保护。
        breaking: false
        references:
          - "#123"
          - "PR #456"
          
      - description: "新增认证中间件"
        detail: |
          提供 `authenticate()` 中间件保护 API 路由。
        breaking: false
        references:
          - "#124"
          
    changed:
      - description: "优化数据库连接池"
        detail: |
          默认连接池大小从 10 提升到 20。
        breaking: false
        references:
          - "#125"
          
    fixed:
      - description: "修复并发请求时的竞态条件"
        detail: |
          修复了高并发场景下的用户创建重复问题。
        references:
          - "#120"
          
  contributors:
    - name: "@alice"
      changes: ["新增登录功能", "认证中间件"]
    - name: "@bob"
      changes: ["优化连接池", "修复竞态条件"]
      
  stats:
    commits: 15
    files_changed: 12
    insertions: 450
    deletions: 80
    
  migration_guide:
    required: false
    steps: []
    breaking_changes: []
    
  full_changelog: |
    ## [1.1.0] - 2026-03-22
    
    ### Added
    - 新增用户登录功能 (#123, PR #456)
      - 支持用户名/密码登录
      - JWT Token 认证
      - 密码强度验证
      - 账号锁定保护
    - 新增认证中间件 (#124)
    
    ### Changed
    - 优化数据库连接池 (#125)
      - 默认连接池大小：10 → 20
    
    ### Fixed
    - 修复并发请求时的竞态条件 (#120)
    
    **Contributors**: @alice, @bob
```

### 示例 2：Major 版本发布

```yaml
changelog_entry:
  version:
    new_version: "2.0.0"
    previous_version: "1.5.0"
    bump_type: major
    bump_reason: "API 不兼容变更"
    
  release_date: "2026-03-22"
  
  changes:
    added:
      - description: "全新插件系统"
        detail: |
          支持自定义插件扩展功能。
        breaking: false
        references:
          - "#200"
          
    changed:
      - description: "API 认证方式变更"
        detail: |
          从 Query Parameter 认证改为 Header 认证。
        breaking: true
        migration: |
          旧代码：
          ```javascript
          fetch('/api?token=xxx')
          ```
          
          新代码：
          ```javascript
          fetch('/api', {
            headers: { 'Authorization': 'Bearer xxx' }
          })
          ```
        references:
          - "#201"
          
    removed:
      - description: "移除旧版 /v1 API"
        detail: |
          旧版 API 已完全移除，请使用 /v2。
        breaking: true
        migration: |
          将所有 /v1 调用改为 /v2，
          参考迁移指南 docs/migration-v1-v2.md
        references:
          - "#202"
          
    security:
      - description: "修复认证绕过漏洞"
        detail: |
          修复了在特定条件下可以绕过认证的问题。
        severity: critical
        references:
          - "#199"
          - "CVE-2026-1234"
          
  migration_guide:
    required: true
    steps:
      - "1. 更新所有 API 调用使用 Header 认证"
      - "2. 将 /v1 调用迁移到 /v2"
      - "3. 更新配置文件格式"
    breaking_changes:
      - "API 认证方式变更"
      - "移除 /v1 API"
      - "配置格式变更"
      
  full_changelog: |
    ## [2.0.0] - 2026-03-22
    
    ### Added
    - 全新插件系统 (#200)
    
    ### Changed
    - **BREAKING** API 认证方式变更 (#201)
      - 从 Query Parameter 改为 Header
      - 参见迁移指南
    
    ### Removed
    - **BREAKING** 移除旧版 /v1 API (#202)
      - 请使用 /v2 API
    
    ### Security
    - 修复认证绕过漏洞 (CVE-2026-1234, #199)
      - **建议所有用户立即升级**
    
    ### Migration Guide
    从 v1 升级到 v2 请参考 [迁移指南](./docs/migration-v1-v2.md)。
```

### 示例 3：Patch 版本发布

```yaml
changelog_entry:
  version:
    new_version: "1.0.1"
    previous_version: "1.0.0"
    bump_type: patch
    bump_reason: "Bug 修复"
    
  release_date: "2026-03-22"
  
  changes:
    fixed:
      - description: "修复登录时的空指针异常"
        detail: |
          当用户名为空时不再抛出异常，
          而是返回 400 错误。
        references:
          - "#110"
          
      - description: "修复 JWT Token 解析错误"
        detail: |
          某些特殊字符导致的解析失败已修复。
        references:
          - "#111"
          
  stats:
    commits: 3
    files_changed: 2
    insertions: 25
    deletions: 10
    
  migration_guide:
    required: false
    
  full_changelog: |
    ## [1.0.1] - 2026-03-22
    
    ### Fixed
    - 修复登录时的空指针异常 (#110)
    - 修复 JWT Token 解析错误 (#111)
```

## Checklists

### 撰写前
- [ ] 所有变更已收集
- [ ] 变更已分类
- [ ] 版本号已确定

### 撰写中
- [ ] 所有类别已覆盖
- [ ] Breaking changes 已标记
- [ ] 迁移说明已添加
- [ ] 贡献者已列出

### 撰写后
- [ ] 格式已检查
- [ ] 链接已验证
- [ ] 版本号顺序正确
- [ ] 日期正确

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 遗漏变更 | 有变更未记录 | 从 commit history 补全 |
| 分类错误 | 变更类型不对 | 参考类别定义 |
| 缺少迁移指南 | Breaking change 无迁移说明 | 必须补充 |
| 版本号错误 | 不符合语义化版本 | 检查变更性质 |

## Notes

### 与 readme-sync 的关系
- changelog-writing 记录历史变更
- readme-sync 更新当前状态
- 两者配合使用

### Keep a Changelog
遵循 [Keep a Changelog](https://keepachangelog.com/) 规范：
- 按版本分组
- 按类别分组
- 最新版本在上
- 保留历史版本

### 自动化
- 从 PR 标题提取变更
- 从 commit message 生成
- 从 issue 标签分类

### 版本号确定
问自己：
- 有 breaking change？→ MAJOR
- 有新功能？→ MINOR
- 只有修复？→ PATCH
