# Example 001: Remove Unused Dependencies

## Scenario
Identify and remove unused dependencies from a Node.js project.

## Task Description
```
Goal: Reduce dependency count by removing unused packages
Analysis Tool: depcheck
Constraints:
  - Do not break existing functionality
  - All tests must pass after removal
  - Document each removal with reason
```

## Dependency Optimization Process

### Step 1: Dependency Tree Analysis
```yaml
initial_state:
  package_json_dependencies: 42
  dev_dependencies: 15
  
dependency_tree:
  command: "npm ls --depth=0"
  result: |
    project@1.0.0
    ├── axios@1.4.0
    ├── date-fns@2.30.0
    ├── express@4.18.2
    ├── left-pad@1.3.0      # UNUSED
    ├── lodash@4.17.21      # PARTIALLY USED
    ├── moment@2.29.4       # UNUSED
    ├── request@2.88.2      # UNUSED
    └── ... (35 more)
```

### Step 2: Unused Dependency Detection
```yaml
depcheck_result:
  command: "depcheck"
  result:
    unused_dependencies:
      - "left-pad"          # No imports found
      - "moment"            # No imports found
      - "request"           # No imports found
      
    missing_dependencies: []  # All imports resolved
    
    partial_usage:
      - "lodash"            # Only 2 methods used
```

### Step 3: Code Analysis for lodash
```yaml
lodash_analysis:
  command: "grep -r 'from \"lodash\"' src/"
  result:
    - "src/utils/helpers.ts: import { cloneDeep, merge } from 'lodash'"
    
  used_methods:
    - "cloneDeep"
    - "merge"
    
  replacement_options:
    cloneDeep: "structuredClone (Node 17+) or JSON.parse(JSON.stringify)"
    merge: "Object.assign for shallow, custom for deep"
```

### Step 4: Optimization Plan
```yaml
plan:
  removals:
    - name: "left-pad"
      risk: low
      replacement: "String.prototype.padStart"
      
    - name: "moment"
      risk: low
      reason: "Already using date-fns in codebase"
      
    - name: "request"
      risk: low
      reason: "Already using axios in codebase"
      
  partial_removals:
    - name: "lodash"
      action: "Remove and replace with native"
      risk: medium
      reason: "Need to verify cloneDeep edge cases"
```

### Step 5: Execute Optimization

#### 5.1: Remove left-pad
```yaml
action:
  command: "npm uninstall left-pad"
  verification: "npm test"
  result: "PASS"
  
commit:
  message: "deps: remove left-pad (use String.padStart)"
```

#### 5.2: Remove moment
```yaml
action:
  command: "npm uninstall moment"
  verification: "npm test"
  result: "PASS"
  
commit:
  message: "deps: remove moment (using date-fns)"
```

#### 5.3: Remove request
```yaml
action:
  command: "npm uninstall request"
  verification: "npm test"
  result: "PASS"
  
commit:
  message: "deps: remove request (using axios)"
```

#### 5.4: Replace lodash with native
```yaml
action:
  steps:
    - "Replace _.cloneDeep with structuredClone"
    - "Replace _.merge with Object.assign (shallow merge sufficient)"
    - "npm uninstall lodash"
  verification: "npm test + manual cloneDeep tests"
  result: "PASS"
  
commit:
  message: "deps: remove lodash (use native alternatives)"
```

### Step 6: Final Verification
```yaml
verification:
  build:
    command: "npm run build"
    result: "SUCCESS"
    
  tests:
    command: "npm test"
    result: "PASS (85 tests)"
    
  bundle_analysis:
    tool: "webpack-bundle-analyzer"
    before: "2.1 MB"
    after: "1.4 MB"
    reduction: "33%"
    
  build_time:
    before: "45 seconds"
    after: "32 seconds"
    reduction: "29%"
```

## Dependency Optimization Summary Output

```yaml
dependency_optimization_summary:
  dispatch_id: "dispatch-deps-001"
  task_id: "T-DEPS-001"
  
  analysis:
    dependency_count:
      before: 42
      after: 38
    unused_dependencies:
      - "left-pad"
      - "moment"
      - "request"
    duplicate_dependencies: []
    security_issues: 0
    
  optimizations:
    removed:
      - name: "left-pad@1.3.0"
        reason: "String.padStart available since Node 8"
        impact_verification: "No imports found, tests pass"
        
      - name: "moment@2.29.4"
        reason: "Project already migrated to date-fns"
        impact_verification: "No imports found, tests pass"
        
      - name: "request@2.88.2"
        reason: "Project already using axios for HTTP"
        impact_verification: "No imports found, tests pass"
        
      - name: "lodash@4.17.21"
        reason: "Only 2 methods used - replaced with native alternatives"
        impact_verification: "Manual review + new unit tests for cloneDeep scenarios"
        
  verification:
    build_status: pass
    test_status: pass
    bundle_size_before: "2.1 MB"
    bundle_size_after: "1.4 MB"
    build_time_before: "45s"
    build_time_after: "32s"
    
  known_issues: []
  
  risks:
    - risk: "structuredClone has different behavior for circular references"
      level: low
      mitigation: "Added unit test for circular reference handling"
      
  recommendation: SEND_TO_TEST
  time_spent_minutes: 60
```

## Key Patterns Demonstrated

1. **Tool-Driven Analysis**: Used depcheck for automated detection
2. **Incremental Removal**: Each package removed and verified separately
3. **Code Analysis**: Verified actual usage before removal
4. **Native Replacements**: Used modern JS alternatives where available
5. **Measurement**: Bundle size and build time comparison

## What Makes This a Good Example

- Used automated analysis tool (depcheck)
- Verified each removal independently
- Documented reasons for each removal
- Measured actual impact (bundle size, build time)
- Added tests for replacement edge cases