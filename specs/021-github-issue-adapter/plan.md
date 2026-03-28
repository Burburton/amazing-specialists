# Implementation Plan: GitHub Issue Orchestrator Adapter

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 021-github-issue-adapter |
| **Plan Version** | 1.0.0 |
| **Status** | Complete |
| **Created** | 2026-03-28 |
| **Target Version** | v1.1 |

---

## Overview

This plan implements the GitHub Issue Orchestrator Adapter based on:
- `specs/021-github-issue-adapter/spec.md` - Feature specification
- `docs/adapters/github-issue-adapter-design.md` - Design document
- `adapters/interfaces/orchestrator-adapter.interface.ts` - Interface contract
- `adapters/cli-local/` - Reference implementation patterns

---

## Phase Breakdown

### Phase 1: Foundation (Infrastructure & Setup)

**Goal**: Establish project structure, dependencies, and core infrastructure.

#### Tasks

| Task ID | Task Name | Description | Dependencies | Estimated Hours |
|---------|-----------|-------------|--------------|-----------------|
| P1-T1 | Create adapter directory structure | Create `adapters/github-issue/` with subdirectories | None | 0.5 |
| P1-T2 | Initialize package.json | Add dependencies: `@octokit/rest`, `@octokit/graphql`, `crypto` | None | 0.5 |
| P1-T3 | Create adapter configuration | `github-issue.config.json` with default values, label mappings, retry config | P1-T1 | 1 |
| P1-T4 | Setup TypeScript definitions | Create `types/github-issue.types.ts` for GitHub-specific types | P1-T1 | 1 |
| P1-T5 | Create shared utilities | Token manager, rate limit tracker, error classifier | P1-T2 | 2 |
| P1-T6 | Setup test infrastructure | Jest config, test helpers, mock utilities | P1-T2 | 1 |

**Phase 1 Deliverables**:
- Directory structure: `adapters/github-issue/{src,tests,__mocks__}/`
- `github-issue.config.json` with complete configuration schema
- `package.json` with all dependencies
- Type definitions for GitHub API types
- Shared utility modules

**Validation Checkpoint**: 
- [ ] Directory structure matches ADAPTERS.md conventions
- [ ] Config file passes JSON validation
- [ ] Dependencies install without errors
- [ ] Test runner executes successfully

---

### Phase 2: Core Implementation (Parsing & API)

**Goal**: Implement all core components for Issue parsing and GitHub API integration.

#### Tasks

| Task ID | Task Name | Description | Dependencies | Estimated Hours |
|---------|-----------|-------------|--------------|-----------------|
| P2-T1 | **Label Parser** | Implement `label-parser.js` - parse milestone:M###, role:*, command:*, task:T###, risk:* | P1-T4 | 2 |
| P2-T2 | **Body Parser** | Implement `body-parser.js` - parse ## Context, ## Goal, ## Constraints, ## Inputs, ## Expected Outputs | P1-T4 | 3 |
| P2-T3 | **Issue Parser** | Implement `issue-parser.js` - orchestrate label/body parsers, build Dispatch Payload | P2-T1, P2-T2 | 2 |
| P2-T4 | **GitHub Client** | Implement `github-client.js` - REST API wrapper for comments, labels, issues | P1-T5 | 4 |
| P2-T5 | **Webhook Handler** | Implement `webhook-handler.js` - signature verification, event filtering, payload parsing | P1-T5, P2-T3 | 3 |
| P2-T6 | **Dispatch Validator** | Implement `dispatch-validator.js` - validate Dispatch Payload against io-contract.md §1 | P2-T3 | 1.5 |
| P2-T7 | **Error Mapper** | Implement `error-mapper.js` - map GitHub API errors to ExecutionStatus | P2-T4 | 1 |
| P2-T8 | **Unit Tests - Label Parser** | Comprehensive tests for all label patterns | P2-T1 | 1.5 |
| P2-T9 | **Unit Tests - Body Parser** | Tests for section extraction, edge cases, malformed markdown | P2-T2 | 2 |
| P2-T10 | **Unit Tests - Issue Parser** | Integration tests for complete parsing flow | P2-T3 | 1.5 |
| P2-T11 | **Unit Tests - GitHub Client** | Mocked API tests using nock | P2-T4 | 2 |
| P2-T12 | **Unit Tests - Webhook Handler** | Security tests, signature verification tests | P2-T5 | 2 |

**Phase 2 Deliverables**:
- `label-parser.js` - Complete label parsing with 100% pattern coverage
- `body-parser.js` - Markdown section parser with fallback logic
- `issue-parser.js` - Main parser coordinating all parsing logic
- `github-client.js` - Full GitHub API client with auth, rate limiting
- `webhook-handler.js` - Secure webhook handler with HMAC verification
- `dispatch-validator.js` - Schema validation per io-contract.md
- `error-mapper.js` - Error classification and mapping
- Unit test suite with >90% coverage

**Validation Checkpoint**:
- [ ] All unit tests pass
- [ ] Label parser handles all defined patterns (milestone, role, command, task, risk)
- [ ] Body parser extracts all sections correctly
- [ ] Webhook signature verification uses constant-time comparison
- [ ] GitHub client handles rate limits with exponential backoff

---

### Phase 3: Integration (Escalation, Retry & Main Adapter)

**Goal**: Implement escalation handling, retry logic, and main adapter interface.

#### Tasks

| Task ID | Task Name | Description | Dependencies | Estimated Hours |
|---------|-----------|-------------|--------------|-----------------|
| P3-T1 | **Comment Templates** | Implement `comment-templates.js` - Escalation, Retry, Result templates | None | 2 |
| P3-T2 | **Retry Handler** | Implement `retry-handler.js` - decision logic, backoff, retry context | P2-T3, P1-T3 | 2 |
| P3-T3 | **Escalation Handler** | Implement `escalation-handler.js` - generate and post escalation comments | P3-T1, P2-T4 | 2 |
| P3-T4 | **Main Adapter** | Implement `index.js` - OrchestratorAdapter interface implementation | P2-T3, P2-T6, P3-T2, P3-T3 | 3 |
| P3-T5 | **Integration Tests** | Test complete workflows: Issue → Dispatch → Result | P3-T4 | 3 |
| P3-T6 | **Webhook Payload Schema** | Create `schemas/github-issue-payload.schema.json` | P2-T5 | 1 |
| P3-T7 | **Update Registry** | Add github-issue adapter entry to `adapters/registry.json` | P3-T4 | 0.5 |
| P3-T8 | **Unit Tests - Retry Handler** | Test retry decisions, backoff calculation, max retry limits | P3-T2 | 1 |
| P3-T9 | **Unit Tests - Escalation Handler** | Test comment generation, label management | P3-T3 | 1.5 |
| P3-T10 | **Unit Tests - Main Adapter** | Test interface compliance, error handling | P3-T4 | 2 |

**Phase 3 Deliverables**:
- `comment-templates.js` - Three template types with variable substitution
- `retry-handler.js` - Complete retry logic with exponential backoff
- `escalation-handler.js` - Escalation generation and GitHub posting
- `index.js` - Full OrchestratorAdapter implementation
- `github-issue-payload.schema.json` - JSON Schema for webhook payloads
- Integration test suite
- Updated `adapters/registry.json`

**Validation Checkpoint**:
- [ ] Main adapter implements all required OrchestratorAdapter methods
- [ ] Integration tests cover all 4 core workflows
- [ ] Retry handler respects max_retry config and risk_level rules
- [ ] Escalation comments include all required sections
- [ ] Registry entry follows schema definition

---

### Phase 4: Documentation & Sync

**Goal**: Complete documentation, examples, and governance updates.

#### Tasks

| Task ID | Task Name | Description | Dependencies | Estimated Hours |
|---------|-----------|-------------|--------------|-----------------|
| P4-T1 | **Adapter README** | Create `adapters/github-issue/README.md` with usage examples | P3-T4 | 1.5 |
| P4-T2 | **API Documentation** | Document all public methods with JSDoc | P3-T4 | 1 |
| P4-T3 | **Usage Examples** | Create example workflows in `examples/github-issue/` | P3-T4 | 1.5 |
| P4-T4 | **Update ADAPTERS.md** | Mark GitHub Issue as "Implemented" with link to adapter | P3-T7 | 0.5 |
| P4-T5 | **E2E Test Setup** | Create E2E test with real GitHub test repository | P3-T5 | 2 |
| P4-T6 | **Troubleshooting Guide** | Common issues and solutions documentation | P4-T1 | 1 |
| P4-T7 | **Security Documentation** | Webhook security best practices | P4-T1 | 0.5 |
| P4-T8 | **Update CHANGELOG** | Add v1.1 entry for GitHub Issue Adapter | All | 0.5 |

**Phase 4 Deliverables**:
- `README.md` - Complete usage guide
- JSDoc comments on all public APIs
- Example workflows (3-5 examples)
- Updated `ADAPTERS.md` status
- E2E test suite
- Troubleshooting guide
- Security best practices doc
- CHANGELOG update

**Validation Checkpoint**:
- [ ] README includes setup instructions, configuration guide, and examples
- [ ] E2E tests pass against real GitHub repository
- [ ] ADAPTERS.md correctly references implementation
- [ ] All acceptance criteria from spec.md are met

---

## Parallel Execution

### Parallel Groups

The following tasks can run concurrently:

**Group A: Infrastructure (Phase 1)**
- P1-T1, P1-T2, P1-T6 can start immediately
- P1-T3, P1-T4, P1-T5 can run in parallel after P1-T1

**Group B: Parsing Components (Phase 2)**
- P2-T1 (Label Parser) and P2-T2 (Body Parser) are **independent**
- P2-T4 (GitHub Client) can run in parallel with parsers
- P2-T8, P2-T9 (Unit Tests) can run in parallel with implementation

**Group C: Handler Components (Phase 3)**
- P3-T1 (Comment Templates) is **independent**
- P3-T2 (Retry Handler) and P3-T3 (Escalation Handler) can run in parallel
- P3-T6 (Schema) is **independent**

**Group D: Documentation (Phase 4)**
- P4-T2, P4-T3, P4-T6, P4-T7 can run in parallel after P3-T4

### Execution Flow Diagram

```
Phase 1: Foundation
├── P1-T1 (Directory) ──┬── P1-T3 (Config) ──┐
├── P1-T2 (Package) ────┼── P1-T4 (Types) ───┼── P2-T1 (Label Parser)
└── P1-T6 (Tests) ──────┴── P1-T5 (Utils) ───┴── P2-T2 (Body Parser)
                                                      │
Phase 2: Core                              ┌────────┴────────┐
├── P2-T1 (Label Parser) ──────────────────┤                 │
├── P2-T2 (Body Parser) ───────────────────┤   P2-T3 (Issue  │
├── P2-T4 (GitHub Client) ─────────────────┤      Parser)    │
│   └── P2-T7 (Error Mapper)               │                 │
├── P2-T5 (Webhook Handler) ───────────────┤                 │
│   └── P2-T6 (Dispatch Validator) ────────┘                 │
└── P2-T8 to P2-T12 (Tests)                                  │
                                                             │
Phase 3: Integration                                         │
├── P3-T1 (Templates) ─────────────────────┐                 │
├── P3-T2 (Retry Handler) ─────────────────┤   P3-T4 (Main   │
├── P3-T3 (Escalation Handler) ────────────┤   Adapter)      │
├── P3-T6 (Schema) ────────────────────────┤                 │
│   └── P3-T7 (Registry)                   │                 │
└── P3-T5, P3-T8-P3-T10 (Tests) ───────────┘                 │
                                                             │
Phase 4: Documentation                                       │
├── P4-T1 (README) ────────────────────────┐                 │
├── P4-T2 (JSDoc) ─────────────────────────┤   P4-T5 (E2E    │
├── P4-T3 (Examples) ──────────────────────┤   Tests)        │
├── P4-T4 (ADAPTERS.md) ───────────────────┤                 │
├── P4-T6 (Troubleshooting) ───────────────┤                 │
├── P4-T7 (Security) ──────────────────────┤                 │
└── P4-T8 (CHANGELOG) ─────────────────────┘                 │
```

---

## Dependencies

### External Dependencies

| Dependency | Version | Purpose | Install Command |
|------------|---------|---------|-----------------|
| `@octokit/rest` | ^20.x | GitHub REST API client | `npm install @octokit/rest` |
| `@octokit/graphql` | ^7.x | GitHub GraphQL API (optional) | `npm install @octokit/graphql` |
| `jsonwebtoken` | ^9.x | JWT generation for GitHub App auth | `npm install jsonwebtoken` |
| `dotenv` | ^16.x | Environment variable management | `npm install dotenv` |

### Internal Dependencies

| Module | Path | Purpose |
|--------|------|---------|
| OrchestratorAdapter Interface | `adapters/interfaces/orchestrator-adapter.interface.ts` | Interface contract |
| Contract Schema Pack | `contracts/pack/` | Validation utilities |
| Shared Utilities | `adapters/shared/` | Version check, profile loader |

### Runtime Dependencies

| Requirement | Source | Notes |
|-------------|--------|-------|
| Node.js 18+ | Environment | Required for crypto.timingSafeEqual |
| GitHub Token | Environment Variable | `GITHUB_TOKEN` or `GITHUB_APP_*` |
| Webhook Secret | Environment Variable | `GITHUB_WEBHOOK_SECRET` |
| Network Access | Infrastructure | api.github.com must be reachable |

---

## Validation Checkpoints

### Checkpoint 1: Foundation Complete (End of Phase 1)

**Criteria**:
- [ ] All Phase 1 tasks complete
- [ ] `npm install` succeeds
- [ ] Directory structure follows ADAPTERS.md conventions
- [ ] Configuration file validates against schema
- [ ] Type definitions compile without errors

**Validation Command**:
```bash
cd adapters/github-issue
npm install
npm run test:config
```

### Checkpoint 2: Core Components Complete (End of Phase 2)

**Criteria**:
- [ ] All Phase 2 tasks complete
- [ ] Unit test coverage >90%
- [ ] Label parser passes all pattern tests
- [ ] Body parser handles edge cases
- [ ] Webhook handler passes security audit
- [ ] GitHub client handles rate limits

**Validation Command**:
```bash
npm test
npm run test:coverage
npm run security:audit
```

### Checkpoint 3: Integration Complete (End of Phase 3)

**Criteria**:
- [ ] All Phase 3 tasks complete
- [ ] Main adapter implements OrchestratorAdapter interface
- [ ] Integration tests pass
- [ ] Registry updated correctly
- [ ] All 4 core workflows tested

**Validation Command**:
```bash
npm run test:integration
npm run test:interface-compliance
npm run validate:registry
```

### Checkpoint 4: Release Ready (End of Phase 4)

**Criteria**:
- [ ] All Phase 4 tasks complete
- [ ] E2E tests pass against real GitHub repo
- [ ] Documentation complete and accurate
- [ ] All acceptance criteria from spec.md met
- [ ] CHANGELOG updated

**Validation Command**:
```bash
npm run test:e2e
npm run docs:check
npm run spec:validate
```

---

## Risk Assessment

### Risk 1: GitHub API Rate Limiting

**Impact**: HIGH  
**Probability**: MEDIUM  
**Description**: GitHub API has rate limits (5000 req/hour for PAT, 15000 for App). Heavy usage could trigger limits.

**Mitigation**:
- Implement rate limit tracking via `X-RateLimit-Remaining` header
- Exponential backoff when approaching limits (implemented in P2-T4)
- Queue non-critical operations
- Document rate limit behavior in troubleshooting guide
- Add metrics/logging for API usage

**Fallback**:
- Cache responses where appropriate
- Batch operations when possible
- Document manual retry procedures

### Risk 2: Webhook Security Vulnerabilities

**Impact**: CRITICAL  
**Probability**: LOW  
**Description**: Improper webhook signature verification could allow forged requests.

**Mitigation**:
- Use constant-time comparison for HMAC verification (P2-T5)
- Strict event/action filtering (BR-006, BR-007)
- Document security best practices (P4-T7)
- Add security audit to CI pipeline
- Never log webhook secrets

**Fallback**:
- IP allowlisting for webhook endpoints
- Request signing with additional headers

### Risk 3: GitHub API Breaking Changes

**Impact**: MEDIUM  
**Probability**: LOW  
**Description**: GitHub may deprecate or change API endpoints.

**Mitigation**:
- Use official Octokit SDK (maintained by GitHub)
- Pin to specific version ranges
- Monitor GitHub API changelog
- Abstract API calls behind client layer (P2-T4)

**Fallback**:
- Version gating in adapter
- Graceful degradation for unsupported features

### Risk 4: Authentication Token Management

**Impact**: HIGH  
**Probability**: MEDIUM  
**Description**: Token expiration, scope issues, or leakage could block operations.

**Mitigation**:
- Support both PAT and GitHub App authentication
- Implement token refresh for App tokens (P2-T4)
- Minimal scope principle (issues:write, issues:read)
- Document token setup procedures
- Add token validation on startup

**Fallback**:
- Graceful error handling with clear messages
- Manual token refresh instructions

### Risk 5: Parsing Edge Cases

**Impact**: MEDIUM  
**Probability**: HIGH  
**Description**: Unexpected Issue body formats, malformed markdown, or unusual labels.

**Mitigation**:
- Defensive parsing with try/catch (P2-T1, P2-T2)
- Comprehensive unit tests for edge cases (P2-T8, P2-T9)
- Fallback values for missing sections (BR-003)
- Document expected Issue format
- Add validation warnings for unrecognized content

**Fallback**:
- Partial parsing (extract what we can)
- Escalate when parsing fails completely

### Risk 6: Integration Complexity

**Impact**: MEDIUM  
**Probability**: MEDIUM  
**Description**: Coordinating multiple components (parsing, API, webhooks, retry) may introduce bugs.

**Mitigation**:
- Clear module boundaries (per ADAPTERS.md)
- Comprehensive integration tests (P3-T5)
- Interface contracts strictly followed
- Incremental development with validation checkpoints

**Fallback**:
- Feature flags for new functionality
- Rollback to previous version

---

## Estimated Effort

### Summary by Phase

| Phase | Tasks | Estimated Hours | Calendar Days* |
|-------|-------|-----------------|----------------|
| Phase 1: Foundation | 6 | 8 | 2 |
| Phase 2: Core Implementation | 12 | 22 | 5 |
| Phase 3: Integration | 10 | 18 | 4 |
| Phase 4: Documentation | 8 | 8.5 | 2 |
| **Total** | **36** | **56.5** | **13** |

*Calendar days assume 2 parallel developers working 6 hours/day, with some parallel task execution.

### Effort by Component

| Component | Tasks | Hours | Complexity |
|-----------|-------|-------|------------|
| **Parsing Layer** | P2-T1, P2-T2, P2-T3 | 7 | Medium |
| **GitHub API Client** | P2-T4, P2-T7 | 5 | High |
| **Webhook Handler** | P2-T5, P2-T6 | 4.5 | High |
| **Retry/Escalation** | P3-T1, P3-T2, P3-T3 | 6 | Medium |
| **Main Adapter** | P3-T4, P3-T7 | 3.5 | Medium |
| **Testing** | P2-T8-P2-T12, P3-T5, P3-T8-P3-T10 | 12 | Medium |
| **Documentation** | P4-T1-P4-T8 | 6.5 | Low |
| **Infrastructure** | P1-T1-P1-T6 | 8 | Low |

### Resource Requirements

| Resource | Hours | Skills Required |
|----------|-------|-----------------|
| Senior Developer | 40 | Node.js, GitHub API, Testing |
| Technical Writer | 6.5 | Documentation, Examples |
| QA Engineer | 10 | Integration testing, E2E testing |

---

## File Structure

```
adapters/github-issue/
├── README.md                           # Usage documentation (P4-T1)
├── package.json                        # Dependencies (P1-T2)
├── github-issue.config.json            # Adapter configuration (P1-T3)
├── index.js                            # Main OrchestratorAdapter implementation (P3-T4)
│
├── src/
│   ├── issue-parser.js                 # Core parsing orchestrator (P2-T3)
│   ├── label-parser.js                 # Label parsing logic (P2-T1)
│   ├── body-parser.js                  # Body section parsing (P2-T2)
│   ├── github-client.js                # GitHub API wrapper (P2-T4)
│   ├── webhook-handler.js              # Webhook handling (P2-T5)
│   ├── dispatch-validator.js           # Payload validation (P2-T6)
│   ├── error-mapper.js                 # Error classification (P2-T7)
│   ├── retry-handler.js                # Retry logic (P3-T2)
│   ├── escalation-handler.js           # Escalation handling (P3-T3)
│   ├── comment-templates.js            # Comment templates (P3-T1)
│   └── utils/
│       ├── token-manager.js            # Token management (P1-T5)
│       ├── rate-limit-tracker.js       # Rate limit handling (P1-T5)
│       └── error-classifier.js         # Error classification (P1-T5)
│
├── types/
│   └── github-issue.types.ts           # TypeScript definitions (P1-T4)
│
├── schemas/
│   └── github-issue-payload.schema.json # Webhook payload schema (P3-T6)
│
├── tests/
│   ├── unit/
│   │   ├── label-parser.test.js        # Label parser tests (P2-T8)
│   │   ├── body-parser.test.js         # Body parser tests (P2-T9)
│   │   ├── issue-parser.test.js        # Issue parser tests (P2-T10)
│   │   ├── github-client.test.js       # GitHub client tests (P2-T11)
│   │   ├── webhook-handler.test.js     # Webhook handler tests (P2-T12)
│   │   ├── retry-handler.test.js       # Retry handler tests (P3-T8)
│   │   ├── escalation-handler.test.js  # Escalation handler tests (P3-T9)
│   │   └── index.test.js               # Main adapter tests (P3-T10)
│   ├── integration/
│   │   └── workflow.test.js            # Integration tests (P3-T5)
│   └── e2e/
│       └── github-workflow.test.js     # E2E tests (P4-T5)
│
├── __mocks__/
│   └── github-api.js                   # Mock GitHub API responses
│
└── examples/
    ├── simple-issue.json               # Simple issue example
    ├── full-featured-issue.json        # Complete issue example
    └── webhook-payload.json            # Sample webhook payload
```

---

## References

- `specs/021-github-issue-adapter/spec.md` - Feature specification
- `docs/adapters/github-issue-adapter-design.md` - Design document
- `adapters/interfaces/orchestrator-adapter.interface.ts` - Interface definition
- `adapters/cli-local/` - Reference implementation patterns
- `adapters/registry.json` - Adapter registry
- `ADAPTERS.md` - Adapter architecture
- `io-contract.md` - I/O contracts
- GitHub REST API Documentation: https://docs.github.com/en/rest
- GitHub Webhooks Documentation: https://docs.github.com/en/webhooks

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-28 | Initial plan draft |

---

## Open Questions

| Question | Impact | Status | Decision |
|----------|--------|--------|----------|
| Support issue_comment events in Phase 1? | MEDIUM | Open | Recommend: Yes, for escalation responses |
| Support GitHub Enterprise Server? | LOW | Open | Recommend: No, Phase 2 |
| Configurable backoff strategy? | LOW | Open | Recommend: Fixed 5min in Phase 1 |
| Concurrent Issue processing? | MEDIUM | Open | Recommend: Serial in Phase 1 |
