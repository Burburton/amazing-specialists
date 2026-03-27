# Reviewer 角色示例

本文档展示 reviewer 角色的具体工作方式和 skill 使用。

---

## 角色定义

**reviewer** 负责独立审查，验证代码实现是否符合规格和最佳实践。

### MVP Skills
- `code-review-checklist` - 代码审查清单
- `spec-implementation-diff` - Spec 与实现对比
- `reject-with-actionable-feedback` - 可执行反馈

### M4 Skills (可选)
- `maintainability-review` - 可维护性审查
- `risk-review` - 风险评估审查

---

## 典型工作流程

### 输入
```yaml
dispatch_id: dsp-review-001
role: reviewer
command: review-task
title: 审查登录功能实现

inputs:
  - artifact_id: impl-login-v1
    artifact_type: implementation_summary
    
  - artifact_id: spec-login-v1
    artifact_type: spec
    
  - artifact_id: design-login-v1
    artifact_type: design_note
    
  - artifact_id: test-report-login-v1
    artifact_type: test_report

expected_outputs:
  - review_report
  - approval_decision
```

### 执行过程

#### Step 1: 读取所有 artifacts
```
reviewer 使用 artifact-reading skill 读取:
- spec: 理解需求
- design: 理解技术方案
- implementation: 理解实现细节
- test_report: 理解测试覆盖
```

#### Step 2: Spec vs Implementation 对比
```
使用 spec-implementation-diff skill:
1. 逐条对比 AC 与实现
2. 识别偏差
3. 记录不一致
```

#### Step 3: 代码审查
```
使用 code-review-checklist skill:
1. 代码质量检查
2. 安全检查
3. 性能检查
4. 可维护性检查
```

#### Step 4: 生成审查报告
```
使用 reject-with-actionable-feedback skill (如有问题):
1. 分类问题严重度
2. 给出具体修改建议
3. 明确阻塞/非阻塞
```

### 输出
```yaml
status: SUCCESS  # 或 FAILED_RETRYABLE
summary: 审查完成

decision: APPROVE  # 或 REJECT

issues_found:
  - severity: low
    description: 建议添加日志
    recommendation: 可后续优化

recommendation: CONTINUE  # 或 REWORK
```

---

## Skill 使用示例

### code-review-checklist

**何时使用**: 审查代码实现

**审查清单**:

```markdown
## 代码质量
- [ ] 命名语义清晰
- [ ] 无重复代码
- [ ] 函数长度适中
- [ ] 注释充分

## 安全性
- [ ] 无硬编码密钥
- [ ] 输入已验证
- [ ] 错误信息不泄露敏感信息
- [ ] 使用安全函数

## 性能
- [ ] 无 N+1 查询
- [ ] 无阻塞操作
- [ ] 资源正确释放

## 可维护性
- [ ] 结构清晰
- [ ] 依赖合理
- [ ] 易于扩展
```

### spec-implementation-diff

**何时使用**: 对比 spec 与实现

**对比矩阵**:

| Spec 要求 | 实现情况 | 状态 |
|-----------|----------|------|
| POST /api/auth/login | AuthController.login() | ✅ |
| 返回 200 + Token | HttpStatus.OK + token | ✅ |
| Token 含 userId | payload.userId | ✅ |
| 错误返回 401 | AuthenticationError | ✅ |

### reject-with-actionable-feedback

**何时使用**: 发现需要修复的问题

**问题分类**:

| 严重度 | 定义 | 示例 |
|--------|------|------|
| must-fix | 阻塞发布 | 安全漏洞、功能缺失 |
| should-fix | 建议修复 | 代码质量、性能 |
| nice-to-have | 可选改进 | 文档、命名 |

**反馈模板**:
```markdown
## Issue: {ISSUE-ID}

**严重度**: must-fix | should-fix | nice-to-have

**描述**: 清晰描述问题

**位置**: 
- 文件: xxx.ts
- 行号: 45

**当前代码**:
```typescript
// 当前实现
```

**建议修改**:
```typescript
// 改进后
```

**理由**: 为什么需要修改
```

---

## 审查报告模板

```markdown
# Review Report: {feature-name}

## 审查结论
**决策**: APPROVE | REJECT

## Spec vs Implementation 对比
| AC | 状态 | 说明 |
|----|------|------|
| AC-001 | ✅ | 实现符合规格 |

## 发现的问题

### Must-Fix (阻塞)
| ID | 描述 | 建议 |
|----|------|------|
| - | - | - |

### Should-Fix (建议)
| ID | 描述 | 建议 |
|----|------|------|
| S-001 | 建议添加日志 | 后续优化 |

## 测试覆盖评估
- 覆盖率: 94%
- 边界测试: 充分
- 错误路径: 已覆盖

## 审查签名
- 审查者: reviewer
- 日期: YYYY-MM-DD
```

---

## 质量门禁

reviewer 输出必须满足:
- [ ] 对比所有 AC 与实现
- [ ] 问题严重度正确分类
- [ ] 给出明确决策 (APPROVE/REJECT)
- [ ] 反馈具体可执行