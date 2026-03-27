# Skill: risk-review

## Purpose

为 reviewer 提供系统化的技术风险评估框架，专注于识别可能导致系统故障、性能下降、数据丢失或安全问题的关键风险点。

解决的核心问题：
- 高风险变更未被发现
- 缺乏回滚能力导致无法恢复
- 监控覆盖不足导致问题难发现
- 容错机制缺失导致级联故障
- 性能敏感代码未评估风险

## Business Rules Compliance

### BR-002: Self-Check Is Not Independent Verification
**Critical Distinction**: Developer self-check informs review but **cannot** replace reviewer verification.
- Self-check claims about "tested edge cases" are hints, NOT evidence
- Reviewer must independently verify risk mitigation claims
- Review reports must explicitly distinguish "developer claims" from "reviewer verified"
- Prohibited language: "Developer tested rollback" → Required: "Reviewer verified rollback procedure..."

### BR-004: Severity Classification
Risk findings must classify issues using severity levels:

| Severity | Definition | Review Action |
|----------|------------|---------------|
| **blocker** | Critical risk that could cause major failure | Must appear in `must_fix` list, blocks approval |
| **major** | Significant risk with potential impact | Must appear in `should_fix` list, recommend mitigation |
| **minor** | Minor risk with limited impact | Appears in `consider` list, optional mitigation |
| **note** | Informational observation | Appears in `notes` |

### BR-007: Honesty Over False Confidence
Risk review reports must honestly disclose:
- Risk scenarios NOT analyzed (due to complexity or time)
- Assumptions made about system behavior
- Areas requiring deeper security/performance review
- Confidence level in risk assessment

## Input Specifications

### Required Upstream Artifacts
- `implementation-summary` (from developer) - Changed files, claimed risks
- `spec.md` (feature spec) - Requirements and critical scenarios
- Risk context (from task dispatch) - Risk level, impact area

### Optional Upstream Artifacts
- `design-note` (from architect) - Risk mitigation design
- `security-report` (from security, for high-risk changes)
- Performance baseline data - If available

## Output Specifications

### Primary Output
`risk-review-report` artifact with:
- `overall_risk_level`: low | medium | high | critical
- `identified_risks`: List of specific risks with impact assessment
- `rollback_capability`: Ability to revert changes
- `monitoring_coverage`: Detection capability assessment
- `fault_tolerance`: Error handling and recovery mechanisms
- `recommendations`: Risk mitigation suggestions

### Downstream Consumers
- **developer**: Uses findings for risk mitigation implementation
- **security**: Uses report for high-risk security review triggers
- **quality gate**: Uses risk level for approval threshold

## Upstream Artifact References
- `specs/004-developer-core/contracts/implementation-summary-contract.md`
- `specs/008-security-core/contracts/security-report-contract.md`

## Downstream Artifact References
- `specs/006-reviewer-core/contracts/review-report-contract.md`
- `quality-gate.md` Section 3.4 - Reviewer Gate

## When to Use

必须使用时：
- 重要功能上线前审查
- 架构变更审查（数据库、缓存、消息队列）
- 性能敏感代码审查（高流量接口）
- 数据迁移相关代码审查
- 安全敏感模块审查

推荐使用时：
- 新核心模块首次审查
- 跨服务调用变更审查
- 配置变更影响评估
- 第三方集成审查

## When Not to Use

不适用场景：
- 简单 UI 样式调整
- 文档变更（无代码）
- 低风险配置微调
- 纯测试代码变更

## Risk Review Categories

### 1. High-Risk Area Identification (高风险区域识别)
- [ ] 是否涉及核心业务逻辑？
- [ ] 是否涉及数据持久化？
- [ ] 是否涉及外部服务调用？
- [ ] 是否涉及认证/授权流程？
- [ ] 是否涉及高流量接口？
- [ ] 是否涉及资金/交易处理？

### 2. Failure Impact Assessment (失败影响评估)
- [ ] 失败是否影响用户核心功能？
- [ ] 失败是否导致数据不一致？
- [ ] 失败是否影响其他服务？
- [ ] 失败是否有级联效应？
- [ ] 失败是否影响系统可用性？
- [ ] 失败恢复时间估计？

### 3. Rollback Capability Check (回滚能力检查)
- [ ] 是否有数据回滚机制？
- [ ] 是否有代码回滚路径？
- [ ] 回滚是否需要人工干预？
- [ ] 回滚操作是否文档化？
- [ ] 回滚是否有测试验证？
- [ ] 回滚时间估计？

### 4. Monitoring Coverage Assessment (监控覆盖评估)
- [ ] 关键指标是否有监控？
- [ ] 错误是否有日志记录？
- [ ] 异常是否有告警配置？
- [ ] 性能是否有指标跟踪？
- [ ] 业务指标是否有监控？
- [ ] 监控是否覆盖新功能？

### 5. Fault Tolerance Mechanism Check (容错机制检查)
- [ ] 是否有重试机制？
- [ ] 是否有超时配置？
- [ ] 是否有降级策略？
- [ ] 是否有熔断机制？
- [ ] 是否有限流保护？
- [ ] 是否有数据备份？

### 6. Performance Risk Assessment (性能风险评估)
- [ ] 是否有可能的性能瓶颈？
- [ ] 是否有 N+1 查询风险？
- [ ] 是否有内存泄漏风险？
- [ ] 是否有锁竞争风险？
- [ ] 是否有资源耗尽风险？
- [ ] 是否有缓存失效风险？

### 7. Data Risk Assessment (数据风险评估)
- [ ] 是否有数据丢失风险？
- [ ] 是否有数据损坏风险？
- [ ] 是否有数据泄露风险？
- [ ] 是否有数据一致性风险？
- [ ] 是否有数据迁移风险？
- [ ] 是否有备份恢复验证？

## Steps

### Step 1: Preparation
1. Read implementation-summary for claimed risk mitigations
2. Understand the change scope and impact area
3. Identify critical scenarios from spec
4. Determine risk focus areas

### Step 2: High-Risk Area Scan
1. Identify code touching core business logic
2. Find external service interactions
3. Locate database operations
4. Identify authentication/authorization changes
5. Find high-traffic endpoints

### Step 3: Failure Scenario Analysis
1. List potential failure scenarios
2. Assess impact of each scenario
3. Determine blast radius
4. Estimate recovery time
5. Identify cascading failure risks

### Step 4: Rollback Assessment
1. Check if changes are reversible
2. Verify data rollback mechanisms
3. Test rollback procedures if available
4. Document rollback steps
5. Estimate rollback complexity

### Step 5: Monitoring Coverage Check
1. Review logging configuration
2. Check alerting setup
3. Verify metrics tracking
4. Assess detection latency
5. Identify monitoring gaps

### Step 6: Fault Tolerance Review
1. Check retry logic
2. Review timeout configurations
3. Verify circuit breaker patterns
4. Check fallback/degradation logic
5. Verify rate limiting

### Step 7: Generate Risk Review Report
Output risk-review-report with:
- Overall risk level
- Identified risks with severity
- Rollback capability assessment
- Monitoring coverage gaps
- Fault tolerance recommendations
- Mitigation suggestions

## Output Format

```yaml
risk_review_report:
  dispatch_id: string
  task_id: string
  reviewer: string
  timestamp: string
  
  # BR-002 Compliance
  self_check_acknowledged:
    status: string  # "Developer claims rollback tested"
    use: string     # "Hints only, NOT evidence - independent verification required"
  
  summary:
    overall_risk_level: low | medium | high | critical
    risk_summary: string
    confidence_level: high | medium | low
    
  high_risk_areas:
    - area: string
      description: string
      impact_level: critical | high | medium | low
      
  identified_risks:
    - risk_id: string
      category: failure | data | performance | security | availability
      description: string
      severity: blocker | major | minor  # BR-004
      impact:
        user_impact: string
        system_impact: string
        blast_radius: string
        recovery_time_estimate: string
      likelihood: high | medium | low
      current_mitigation: string
      br_002_verification: string  # How reviewer verified
      
  rollback_capability:
    data_rollback:
      available: boolean
      method: string
      tested: boolean
      complexity: simple | moderate | complex
      estimated_time: string
      
    code_rollback:
      available: boolean
      method: string
      requires_manual_action: boolean
      
  monitoring_coverage:
    covered_areas: string[]
    gaps:
      - area: string
        severity: major | minor
        suggestion: string
        
  fault_tolerance:
    mechanisms_present:
      - mechanism: retry | timeout | circuit_breaker | fallback | rate_limit
        location: string
        effectiveness: adequate | inadequate | missing
        
    missing_mechanisms:
      - mechanism: string
        recommended_location: string
        severity: major | minor
        
  performance_risks:
    - risk: string
      location: string
      severity: major | minor
      mitigation: string
      
  data_risks:
    - risk: string
      location: string
      severity: blocker | major | minor
      mitigation: string
      
  # BR-007 Compliance
  review_coverage:
    risk_scenarios_analyzed: string[]
    scenarios_not_analyzed: string[]
    not_analyzed_reason: string
    assumptions_made: string[]
    
  recommendations:
    must_fix: string[]      # blocker risks
    should_fix: string[]    # major risks
    consider: string[]      # minor risks
    deploy_recommendations:
      - recommendation: string
        reason: string
        
  recommendation_to_next:
    action: approve | reject | warn | request_security_review | request_staged_deploy
    next_steps: string[]
```

## Risk Level Interpretation

| Level | Meaning | Action |
|-------|---------|--------|
| **critical** | Major failure risk | Reject, must mitigate before deploy |
| **high** | Significant risk | Warn, recommend staged deploy or mitigation |
| **medium** | Some risk present | Approve with monitoring attention |
| **low** | Minimal risk | Approve, standard deployment |

## Examples

> **Note**: Complete examples with step-by-step walkthroughs are available in `examples/` directory.
> See `examples/example-001-critical-feature-review.md`.

### 示例 1：Low Risk Feature

```yaml
risk_review_report:
  summary:
    overall_risk_level: low
    risk_summary: "Minor UI enhancement, no core logic changes"
    confidence_level: high
    
  identified_risks: []
  
  rollback_capability:
    code_rollback:
      available: true
      method: "Git revert"
      requires_manual_action: false
      
  monitoring_coverage:
    covered_areas: ["UI rendering metrics"]
    gaps: []
    
  recommendations:
    must_fix: []
    should_fix: []
    consider: []
    
  recommendation_to_next:
    action: approve
    next_steps: ["Standard deployment allowed"]
```

### 示例 2：High Risk Feature

```yaml
risk_review_report:
  summary:
    overall_risk_level: high
    risk_summary: "Payment processing changes, data consistency risk"
    confidence_level: medium
    
  identified_risks:
    - risk_id: RISK-001
      category: data
      description: "Payment status update without transaction"
      severity: blocker
      impact:
        user_impact: "Payment could be lost"
        system_impact: "Financial data inconsistency"
        blast_radius: "Payment service, order service"
        recovery_time_estimate: "Hours to days"
      likelihood: medium
      current_mitigation: "Developer claims atomic operations"
      br_002_verification: "Reviewer found non-atomic DB operations"
      
  rollback_capability:
    data_rollback:
      available: false
      method: "None implemented"
      tested: false
      complexity: complex
      
  fault_tolerance:
    missing_mechanisms:
      - mechanism: "Circuit breaker for payment gateway"
        recommended_location: "PaymentService.ts"
        severity: major
        
  recommendations:
    must_fix:
      - "Add transaction wrapper for payment status update (RISK-001)"
    should_fix:
      - "Implement circuit breaker for payment gateway"
    deploy_recommendations:
      - recommendation: "Staged deployment with payment validation"
        reason: "High financial impact risk"
        
  recommendation_to_next:
    action: reject
    next_steps:
      - "Fix blocker risks before deployment"
      - "Add rollback mechanism"
      - "Request security review for payment flow"
```

## Common Failure Modes

| 失败模式 | 表现 | 处理建议 | BR Reference |
|----------|------|----------|--------------|
| **低估失败影响** | "失败概率低" | 必须评估 impact | - |
| **忽略级联风险** | 只看单点失败 | 评估 blast radius | - |
| **回滚验证不独立** | "Developer 测试了" | Reviewer 独立验证 | BR-002 |
| **监控覆盖盲目信任** | "有日志就行" | 检查告警配置 | - |
| **容错机制忽略** | "有 try-catch" | 检查降级策略 | - |
| **风险场景不披露** | 未分析部分不记录 | BR-007 披露 | BR-007 |

## Anti-Patterns

> **Note**: Detailed anti-examples available in `anti-examples/` directory.
> See `anti-examples/anti-example-001-impact-blindness.md`.

### ❌ Anti-Pattern: Impact Blindness
```markdown
## Risk Review Report
Risk Level: low
Risks: None identified
The change is small and safe.
```

**Why wrong**: A database schema change was marked "low risk" without analyzing data migration failure impact.

### ❌ Anti-Pattern: Trust Without Verification
```markdown
## Rollback Capability
Developer verified rollback works. Proceeding.
```

**Why wrong**: BR-002 violation - reviewer must independently verify rollback, not trust developer claims.

## Checklists

> **Note**: Standalone checklist file available at `checklists/validation-checklist.md`

### Review Before
- [ ] Understand change scope and impact
- [ ] Identify critical scenarios from spec
- [ ] Read claimed mitigations from developer
- [ ] **BR-002**: Acknowledge claims as hints only

### Review During
- [ ] Scan high-risk areas
- [ ] Analyze failure scenarios
- [ ] Check rollback capability
- [ ] Verify monitoring coverage
- [ ] Review fault tolerance mechanisms
- [ ] **BR-002**: Independently verify critical claims

### Review After
- [ ] Risk level determined correctly
- [ ] All risks documented with severity
- [ ] Rollback capability assessed
- [ ] Monitoring gaps identified
- [ ] Recommendations actionable
- [ ] **BR-007**: Unanalyzed scenarios disclosed

## Notes

### 与 code-review-checklist 的关系
- `code-review-checklist` 检查代码质量
- `risk-review` 深入检查风险维度
- 高风险变更应两者结合使用

### 与 security 报告的协作
- 发现安全相关风险时，建议 request_security_review
- 认证/授权变更必须 security 报告确认

### 与运维的协作
- 高风险变更建议 staged deployment
- 建议灰度发布和快速回滚机制

### Deploy Recommendations
| Risk Level | Deploy Strategy |
|------------|-----------------|
| critical | Block until mitigated |
| high | Staged deploy + monitoring |
| medium | Standard deploy + alert |
| low | Standard deploy |

### Educational Materials
- `examples/` - Step-by-step review workflow examples
- `anti-examples/` - Common mistakes and how to avoid them
- `checklists/` - Standalone checklist for quick reference

### Related Skills
- `reviewer/code-review-checklist` - General code review
- `reviewer/maintainability-review` - Maintainability assessment
- `security/auth-and-permission-review` - Security-specific review