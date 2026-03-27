# Docs 角色示例

本文档展示 docs 角色的具体工作方式和 skill 使用。

---

## 角色定义

**docs** 负责文档同步，确保项目文档与代码实现保持一致。

### MVP Skills
- `readme-sync` - README 文档同步
- `changelog-writing` - 变更日志编写

### M4 Skills (可选)
- `architecture-doc-sync` - 架构文档同步
- `user-guide-update` - 用户指南更新

---

## 典型工作流程

### 输入
```yaml
dispatch_id: dsp-docs-001
role: docs
command: sync-docs
title: 同步登录功能文档

inputs:
  - artifact_id: impl-login-v1
    artifact_type: implementation_summary
    
  - artifact_id: spec-login-v1
    artifact_type: spec

expected_outputs:
  - doc_update_report
```

### 执行过程

#### Step 1: 分析变更
```
docs 使用 artifact-reading skill 读取:
- implementation: 理解新增功能
- spec: 理解用户视角需求
```

#### Step 2: 更新 README
```
使用 readme-sync skill:
1. 更新功能列表
2. 更新 API 端点说明
3. 更新使用示例
```

#### Step 3: 更新 CHANGELOG
```
使用 changelog-writing skill:
1. 记录新增功能
2. 记录变更内容
3. 标记版本号
```

### 输出
```yaml
status: SUCCESS
summary: 完成文档同步

changed_files:
  - path: README.md
    change_type: modified
    change_summary: 添加登录 API 说明
    
  - path: CHANGELOG.md
    change_type: modified
    change_summary: 记录 v0.2.0 变更

recommendation: CONTINUE
```

---

## Skill 使用示例

### readme-sync

**何时使用**: 功能实现完成后

**同步检查清单**:
```
1. [ ] 功能列表是否更新?
2. [ ] API 端点是否记录?
3. [ ] 使用示例是否添加?
4. [ ] 配置说明是否完整?
5. [ ] 依赖列表是否更新?
```

**README 更新模板**:
```markdown
## API Endpoints

### POST /api/auth/login

用户登录认证。

**Request**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200)**:
```json
{
  "token": "string",
  "expiresIn": 86400
}
```

**Response (401)**:
```json
{
  "error": "用户名或密码错误"
}
```
```

### changelog-writing

**何时使用**: 版本发布前

**CHANGELOG 格式**:
```markdown
# Changelog

## [0.2.0] - 2026-03-28

### Added
- 用户登录功能 (POST /api/auth/login)
- JWT Token 认证支持

### Changed
- 更新依赖: jsonwebtoken@9.0.0, bcrypt@5.1.0

### Fixed
- N/A

### Security
- 密码使用 bcrypt 加密
- Token 有效期 24 小时
```

**变更类型**:
- `Added`: 新增功能
- `Changed`: 功能变更
- `Deprecated`: 即将废弃
- `Removed`: 已移除
- `Fixed`: 问题修复
- `Security`: 安全相关

---

## 文档质量检查

### 文档完整性
- [ ] 功能描述清晰
- [ ] 使用示例可运行
- [ ] 错误码有说明
- [ ] 配置项有默认值

### 文档准确性
- [ ] 与代码实现一致
- [ ] API 路径正确
- [ ] 参数类型正确
- [ ] 响应格式正确

### 文档可读性
- [ ] 结构清晰
- [ ] 语言简洁
- [ ] 示例充分

---

## 质量门禁

docs 输出必须满足:
- [ ] README 已更新
- [ ] CHANGELOG 已记录
- [ ] 文档与实现一致
- [ ] 示例代码可运行