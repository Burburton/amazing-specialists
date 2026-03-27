# Example 001: New Feature Release Sync

## Scenario

A new feature has been implemented and verified. The docs role needs to synchronize the user guide with the actual implementation, ensuring users can understand and use the new functionality.

## Input Context

### Upstream Artifacts

**implementation-summary.md** (specs/004-developer-core/implementation-summary.md):
```yaml
feature_id: 004-developer-core
user_visible_changes:
  - type: new_skill
    skill: feature-implementation
    description: "从 spec 到实现的工作流，支持 spec-driven 开发"
  - type: api_change
    api: /dispatch
    change: "新增 skill 参数"
api_changes:
  - endpoint: /dispatch
    change_type: added
    new_param: skill
    description: "指定要使用的 skill 类型"
known_issues: []
```

**verification-report.md**:
```yaml
user_workflow_verified: true
verified_workflows:
  - workflow: "feature-implementation workflow"
    steps_verified: 5
    issues: []
```

**design-note.md**:
```yaml
user_impact: medium
user_workflow_changes:
  - before: "手动实现功能"
    after: "使用 feature-implementation skill 从 spec 到实现"
```

## Execution Steps

### Step 1: Consume Upstream Artifacts

```yaml
consumed_artifacts:
  - artifact: implementation-summary
    path: specs/004-developer-core/implementation-summary.md
    fields_used: [user_visible_changes, api_changes]
  - artifact: verification-report
    path: specs/005-tester-core/verification-report.md
    fields_used: [user_workflow_verified, verified_workflows]
  - artifact: design-note
    path: specs/003-architect-core/design-note.md
    fields_used: [user_impact, user_workflow_changes]
```

### Step 2: Analyze Current User Guide

Current user guide shows:
```markdown
## Available Skills

### Common Skills
- artifact-reading
- context-summarization

### Developer Skills
- bugfix-workflow
- code-change-selfcheck
```

Current API reference shows:
```markdown
## /dispatch

Parameters:
- task_id (required)
- context (optional)
```

### Step 3: Determine User Impact Scope

Based on implementation-summary:
- New skill: feature-implementation (需要添加说明)
- API change: /dispatch 新增 skill 参数
- Workflow change: 用户可选择使用新 skill

### Step 4: Generate Updates

**Section: Available Skills**

Before:
```markdown
### Developer Skills
- bugfix-workflow
- code-change-selfcheck
```

After:
```markdown
### Developer Skills
- **feature-implementation** ✨ NEW - 从 spec 到实现的工作流
- bugfix-workflow
- code-change-selfcheck
```

**Section: API Reference**

Before:
```markdown
## /dispatch

Parameters:
- task_id (required)
- context (optional)
```

After:
```markdown
## /dispatch

Parameters:
- task_id (required)
- **skill** (optional) - NEW: 指定要使用的 skill 类型（如 "feature-implementation"）
- context (optional)
```

**Section: Workflow Guide**

Added new section:
```markdown
## Using feature-implementation Skill

### When to Use
- 当你需要从 spec 实现一个新功能
- 当你遵循 spec-driven 开发流程

### Steps
1. 凘备 spec.md 和 plan.md
2. 调用 /dispatch with skill="feature-implementation"
3. 系统自动执行实现工作流
```

### Step 5: Example Code Verification

Example code:
```bash
# Using the new skill
curl -X POST /dispatch \
  -d "task_id=task-001" \
  -d "skill=feature-implementation"
```

Verification result:
- Verified: ✅ (manual run)
- Output matches expected response

### Step 6: Cross-Document Consistency Check

- User guide vs README: ✅ Consistent (both show feature-implementation)
- User guide API vs actual: ✅ Consistent (skill param matches)
- Examples runnable: ✅ Verified

## Output Artifact

```yaml
user_guide_sync_report:
  sync_target:
    feature_id: "004-developer-core"
    feature_name: "Developer 角色核心技能"
    user_impact_level: medium
    
  consumed_artifacts:
    - artifact: implementation-summary
      path: specs/004-developer-core/implementation-summary.md
      fields_used: [user_visible_changes, api_changes]
    - artifact: verification-report
      path: specs/005-tester-core/verification-report.md
      fields_used: [user_workflow_verified]
    - artifact: design-note
      path: specs/003-architect-core/design-note.md
      fields_used: [user_impact, user_workflow_changes]
      
  touched_sections:
    - section: "Available Skills"
      status: updated
      change_reason: "新增 feature-implementation skill 说明"
      user_impact: "用户可以使用新 skill 实现功能"
      changes:
        - type: added
          content: "feature-implementation: 从 spec 到实现的工作流"
        
    - section: "API Reference > /dispatch"
      status: updated
      change_reason: "新增 skill 参数"
      user_impact: "用户可以通过 skill 参数指定执行类型"
      changes:
        - type: added
          content: "skill (optional) - 指定要使用的 skill 类型"
        
    - section: "Workflow Guide"
      status: added
      change_reason: "新增 feature-implementation 使用指南"
      user_impact: "用户了解如何使用新 skill"
      changes:
        - type: added
          content: "Using feature-implementation Skill 章节"
          
  api_changes:
    - api_endpoint: "/dispatch"
      change_type: added
      user_action_required: "无强制要求，新参数可选"
      evidence: "implementation-summary.md#api_changes"
      
  example_verification:
    - example_id: "curl-dispatch-example"
      verified: true
      verification_method: "手动运行 curl 命令"
      issues_found: []
      
  consistency_checks:
    user_guide_vs_readme:
      status: consistent
      details: "README 和用户指南都显示 feature-implementation skill"
    user_guide_api_vs_actual:
      status: consistent
      details: "/dispatch 参数与实际接口一致"
    examples_runnable:
      status: verified
      details: "示例代码已手动验证可运行"
      
  unresolved_ambiguities: []
  
  recommendation: sync-complete
```

## Key Decisions

1. **Minimal Surface Area**: Only updated 3 sections related to user-visible changes
2. **Evidence-Based**: All changes reference implementation-summary and verification-report
3. **User Impact Described**: Each section change explains user impact
4. **Examples Verified**: curl example manually verified to work

## BR Compliance Verification

- [x] **BR-001**: All updates reference consumed_artifacts
- [x] **BR-002**: touched_sections documented with change_reason
- [x] **BR-003**: API changes match implementation-summary
- [x] **BR-005**: Cross-document consistency verified
- [x] **Examples runnable**: All examples verified