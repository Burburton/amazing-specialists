# Backlog

This document tracks deferred items that are not currently being implemented but should be considered in future iterations.

## Format

Each backlog item includes:
- **ID**: Unique identifier
- **Title**: Short description
- **Source**: Where the item originated
- **Priority**: high/medium/low
- **Status**: pending/in-review/scheduled
- **Rationale**: Why it was deferred
- **Dependencies**: Prerequisites for implementation
- **Estimate**: Approximate effort

---

## Backlog Items

### BL-001: GitHub Issue Webhook Integration

| Field | Value |
|-------|-------|
| ID | BL-001 |
| Title | GitHub Issue Webhook Integration for Automated Dispatch |
| Source | `specs/026-github-issue-adapter-workflow-test/workflow-test-report.md` (Suggestion 3) |
| Priority | medium |
| Status | pending |
| Created | 2026-03-29 |

**Description**:
When a GitHub Issue is created, a webhook triggers the GitHub Issue Adapter to:
1. Parse the Issue into a Dispatch Payload
2. Route to the execution layer automatically
3. Post execution results back to the Issue

**Rationale for Deferral**:
Per user instruction: "至于建议 3: 增加 Webhook 集成先不要做，可以记录backlog，以后等系统跑稳定了再做"

The workflow needs to stabilize before adding automated triggering. Current manual workflow provides better observability during testing phase.

**Implementation Requirements**:
- Webhook endpoint setup (Express.js or similar)
- HMAC-SHA256 signature verification (already in `webhook-handler.js`)
- Event filtering (issues opened, edited, labeled)
- Dispatch routing to execution layer
- Error handling and retry for webhook delivery failures

**Dependencies**:
- Feature 027 completion (adapter enhancements)
- Stable execution layer with proven workflow
- Deployment infrastructure (server, domain, HTTPS)
- GitHub App or Webhook configuration in target repo

**Estimate**: 2-3 days

**Related Files**:
- `adapters/github-issue/webhook-handler.js` - Existing webhook handler
- `adapters/github-issue/index.js` - `handleWebhook()` method exists
- `io-contract.md §8` - OrchestratorAdapter interface

---

### BL-002: [Reserved for future items]

---

## Backlog Maintenance

### Adding Items

1. Create new entry with unique ID (BL-XXX)
2. Fill all required fields
3. Link to source document/spec
4. Set status to `pending`

### Reviewing Items

Review backlog items quarterly or when:
- Related feature is being planned
- Dependencies become satisfied
- User requests reconsideration

### Scheduling Items

When scheduling a backlog item:
1. Update status to `scheduled`
2. Create feature spec under `specs/XXX-feature-name/`
3. Reference backlog ID in spec metadata

---

## History

| Date | Action | Item |
|------|--------|------|
| 2026-03-29 | Created | BL-001 added from Feature 026 test report |