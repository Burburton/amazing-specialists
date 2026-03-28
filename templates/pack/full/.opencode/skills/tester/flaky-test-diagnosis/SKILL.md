# Skill: flaky-test-diagnosis

## Purpose

指导 tester 诊断和修复不稳定测试（flaky tests），确保测试可重复执行，提高 CI/CD 可信度。

解决的核心问题：
- 测试间歇性失败
- CI/CD 结果不可信
- 难以复现的测试失败
- 测试执行顺序依赖
- 资源竞争和时序问题

## Business Rules Compliance

### BR-001: Tester Must Consume Developer Evidence
This skill requires reading and consuming developer artifacts before flaky test diagnosis:
- `implementation-summary.changed_files` - Identify recently changed tests
- `implementation-summary.risks` - Check if flaky risk was identified
- `test-history` - Historical test execution data
- `ci-logs` - CI/CD failure logs

### BR-002: Flaky Tests Are Critical Quality Issues
**Critical**: Flaky tests undermine trust in the entire test suite.
- A flaky test is a blocker for deployment confidence
- Flaky tests must be diagnosed, not ignored
- Flaky tests should not be marked as "expected failure"

### BR-003: Root Cause Must Be Identified
Every flaky test diagnosis must identify:
- The root cause category (timing, state, resource, order, external)
- The specific mechanism causing flakiness
- The fix strategy (not just retry)

### BR-004: Retry Is Not A Fix
**Prohibited**: Adding retries without identifying root cause.
- Retry is a temporary mitigation, not a fix
- Retry must be documented as workaround
- Root cause must still be investigated

### BR-005: Flaky Test Quarantine
Flaky tests should be quarantined until fixed:
- Quarantine prevents blocking CI/CD
- Quarantine is temporary, not permanent
- Quarantined tests must have fix owner

## Upstream Artifact References
- `specs/005-tester-core/contracts/verification-report-contract.md`
- `specs/005-tester-core/upstream-consumption.md`

## Downstream Artifact References
- `specs/005-tester-core/contracts/regression-risk-report-contract.md` - Flaky test status
- `specs/005-tester-core/spec.md` Section 6 - Business rules

## When to Use

必须使用时：
- 测试间歇性失败
- CI/CD 结果不稳定
- 同一测试多次运行结果不一致
- 测试在不同环境表现不同

推荐使用时：
- 新测试添加后出现不稳定
- 代码变更后测试变 flaky
- 定期测试健康检查

## When Not to Use

不适用场景：
- 测试总是失败（确定性 bug）
- 测试总是通过（稳定测试）
- 环境 provisioning 问题（非测试代码问题）

## Flaky Test Categories

### 1. 时序问题 (Timing)
测试依赖时间或异步操作完成时机：
- 等待时间不足
- Race condition
- 动画/网络请求完成时间不确定

### 2. 状态泄漏 (State Leakage)
测试间共享状态导致不一致：
- 未清理的数据库数据
- 未清理的全局变量
- 未清理的缓存
- 文件系统残留

### 3. 资源竞争 (Resource Contention)
多测试并发访问同一资源：
- 数据库连接池耗尽
- 文件锁竞争
- 网络端口竞争
- 内存竞争

### 4. 执行顺序依赖 (Order Dependency)
测试结果依赖执行顺序：
- 前序测试创建状态
- 后序测试依赖前序测试数据
- 全州 setup/teardown 不完整

### 5. 外部依赖不稳定 (External Dependency)
依赖外部服务不稳定：
- 外部 API 响应时间不确定
- 外部服务不可用
- 网络问题

## Diagnosis Process

### Step 1: 确认 Flaky 行为
1. 运行测试多次（至少 10 次）
2. 记录失败频率
3. 记录失败模式

### Step 2: 收集诊断数据
1. CI logs 分析
2. 本地重现尝试
3. 执行时间分布
4. 资源使用监控

### Step 3: 分类 Flaky 类型
1. 对照 categories 表
2. 确定主要类型
3. 确定具体机制

### Step 4: 确定根因
1. 深入代码分析
2. 检查测试 setup/teardown
3. 检查依赖 mock
4. 检查并发代码

### Step 5: 设计修复方案
1. 针对根因设计修复
2. 评估修复风险
3. 评估临时 mitigation（如 retry）

### Step 6: 实施修复
1. 编写修复代码
2. 运行验证（多次）
3. 监控后续稳定性

## Diagnosis Output Format

```yaml
flaky_test_diagnosis:
  dispatch_id: string
  task_id: string
  
  test_identification:
    test_file: string
    test_name: string
    test_suite: string
    
  flaky_behavior:
    failure_rate: number  # percentage
    failure_pattern: string
    reproduction_attempts: number
    successful_reproductions: number
    
  diagnosis:
    root_cause_category: timing | state_leakage | resource_contention | order_dependency | external_dependency
    
    root_cause_detail:
      description: string
      mechanism: string
      evidence: string[]
      
    affected_code:
      - file: string
        line_range: string
        issue: string
        
  fix_strategy:
    type: fix | quarantine | retry_mitigation
    
    recommended_fix:
      description: string
      approach: string
      risk_assessment: string
      
    temporary_mitigation:
      description: string
      retry_count: number
      retry_delay_ms: number
      
  quarantine_status:
    quarantined: boolean
    quarantine_reason: string
    fix_owner: string
    fix_due_date: string
    
  verification:
    fix_applied: boolean
    post_fix_runs: number
    post_fix_failures: number
    stability_verified: boolean
```

## Flaky Test Detection Techniques

### Technique 1: Multiple Runs

```bash
# Run test 20 times
for i in {1..20}; do npm test -- --testNamePattern="FlakyTest"; done

# Count failures
```

### Technique 2: Parallel vs Sequential

```bash
# Run in parallel (may expose race conditions)
npm test -- --parallel

# Run sequentially
npm test -- --serial
```

### Technique 3: Random Order

```bash
# Run tests in random order
npm test -- --shuffle

# If test fails only in certain order → order dependency
```

### Technique 4: Isolated Execution

```bash
# Run test alone (no other tests)
npm test -- --testNamePattern="SingleTest" --runInBand

# If passes alone but fails in suite → state leakage or order dependency
```

## Common Fixes

### Timing Fixes

| 问题 | 修复方案 |
|------|---------|
| 等待时间不足 | 增加合理等待或使用 retry with exponential backoff |
| Race condition | 添加同步机制或重构为确定性 |
| Async 未完成 | 使用 await/回调确认完成 |

### State Leakage Fixes

| 问题 | 修复方案 |
|------|---------|
| 数据库残留 | afterEach truncate 或 transaction rollback |
| 全局变量 | 重置或避免全局状态 |
| 缓存残留 | afterEach clear cache |
| 文件残留 | afterEach cleanup files |

### Resource Contention Fixes

| 问题 | 修复方案 |
|------|---------|
| 连接池耗尽 | 增加池大小或减少并发 |
| 文件锁竞争 | 使用独立文件或顺序执行 |
| 端口竞争 | 使用动态端口分配 |
| 内存竞争 | 减少内存使用或分批执行 |

### Order Dependency Fixes

| 问题 | 修复方案 |
|------|---------|
| 依赖前序测试 | 添加独立 setup |
| 共享 fixture | 使用独立 fixture 或 factory |
| Global state | 每个测试重置 global state |

### External Dependency Fixes

| 问题 | 修复方案 |
|------|---------|
| API 不稳定 | Mock external API |
| 网络问题 | Mock network calls |
| 服务不可用 | Fake 或 mock 服务 |

## Examples

### 示例 1：时序问题诊断

```yaml
flaky_test_diagnosis:
  test_identification:
    test_file: "tests/integration/Payment.test.ts"
    test_name: "payment completes within timeout"
    test_suite: "Payment Integration Tests"
    
  flaky_behavior:
    failure_rate: 15  # 15% failure rate
    failure_pattern: "Timeout exceeded"
    reproduction_attempts: 20
    successful_reproductions: 3
    
  diagnosis:
    root_cause_category: timing
    
    root_cause_detail:
      description: "Test waits for payment callback but callback timing varies"
      mechanism: "External payment gateway response time varies (100ms to 5000ms)"
      evidence:
        - "CI logs show failures when response > 3000ms"
        - "Test timeout set to 2000ms"
        
    affected_code:
      - file: "tests/integration/Payment.test.ts"
        line_range: "45-50"
        issue: "Hard-coded timeout 2000ms insufficient for real-world latency"
        
  fix_strategy:
    type: fix
    
    recommended_fix:
      description: "Increase timeout to 5000ms and add retry mechanism"
      approach: "Use waitFor with exponential backoff instead of fixed timeout"
      risk_assessment: "Low risk - makes test more resilient without changing test logic"
      
    implementation:
      old: "await waitForCallback(2000)"
      new: "await waitForCallback({ timeout: 5000, retries: 3, backoff: 'exponential' })"
      
  quarantine_status:
    quarantined: false
    quarantine_reason: "Root cause identified, fix straightforward"
    
  verification:
    fix_applied: true
    post_fix_runs: 50
    post_fix_failures: 0
    stability_verified: true
```

## Checklists

### 诊断阶段
- [ ] 确认 flaky 行为（多次运行）
- [ ] 收集诊断数据
- [ ] 分类 flaky 类型
- [ ] 确定根因

### 修复阶段
- [ ] 设计修复方案
- [ ] 评估修复风险
- [ ] 实施修复
- [ ] 验证稳定性

### Quarantine 阶段（如需要）
- [ ] 标记 quarantine
- [ ] 指定 fix owner
- [ ] 设置 fix due date
- [ ] 记录 workaround

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 |
|----------|------|----------|
| 假修复 | 添加 retry 但未解决根因 | BR-004: Retry 不是修复 |
| 隐藏 flaky | 标记 expected failure | BR-002: 必须诊断修复 |
| 过度 quarantine | 永久 quarantine | BR-005: Quarantine 临时 |
| 误判类型 | 错误分类根因 | 深入分析，收集证据 |

## Notes

### 与 unit-test-design 的关系
- unit-test-design 创建测试
- flaky-test-diagnosis 修复不稳定测试
- 良好的单元测试设计可预防 flaky

### Retry Policy 建议
Retry 只作为临时 mitigation：
- Retry count: 建议 2-3 次
- Retry delay: 使用 exponential backoff
- Retry 不改变断言，只改变等待
- Retry 必须记录为 workaround

### CI/CD 建议
- Quarantine flaky tests 到单独 suite
- 定期运行 quarantined tests 尝试修复
- 监控 flaky rate 作为质量指标
- Flaky test 阻止新代码 merge（直到修复或 quarantine）

### Prevention 建议
预防 flaky test：
- 遵循 FIRST 原则（Fast, Independent, Repeatable）
- 避免共享状态
- Mock 外部依赖
- 使用确定性时间（mock Date）
- 清理所有副作用