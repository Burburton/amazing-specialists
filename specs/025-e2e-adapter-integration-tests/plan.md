# Plan: E2E Adapter Integration Tests

## Metadata

| Field | Value |
|-------|-------|
| **Feature ID** | 025-e2e-adapter-integration-tests |
| **Plan Version** | 1.0.0 |
| **Created** | 2026-03-29 |
| **Based on** | spec.md v1.0.0 |

---

## Implementation Units

### Unit 1: Test Infrastructure Setup

**Goal**: Create test directory structure and shared utilities

**Tasks**:
- T001: Create `tests/e2e/adapters/` directory
- T002: Create adapter test fixtures (`adapter-fixtures.js`)
- T003: Create mock configuration helper (`mock-config.js`)
- T004: Create test assertions for adapter validation (`adapter-assertions.js`)

**Parallel-safe**: All tasks can run in parallel

**Output**:
- `tests/e2e/adapters/` directory
- `tests/e2e/adapters/fixtures/adapter-fixtures.js`
- `tests/e2e/adapters/helpers/mock-config.js`
- `tests/e2e/adapters/helpers/adapter-assertions.js`

---

### Unit 2: GitHub Issue Adapter Tests (P0)

**Goal**: Implement 15 test cases for `adapters/github-issue/index.js`

**Tasks**:
- T005: Implement webhook handling tests (TC-GI-001~003)
- T006: Implement parsing flow tests (TC-GI-004~007)
- T007: Implement error mapping tests (TC-GI-008~009)
- T008: Implement escalation flow tests (TC-GI-010~011)
- T009: Implement retry flow tests (TC-GI-012~013)
- T010: Implement result posting tests (TC-GI-014)
- T011: Implement adapter info test (TC-GI-015)

**Dependencies**: Unit 1 complete

**Output**:
- `tests/e2e/adapters/github-issue-adapter.test.js` (15 test cases)

**Key Implementation Notes**:

1. **Webhook Signature Verification**: Use real `WebhookHandler.handleRequest()`:
   ```javascript
   const result = await adapter.handleWebhook(request, secret);
   expect(result.valid).toBe(true);
   ```

2. **Dispatch Creation**: Use real `IssueParser.parse()`:
   ```javascript
   const dispatch = adapter.normalizeInput(result.issue);
   const validation = adapter.validateDispatch(dispatch);
   expect(validation.isValid).toBe(true);
   ```

3. **Nock Mock Configuration**: Use adapter's config.json for base_url:
   ```javascript
   const config = require('../../../adapters/github-issue/github-issue.config.json');
   nock(config.github_config.api.base_url)
     .post('/repos/.../comments')
     .reply(201);
   ```

---

### Unit 3: OpenClaw Adapter Tests (P1)

**Goal**: Implement 14 test cases for `adapters/openclaw/index.js`

**Tasks**:
- T012: Implement JWT auth tests (TC-OC-001~003)
- T013: Implement message parsing tests (TC-OC-004)
- T014: Implement callback tests (TC-OC-005~008)
- T015: Implement decision response tests (TC-OC-009~012)
- T016: Implement error mapping test (TC-OC-013)
- T017: Implement adapter info test (TC-OC-014)

**Dependencies**: Unit 1 complete

**Output**:
- `tests/e2e/adapters/openclaw-adapter.test.js` (14 test cases)

**Key Implementation Notes**:

1. **JWT Testing**: Use test-only secret:
   ```javascript
   const testSecret = 'test-jwt-secret-do-not-use-in-production';
   const token = adapter.generateTestJWT({ dispatch_id: 'test-001' }, testSecret);
   ```

2. **Callback Verification**: Verify Nock mock calls:
   ```javascript
   nock(baseUrl)
     .post('/api/v1/results', (body) => {
       expect(body.dispatch_id).toBe('dispatch-001');
       return true;
     })
     .reply(200);
   ```

---

### Unit 4: GitHub PR Adapter Tests (P2)

**Goal**: Implement 10 test cases for `adapters/github-pr/index.js`

**Tasks**:
- T018: Implement PR creation tests (TC-PR-001~004)
- T019: Implement artifact writing tests (TC-PR-005~006)
- T020: Implement PR metadata tests (TC-PR-007~009)
- T021: Implement adapter info test (TC-PR-010)

**Dependencies**: Unit 1 complete

**Output**:
- `tests/e2e/adapters/github-pr-adapter.test.js` (10 test cases)

**Key Implementation Notes**:

1. **PR Creation Flow**: Mock complete Git workflow:
   ```javascript
   nock('https://api.github.com')
     .get('/repos/.../git/ref/heads/main').reply(200, { object: { sha: 'abc' } })
     .post('/repos/.../git/trees').reply(200, { sha: 'tree-sha' })
     .post('/repos/.../git/commits').reply(200, { sha: 'commit-sha' })
     .post('/repos/.../git/refs').reply(201)
     .post('/repos/.../pulls').reply(201, { number: 456 });
   ```

---

### Unit 5: Local Repo Adapter Tests (P3)

**Goal**: Implement 7 test cases for `adapters/local-repo/index.js`

**Tasks**:
- T022: Implement workspace tests (TC-LR-001~006)
- T023: Implement adapter info test (TC-LR-007)

**Dependencies**: Unit 1 complete

**Output**:
- `tests/e2e/adapters/local-repo-adapter.test.js` (7 test cases)

**Key Implementation Notes**:

1. **File System Testing**: Use temp directory:
   ```javascript
   const tmpDir = path.join(os.tmpdir(), `local-repo-test-${Date.now()}`);
   await adapter.initializeWorkspace({ path: tmpDir });
   // Verify files exist
   expect(fs.existsSync(path.join(tmpDir, 'README.md'))).toBe(true);
   ```

2. **Cleanup**: Remove temp directory after tests:
   ```javascript
   afterAll(() => {
     fs.rmSync(tmpDir, { recursive: true, force: true });
   });
   ```

---

### Unit 6: Documentation and Integration

**Goal**: Update documentation and integrate with existing test infrastructure

**Tasks**:
- T024: Update `tests/e2e/README.md` with adapter test section
- T025: Add npm scripts for adapter tests
- T026: Verify all tests pass (46 test cases)
- T027: Generate test report

**Dependencies**: Units 2-5 complete

**Output**:
- Updated `tests/e2e/README.md`
- Updated `package.json` scripts
- Test execution report

---

## Parallel Execution Matrix

### Sprint 1 (Unit 1 - Infrastructure)
| Task | Parallel-Safe |
|------|---------------|
| T001-T004 | All parallel |

### Sprint 2 (Unit 2 - GitHub Issue)
| Task | Dependencies |
|------|--------------|
| T005-T011 | Unit 1 complete, can run in parallel |

### Sprint 3 (Units 3-5 - Other Adapters)
| Task | Dependencies |
|------|--------------|
| T012-T017 (OpenClaw) | Unit 1 complete, parallel with Unit 2 |
| T018-T021 (GitHub PR) | Unit 1 complete, parallel with Unit 2 & 3 |
| T022-T023 (Local Repo) | Unit 1 complete, parallel with all |

### Sprint 4 (Unit 6 - Integration)
| Task | Dependencies |
|------|--------------|
| T024-T027 | Units 2-5 complete |

**Recommended Execution**: Run Sprint 1 → Sprint 2 + Sprint 3 parallel → Sprint 4

---

## Technical Implementation Details

### Nock Mock Pattern

```javascript
describe('True E2E: GitHub Issue Adapter', () => {
  let adapter;
  let githubNock;

  beforeEach(() => {
    nock.cleanAll();
    
    // Load real adapter config
    const config = require('../../../adapters/github-issue/github-issue.config.json');
    adapter = new GitHubIssueAdapter(config);
    
    // Setup Nock with adapter's base_url
    githubNock = nock(config.github_config.api.base_url);
  });

  afterAll(() => {
    nock.cleanAll();
  });

  test('TC-GI-001: Webhook → Dispatch', async () => {
    // 1. Create webhook payload
    const payload = createWebhookPayload();
    const signature = computeHMAC(payload, secret);
    
    // 2. Call real adapter
    const result = await adapter.handleWebhook({
      body: JSON.stringify(payload),
      headers: { 'x-hub-signature-256': signature }
    }, secret);
    
    // 3. Verify result
    expect(result.valid).toBe(true);
    
    // 4. Call real normalizeInput
    const dispatch = adapter.normalizeInput(result.issue);
    
    // 5. Verify dispatch
    expect(dispatch.role).toBe('architect');
    expect(dispatch.command).toBe('design-task');
    
    // 6. Validate dispatch
    const validation = adapter.validateDispatch(dispatch);
    expect(validation.isValid).toBe(true);
  });
});
```

### Test Fixture Pattern

```javascript
// tests/e2e/adapters/fixtures/adapter-fixtures.js

function createGitHubWebhookPayload(overrides = {}) {
  const base = {
    action: 'opened',
    issue: {
      number: 123,
      title: '[architect:design-task] Design auth feature',
      body: `## Context
Building authentication feature.

## Goal
Create design document.

## Constraints
- OAuth2
- MFA`,
      labels: [
        { name: 'milestone:mvp' },
        { name: 'risk:low' }
      ]
    },
    repository: {
      owner: { login: 'test-owner' },
      name: 'test-repo'
    }
  };
  
  return deepMerge(base, overrides);
}

function createOpenClawMessage(overrides = {}) {
  const base = {
    message_id: 'msg-001',
    dispatch_id: 'dispatch-001',
    role: 'developer',
    command: 'feature-implementation',
    payload: {
      goal: 'Implement authentication',
      context: { project: 'test' }
    },
    auth: {
      token: 'test-jwt-token'
    }
  };
  
  return deepMerge(base, overrides);
}
```

### Adapter Assertions Pattern

```javascript
// tests/e2e/adapters/helpers/adapter-assertions.js

function assertValidDispatchFromAdapter(dispatch, expectedRole) {
  // io-contract.md §1 validation
  const requiredFields = [
    'dispatch_id', 'project_id', 'role', 'command',
    'title', 'goal', 'risk_level'
  ];
  
  for (const field of requiredFields) {
    expect(dispatch[field]).toBeDefined();
  }
  
  expect(dispatch.role).toBe(expectedRole);
  expect(['low', 'medium', 'high', 'critical']).toContain(dispatch.risk_level);
}

function assertNockCallComplete(nockScope) {
  expect(nockScope.isDone()).toBe(true);
}

function assertAdapterErrorMapping(adapter, statusCode, expectedStatus) {
  const error = { status: statusCode };
  const mapped = adapter.mapError(error);
  expect(mapped).toBe(expectedStatus);
}
```

---

## Estimated Effort

| Unit | Tasks | Estimated Time |
|------|-------|----------------|
| Unit 1 | 4 | 30 min |
| Unit 2 | 7 | 2 hours |
| Unit 3 | 6 | 1.5 hours |
| Unit 4 | 4 | 1 hour |
| Unit 5 | 2 | 30 min |
| Unit 6 | 4 | 30 min |
| **Total** | **27** | **5.5 hours** |

---

## Dependencies

### External Dependencies
- `nock` - HTTP mocking (already installed)
- `jest` - Test framework (already installed)
- `jsonwebtoken` - JWT handling (used by OpenClaw adapter)

### Internal Dependencies
- `adapters/github-issue/` - GitHub Issue adapter code
- `adapters/openclaw/` - OpenClaw adapter code
- `adapters/github-pr/` - GitHub PR adapter code
- `adapters/local-repo/` - Local Repo adapter code
- `tests/e2e/setup/` - Existing E2E infrastructure

---

## Risks and Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Adapter config changes | Medium | High | Use adapter's actual config.json |
| Nock URL mismatch | Low | Medium | Verify base_url from config |
| JWT secret in tests | Low | Medium | Use test-only secret, document in fixtures |
| Temp directory cleanup | Low | Low | Force delete in afterAll |

---

## Verification Plan

1. **Unit Verification**: Each test file runs independently
2. **Integration Verification**: All tests run in single Jest session
3. **Coverage Verification**: > 90% coverage on adapter `index.js`
4. **No External Calls**: `nock.cleanAll()` + `nock.isDone()` verification

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-29 | Initial plan created |