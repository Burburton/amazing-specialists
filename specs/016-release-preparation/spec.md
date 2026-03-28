# 016-release-preparation

## Background

本 feature 旨在为 v1.0.0 正式发布做准备，确保项目处于最佳发布状态。需要完成以下工作：

1. **文档一致性检查**: 确保所有文档之间信息一致
2. **临时产物清理**: 删除/归档临时文件和过渡产物
3. **文档整理**: 优化文档结构和内容
4. **发布准备**: 创建版本标签和发布说明

## Goal

使项目达到可正式发布的状态：
- 所有文档内容一致、格式规范
- 无临时/调试文件残留
- 项目结构清晰、易于理解

## Scope

### In Scope

#### 1. 文档一致性检查
- README.md 与各 feature completion-report 状态一致
- CHANGELOG.md 与实际 feature 列表一致
- docs/enhanced-mode-guide.md 与 skills 清单一致
- 各 spec.md status 字段与实际状态一致

#### 2. 临时产物清理
- 检查并清理 `specs/` 目录下的临时文件
- 检查是否有调试/测试文件残留
- 归档或删除过时的过渡文档

#### 3. 文档整理
- 统一文档格式和术语
- 确保所有必要文档存在且内容完整
- 检查文档引用链接有效性

#### 4. 发布准备
- 验证所有 AH-001~AH-006 规则
- 创建版本标签检查清单
- 准备发布说明

### Out of Scope
- 代码功能修改
- 新功能开发
- 性能优化

## Actors

| Actor | Role | Responsibility |
|-------|------|----------------|
| reviewer | reviewer | 执行文档一致性检查 |
| docs | docs | 清理和整理文档 |
| tester | tester | 验证所有链接和引用 |

## Acceptance Criteria

| ID | Criterion | Validation Method |
|----|-----------|-------------------|
| AC-001 | 文档一致性验证通过 | 所有文档状态/内容一致 |
| AC-002 | 临时产物已清理 | 无临时/调试文件残留 |
| AC-003 | 文档结构优化完成 | 目录结构清晰规范 |
| AC-004 | AH-001~AH-006 验证通过 | Governance 审计通过 |
| AC-005 | 发布准备完成 | 发布检查清单完成 |

## Tasks Overview

### Phase 1: 文档一致性检查
- [ ] T-1.1: 检查 README.md feature 表格与 completion-report 状态一致性
- [ ] T-1.2: 检查 CHANGELOG.md 与实际 feature 列表一致性
- [ ] T-1.3: 检查 skills 清单与 .opencode/skills/ 目录一致性
- [ ] T-1.4: 检查文档引用链接有效性

### Phase 2: 临时产物清理
- [ ] T-2.1: 扫描并识别临时/过渡文件
- [ ] T-2.2: 决定清理或归档策略
- [ ] T-2.3: 执行清理操作

### Phase 3: 文档整理
- [ ] T-3.1: 统一文档格式
- [ ] T-3.2: 补充缺失文档
- [ ] T-3.3: 优化文档结构

### Phase 4: 发布验证
- [ ] T-4.1: 执行 AH-001~AH-006 验证
- [ ] T-4.2: 创建发布检查清单
- [ ] T-4.3: 生成发布准备报告

## Assumptions

1. 项目核心功能已全部完成
2. 不需要新增功能
3. 清理操作不会影响核心功能

## Open Questions

1. 是否需要归档 `docs/archive/` 中的内容？
2. 是否有需要保留的调试文件？