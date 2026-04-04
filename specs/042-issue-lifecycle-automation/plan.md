# Implementation Plan: Issue Lifecycle Automation

## Plan ID
042-issue-lifecycle-automation

## Feature
042-issue-lifecycle-automation

## Version
1.0.0

## Created
2026-04-04

---

## Architecture Overview

### Component Changes

```
adapters/github-issue/
├── github-client.js          # 增强：新增 CRUD 方法
├── issue-context.js          # 新增：状态文件管理
└── labels.json               # 现有：Label 配置

scripts/
└── process-issue.js          # 增强：新增子命令

.github/ISSUE_TEMPLATE/
└── task.md                   # 更新：Task ID 优先

docs/
└── issue-lifecycle.md        # 新增：使用文档（可选）
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLI Commands                              │
│  process-issue.js create | close | status | list                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     IssueContext Manager                         │
│  - Read/Write .issue-context.json                               │
│  - Map Task ID ↔ Issue Number                                   │
│  - Track Issue Status                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       GitHubClient                               │
│  - createIssue()                                                 │
│  - searchIssues({ labels })                                      │
│  - closeIssue()                                                  │
│  - getIssue()                                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    GitHub REST API v3
```

### Class Design

```javascript
// issue-context.js
class IssueContext {
  constructor(projectRoot)
  
  // 状态文件操作
  load()                           // 读取 .issue-context.json
  save()                           // 保存 .issue-context.json
  
  // Issue 映射
  recordIssue(taskId, issueNumber, metadata)
  getIssueByTaskId(taskId)         // 返回 { number, status, ... }
  updateIssueStatus(taskId, status)
  
  // 查询
  listIssues(filter)               // 列出所有或过滤
  findIssuesByLabel(label)         // 按 label 查找
}

// github-client.js 增强
class GitHubClient {
  // 现有方法...
  
  // 新增方法
  async createIssue(owner, repo, options)
  async searchIssues(owner, repo, options)
  async updateIssue(owner, repo, issueNumber, options)
  async closeIssue(owner, repo, issueNumber)
  async reopenIssue(owner, repo, issueNumber)
}

// process-issue.js 增强
class IssueProcessor {
  // 现有方法...
  
  // 新增命令处理
  async createIssue(options)       // 创建 Issue
  async closeIssue(options)        // 关闭 Issue（按 Task ID）
  async getStatus(options)         // 查询状态
  async listIssues(options)        // 列出 Issues
}
```

---

## Implementation Phases

### Phase 1: GitHubClient Enhancement (M1)

#### 1.1 Create Issue Method

```javascript
/**
 * Create a new issue
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {Object} options - Issue options
 * @param {string} options.title - Issue title
 * @param {string} [options.body] - Issue body (markdown)
 * @param {string[]} [options.labels] - Labels to add
 * @param {string|number} [options.milestone] - Milestone number or title
 * @param {string[]} [options.assignees] - Assignees
 * @returns {Promise<Object>} Created issue object
 */
async createIssue(owner, repo, options) {
  const path = `/repos/${owner}/${repo}/issues`;
  const data = {
    title: options.title,
    body: options.body || '',
    labels: options.labels || [],
    assignees: options.assignees || []
  };
  
  // Handle milestone (can be number or title)
  if (options.milestone) {
    data.milestone = options.milestone;
  }
  
  return await this._requestWithRetry('POST', path, data);
}
```

#### 1.2 Search Issues Method

```javascript
/**
 * Search issues with filters
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {Object} options - Search options
 * @param {string[]} [options.labels] - Filter by labels
 * @param {string} [options.state] - Filter by state (open, closed, all)
 * @param {string} [options.milestone] - Filter by milestone
 * @param {number} [options.per_page] - Results per page (max 100)
 * @param {number} [options.page] - Page number
 * @returns {Promise<Array>} Array of issue objects
 */
async searchIssues(owner, repo, options = {}) {
  const params = new URLSearchParams();
  
  if (options.labels && options.labels.length > 0) {
    params.set('labels', options.labels.join(','));
  }
  if (options.state) {
    params.set('state', options.state);
  }
  if (options.milestone) {
    params.set('milestone', options.milestone);
  }
  params.set('per_page', String(options.per_page || 100));
  if (options.page) {
    params.set('page', String(options.page));
  }
  
  const path = `/repos/${owner}/${repo}/issues?${params.toString()}`;
  return await this._requestWithRetry('GET', path);
}
```

#### 1.3 Update/Close Issue Methods

```javascript
/**
 * Update an issue
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} issueNumber - Issue number
 * @param {Object} options - Update options
 * @returns {Promise<Object>} Updated issue object
 */
async updateIssue(owner, repo, issueNumber, options) {
  const path = `/repos/${owner}/${repo}/issues/${issueNumber}`;
  return await this._requestWithRetry('PATCH', path, options);
}

/**
 * Close an issue
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} issueNumber - Issue number
 * @returns {Promise<Object>} Closed issue object
 */
async closeIssue(owner, repo, issueNumber) {
  return await this.updateIssue(owner, repo, issueNumber, { state: 'closed' });
}

/**
 * Reopen an issue
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} issueNumber - Issue number
 * @returns {Promise<Object>} Reopened issue object
 */
async reopenIssue(owner, repo, issueNumber) {
  return await this.updateIssue(owner, repo, issueNumber, { state: 'open' });
}
```

---

### Phase 2: Issue Context Manager (M1)

#### 2.1 IssueContext Class

```javascript
const fs = require('fs');
const path = require('path');

class IssueContext {
  constructor(projectRoot) {
    this.contextPath = path.join(projectRoot, '.issue-context.json');
    this.data = this._loadOrCreate();
  }
  
  _loadOrCreate() {
    try {
      if (fs.existsSync(this.contextPath)) {
        const content = fs.readFileSync(this.contextPath, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn('Failed to load issue context, creating new one:', error.message);
    }
    
    return {
      version: '1.0.0',
      issues: {},
      lastUpdated: new Date().toISOString()
    };
  }
  
  save() {
    this.data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.contextPath, JSON.stringify(this.data, null, 2));
  }
  
  recordIssue(taskId, issueNumber, metadata = {}) {
    this.data.issues[taskId] = {
      number: issueNumber,
      url: metadata.url || '',
      status: metadata.status || 'open',
      created_at: metadata.created_at || new Date().toISOString(),
      closed_at: metadata.closed_at || null,
      commit_sha: metadata.commit_sha || null
    };
    this.save();
  }
  
  getIssueByTaskId(taskId) {
    return this.data.issues[taskId] || null;
  }
  
  updateIssueStatus(taskId, status, metadata = {}) {
    if (this.data.issues[taskId]) {
      this.data.issues[taskId].status = status;
      if (status === 'closed') {
        this.data.issues[taskId].closed_at = new Date().toISOString();
      }
      if (metadata.commit_sha) {
        this.data.issues[taskId].commit_sha = metadata.commit_sha;
      }
      this.save();
    }
  }
  
  listIssues(filter = {}) {
    let issues = Object.entries(this.data.issues).map(([taskId, data]) => ({
      taskId,
      ...data
    }));
    
    if (filter.status) {
      issues = issues.filter(i => i.status === filter.status);
    }
    
    return issues;
  }
}

module.exports = { IssueContext };
```

---

### Phase 3: CLI Commands (M2)

#### 3.1 Create Command

```javascript
async handleCreateCommand(argv) {
  const { owner, repo, task, title, role, risk, milestone, body, bodyFile } = argv;
  
  // 检查是否已存在
  const existing = await this._findIssueByTaskId(owner, repo, task);
  if (existing) {
    console.log(`Issue #${existing.number} already exists for task:${task}`);
    return { success: true, issue: existing, alreadyExisted: true };
  }
  
  // 构建 labels
  const labels = [`task:${task}`];
  if (role) labels.push(`role:${role}`);
  if (risk) labels.push(`risk:${risk}`);
  if (milestone) labels.push(`milestone:${milestone}`);
  
  // 读取 body
  let issueBody = body || '';
  if (bodyFile && fs.existsSync(bodyFile)) {
    issueBody = fs.readFileSync(bodyFile, 'utf8');
  }
  
  // 创建 Issue
  const issue = await this.adapter.githubClient.createIssue(owner, repo, {
    title: title,
    body: issueBody,
    labels: labels
  });
  
  // 记录到状态文件
  this.context.recordIssue(task, issue.number, {
    url: issue.html_url,
    status: 'open'
  });
  
  console.log(`Created Issue #${issue.number}: ${issue.html_url}`);
  return { success: true, issue };
}
```

#### 3.2 Close Command

```javascript
async handleCloseCommand(argv) {
  const { owner, repo, task, comment } = argv;
  
  // 查找 Issue
  const issues = await this.adapter.githubClient.searchIssues(owner, repo, {
    labels: [`task:${task}`],
    state: 'all'
  });
  
  if (issues.length === 0) {
    console.error(`No issue found with task:${task}`);
    return { success: false, error: 'NOT_FOUND' };
  }
  
  if (issues.length > 1) {
    console.warn(`Warning: Multiple issues found with task:${task}, using first`);
  }
  
  const issue = issues[0];
  
  // 幂等性：已关闭则跳过
  if (issue.state === 'closed') {
    console.log(`Issue #${issue.number} already closed`);
    return { success: true, issue, alreadyClosed: true };
  }
  
  // 发布评论（如果提供）
  if (comment) {
    await this.adapter.githubClient.postComment(owner, repo, issue.number, comment);
  }
  
  // 关闭 Issue
  await this.adapter.githubClient.closeIssue(owner, repo, issue.number);
  
  // 更新状态文件
  this.context.updateIssueStatus(task, 'closed');
  
  console.log(`Closed Issue #${issue.number}`);
  return { success: true, issue };
}
```

#### 3.3 Status & List Commands

```javascript
async handleStatusCommand(argv) {
  const { owner, repo, task } = argv;
  
  // 先查状态文件
  const cached = this.context.getIssueByTaskId(task);
  if (cached) {
    console.log(`Issue #${cached.number}`);
    console.log(`  URL: ${cached.url}`);
    console.log(`  Status: ${cached.status}`);
    console.log(`  Created: ${cached.created_at}`);
    if (cached.closed_at) {
      console.log(`  Closed: ${cached.closed_at}`);
    }
    return { success: true, issue: cached };
  }
  
  // 查 GitHub API
  const issues = await this.adapter.githubClient.searchIssues(owner, repo, {
    labels: [`task:${task}`],
    state: 'all'
  });
  
  if (issues.length === 0) {
    console.error(`No issue found with task:${task}`);
    return { success: false, error: 'NOT_FOUND' };
  }
  
  const issue = issues[0];
  console.log(`Issue #${issue.number}`);
  console.log(`  URL: ${issue.html_url}`);
  console.log(`  Status: ${issue.state}`);
  console.log(`  Title: ${issue.title}`);
  
  return { success: true, issue };
}

async handleListCommand(argv) {
  const { owner, repo, label, state } = argv;
  
  const options = {};
  if (label) options.labels = Array.isArray(label) ? label : [label];
  if (state) options.state = state;
  
  const issues = await this.adapter.githubClient.searchIssues(owner, repo, options);
  
  console.log(`Found ${issues.length} issues:\n`);
  
  for (const issue of issues) {
    const taskLabel = issue.labels.find(l => l.name.startsWith('task:'));
    const taskId = taskLabel ? taskLabel.name : 'N/A';
    console.log(`#${issue.number} [${issue.state}] ${taskId}: ${issue.title}`);
  }
  
  return { success: true, issues };
}
```

---

### Phase 4: Issue Template Update (M3)

更新 `.github/ISSUE_TEMPLATE/task.md`，强调使用 Task ID 而非 Issue 编号。

---

## Testing Strategy

### Unit Tests

```javascript
// tests/unit/github-client.test.js
describe('GitHubClient', () => {
  describe('createIssue', () => {
    it('should create issue with required fields', async () => {
      const issue = await client.createIssue('owner', 'repo', {
        title: 'Test Issue',
        labels: ['task:T-001']
      });
      expect(issue.number).toBeDefined();
    });
  });
  
  describe('searchIssues', () => {
    it('should filter by labels', async () => {
      const issues = await client.searchIssues('owner', 'repo', {
        labels: ['task:T-001']
      });
      expect(Array.isArray(issues)).toBe(true);
    });
  });
  
  describe('closeIssue', () => {
    it('should close issue by number', async () => {
      const issue = await client.closeIssue('owner', 'repo', 123);
      expect(issue.state).toBe('closed');
    });
  });
});
```

### Integration Tests

```bash
# 测试创建 Issue
node scripts/process-issue.js create \
  --owner test-owner --repo test-repo \
  --task T-TEST-001 --title "Test Issue" \
  --role developer --risk low

# 测试幂等性（重复创建）
node scripts/process-issue.js create \
  --owner test-owner --repo test-repo \
  --task T-TEST-001 --title "Test Issue"

# 测试关闭
node scripts/process-issue.js close \
  --owner test-owner --repo test-repo \
  --task T-TEST-001 --comment "✅ Test complete"
```

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| State file conflicts | Low | Medium | Git track + manual merge |
| API rate limit | Medium | Low | Built-in retry + quota display |
| Permission errors | Low | High | Clear error messages with required scopes |
| Missing labels | Medium | Low | Auto-create or prompt |

---

## Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| M1: GitHubClient + Context | 2 hours | createIssue, searchIssues, closeIssue, IssueContext |
| M2: CLI Commands | 2 hours | create, close, status, list |
| M3: Documentation | 1 hour | Template update, README |

**Total Estimated: 5 hours**