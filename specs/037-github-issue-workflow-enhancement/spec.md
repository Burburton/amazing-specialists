# Feature: GitHub Issue Workflow Enhancement

## Feature ID
`037-github-issue-workflow-enhancement`

## Status
`completed`

## Version
`1.0.0`

## Created
2026-04-04

## Overview

### Goal
增强 GitHub Issue Adapter 的工作流完整性，通过实际开发验证发现并修复 Issue 模板、流程闭环、角色触发等方面的缺陷。

### Background
在 amazing-specialist-face 测试项目中使用 GitHub Issue Workflow 进行实际开发（T-007, T-008），发现以下问题：

1. **Issue 模板缺失关键步骤** - 无 Pre-flight Check、Commit Guidance、Verification Commands
2. **Issue → Code Traceability 缺失** - 没有记录哪些文件对应哪个 Issue
3. **角色触发机制缺失** - Issue 完成后无 Reviewer/Test 触发
4. **Issue Workflow 未闭环** - 无 Reviewer 签核步骤

### Scope
**In Scope:**
- Issue 模板增强（Pre-flight Check、Verification Commands、Post-completion）
- Workflow 流程文档更新
- 角色触发机制定义
- Traceability 记录规范

**Out of Scope:**
- 自动化脚本实现（仅定义规范，实现作为后续 feature）
- 平台特定问题（PowerShell heredoc 等）

---

## Requirements

### Functional Requirements

#### FR-001: Issue Template Enhancement
增强 Issue 模板，添加以下章节：

1. **Pre-flight Check**
   - 依赖任务状态检查
   - 必需文件存在检查
   - 环境变量检查

2. **Verification Commands**
   - 明确的构建命令（如 `npx vite build --mode development`）
   - 类型检查命令（如 `npx tsc --noEmit`）
   - 测试命令（如 `npm test`）

3. **Post-completion**
   - Git commit 指导（commit message 格式）
   - PR 创建指导
   - Reviewer 指派指导

#### FR-002: Workflow Documentation Enhancement
更新 `adapters/github-issue/README.md`，添加完整 Workflow 步骤：

1. Pre-flight Check
2. Implementation
3. Verification
4. Completion Report
5. Reviewer Sign-off（新增）

#### FR-003: Role Trigger Mechanism
定义 Issue 完成后的角色触发机制：

1. **Reviewer 触发**
   - 高风险任务自动触发 `role:reviewer`
   - 可选配置：所有任务都需 reviewer 签核

2. **Tester 触发**
   - 涉及核心逻辑的任务自动触发 `role:tester`
   - 可选配置：强制测试验证

#### FR-004: Traceability Recording
定义 Issue → Code 的追溯规范：

1. Completion Comment 必须包含：
   - Files Changed 列表
   - Functions/Components 变更摘要
   - Verification 结果（build output 精华）

2. 可选：生成 `.issue-trace.json` 文件记录映射关系

### Non-Functional Requirements

#### NFR-001: Backward Compatibility
- 现有 Issue 格式仍然有效
- 新增章节为可选（推荐但不强制）

#### NFR-002: Documentation-First
- 先更新文档，再考虑自动化
- 文档变更需同步到 README.md

---

## Acceptance Criteria

### AC-001: Issue Template Enhanced
- [ ] `.github/ISSUE_TEMPLATE/task.md` 包含 Pre-flight Check 章节
- [ ] `.github/ISSUE_TEMPLATE/task.md` 包含 Verification Commands 章节
- [ ] `.github/ISSUE_TEMPLATE/task.md` 包含 Post-completion 章节

### AC-002: README.md Updated
- [ ] `adapters/github-issue/README.md` 包含完整 Workflow 步骤
- [ ] 包含 Reviewer Sign-off 步骤定义
- [ ] 包含 Role Trigger Mechanism 说明

### AC-003: Traceability Defined
- [ ] 定义 Completion Comment 格式规范
- [ ] 包含 Files Changed 列表要求
- [ ] 包含 Verification 结果要求

---

## Technical Constraints

### TC-001: 文档优先
本 feature 以文档更新为主，不涉及代码实现。

### TC-002: 向后兼容
所有新增内容为推荐项，不破坏现有流程。

---

## Dependencies

### Internal Dependencies
- Feature 021: GitHub Issue Adapter（已实现）
- Feature 027: GitHub Issue Adapter Enhancements（已实现）

---

## Risks

### Risk-001: 过度设计
- **描述**: 可能倾向于添加过多自动化功能
- **影响**: 延迟交付
- **缓解**: 严格遵守"文档优先"原则，自动化作为后续 feature

---

## Milestones

### M1: Issue Template Update
- 更新 `.github/ISSUE_TEMPLATE/task.md`
- 添加 Pre-flight Check、Verification Commands、Post-completion 章节

### M2: Documentation Update
- 更新 `adapters/github-issue/README.md`
- 添加完整 Workflow 步骤
- 添加 Role Trigger Mechanism

### M3: Traceability Definition
- 定义 Completion Comment 格式规范
- 更新 comment-templates.js 文档说明

---

## References

- `adapters/github-issue/README.md` - 现有 GitHub Issue Adapter 文档
- `.github/ISSUE_TEMPLATE/task.md` - 现有 Issue 模板
- `adapters/github-issue/comment-templates.js` - Comment 模板
- `role-definition.md` - 6-role 模型定义
- `collaboration-protocol.md` - 角色协作协议