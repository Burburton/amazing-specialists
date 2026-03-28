# Implementation Plan: 019-versioning-and-compatibility-foundation

## Metadata
```yaml
feature_id: 019-versioning-and-compatibility-foundation
feature_name: 版本化与兼容性治理基础
plan_version: 1.0.0
created_at: 2026-03-28
status: Draft
depends_on: [016-release-preparation, 017-contract-schema-pack, 018-template-and-bootstrap-foundation]
```

---

## Architecture Summary

本 Feature 建立正式的版本化与兼容性治理体系，将版本号从"标记"升级为"可承诺、可验证、可追溯的接口兼容语义"。

### Core Design Decisions

1. **版本对象层级模型**：采用 BR-001 定义的主版本/派生版本层级，Package Version 为主版本，Contract Pack、Template Pack、Profile、Tooling 为派生版本
2. **兼容性矩阵设计**：采用 JSON 格式存储，支持程序化查询，兼容状态使用三值模型（compatible / compatible_with_migration / incompatible）
3. **治理文档同步**：版本变更触发 BR-011 定义的文档同步义务，与 AH-005 审计规则集成
4. **Audit 集成**：Release Checklist 必须包含 AH-001~AH-006 验证步骤

---

## Inputs from Spec

### Business Rules (BR)
| Rule ID | Description | Implementation Impact |
|---------|-------------|----------------------|
| BR-001 | Version Object Hierarchy | 定义 VERSIONING.md 主架构 |
| BR-002 | SemVer for Package Version | VERSIONING.md 详细触发条件表 |
| BR-003 | SemVer for Contract Pack | VERSIONING.md 触发条件表 |
| BR-004 | SemVer for Template Pack | VERSIONING.md 触发条件表 |
| BR-005 | SemVer for Profile | VERSIONING.md 触发条件表 |
| BR-006 | SemVer for Tooling | VERSIONING.md 触发条件表 |
| BR-007 | Compatibility Matrix Structure | compatibility-matrix.json schema |
| BR-008 | Changelog Discipline Enhancement | CHANGELOG.md 格式规范 |
| BR-009 | Migration Guide Framework | migration-guide-template.md |
| BR-010 | Release Checklist Integration | release-checklist-enhanced.md |
| BR-011 | Docs Sync on Version Change | VERSIONING.md 同步规则表 |

### Non-functional Requirements (NFR)
| NFR ID | Description | Implementation |
|--------|-------------|----------------|
| NFR-001 | Version Discoverability | package-lifecycle.md + registry.json + pack-version.json |
| NFR-002 | Compatibility Matrix Query | compatibility-matrix.json + schema |
| NFR-003 | Migration Guide Accessibility | docs/migration/ 目录结构 |
| NFR-004 | Audit Integration | Release Checklist AH 步骤 |
| NFR-005 | CI Integration Points | docs/ci-integration-points.md |

### Acceptance Criteria Traceability
| AC ID | Primary Deliverable | Validation Method |
|-------|--------------------|--------------------|
| AC-001 | VERSIONING.md | Governance alignment check |
| AC-002 | VERSIONING.md | Trigger condition completeness review |
| AC-003 | compatibility-matrix.json + schema | JSON schema validation |
| AC-004 | migration-guide-template.md | Template usability review |
| AC-005 | release-checklist-enhanced.md | Checklist completeness check |
| AC-006 | CHANGELOG.md update | Format compliance check |
| AC-007 | BR-011 in VERSIONING.md | Rule integration check |
| AC-008 | docs/ci-integration-points.md | Integration point definition check |
| AC-009 | Governance documents update | AH-001~AH-006 audit |
| AC-010 | All deliverables | Path resolution + schema validation |

---

## Technical Constraints

### Existing Artifacts to Preserve
1. **package-lifecycle.md** - 增强 SemVer 部分，不替换整体结构
2. **contracts/pack/registry.json** - 保持现有契约元数据，添加版本语义字段（如需要）
3. **templates/pack/pack-version.json** - 保持现有结构，确保与 Package Version 关系明确
4. **CHANGELOG.md** - 保持现有格式，添加本 Feature 条目

### Governance Constraints
1. 不修改 `role-definition.md` - 本 Feature 不涉及角色边界变更
2. 不修改 `io-contract.md` - 本 Feature 不涉及契约字段变更
3. 不修改 `quality-gate.md` - 使用现有 AH-001~AH-006 规则
4. 不修改 `.opencode/commands/` - 不新增或修改命令

### Format Constraints
1. compatibility-matrix.json 必须符合 JSON Schema Draft 2020-12
2. Migration Guide 文件名必须遵循 `v{FROM}-to-v{TO}.md` 格式
3. 所有 JSON 文件必须包含 `$schema` 字段

---

## Module Decomposition

### Module 1: VERSIONING.md - 版本化对象与 SemVer 规则
**Scope**: 定义 5 类版本化对象、层级关系、SemVer 触发条件、文档同步规则

**Structure**:
```
VERSIONING.md
├── 1. Version Object Definitions
│   ├── Package Version (主版本)
│   ├── Contract Pack Version (派生)
│   ├── Template Pack Version (派生)
│   ├── Profile Version (派生)
│   └── Tooling Version (独立)
├── 2. Version Object Hierarchy (BR-001)
├── 3. SemVer Rules
│   ├── Package Version (BR-002)
│   ├── Contract Pack Version (BR-003)
│   ├── Template Pack Version (BR-004)
│   ├── Profile Version (BR-005)
│   └── Tooling Version (BR-006)
├── 4. Version Number Storage Locations
├── 5. Docs Sync Rules (BR-011)
├── 6. Version Planning Workflow
└── 7. References
```

### Module 2: Compatibility Matrix Schema
**Scope**: 定义兼容性矩阵 JSON 结构和 schema

**Files**:
- `compatibility-matrix.json` - 实际兼容性矩阵数据
- `compatibility-matrix.schema.json` - JSON Schema 定义

**Schema Structure**:
```json
{
  "matrix_id": "string",
  "created_at": "date-time",
  "updated_at": "date-time",
  "versions": [
    {
      "package_version": "semver",
      "contract_pack_version": "semver",
      "template_pack_version": "semver",
      "profiles": ["minimal", "full"],
      "node_version": "semver-range",
      "opencode_version": "semver-range"
    }
  ],
  "compatibility_entries": [
    {
      "from_version": {...},
      "to_version": {...},
      "status": "compatible|compatible_with_migration|incompatible",
      "migration_guide": "path|null",
      "notes": "string|null"
    }
  ]
}
```

### Module 3: Migration Guide Framework
**Scope**: 建立 Migration Guide 模板和示例

**Files**:
- `docs/templates/migration-guide-template.md` - 模板文档
- `docs/migration/v0-to-v1.md` - 更新后的迁移指南（参考现有 package-lifecycle.md 内容）

**Template Structure**:
```markdown
# Migration Guide: v{FROM} to v{TO}

## Upgrade Path
- From: v{FROM}
- To: v{TO}

## Breaking Changes
<!-- 列出所有 breaking changes -->

## Step-by-Step Instructions
<!-- 逐步迁移步骤 -->

## Validation Steps
<!-- 迁移后验证 -->

## Rollback Instructions
<!-- 回滚步骤（如有） -->

## References
```

### Module 4: Enhanced Release Checklist
**Scope**: 增强 Release Checklist，集成 SemVer 验证、兼容性矩阵、Audit 步骤

**File**: `docs/validation/release-checklist-enhanced.md`

**Structure**:
```markdown
# Enhanced Release Checklist

## Pre-Release Verification

### 1. Version Planning
- [ ] 变更内容分析
- [ ] SemVer 规则判定
- [ ] 版本号更新

### 2. SemVer Verification
- [ ] Package Version 触发条件判定正确
- [ ] Contract Pack Version 触发条件判定正确（如适用）
- [ ] Template Pack Version 触发条件判定正确（如适用）

### 3. Compatibility Matrix
- [ ] 兼容性矩阵更新（如需要）
- [ ] Migration Guide 编写（如需要）

### 4. Governance Audit (AH-001~AH-006)
- [ ] AH-001: Canonical Comparison
- [ ] AH-002: Cross-Document Consistency
- [ ] AH-003: Path Resolution
- [ ] AH-004: Status Truthfulness
- [ ] AH-005: README Governance Sync
- [ ] AH-006: Enhanced Reviewer Responsibilities

### 5. Docs Sync
- [ ] README.md 更新（MINOR/MAJOR）
- [ ] package-lifecycle.md 更新
- [ ] CHANGELOG.md 更新
- [ ] 其他治理文档更新（如需要）

### 6. Contract & Template Verification
- [ ] Contract Schema 验证
- [ ] Template Pack 验证
```

### Module 5: CI Integration Points
**Scope**: 定义 CI 接入点（不实现）

**File**: `docs/ci-integration-points.md`

**Integration Points**:
| Script | Purpose | Status |
|--------|---------|--------|
| scripts/validate-version.sh | 版本号格式验证 | Defined, not implemented |
| scripts/validate-compatibility.sh | 兼容性矩阵验证 | Defined, not implemented |
| scripts/validate-changelog.sh | CHANGELOG 格式验证 | Defined, not implemented |

---

## Data Flow

### Workflow 1: Version Planning
```
Maintainer 分析变更
  -> 判断变更级别（BR-002~BR-006）
  -> 更新版本号（package-lifecycle.md, pack-version.json, registry.json）
  -> 更新 CHANGELOG.md（BR-008）
  -> 更新兼容性矩阵（如需要）
  -> 编写 Migration Guide（如需要）
  -> 执行 release-checklist-enhanced.md
  -> 通过 AH-001~AH-006 audit
  -> 发布
```

### Workflow 2: Compatibility Query
```
Consumer 请求兼容性
  -> 查询 compatibility-matrix.json
  -> 返回 compatibility_entries
  -> 若 compatible_with_migration -> 提供 migration guide path
  -> Consumer 执行迁移步骤
```

### Workflow 3: Release Gate
```
准备发布
  -> 执行 release-checklist-enhanced.md
  -> SemVer 验证通过
  -> Compatibility Matrix 更新完成（如需要）
  -> AH-001~AH-006 audit 通过
  -> 发布版本
```

---

## Failure Handling

### Failure Scenario 1: SemVer 判定错误
**Detection**: AH-002 Cross-Document Consistency 检查发现版本号与变更内容不匹配
**Resolution**: 回退版本号更新，重新判定变更级别
**Severity**: major

### Failure Scenario 2: Compatibility Matrix 缺失条目
**Detection**: Consumer 查询时发现缺少版本对兼容性信息
**Resolution**: 立即补充缺失条目，标注为 "pending review"
**Severity**: major

### Failure Scenario 3: Migration Guide 缺失
**Detection**: Compatibility Matrix 显示 compatible_with_migration 但 migration guide path 为 null
**Resolution**: 暂停发布，补充 Migration Guide
**Severity**: blocker

### Failure Scenario 4: Docs Sync 未执行
**Detection**: AH-005 README Governance Sync 检查发现状态不一致
**Resolution**: 执行文档同步，重新 audit
**Severity**: major

### Failure Scenario 5: Version Object 层级冲突
**Detection**: Contract Pack Version 独立更新但 Package Version 未同步
**Resolution**: 根据 BR-001 规则，Contract Pack patch 更新不触发 Package 更新（合规），若 Contract Pack major 更新则必须同步 Package major
**Severity**: 按变更级别判定

---

## Validation Strategy

### 1. Governance Alignment Validation (AH-001~AH-006)
使用现有 `docs/audit-hardening.md` 规则：
- AH-001: VERSIONING.md 与 role-definition.md/package-spec.md 无冲突
- AH-002: VERSIONING.md、CHANGELOG.md、README.md 流程一致
- AH-003: 所有声明路径可 resolve
- AH-004: Completion status truthfulness
- AH-005: README 同步版本化体系说明
- AH-006: Reviewer 检查版本合规性

### 2. JSON Schema Validation
```bash
# 验证 compatibility-matrix.json
node contracts/pack/validate-schema.js compatibility-matrix.json compatibility-matrix.schema.json
```

### 3. SemVer Trigger Condition Review
检查 BR-002~BR-006 触发条件表：
- 每类变更都有明确的级别判定
- 示例覆盖典型场景
- 无遗漏变更类型

### 4. Migration Guide Template Usability
检查模板：
- 包含 BR-009 所有必需部分
- 可复用于任意版本迁移
- 结构清晰易懂

### 5. Release Checklist Completeness
检查 release-checklist-enhanced.md：
- 包含 BR-010 所有必需步骤
- AH-001~AH-006 步骤明确
- 与现有 release-checklist.md 无冲突

---

## Risks / Tradeoffs

### Risk 1: 版本对象边界模糊
**Description**: 实际变更可能同时影响多个版本对象（如新增 role 同时影响 Package 和 Template）
**Mitigation**: BR-001 定义层级关系，明确"主版本优先"原则 - Package Version 变更触发派生版本同步
**Severity**: medium

### Risk 2: Compatibility Matrix 维护成本
**Description**: 每次版本变更都需要更新矩阵，可能遗漏
**Mitigation**: Release Checklist 强制检查，CI 接入点定义（未来实现自动化验证）
**Severity**: medium

### Risk 3: Migration Guide 编写负担
**Description**: MINOR/MAJOR 版本可能需要详细迁移指南
**Mitigation**: 提供模板，鼓励渐进式迁移，minimal profile 用户可能无需迁移
**Severity**: low

### Risk 4: 多版本并发问题（Open Question）
**Description**: Spec 提出多版本并发问题，但当前假设单 Package 模式
**Mitigation**: 明确 Assumption，未来扩展时重新设计矩阵
**Severity**: low (当前阶段)

### Risk 5: Governance 文档膨胀
**Description**: VERSIONING.md 可能过长，影响阅读
**Mitigation**: 使用表格和结构化格式，必要时拆分为子文档
**Severity**: low

### Tradeoff 1: CI 接入点定义但不实现
**Reason**: 本 Feature scope 明确不实现自动化 CI 系统
**Impact**: 依赖手动执行 release checklist，未来 Feature 可实现自动化

### Tradeoff 2: Contract Pack Version 继承 Package Version
**Reason**: BR-001 定义 Contract Pack 派生关系
**Impact**: Contract Pack patch 可独立，但 major 必须跟随 Package major

---

## Requirement Traceability

### BR to Deliverable Mapping
| BR ID | Deliverable | Section |
|-------|-------------|---------|
| BR-001 | VERSIONING.md | Section 2 - Version Object Hierarchy |
| BR-002 | VERSIONING.md | Section 3.1 - Package Version SemVer |
| BR-003 | VERSIONING.md | Section 3.2 - Contract Pack SemVer |
| BR-004 | VERSIONING.md | Section 3.3 - Template Pack SemVer |
| BR-005 | VERSIONING.md | Section 3.4 - Profile SemVer |
| BR-006 | VERSIONING.md | Section 3.5 - Tooling SemVer |
| BR-007 | compatibility-matrix.json + schema | Full schema structure |
| BR-008 | CHANGELOG.md update | Format enhancement |
| BR-009 | migration-guide-template.md | Full template |
| BR-010 | release-checklist-enhanced.md | Full checklist |
| BR-011 | VERSIONING.md | Section 5 - Docs Sync Rules |

### AC to Validation Mapping
| AC ID | Validation Method | Validator |
|-------|-------------------|-----------|
| AC-001 | VERSIONING.md 内容审查 | reviewer |
| AC-002 | SemVer trigger condition completeness | reviewer |
| AC-003 | JSON schema validation + manual review | tester + reviewer |
| AC-004 | Template usability review | reviewer |
| AC-005 | Checklist completeness | reviewer |
| AC-006 | CHANGELOG format check | reviewer |
| AC-007 | BR-011 integration check | reviewer |
| AC-008 | CI points definition | reviewer |
| AC-009 | AH-001~AH-006 audit | reviewer |
| AC-010 | Path resolution + schema validation | tester |

---

## Assumptions

### Explicit Assumptions
1. **当前版本基线**: v1.0.0 为当前稳定版本，无前置版本兼容性问题
2. **OpenClaw 版本**: 暂不考虑 OpenClaw 版本兼容性（未来可扩展）
3. **Node Version**: Node >= 18.0.0 为唯一运行环境要求
4. **单 Package 模式**: 当前仅支持单一专家包版本（不考虑多包并发）
5. **Contract Schema Patch 不触发 Package Patch**: Contract Pack patch 级别更新视为独立修复

### Implicit Assumptions
1. 版本号更新由 Maintainer 手动执行（无自动化）
2. Compatibility Matrix 初版仅包含 v1.0.0 自兼容条目
3. Migration Guide v0-to-v1 已有基础内容（来自 package-lifecycle.md）

---

## Open Questions (Deferred)

1. **多版本并发问题**: 如存在 v1.x LTS + v2.x 新版，矩阵如何设计？
   - Deferred: 当前单 Package 模式，未来扩展时处理
   
2. **预发布版本处理**: alpha/beta/rc 是否纳入兼容性矩阵？
   - Deferred: 当前 v1.0.0 正式版本，预发布机制未建立
   
3. **回滚版本号问题**: 发布后回滚，版本号如何处理？
   - Partial Resolution: package-lifecycle.md 已有 Rollback Strategy，可沿用
   
4. **Contract Schema 与 Package Version 关系**: Contract patch 是否触发 Package patch？
   - Assumption: 不触发，Contract Pack patch 独立
   
5. **自动化 CI 范围**: 本 Feature 定义的 CI 接入点是否后续实现？
   - Deferred: 明确 Out of Scope，未来 Feature 可实现

---

## Implementation Phases

### Phase 1: VERSIONING.md Core Document
**Tasks**:
- T-001: Create VERSIONING.md with BR-001~BR-006 + BR-011
- T-002: Define version object hierarchy diagram
- T-003: Write SemVer trigger condition tables
- T-004: Define version number storage locations
- T-005: Define docs sync rules table

### Phase 2: Compatibility Matrix
**Tasks**:
- T-006: Create compatibility-matrix.schema.json
- T-007: Create compatibility-matrix.json with v1.0.0 baseline
- T-008: Validate JSON schema

### Phase 3: Migration Guide Framework
**Tasks**:
- T-009: Create docs/templates/migration-guide-template.md
- T-010: Update docs/migration/v0-to-v1.md (if exists) or create

### Phase 4: Enhanced Release Checklist
**Tasks**:
- T-011: Create docs/validation/release-checklist-enhanced.md
- T-012: Integrate AH-001~AH-006 steps
- T-013: Add SemVer verification section

### Phase 5: Secondary Deliverables
**Tasks**:
- T-014: Update package-lifecycle.md (enhance SemVer section)
- T-015: Update CHANGELOG.md (add 019 feature)
- T-016: Update README.md (add versioning system section)
- T-017: Create docs/ci-integration-points.md

### Phase 6: Governance Validation
**Tasks**:
- T-018: Run AH-001~AH-006 audit
- T-019: Create completion-report.md
- T-020: Final sign-off

---

## Dependencies

### Upstream Dependencies
| Feature | Dependency Type | Reason |
|---------|-----------------|--------|
| 016-release-preparation | Content Reference | release-checklist.md 为增强起点 |
| 017-contract-schema-pack | Content Reference | registry.json 包含契约版本信息 |
| 018-template-and-bootstrap-foundation | Content Reference | pack-version.json 包含模板版本信息 |

### Downstream Impact
| Potential Feature | Impact Type | Reason |
|-------------------|-------------|--------|
| Future CI Implementation | Integration Point | CI 接入点定义可被实现 |
| OpenClaw Integration | Consumer | OpenClaw 可查询兼容性矩阵 |
| Multi-Version Support | Extension | 多版本并发问题需扩展矩阵 |

---

## References

- `specs/019-versioning-and-compatibility-foundation/spec.md` - 本 Feature spec
- `package-lifecycle.md` - 现有版本策略
- `contracts/pack/registry.json` - 契约版本定义
- `templates/pack/pack-version.json` - 模板版本定义
- `templates/pack/content-index.json` - 内容分类定义
- `docs/audit-hardening.md` - AH-001~AH-006 规则
- `specs/016-release-preparation/release-checklist.md` - 现有 Release Checklist
- [Semantic Versioning Specification](https://semver.org/spec/v2.0.0.html)