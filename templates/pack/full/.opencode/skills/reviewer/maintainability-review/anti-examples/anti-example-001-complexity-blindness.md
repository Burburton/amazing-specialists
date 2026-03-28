# Anti-Example 001: Complexity Blindness

## What This Anti-Example Looks Like

### ❌ Incorrect Maintainability Review (Complexity Blindness)

```yaml
maintainability_review_report:
  dispatch_id: "DISPATCH-2024-002"
  task_id: "TASK-REF-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-01-20T10:00:00Z"
  
  summary:
    overall_maintainability_score: 5
    score_reason: "Clean code, well-organized"
    
  complexity_analysis:
    hot_spots: []
    
  dependency_assessment:
    circular_dependencies: []
    
  solid_compliance:
    violations: []
    
  recommendations:
    must_fix: []
    should_fix: []
    consider: []
    
  recommendation_to_next:
    action: approve
    next_steps: ["Merge when ready"]
```

## Why This Is Wrong

### Multiple BR Violations

#### BR-002 Violation: No Independent Verification
The review shows no evidence of independent analysis:
- Developer claimed "complexity reduced to 12" but reviewer did not verify
- No `br_002_verification` fields
- Score of 5 without any analysis evidence

#### BR-007 Violation: False Confidence
The report claims "Clean code, well-organized" without:
- Providing any complexity metrics
- Showing what was analyzed
- Documenting review coverage
- Listing assumptions made

### The Real Problem

The reviewer failed to detect a critical complexity issue:

**Actual Code (Hidden Complexity)**:

```typescript
// src/services/DataProcessor.ts - What reviewer "missed"
class DataProcessor {
  // A 200-line function with 35 cyclomatic complexity
  processAllData(input: any): Result {
    // Deeply nested conditionals
    if (input && input.type) {
      if (input.type === 'json') {
        if (input.data) {
          try {
            const parsed = JSON.parse(input.data);
            if (parsed.records) {
              for (let record of parsed.records) {
                if (record.id) {
                  if (record.value) {
                    if (record.value > 0) {
                      // ... 15 more nested levels
                    }
                  }
                }
              }
            }
          } catch (e) {
            // ... 10 more branches for error handling
          }
        }
      } else if (input.type === 'xml') {
        // ... 20 more branches for XML handling
      }
    }
    // ... remaining 150 lines with similar complexity
  }
}
```

| Problem | Why It's Wrong | Impact |
|---------|----------------|--------|
| **Score 5 with no analysis** | No evidence of review | Untrustworthy |
| **Hot spots empty** | Did reviewer actually check? | Complexity issues missed |
| **"Clean code" claim** | Subjective, not measured | False confidence |
| **No review coverage** | No scope documented | Cannot verify what was reviewed |

### What This Allows

This type of blindness allows:
- High-complexity code to be approved without scrutiny
- Technical debt to accumulate unnoticed
- Future developers to struggle with unmaintainable code
- No accountability when code becomes problematic

## How to Detect This Anti-Pattern

### Detection Checklist

- [ ] **Score Evidence Check**: Is the score backed by specific analysis?
- [ ] **Hot Spots Check**: If hot spots is empty, is there justification?
- [ ] **Metrics Check**: Are complexity numbers provided (even if within threshold)?
- [ ] **SOLID Check**: Is SOLID assessed per-principle?
- [ ] **Coverage Check**: Is there a review_coverage section?
- [ ] **BR-002 Check**: Is there independent verification documented?

### Warning Signs

```text
🚩 Score 5 without complexity metrics
🚩 Empty hot_spots without justification
🚩 "Clean code" as only reason
🚩 No cyclomatic complexity numbers
🚩 SOLID check says "all pass" without per-principle assessment
🚩 No br_002_verification fields
🚩 Review completed in under 10 minutes for 200-line change
```

## How to Fix This

### Step 1: Actually Analyze Complexity

```yaml
complexity_analysis:
  metrics_calculated:
    cyclomatic_complexity: 35
    function_length: 200
    nesting_depth: 7
    
  hot_spots:
    - file: "src/services/DataProcessor.ts"
      function: "processAllData"
      metric: "cyclomatic_complexity"
      value: 35
      threshold: 15
      severity: major  # Exceeds threshold significantly
      suggestion: "Break into smaller functions or extract modules"
```

### Step 2: Document Independent Verification (BR-002)

```yaml
br_002_verification:
  developer_claim: "Complexity is manageable"
  reviewer_action: "Counted decision points in processAllData()"
  finding: "35 decision points found - exceeds threshold of 15"
  conclusion: "Claim contradicted by independent analysis"
```

### Step 3: Assess SOLID Per-Principle

```yaml
solid_compliance:
  violations:
    - principle: S
      location: "src/services/DataProcessor.ts"
      description: "processAllData handles parsing, validation, transformation, and storage"
      severity: major
      suggestion: "Extract separate classes for each concern"
```

### Step 4: Honest Score Assignment

```yaml
summary:
  overall_maintainability_score: 2  # Not 5!
  score_reason: "High complexity (35), Single Responsibility violated, deeply nested code"
```

## Corrected Example

### ✅ Correct Maintainability Review (BR-Compliant)

```yaml
maintainability_review_report:
  dispatch_id: "DISPATCH-2024-002"
  task_id: "TASK-REF-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-01-20T10:00:00Z"
  
  # BR-002 Compliance
  self_check_acknowledged:
    status: "Developer claims complexity manageable"
    use: "Hint only - independent verification performed"
  
  summary:
    overall_maintainability_score: 2
    score_reason: "High cyclomatic complexity (35), deep nesting (7 levels), SRP violated"
    
  complexity_analysis:
    hot_spots:
      - file: "src/services/DataProcessor.ts"
        function: "processAllData"
        metric: "cyclomatic_complexity"
        value: 35
        threshold: 15
        severity: major
        suggestion: "Break into smaller functions"
        br_002_verification: "Reviewer counted 35 decision points"
        
      - file: "src/services/DataProcessor.ts"
        function: "processAllData"
        metric: "function_length"
        value: 200
        threshold: 50
        severity: major
        suggestion: "Extract modules for parsing, validation, transformation"
        
      - file: "src/services/DataProcessor.ts"
        function: "processAllData"
        metric: "nesting_depth"
        value: 7
        threshold: 4
        severity: major
        suggestion: "Flatten nested conditionals with guard clauses"
        
  dependency_assessment:
    circular_dependencies: []
    
  solid_compliance:
    violations:
      - principle: S
        location: "src/services/DataProcessor.ts:processAllData"
        description: "Function handles parsing, validation, transformation, and storage"
        severity: major
        suggestion: "Extract Parser, Validator, Transformer, and Storage modules"
        br_002_verification: "Reviewer verified function touches 4 distinct concerns"
        
  documentation_coverage:
    missing_comments:
      - location: "src/services/DataProcessor.ts"
        severity: minor
        suggestion: "Complex logic needs explanatory comments"
        
  technical_debt_risk:
    estimated_debt_hours: 8
    debt_items:
      - item: "Refactor processAllData"
        impact: high
        effort: high
        
  # BR-007 Compliance
  review_coverage:
    files_analyzed:
      - "src/services/DataProcessor.ts"
    files_not_analyzed: []
    assumptions_made:
      - "Thresholds: complexity<15, length<50, nesting<4"
      
  recommendations:
    must_fix: []
    should_fix:
      - "Reduce complexity in processAllData (ISS-001)"
      - "Apply Single Responsibility - extract modules (ISS-002)"
      - "Flatten nested conditionals (ISS-003)"
    consider:
      - "Add explanatory comments for complex logic"
      
  recommendation_to_next:
    action: warn
    next_steps:
      - "Approve with warning - technical debt noted"
      - "Create refactoring task to address complexity"
      - "Estimate 8 hours for full refactoring"
```

## Lesson

**A maintainability score without analysis is meaningless.** A proper review must:
1. Actually measure complexity (count decision points)
2. Provide specific numbers, not subjective claims
3. Check SOLID per-principle, not as blanket statement
4. Document independent verification (BR-002)
5. Honestly assess score based on findings
6. Disclose review scope and assumptions (BR-007)

Complexity blindness lets unmaintainable code slip through, creating long-term technical debt that compounds over time. The reviewer's job is to catch this before it becomes a burden on future developers.

---

## References

- `specs/006-reviewer-core/spec.md` Section 6: BR-002, BR-007
- `quality-gate.md` Section 3.4: Reviewer Gate
- `examples/example-001-legacy-code-review.md` - Complete correct example