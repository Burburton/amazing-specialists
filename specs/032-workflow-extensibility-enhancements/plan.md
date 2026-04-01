# Plan: 032-workflow-extensibility-enhancements

## Plan ID
`032-workflow-extensibility-enhancements`

## Feature Reference
`specs/032-workflow-extensibility-enhancements/spec.md`

## Version
`1.0.0`

## Created
2026-04-01

---

## Design Note

### Background

OpenClaw 工作流测试发现了专家包扩展性的三个改进点：

1. **Adapter 层**: Body Parser 硬编码，无法支持项目定制 Issue 格式
2. **Plugin 层**: 缺少执行能力，无法运行 build/test 命令
3. **Core 层**: Tester Skill Step 6 描述过于简单

### Feature Goal

通过配置驱动和 Plugin 扩展，使专家包支持项目级定制，同时保持核心层的泛化能力。

### Input Sources

| 来源 | 内容 |
|------|------|
| `specs/032-workflow-extensibility-enhancements/spec.md` | 需求定义 |
| `adapters/github-issue/body-parser.js` | 当前实现参考 |
| `plugins/vite-react-ts/plugin.json` | Plugin 结构参考 |
| `.opencode/skills/tester/unit-test-design/SKILL.md` | Tester Skill 参考 |

### Requirement-to-Design Mapping

| Requirement | Design Decision | Rationale |
|-------------|-----------------|-----------|
| R1: Body Parser 可配置 | 配置驱动的 section 解析 | 保持核心逻辑不变，通过配置扩展 |
| R2: Template → Command 映射 | 配置映射表 + 优先级规则 | 显式 label 优先，Template 作为 fallback |
| R3: Plugin Commands 配置 | plugin.json 新增 commands 字段 | 与现有 Plugin 结构兼容 |
| R4: Plugin 执行 Skills | 新增 run-tests, run-build skills | Skill 读取 plugin.json 配置 |
| R5: Tester Step 6 增强 | 细化为 4 个子步骤 | 提供更详细的执行指导 |

---

## Architecture Summary

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Configuration Layer                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  github-issue.config.json                                   │ │
│  │  ├── body_parser_config.sections                           │ │
│  │  └── template_mapping                                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  plugin.json (vite-react-ts)                                │ │
│  │  └── commands: { build, test, lint }                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Adapter Layer                            │
│  ┌────────────────────┐    ┌────────────────────┐               │
│  │  body-parser.js    │    │  issue-parser.js   │               │
│  │  (config-driven)   │    │  (template-aware)  │               │
│  └────────────────────┘    └────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Plugin Layer                             │
│  ┌────────────────────┐    ┌────────────────────┐               │
│  │  run-tests skill   │    │  run-build skill   │               │
│  │  (execute tests)   │    │  (execute build)   │               │
│  └────────────────────┘    └────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Core Layer                               │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  tester/unit-test-design/SKILL.md                          │ │
│  │  └── Step 6: 运行验证 (enhanced)                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Issue #123
    │
    ├── issue-parser.js
    │   ├── 读取 template_mapping 配置
    │   ├── 推断 Template 类型 (task.md)
    │   └── 映射到 command: implement-task
    │
    ├── body-parser.js
    │   ├── 读取 body_parser_config.sections 配置
    │   ├── 解析可配置的 sections
    │   └── 映射到 Dispatch Payload 字段
    │
    └── Dispatch Payload
        │
        ├── role: developer
        ├── command: implement-task
        └── verification_steps: [...] (新 section)

Developer 执行
    │
    ├── 实现代码
    │
    └── Tester 验证
        │
        ├── Step 6: 运行验证 (enhanced)
        │   ├── 6.1 检测测试命令 (plugin.json commands.test)
        │   ├── 6.2 执行测试 (run-tests skill)
        │   ├── 6.3 解析结果
        │   └── 6.4 生成报告
        │
        └── Verification Report
```

---

## Module Decomposition

### M1: Body Parser Enhancement (Adapter Layer)

| File | Changes |
|------|---------|
| `adapters/github-issue/body-parser.js` | 支持可配置 section 解析 |
| `adapters/github-issue/github-issue.config.json` | 新增 `body_parser_config` |
| `adapters/github-issue/tests/body-parser.test.js` | 新增测试 |

**Key Functions**:
```javascript
// body-parser.js
function parseBodyWithConfig(body, config) {
  const sections = config?.body_parser_config?.sections || DEFAULT_SECTIONS;
  return extractSections(body, sections);
}

function extractSections(body, sectionsConfig) {
  const result = {};
  for (const [sectionName, payloadField] of Object.entries(sectionsConfig.mapping)) {
    const content = extractSection(body, sectionName);
    if (content) {
      setNestedField(result, payloadField, content);
    }
  }
  return result;
}
```

### M2: Template Mapping (Adapter Layer)

| File | Changes |
|------|---------|
| `adapters/github-issue/issue-parser.js` | 支持 template_mapping |
| `adapters/github-issue/github-issue.config.json` | 新增 `template_mapping` |
| `adapters/github-issue/tests/issue-parser.test.js` | 新增测试 |

**Key Functions**:
```javascript
// issue-parser.js
function inferCommandFromTemplate(issue, config) {
  // 1. 显式 label 优先
  const labelCommand = extractCommandFromLabels(issue.labels);
  if (labelCommand) return labelCommand;
  
  // 2. Template 映射 fallback
  const templateName = inferTemplateName(issue);
  return config?.template_mapping?.[templateName] || 'implement-task';
}
```

### M3: Plugin Commands Configuration (Plugin Layer)

| File | Changes |
|------|---------|
| `plugins/PLUGIN-SPEC.md` | 新增 `commands` 字段规范 |
| `plugins/vite-react-ts/plugin.json` | 新增 `commands` 配置 |
| `plugins/loader.js` | 加载 commands 配置 |

**Configuration Schema**:
```json
{
  "commands": {
    "build": {
      "cmd": "string",
      "env": { "string": "string" },
      "description": "string"
    }
  }
}
```

### M4: Plugin Execution Skills (Plugin Layer)

| File | Changes |
|------|---------|
| `plugins/vite-react-ts/skills/run-tests/SKILL.md` | 新增 skill |
| `plugins/vite-react-ts/skills/run-build/SKILL.md` | 新增 skill |

**Skill Structure**:
```markdown
# Skill: run-tests

## Purpose
执行 Vite + Vitest 项目的测试

## Implementation
1. 读取 plugin.json 的 commands.test 配置
2. 执行测试命令
3. 解析测试结果
4. 返回测试报告
```

### M5: Tester Skill Enhancement (Core Layer)

| File | Changes |
|------|---------|
| `.opencode/skills/tester/unit-test-design/SKILL.md` | Step 6 增强 |

**Enhanced Content**:
```markdown
### Step 6: 运行验证

#### 6.1 检测测试命令
#### 6.2 执行测试
#### 6.3 解析结果
#### 6.4 生成报告
```

---

## Implementation Phases

### Phase 1: Adapter Enhancement (Priority: High)

**Goal**: Body Parser 支持可配置 section

**Tasks**:
- T-001: 定义 body_parser_config schema
- T-002: 修改 body-parser.js 支持配置解析
- T-003: 更新 github-issue.config.json 默认配置
- T-004: 编写单元测试

**Dependencies**: None

### Phase 2: Template Mapping (Priority: Medium)

**Goal**: Issue Template 自动映射到 command

**Tasks**:
- T-005: 定义 template_mapping schema
- T-006: 修改 issue-parser.js 支持 template 推断
- T-007: 更新默认配置
- T-008: 编写单元测试

**Dependencies**: Phase 1 (shared config structure)

### Phase 3: Plugin Commands (Priority: High)

**Goal**: Plugin 提供执行命令配置

**Tasks**:
- T-009: 更新 PLUGIN-SPEC.md
- T-010: 更新 vite-react-ts plugin.json
- T-011: 更新 plugin loader

**Dependencies**: None (independent)

### Phase 4: Plugin Execution Skills (Priority: High)

**Goal**: Plugin 提供测试/构建执行能力

**Tasks**:
- T-012: 创建 run-tests skill
- T-013: 创建 run-build skill
- T-014: 编写 skill 示例

**Dependencies**: Phase 3 (commands config)

### Phase 5: Core Skill Enhancement (Priority: Medium)

**Goal**: Tester Skill Step 6 增强

**Tasks**:
- T-015: 增强 Step 6 内容
- T-016: 更新示例

**Dependencies**: Phase 4 (plugin skills)

---

## Validation Strategy

### Unit Tests

| Component | Test File | Coverage |
|-----------|-----------|----------|
| body-parser.js | tests/body-parser.test.js | Section parsing, config loading |
| issue-parser.js | tests/issue-parser.test.js | Template inference, command mapping |
| Plugin loader | plugins/tests/loader.test.js | Commands loading |

### Integration Tests

| Scenario | Expected Behavior |
|----------|-------------------|
| Issue with custom sections | Body Parser extracts custom sections |
| Issue without command label | Template mapping provides default command |
| Plugin with commands | Skills can execute commands |

### E2E Test

```
1. Create Issue with custom template
2. GitHub Issue Adapter parses Issue
3. Verify Dispatch Payload contains custom fields
4. Execute developer workflow
5. Execute tester workflow with run-tests skill
6. Verify test execution and report
```

---

## Risks and Tradeoffs

### R1: Backward Compatibility Risk

**Risk**: 配置变更可能影响现有项目

**Mitigation**:
- 所有新配置有合理默认值
- 默认行为与现有实现一致
- 提供迁移文档

### R2: Template Inference Accuracy

**Risk**: Template 推断可能不准确

**Mitigation**:
- 显式 label 优先
- 无法推断时使用默认值
- 记录推断日志

### R3: Test Framework Compatibility

**Risk**: 不同测试框架输出格式不同

**Mitigation**:
- Phase 1 只支持 Vitest/Jest JSON 格式
- Phase 2 可扩展支持 pytest、go test
- Plugin 可自定义解析器

---

## Requirement Traceability

| Requirement | Design Section | Tasks |
|-------------|----------------|-------|
| R1: Body Parser 可配置 | M1: Body Parser Enhancement | T-001 ~ T-004 |
| R2: Template → Command 映射 | M2: Template Mapping | T-005 ~ T-008 |
| R3: Plugin Commands 配置 | M3: Plugin Commands Configuration | T-009 ~ T-011 |
| R4: Plugin 执行 Skills | M4: Plugin Execution Skills | T-012 ~ T-014 |
| R5: Tester Step 6 增强 | M5: Tester Skill Enhancement | T-015 ~ T-016 |

---

## References

- `specs/032-workflow-extensibility-enhancements/spec.md`
- `adapters/github-issue/body-parser.js`
- `plugins/PLUGIN-SPEC.md`
- `.opencode/skills/tester/unit-test-design/SKILL.md`