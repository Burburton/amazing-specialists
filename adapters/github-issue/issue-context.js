/**
 * Issue Context Manager
 * 
 * Manages .issue-context.json state file for Task ID to Issue Number mapping.
 * Reference: specs/042-issue-lifecycle-automation/plan.md
 * 
 * Features:
 * - Read/Write .issue-context.json
 * - Map Task ID ↔ Issue Number
 * - Track Issue Status (open/closed)
 * - Handle missing/corrupted files
 */

const fs = require('fs');
const path = require('path');

/**
 * IssueContext class for managing issue state
 */
class IssueContext {
  /**
   * Create a new IssueContext manager
   * @param {string} projectRoot - Project root directory
   */
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.contextPath = path.join(projectRoot, '.issue-context.json');
    this.data = this._loadOrCreate();
  }

  /**
   * Load existing context file or create new one
   * @returns {Object} Context data
   * @private
   */
  _loadOrCreate() {
    try {
      if (fs.existsSync(this.contextPath)) {
        const content = fs.readFileSync(this.contextPath, 'utf8');
        const data = JSON.parse(content);
        
        // Validate structure
        if (!data.version || !data.issues) {
          console.warn('IssueContext: Invalid structure, creating new one');
          return this._createDefault();
        }
        
        return data;
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File not found - normal case for new projects
        return this._createDefault();
      }
      
      // Corrupted file (JSON parse error or other)
      console.warn('IssueContext: Corrupted file, recreating:', error.message);
      
      // Backup corrupted file if it exists
      if (fs.existsSync(this.contextPath)) {
        const backupPath = this.contextPath + '.corrupted.bak';
        try {
          fs.copyFileSync(this.contextPath, backupPath);
          console.warn(`IssueContext: Corrupted file backed up to ${backupPath}`);
        } catch (bakError) {
          console.warn('IssueContext: Failed to backup corrupted file:', bakError.message);
        }
      }
      
      return this._createDefault();
    }
    
    return this._createDefault();
  }

  /**
   * Create default context structure
   * @returns {Object} Default context data
   * @private
   */
  _createDefault() {
    return {
      version: '1.0.0',
      project: null,
      owner: null,
      issues: {},
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Save context to file
   */
  save() {
    this.data.lastUpdated = new Date().toISOString();
    
    try {
      fs.writeFileSync(
        this.contextPath,
        JSON.stringify(this.data, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('IssueContext: Failed to save:', error.message);
      throw error;
    }
  }

  /**
   * Set project and owner info
   * @param {string} project - Repository name
   * @param {string} owner - Repository owner
   */
  setProjectInfo(project, owner) {
    this.data.project = project;
    this.data.owner = owner;
    this.save();
  }

  /**
   * Record a new issue
   * @param {string} taskId - Task ID (e.g., 'T-042-001')
   * @param {number} issueNumber - GitHub Issue number
   * @param {Object} [metadata] - Additional metadata
   * @param {string} [metadata.url] - Issue URL
   * @param {string} [metadata.status] - Initial status (default: 'open')
   * @param {string} [metadata.created_at] - Creation timestamp
   * @param {string} [metadata.closed_at] - Closure timestamp
   * @param {string} [metadata.commit_sha] - Associated commit SHA
   */
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

  /**
   * Get issue by Task ID
   * @param {string} taskId - Task ID
   * @returns {Object|null} Issue data or null if not found
   */
  getIssueByTaskId(taskId) {
    return this.data.issues[taskId] || null;
  }

  /**
   * Get issue by Issue number
   * @param {number} issueNumber - GitHub Issue number
   * @returns {Object|null} Issue data with taskId or null if not found
   */
  getIssueByNumber(issueNumber) {
    for (const [taskId, data] of Object.entries(this.data.issues)) {
      if (data.number === issueNumber) {
        return { taskId, ...data };
      }
    }
    return null;
  }

  /**
   * Update issue status
   * @param {string} taskId - Task ID
   * @param {string} status - New status ('open' or 'closed')
   * @param {Object} [metadata] - Additional metadata to update
   */
  updateIssueStatus(taskId, status, metadata = {}) {
    if (!this.data.issues[taskId]) {
      console.warn(`IssueContext: Issue not found for taskId: ${taskId}`);
      return false;
    }
    
    this.data.issues[taskId].status = status;
    
    if (status === 'closed') {
      this.data.issues[taskId].closed_at = new Date().toISOString();
    } else if (status === 'open') {
      this.data.issues[taskId].closed_at = null;
    }
    
    if (metadata.commit_sha) {
      this.data.issues[taskId].commit_sha = metadata.commit_sha;
    }
    
    if (metadata.url) {
      this.data.issues[taskId].url = metadata.url;
    }
    
    this.save();
    return true;
  }

  /**
   * Remove issue record
   * @param {string} taskId - Task ID
   * @returns {boolean} True if removed, false if not found
   */
  removeIssue(taskId) {
    if (!this.data.issues[taskId]) {
      return false;
    }
    
    delete this.data.issues[taskId];
    this.save();
    return true;
  }

  /**
   * List all issues with optional filter
   * @param {Object} [filter] - Filter options
   * @param {string} [filter.status] - Filter by status ('open' or 'closed')
   * @returns {Array} Array of issue objects with taskId
   */
  listIssues(filter = {}) {
    let issues = Object.entries(this.data.issues).map(([taskId, data]) => ({
      taskId,
      ...data
    }));
    
    if (filter.status) {
      issues = issues.filter(i => i.status === filter.status);
    }
    
    // Sort by issue number
    issues.sort((a, b) => a.number - b.number);
    
    return issues;
  }

  /**
   * Find issues by label (requires external API call, returns cached matches)
   * Note: This searches the taskId pattern in stored issues, not GitHub labels
   * @param {string} labelPattern - Label pattern to match (e.g., 'task:T-042')
   * @returns {Array} Matching issues
   */
  findIssuesByTaskPrefix(taskPrefix) {
    const issues = Object.entries(this.data.issues)
      .filter(([taskId]) => taskId.startsWith(taskPrefix))
      .map(([taskId, data]) => ({ taskId, ...data }));
    
    issues.sort((a, b) => a.number - b.number);
    return issues;
  }

  /**
   * Get context statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const issues = Object.values(this.data.issues);
    return {
      total: issues.length,
      open: issues.filter(i => i.status === 'open').length,
      closed: issues.filter(i => i.status === 'closed').length,
      lastUpdated: this.data.lastUpdated,
      project: this.data.project,
      owner: this.data.owner
    };
  }

  /**
   * Clear all issue records (keep structure)
   */
  clear() {
    this.data.issues = {};
    this.data.lastUpdated = new Date().toISOString();
    this.save();
  }

  /**
   * Export context as JSON string
   * @returns {string} JSON string
   */
  export() {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Import context from JSON string (overwrites existing)
   * @param {string} jsonString - JSON string to import
   * @returns {boolean} True if successful
   */
  import(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      
      if (!data.version || !data.issues) {
        throw new Error('Invalid context structure');
      }
      
      this.data = data;
      this.save();
      return true;
    } catch (error) {
      console.error('IssueContext: Import failed:', error.message);
      return false;
    }
  }
}

module.exports = { IssueContext };