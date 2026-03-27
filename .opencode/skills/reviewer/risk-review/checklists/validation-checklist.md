# Validation Checklist: Risk Review

> **Standalone checklist for risk review.** For detailed guidance, see `../SKILL.md`.

---

## Pre-Review Checklist

- [ ] Read risk-context from task dispatch
- [ ] Understand impact area (financial, security, availability)
- [ ] Identify critical scenarios from spec
- [ ] **BR-002**: Acknowledge developer claims as hints only

---

## High-Risk Area Checklist

### Area Identification
- [ ] Code touches core business logic?
- [ ] Code involves data persistence?
- [ ] Code involves external service calls?
- [ ] Code involves authentication/authorization?
- [ ] Code involves high-traffic endpoints?
- [ ] Code involves financial/transaction processing?

### Impact Level Assessment
- [ ] Assessed user impact if failure occurs?
- [ ] Assessed system impact if failure occurs?
- [ ] Assessed blast radius (how far failure spreads)?
- [ ] Estimated recovery time if failure occurs?

---

## Failure Scenario Checklist

### Failure Scenarios to Consider
- [ ] External service timeout/unavailability?
- [ ] Database operation failure?
- [ ] Data consistency violation?
- [ ] Race condition/concurrency issue?
- [ ] Resource exhaustion (memory, connections)?
- [ ] User input causing unexpected behavior?
- [ ] Configuration error?

### For Each Scenario
- [ ] User impact documented?
- [ ] System impact documented?
- [ ] Blast radius defined?
- [ ] Recovery time estimated?
- [ ] Likelihood assessed?

---

## Rollback Capability Checklist

### Data Rollback
- [ ] Database schema rollback available?
- [ ] Transaction data rollback available?
- [ ] Rollback procedure documented?
- [ ] Rollback tested (BR-002 independent verification)?
- [ ] Rollback complexity assessed?
- [ ] Rollback time estimated?

### Code Rollback
- [ ] Git revert path available?
- [ ] Previous version deployable?
- [ ] Rollback requires manual action?
- [ ] Dependencies revertible?

---

## Monitoring Coverage Checklist

### Error Detection
- [ ] Critical errors logged?
- [ ] Error alerts configured?
- [ ] Detection latency reasonable?
- [ ] Alerting thresholds defined?

### Performance Monitoring
- [ ] Response time monitored?
- [ ] Resource usage monitored?
- [ ] Performance alerts configured?

### Business Metrics
- [ ] Success rate monitored?
- [ ] Business KPI alerts configured?
- [ ] Consistency metrics monitored?

---

## Fault Tolerance Checklist

### Retry Mechanism
- [ ] Retry logic implemented?
- [ ] Retry limits defined?
- [ ] Retry delay appropriate?

### Timeout Configuration
- [ ] Timeout values defined?
- [ ] Timeout appropriate for operation?
- [ ] Timeout exceeded handling?

### Circuit Breaker
- [ ] Circuit breaker implemented?
- [ ] Failure threshold defined?
- [ ] Reset timeout defined?
- [ ] Circuit breaker connected to timeout?

### Rate Limiting
- [ ] Rate limits defined?
- [ ] Rate limit appropriate?
- [ ] Rate limit exceeded handling?

### Fallback/Degradation
- [ ] Fallback behavior defined?
- [ ] Degradation graceful?
- [ ] User experience maintained?

---

## BR Compliance Checks

### BR-002: Independent Verification
- [ ] Self-check acknowledged as hints only
- [ ] Rollback claim independently verified
- [ ] Circuit breaker claim independently verified
- [ ] Timeout claim independently verified
- [ ] Monitoring claim independently verified
- [ ] All findings include `br_002_verification`

### BR-004: Severity Classification
- [ ] All risks classified: blocker | major | minor
- [ ] Blockers = critical impact (financial loss, data corruption)
- [ ] Major = significant impact (user experience, recovery effort)
- [ ] Minor = limited impact (minor inconvenience)

### BR-007: Honest Disclosure
- [ ] Risk scenarios analyzed listed
- [ ] Scenarios NOT analyzed listed
- [ ] Reason for not analyzing documented
- [ ] Assumptions made documented
- [ ] Confidence level stated

---

## Risk Level Classification Guide

| Level | Criteria | Deploy Action |
|-------|----------|---------------|
| **critical** | Financial loss, data corruption, security breach | Block until mitigated |
| **high** | Significant user/system impact, extended recovery | Staged deploy + monitoring |
| **medium** | Some impact, quick recovery possible | Standard deploy + alerts |
| **low** | Minimal impact, no critical scenarios | Standard deploy |

---

## Deploy Recommendations Guide

| Risk Level | Deployment Strategy |
|------------|---------------------|
| critical | Block, require mitigation |
| high | Staged deploy during low-traffic, ops on standby |
| medium | Standard deploy with enhanced monitoring |
| low | Standard deploy |

---

## Common Anti-Patterns to Avoid

| Anti-Pattern | Warning Sign | Fix |
|--------------|--------------|-----|
| **Impact blindness** | "Low risk" for payment system | Analyze impact area |
| **Trust without verify** | "Developer tested rollback" | Independent verification |
| **Missing blast radius** | Only single failure considered | Trace downstream effects |
| **No recovery estimate** | "Can fix later" | Estimate actual recovery time |
| **Monitoring assumed** | "Has logging" | Check for alerts |

---

## Quick Decision Guide

```
┌─────────────────────────────────────────────────────────────┐
│                    RISK DECISION TREE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Is this a financial/security/critical system?              │
│       │                                                      │
│       ├── YES → Start at HIGH risk level                     │
│       │                                                      │
│       └── NO ──┐                                             │
│                │                                              │
│                ▼                                              │
│  Are there blocker risks (data loss, corruption)?           │
│       │                                                      │
│       ├── YES → REJECT, critical risk                        │
│       │                                                      │
│       └── NO ──┐                                             │
│                │                                              │
│                ▼                                              │
│  Are there major risks (impact, recovery effort)?           │
│       │                                                      │
│       ├── YES → HIGH/MEDIUM, staged deploy                   │
│       │                                                      │
│       └── NO ──┐                                             │
│                │                                              │
│                ▼                                              │
│  Is rollback verified and monitoring sufficient?            │
│       │                                                      │
│       ├── YES → LOW, standard deploy                         │
│       │                                                      │
│       └── NO ──→ MEDIUM, add monitoring                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Failure Impact Quick Reference

| Impact Type | Severity | Example |
|-------------|----------|---------|
| **Financial loss** | blocker | Double payment, lost transaction |
| **Data corruption** | blocker | Inconsistent state, cannot recover |
| **Security breach** | blocker | Auth bypass, data leak |
| **Extended downtime** | major | Hours of unavailable service |
| **User data loss** | major | User content deleted |
| **Degraded experience** | medium | Slow response, partial function |
| **Minor inconvenience** | minor | UI glitch, retry needed |

---

## Related Resources

- **Full Skill**: `../SKILL.md`
- **Examples**: `../examples/`
- **Anti-Examples**: `../anti-examples/`
- **Quality Gate**: `quality-gate.md` Section 3.4
- **Security Skills**: `security/auth-and-permission-review`