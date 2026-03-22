# Skill: readme-sync

## Purpose

保证 README 与当前实现一致，让用户和开发者能获取最新的项目信息。

解决的核心问题：
- README 与代码不同步
- 新功能未文档化
- API 变更未更新
- 安装/使用说明过时

## When to Use

必须使用时：
- milestone 完成时
- 有用户可见的功能变更
- API 变更后
- 项目结构变更后

推荐使用时：
- 每次代码变更后
- 新功能发布后
- 发现 README 过时

## When Not to Use

不适用场景：
- 纯内部重构无外部影响
- 文档已自动同步
- 紧急修复（事后补）

## README Sections

### 1. Header
- 项目名称
- 一句话描述
- 徽章（版本、构建状态、许可）

### 2. 简介 (Introduction)
- 项目是什么
- 解决什么问题
- 核心特性

### 3. 安装 (Installation)
- 环境要求
- 安装步骤
- 依赖说明

### 4. 快速开始 (Quick Start)
- 最小示例
- 基本用法
- 常见场景

### 5. 功能特性 (Features)
- 主要功能列表
- 最新更新
- 路线图

### 6. API 文档 (API Documentation)
- 接口列表
- 参数说明
- 返回值说明
- 错误码

### 7. 配置 (Configuration)
- 配置项说明
- 环境变量
- 默认值

### 8. 贡献指南 (Contributing)
- 如何贡献
- 开发流程
- 提交规范

### 9. 许可 (License)
- 开源协议
- 版权声明

## Steps

### Step 1: 收集变更信息
1. 读取 implementation summary
2. 读取 changed_files
3. 读取 review summary
4. 识别用户可见变更

### Step 2: 分析当前 README
1. 读取现有 README
2. 识别需要更新的章节
3. 检查过时内容
4. 识别缺失章节

### Step 3: 确定更新范围
- 哪些章节需要更新？
- 哪些章节需要新增？
- 哪些章节可以删除？
- 哪些章节保持不变？

### Step 4: 生成更新内容
1. 更新功能特性
2. 更新 API 文档
3. 更新快速开始示例
4. 更新配置说明
5. 添加变更说明

### Step 5: 验证同步
1. 检查所有变更已反映
2. 检查代码示例可运行
3. 检查链接有效
4. 检查格式正确

### Step 6: 输出更新报告
生成 readme sync report

## Output Format

```yaml
readme_sync_report:
  dispatch_id: string
  task_id: string
  
  analysis:
    current_version: string
    new_version: string
    
    changes_detected:
      - type: feature | api | config | breaking
        description: string
        user_visible: boolean
        
  sections_updated:
    - section: string
      status: updated | added | removed | unchanged
      changes:
        - type: added | modified | deleted
          content: string
      reason: string
      
  sections_added:
    - section: string
      content: string
      reason: string
      
  sections_removed:
    - section: string
      reason: string
      
  code_examples_verified:
    - example: string
      verified: boolean
      notes: string
      
  links_verified:
    - link: string
      status: valid | broken | removed
      
  breaking_changes_documented:
    - change: string
      migration_guide: string
      
  sync_summary:
    sections_updated_count: number
    sections_added_count: number
    sections_removed_count: number
    lines_changed: number
    
  missing_documentation:
    - feature: string
      priority: high | medium | low
      reason: string
      
  recommendation:
    action: SYNC_COMPLETE | PARTIAL_SYNC | NEEDS_MANUAL_REVIEW
    next_steps: string[]
```

## Examples

### 示例 1：新增登录功能

```yaml
readme_sync_report:
  analysis:
    current_version: "v1.0.0"
    new_version: "v1.1.0"
    
    changes_detected:
      - type: feature
        description: "新增用户登录功能"
        user_visible: true
      - type: api
        description: "新增 POST /api/auth/login 接口"
        user_visible: true
        
  sections_updated:
    - section: "功能特性"
      status: updated
      changes:
        - type: added
          content: "- **用户认证**: 支持用户名/密码登录，JWT Token 认证"
      reason: "新增登录功能"
      
    - section: "API 文档"
      status: updated
      changes:
        - type: added
          content: |
            ### 登录
            
            ```http
            POST /api/auth/login
            Content-Type: application/json
            
            {
              "username": "string",
              "password": "string"
            }
            ```
            
            **响应**
            
            ```json
            {
              "success": true,
              "token": "eyJhbGc...",
              "user": {
                "id": "123",
                "username": "john"
              }
            }
            ```
      reason: "新增登录接口"
      
    - section: "快速开始"
      status: updated
      changes:
        - type: modified
          content: |
            ```javascript
            // 登录
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: 'john',
                password: 'secret'
              })
            });
            
            const { token } = await response.json();
            // 使用 token 调用其他 API
            ```
      reason: "添加登录示例"
      
  sections_added:
    - section: "认证"
      content: |
        ## 认证
        
        本 API 使用 JWT Token 认证。登录成功后获取 token，
        在后续请求 Header 中携带：
        
        ```
        Authorization: Bearer <token>
        ```
        
        Token 有效期为 24 小时。
      reason: "新功能需要说明认证机制"
      
  code_examples_verified:
    - example: "登录示例代码"
      verified: true
      notes: "已在本地测试通过"
      
  sync_summary:
    sections_updated_count: 3
    sections_added_count: 1
    sections_removed_count: 0
    lines_changed: 45
    
  recommendation:
    action: SYNC_COMPLETE
    next_steps:
      - "README 已更新，可提交"
```

### 示例 2：API 变更

```yaml
readme_sync_report:
  analysis:
    changes_detected:
      - type: breaking
        description: "API 响应格式变更：user 改为 userData"
        user_visible: true
        
  sections_updated:
    - section: "API 文档"
      status: updated
      changes:
        - type: modified
          content: |
            **旧格式** (v1.0)
            ```json
            { "user": { "id": "123" } }
            ```
            
            **新格式** (v1.1)
            ```json
            { "userData": { "id": "123" } }
            ```
      reason: "响应字段名变更"
      
  breaking_changes_documented:
    - change: "API 响应 user 字段改为 userData"
      migration_guide: |
        升级时更新代码：
        ```javascript
        // 旧代码
        const user = response.user;
        
        // 新代码
        const user = response.userData;
        ```
      
  recommendation:
    action: SYNC_COMPLETE
    next_steps:
      - "已添加迁移指南"
      - "考虑发送迁移通知给 API 用户"
```

### 示例 3：部分同步

```yaml
readme_sync_report:
  sections_updated:
    - section: "功能特性"
      status: updated
      
  sections_added: []
  
  missing_documentation:
    - feature: "高级配置选项"
      priority: medium
      reason: "配置项较多，需要专门文档页面"
      
    - feature: "错误码完整列表"
      priority: high
      reason: "API 用户需要了解所有错误码"
      
  recommendation:
    action: PARTIAL_SYNC
    next_steps:
      - "README 基础信息已更新"
      - "需要补充 docs/ 目录下的详细文档"
      - "建议创建 docs/api/errors.md"
```

## Checklists

### 更新前
- [ ] 变更已识别
- [ ] 当前 README 已读取
- [ ] 更新范围已确定

### 更新中
- [ ] 功能特性已更新
- [ ] API 文档已同步
- [ ] 示例代码已验证
- [ ] 格式已检查

### 更新后
- [ ] 链接已验证
- [ ] 示例可运行
- [ ] 无遗漏文档
- [ ] 报告已生成

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 遗漏更新 | 功能已变更但 README 未更新 | 建立变更检查清单 |
| 示例过时 | 代码示例无法运行 | 自动化测试示例 |
| 链接失效 | 文档链接指向 404 | 定期链接检查 |
| 信息过载 | README 过长 | 拆分到详细文档 |

## Notes

### 与 changelog-writing 的关系
- readme-sync 更新项目介绍
- changelog-writing 记录变更历史
- 两者配合使用

### README 长度
- 理想长度：1-2 屏可读完
- 详细内容链接到 docs/
- 保持简洁，重点突出

### 自动化
- 示例代码应可测试
- API 文档可从代码生成
- 徽章可自动更新

### 多语言
- 主要 README 用英文
- 可添加中文 README
- 保持内容同步
