# Example 001: Feature Release

## Scenario

**Feature ID:** 007-docs-core
**Feature Name:** Docs 角色核心技能
**Change Type:** feature

## Context

The 007-docs-core feature has completed development and needs a changelog entry for release.

## Input Artifacts

### completion-report.md
```yaml
feature_id: 007-docs-core
feature_name: Docs 角色核心技能
completion_status: complete
deliverables:
  - readme-sync/SKILL.md (enhanced)
  - changelog-writing/SKILL.md (enhanced)
  - docs-sync-report-contract.md
  - changelog-entry-contract.md
  - validation documents
  - examples and anti-examples
known_gaps: []
```

### implementation-summary.md
```yaml
changed_files:
  - .opencode/skills/docs/readme-sync/SKILL.md
  - .opencode/skills/docs/changelog-writing/SKILL.md
  - README.md
known_issues: []
```

## Skill Execution

### Step 1: Consume Upstream Artifacts (BR-001)

```yaml
consumed_artifacts:
  - artifact: completion-report
    path: specs/007-docs-core/completion-report.md
    fields_used: [deliverables, known_gaps]
  - artifact: implementation-summary
    path: specs/007-docs-core/implementation-summary.md
    fields_used: [changed_files]
```

### Step 2: Classify Changes (BR-006)

| Change | Type | Rationale |
|--------|------|-----------|
| readme-sync skill enhancement | feature | New capability for docs role |
| changelog-writing skill enhancement | feature | New capability for docs role |
| Artifact contracts | feature | New structured outputs |
| Validation layer | feature | New quality assurance capability |

**Primary change_type:** feature

### Step 3: Write Entries

Each entry is specific and actionable:
- "实现 docs 角色核心技能" - specific, not "various improvements"
- "readme-sync: README 文档同步能力" - detailed breakdown
- "changelog-writing: 结构化变更日志生成" - specific capability

### Step 4: Determine Version

- Previous version: 1.2.0
- Has new features (feature type): MINOR bump
- New version: 1.3.0

### Step 5: Truthful Limitations (BR-008)

- known_gaps: [] (empty)
- No limitations to hide
- known_limitations: []

## Output Artifact

```yaml
changelog_entry:
  feature_id: "007-docs-core"
  feature_name: "Docs 角色核心技能"
  
  version:
    new_version: "1.3.0"
    previous_version: "1.2.0"
    bump_type: minor
    bump_reason: "新功能：docs 角色核心技能实现"
    
  release_date: "2026-03-26"
  
  change_type: feature
  
  consumed_artifacts:
    - artifact: completion-report
      path: specs/007-docs-core/completion-report.md
      fields_used: [deliverables, known_gaps]
    - artifact: implementation-summary
      path: specs/007-docs-core/implementation-summary.md
      fields_used: [changed_files]
      
  summary: "实现 docs 角色核心技能：readme-sync 和 changelog-writing，包含完整 artifact contracts 和 validation layer"
  
  capability_changes:
    - description: "新增 readme-sync 正式技能"
      detail: |
        - README 文档同步能力
        - BR-001 到 BR-008 合规检查
        - docs-sync-report artifact 生成
      breaking: false
      references: ["007-docs-core"]
      
    - description: "新增 changelog-writing 正式技能"
      detail: |
        - 结构化变更日志生成
        - BR-006 变更类型区分
        - changelog-entry artifact 生成
      breaking: false
      references: ["007-docs-core"]
      
  docs_changes:
    - description: "新增 docs-sync-report contract"
      detail: "定义文档同步报告的标准格式（8 个必填字段）"
    - description: "新增 changelog-entry contract"
      detail: "定义变更日志条目的标准格式（10 个必填字段）"
      
  validation_changes:
    - description: "新增 upstream-consumability-checklist"
      detail: "验证上游工件消费的正确性"
    - description: "新增 downstream-consumability-checklist"
      detail: "验证下游交付的可消费性"
    - description: "新增 failure-mode-checklist"
      detail: "检测和预防常见文档失败模式（7 种反模式）"
      
  breaking_changes: []
  
  known_limitations: []
  
  related_features: ["003-architect-core", "004-developer-core", "005-tester-core", "006-reviewer-core"]
  
  full_changelog: |
    ## [1.3.0] - 2026-03-26
    
    ### feature
    - 实现 docs 角色核心技能 (007-docs-core)
      - readme-sync: README 文档同步能力，支持 BR-001 到 BR-008 合规检查
      - changelog-writing: 结构化变更日志生成，支持 BR-006 变更类型区分
    
    - 新增 artifact contracts
      - docs-sync-report contract: 文档同步报告标准格式
      - changelog-entry contract: 变更日志条目标准格式
    
    - 新增 validation layer
      - upstream-consumability-checklist
      - downstream-consumability-checklist
      - failure-mode-checklist
```

## BR Compliance Verification

- [x] **BR-001**: All changes reference consumed_artifacts
- [x] **BR-006**: All changes have explicit change_type
- [x] **BR-008**: No known gaps to hide
- [x] Format follows Keep a Changelog

## Key Decision Notes

1. **BR-006 Compliance:** Used specific "feature" type, not generic "Added"
2. **Specific Summary:** "实现 docs 角色核心技能..." not "Various improvements"
3. **Detailed Breakdown:** Each capability listed separately
4. **No Hidden Gaps:** completion-report shows complete, no limitations to disclose