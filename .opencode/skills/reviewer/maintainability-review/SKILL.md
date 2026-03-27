# Skill: maintainability-review

## Purpose

为 reviewer 提供系统化的代码可维护性评估框架，专注于识别影响长期维护效率的问题。

解决的核心问题：
- 技术债务累积未被发现
- 复杂代码导致后续修改困难
- 依赖关系混乱影响系统稳定性
- 缺乏文档使代码难以理解
- 设计原则违反导致扩展困难

## Business Rules Compliance

### BR-002: Self-Check Is Not Independent Verification
**Critical Distinction**: Developer self-check informs review but **cannot** replace reviewer verification.
- Self-check reports are hints for review focus areas, NOT evidence of correctness
- Reviewer must independently verify maintainability claims
- Review reports must explicitly distinguish "developer self-check claims" from "reviewer independently verified"
- Prohibited language: "Developer verified maintainability" → Required: "Reviewer independently verified..."

### BR-004: Severity Classification
Review findings must classify issues using the severity levels defined in `quality-gate.md`:

| Severity | Definition | Review Action |
|----------|------------|---------------|
| **blocker** | Must fix, blocks milestone acceptance | Must appear in `must_fix` list, blocks approval |
| **major** | Affects downstream or causes understanding deviation | Must appear in `should_fix` list, recommend fix |
| **minor** | Minor issue, improvement possible | Appears in `consider` list, optional |
| **note** | Informational observation | Appears in `positives` or separate notes |

### BR-007: Honesty Over False Confidence
Review reports must honestly disclose:
- What complexity was NOT fully analyzed
- Known gaps in maintainability coverage
- Assumptions made about future maintenance scenarios
- Areas requiring deeper architecture review

## Input Specifications

### Required Upstream Artifacts
- `implementation-summary` (from developer) - Changed files, complexity claims
- `design-note` (from architect, if exists) - Design specifications and patterns
- `spec.md` (feature spec) - Requirements and acceptance criteria

### Optional Upstream Artifacts
- `test-report` (from tester) - Test coverage data
- Code metrics (cyclomatic complexity, coupling metrics) - If available

## Output Specifications

### Primary Output
`maintainability-review-report` artifact with:
- `overall_maintainability_score`: 1-5 scale (poor to excellent)
- `complexity_analysis`: Hot spots and metrics
- `dependency_assessment`: Coupling and dependency risks
- `documentation_coverage`: Missing documentation areas
- `solid_compliance`: Design principle adherence
- `technical_debt_risk`: Estimated debt impact

### Downstream Consumers
- **developer**: Uses findings for refactoring decisions
- **architect**: Uses report for architecture review triggers
- **quality gate**: Uses score for maintainability threshold

## Upstream Artifact References
- `specs/004-developer-core/contracts/implementation-summary-contract.md`
- `specs/003-architect-core/contracts/design-note-contract.md`

## Downstream Artifact References
- `specs/006-reviewer-core/contracts/review-report-contract.md`
- `quality-gate.md` Section 3.4 - Reviewer Gate

## When to Use

必须使用时：
- 大型 PR review（超过 500 行改动）
- 遗留代码改造审查
- 技术债务评估审查
- 核心模块重构审查

推荐使用时：
- 新模块首次审查
- 复杂业务逻辑审查
- 长期维护关键代码审查

## When Not to Use

不适用场景：
- 简单配置变更（小于 50 行）
- 纯 UI 样式调整
- 紧急 bugfix（优先功能审查）
- 自动化生成代码（如 stub）

## Maintainability Review Categories

### 1. Complexity Analysis (复杂度分析)
- [ ] 圈复杂度是否合理（阈值：<15）？
- [ ] 函数长度是否适中（阈值：<50行）？
- [ ] 类大小是否合理（阈值：<500行）？
- [ ] 是否有嵌套过深的代码（阈值：<4层）？
- [ ] 是否有复杂的条件逻辑可简化？

### 2. Naming and Documentation (命名与文档)
- [ ] 变量命名是否清晰有意义？
- [ ] 函数命名是否准确描述行为？
- [ ] 是否有魔法数字/字符串需要常量化？
- [ ] 关键逻辑是否有注释说明？
- [ ] 公共 API 是否有文档？
- [ ] 复杂算法是否有解释？

### 3. Dependency Assessment (依赖关系评估)
- [ ] 是否有不必要的依赖？
- [ ] 依赖是否单向合理？
- [ ] 是否有循环依赖？
- [ ] 外部依赖版本是否稳定？
- [ ] 是否有隐式依赖（通过全局状态）？
- [ ] 模块边界是否清晰？

### 4. Test Coverage Check (测试覆盖率检查)
- [ ] 是否有单元测试覆盖核心逻辑？
- [ ] 测试是否覆盖边界条件？
- [ ] 测试是否易于理解和维护？
- [ ] 是否有集成测试覆盖模块交互？
- [ ] 测试命名是否清晰？

### 5. SOLID Principles Check (SOLID 原则检查)
- [ ] **S** - 单一职责：类/函数是否只有一个职责？
- [ ] **O** - 开放封闭：是否易于扩展无需修改？
- [ ] **L** - Liskov 替换：子类是否可替换父类？
- [ ] **I** - 接口隔离：接口是否最小必要？
- [ ] **D** - 依赖倒置：是否依赖抽象而非具体？

### 6. Code Duplication (代码重复)
- [ ] 是否有明显的重复代码？
- [ ] 相似逻辑是否可抽取？
- [ ] 是否有可复用的通用模式？
- [ ] 配置/常量是否集中管理？

### 7. Error Handling Quality (错误处理质量)
- [ ] 错误处理是否统一？
- [ ] 异常是否被正确捕获？
- [ ] 错误信息是否清晰？
- [ ] 是否有静默失败？
- [ ] 错误恢复是否合理？

## Steps

### Step 1: Preparation
1. Read design-note for expected patterns
2. Review implementation-summary for complexity claims
3. Identify files with high LOC changes
4. Determine maintainability focus areas

### Step 2: Complexity Scan
1. Identify long functions (>50 lines)
2. Find deeply nested code (>4 levels)
3. Count conditional branches per function
4. Locate complex algorithm implementations
5. Use tools if available (complexity analyzer)

### Step 3: Dependency Analysis
1. Map import/require dependencies
2. Check for circular dependencies
3. Evaluate coupling tightness
4. Identify hidden dependencies
5. Assess module boundaries

### Step 4: SOLID Assessment
1. Check Single Responsibility for each class
2. Evaluate Open/Closed adherence
3. Verify inheritance relationships (Liskov)
4. Review interface definitions (Interface Segregation)
5. Examine dependency direction (Dependency Inversion)

### Step 5: Documentation Review
1. Check public API documentation
2. Review inline comments for complex logic
3. Verify naming clarity
4. Identify magic numbers/strings
5. Assess README/usage docs if applicable

### Step 6: Test Coverage Assessment
1. Review test file structure
2. Check test naming conventions
3. Evaluate test clarity and maintainability
4. Identify missing coverage areas
5. Check for edge case tests

### Step 7: Generate Maintainability Report
Output maintainability-review-report with:
- Overall maintainability score (1-5)
- Complexity hot spots
- Dependency risks
- SOLID violations
- Documentation gaps
- Technical debt estimate

## Output Format

```yaml
maintainability_review_report:
  dispatch_id: string
  task_id: string
  reviewer: string
  timestamp: string
  
  # BR-002 Compliance
  self_check_acknowledged:
    status: string  # "Developer claims complexity is manageable"
    use: string     # "Hints for focus, NOT evidence"
  
  summary:
    overall_maintainability_score: 1-5  # 1=poor, 5=excellent
    score_reason: string
    
  complexity_analysis:
    hot_spots:
      - file: string
        function: string
        metric: string
        value: number
        threshold: number
        severity: blocker | major | minor
        suggestion: string
        
  dependency_assessment:
    total_dependencies: number
    new_dependencies: number
    circular_dependencies: string[]
    tight_coupling_areas:
      - location: string
        description: string
        severity: major | minor
        
  documentation_coverage:
    documented_apis: number
    undocumented_apis: number
    missing_comments:
      - location: string
        severity: minor
        suggestion: string
        
  solid_compliance:
    violations:
      - principle: S | O | L | I | D
        location: string
        description: string
        severity: major | minor
        suggestion: string
        
  code_duplication:
    duplicate_blocks:
      - location_1: string
        location_2: string
        similarity: number
        suggestion: string
        
  test_quality:
    coverage_assessment: string
    test_maintainability: string
    missing_tests:
      - location: string
        description: string
        
  technical_debt_risk:
    estimated_debt_hours: number  # Estimated refactoring time
    debt_items:
      - item: string
        impact: high | medium | low
        effort: high | medium | low
        
  # BR-007 Compliance
  review_coverage:
    files_analyzed: string[]
    files_not_analyzed: string[]
    not_analyzed_reason: string
    assumptions_made: string[]
    
  recommendations:
    must_fix: string[]      # blocker issues
    should_fix: string[]    # major issues
    consider: string[]      # minor improvements
    
  recommendation_to_next:
    action: approve | reject | warn | request_architect_review
    next_steps: string[]
```

## Maintainability Score Interpretation

| Score | Meaning | Action |
|-------|---------|--------|
| **5** | Excellent | Approve, no concerns |
| **4** | Good | Approve, minor suggestions |
| **3** | Acceptable | Warn, some improvements needed |
| **2** | Poor | Consider reject, significant debt |
| **1** | Unacceptable | Reject, major refactoring required |

## Examples

> **Note**: Complete examples with step-by-step walkthroughs are available in `examples/` directory.
> See `examples/example-001-legacy-code-review.md`.

### 示例 1：Good Maintainability (Score 4)

```yaml
maintainability_review_report:
  summary:
    overall_maintainability_score: 4
    score_reason: "Clean structure, good naming, minor documentation gaps"
    
  complexity_analysis:
    hot_spots: []
    
  dependency_assessment:
    total_dependencies: 5
    new_dependencies: 0
    circular_dependencies: []
    tight_coupling_areas: []
    
  solid_compliance:
    violations: []
    
  technical_debt_risk:
    estimated_debt_hours: 0
    
  recommendations:
    must_fix: []
    should_fix: []
    consider:
      - "Add API documentation for new public methods"
```

### 示例 2：Poor Maintainability (Score 2)

```yaml
maintainability_review_report:
  summary:
    overall_maintainability_score: 2
    score_reason: "High complexity, circular dependencies, SOLID violations"
    
  complexity_analysis:
    hot_spots:
      - file: "src/services/DataProcessor.ts"
        function: "processAllData"
        metric: "cyclomatic_complexity"
        value: 25
        threshold: 15
        severity: major
        suggestion: "Break into smaller functions"
        
  dependency_assessment:
    circular_dependencies:
      - "UserService <-> DataProcessor"
      
  solid_compliance:
    violations:
      - principle: S
        location: "src/services/DataProcessor.ts"
        description: "Class handles parsing, validation, and storage"
        severity: major
        suggestion: "Split into Parser, Validator, and Storage classes"
        
  technical_debt_risk:
    estimated_debt_hours: 8
    
  recommendations:
    must_fix: []
    should_fix:
      - "Reduce complexity in processAllData (estimated 4 hours)"
      - "Resolve circular dependency (estimated 2 hours)"
    consider:
      - "Apply Single Responsibility principle"
```

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 | BR Reference |
|----------|------|----------|--------------|
| **过度容忍复杂度** | "复杂度 25 还可以" | 严格执行阈值 | - |
| **忽略隐式依赖** | 只看 import 语句 | 检查全局状态 | - |
| **SOLID 检查不深入** | 只检查类大小 | 逐原则验证 | - |
| **技术债务低估** | "以后再说" | 估算具体工时 | - |
| **Self-check 混淆** | "Developer 说可维护" | Reviewer 独立验证 | BR-002 |
| **虚假信心** | 未披露分析盲区 | 必须记录未分析部分 | BR-007 |

## Anti-Patterns

> **Note**: Detailed anti-examples available in `anti-examples/` directory.
> See `anti-examples/anti-example-001-complexity-blindness.md`.

### ❌ Anti-Pattern: Complexity Blindness
```markdown
## Review Report
Maintainability Score: 5
Hot Spots: None
The code is clean and well-organized.
```

**Why wrong**: A 200-line function with 30 branches was not flagged. Reviewer did not actually analyze complexity.

### ❌ Anti-Pattern: Ignoring SOLID
```markdown
## SOLID Compliance
Violations: None
The class follows good design.
```

**Why wrong**: A "God class" with 15 methods doing unrelated things was not flagged as Single Responsibility violation.

## Checklists

> **Note**: Standalone checklist file available at `checklists/validation-checklist.md`

### Review Before
- [ ] Read design-note for expected patterns
- [ ] Understand module boundaries
- [ ] Identify high LOC files
- [ ] **BR-002**: Acknowledge self-check as hints

### Review During
- [ ] Analyze complexity metrics
- [ ] Map dependency graph
- [ ] Check SOLID principles
- [ ] Review documentation coverage
- [ ] Assess test maintainability
- [ ] **BR-002**: Independent verification performed

### Review After
- [ ] Score calculated correctly
- [ ] All hot spots documented
- [ ] Debt estimate provided
- [ ] Recommendations actionable
- [ ] **BR-007**: Coverage gaps disclosed

## Notes

### 与 code-review-checklist 的关系
- `code-review-checklist` 检查功能和质量基础
- `maintainability-review` 深入检查可维护性维度
- 大型 PR 应同时使用两者

### 与 architect 的协作
- 发现严重 SOLID 违反时，建议 request_architect_review
- 技术债务超过 8 小时时，建议 architect 评估

### 维护成本估算
- 圈复杂度每超过阈值 5 点 → 约 1 小时重构
- 循环依赖 → 约 2 小时解耦
- SRP 违反 → 约 4 小时重构

### Educational Materials
- `examples/` - Step-by-step review workflow examples
- `anti-examples/` - Common mistakes and how to avoid them
- `checklists/` - Standalone checklist for quick reference

### Related Skills
- `reviewer/code-review-checklist` - General code review
- `reviewer/risk-review` - Technical risk assessment
- `architect/module-boundary-design` - Module boundary guidance