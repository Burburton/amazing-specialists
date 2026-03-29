/**
 * Heartbeat Sender - Periodic heartbeat mechanism for OpenClaw Adapter
 * 
 * Sends periodic status updates to OpenClaw during long-running executions.
 * Implements BR-003: Dynamic heartbeat intervals based on task length.
 * 
 * @module adapters/openclaw/heartbeat-sender
 */

const { HeartbeatStatusEnum, HeartbeatPayload, HeartbeatProgress } = require('./types');

/**
 * HeartbeatSender class - manages periodic heartbeat for active dispatches
 * 
 * Features:
 * - Supports multiple concurrent dispatches (tracked by dispatchId)
 * - Dynamic interval calculation based on estimated task length (BR-003)
 * - Graceful error handling (logs but doesn't fail execution)
 * - Progress state tracking per dispatch
 * - Configurable enable/disable
 */
class HeartbeatSender {
  /**
   * Creates a HeartbeatSender instance
   * 
   * @param {Object} client - OpenClawClient instance for HTTP communication
   * @param {Object} config - Heartbeat configuration
   * @param {boolean} [config.enabled=true] - Whether heartbeat is enabled
   * @param {number} [config.interval_seconds=120] - Default interval (overridden by calculateInterval)
   * @param {Object} [config.task_length_thresholds] - Thresholds for interval calculation
   * @param {number} [config.task_length_thresholds.short=300] - Short task threshold (5 min)
   * @param {number} [config.task_length_thresholds.medium=1800] - Medium task threshold (30 min)
   * @param {Object} [config.logger] - Logger instance for error logging
   */
  constructor(client, config = {}) {
    if (!client) {
      throw new Error('HeartbeatSender requires an OpenClawClient instance');
    }

    this.client = client;
    
    this.config = {
      enabled: config.enabled !== false,
      interval_seconds: config.interval_seconds || 120,
      task_length_thresholds: {
        short: (config.task_length_thresholds?.short) || 300,
        medium: (config.task_length_thresholds?.medium) || 1800
      },
      logger: config.logger || null
    };

    this.activeDispatches = new Map();
  }

  /**
   * Calculates heartbeat interval based on estimated task length (BR-003)
   * 
   * Interval rules:
   * - < 300s (5 min) → 30s interval (short tasks need frequent updates)
   * - 300-1800s (5-30 min) → 120s interval (medium tasks)
   * - > 1800s (> 30 min) → 300s interval (long tasks)
   * 
   * @param {number} estimatedSeconds - Estimated task duration in seconds
   * @returns {number} Heartbeat interval in seconds
   */
  calculateInterval(estimatedSeconds) {
    if (typeof estimatedSeconds !== 'number' || estimatedSeconds < 0) {
      return this.config.interval_seconds;
    }

    const thresholds = this.config.task_length_thresholds;

    if (estimatedSeconds < thresholds.short) {
      return 30;
    } else if (estimatedSeconds <= thresholds.medium) {
      return 120;
    } else {
      return 300;
    }
  }

  /**
   * Starts periodic heartbeat for a dispatch
   * 
   * @param {string} dispatchId - Unique dispatch identifier
   * @param {number} estimatedLengthSeconds - Estimated task duration in seconds
   * @returns {boolean} True if heartbeat started successfully
   */
  start(dispatchId, estimatedLengthSeconds) {
    if (!this.config.enabled) {
      this._log('info', `Heartbeat disabled, skipping start for dispatch ${dispatchId}`);
      return false;
    }

    if (!dispatchId || typeof dispatchId !== 'string') {
      this._log('error', 'Invalid dispatchId provided to start()');
      return false;
    }

    if (this.activeDispatches.has(dispatchId)) {
      this.stop(dispatchId);
    }

    const intervalSeconds = this.calculateInterval(estimatedLengthSeconds);
    const intervalMs = intervalSeconds * 1000;

    const dispatchState = {
      interval: intervalSeconds,
      estimatedSeconds: estimatedLengthSeconds,
      startTime: Date.now(),
      progress: {
        phase: 'initializing',
        percent_complete: 0,
        estimated_remaining_seconds: estimatedLengthSeconds
      },
      status: HeartbeatStatusEnum.RUNNING,
      timer: setInterval(() => {
        this._sendHeartbeatTick(dispatchId);
      }, intervalMs)
    };

    this.activeDispatches.set(dispatchId, dispatchState);

    this._sendHeartbeatTick(dispatchId);

    this._log('info', `Heartbeat started for dispatch ${dispatchId} with ${intervalSeconds}s interval`);
    return true;
  }

  /**
   * Stops heartbeat for a dispatch
   * 
   * @param {string} dispatchId - Unique dispatch identifier
   * @returns {boolean} True if heartbeat stopped successfully
   */
  stop(dispatchId) {
    if (!dispatchId || typeof dispatchId !== 'string') {
      this._log('error', 'Invalid dispatchId provided to stop()');
      return false;
    }

    const dispatchState = this.activeDispatches.get(dispatchId);
    
    if (!dispatchState) {
      this._log('info', `No active heartbeat for dispatch ${dispatchId}`);
      return false;
    }

    if (dispatchState.timer) {
      clearInterval(dispatchState.timer);
      dispatchState.timer = null;
    }

    this.activeDispatches.delete(dispatchId);

    this._log('info', `Heartbeat stopped for dispatch ${dispatchId}`);
    return true;
  }

  /**
   * Updates progress state for an active dispatch
   * 
   * @param {string} dispatchId - Unique dispatch identifier
   * @param {Object} progress - Progress update
   * @param {string} [progress.phase] - Current execution phase
   * @param {number} [progress.percent_complete] - Completion percentage (0-100)
   * @param {number} [progress.estimated_remaining_seconds] - Estimated remaining time
   * @returns {boolean} True if progress updated successfully
   */
  updateProgress(dispatchId, progress) {
    if (!dispatchId || typeof dispatchId !== 'string') {
      this._log('error', 'Invalid dispatchId provided to updateProgress()');
      return false;
    }

    const dispatchState = this.activeDispatches.get(dispatchId);
    
    if (!dispatchState) {
      this._log('warn', `No active heartbeat for dispatch ${dispatchId}, cannot update progress`);
      return false;
    }

    if (progress.phase !== undefined) {
      dispatchState.progress.phase = progress.phase;
    }
    
    if (typeof progress.percent_complete === 'number') {
      dispatchState.progress.percent_complete = Math.max(0, Math.min(100, progress.percent_complete));
    }
    
    if (typeof progress.estimated_remaining_seconds === 'number') {
      dispatchState.progress.estimated_remaining_seconds = Math.max(0, progress.estimated_remaining_seconds);
    }

    if (progress.percent_complete === undefined && dispatchState.estimatedSeconds > 0) {
      const elapsedSeconds = (Date.now() - dispatchState.startTime) / 1000;
      const progressRatio = elapsedSeconds / dispatchState.estimatedSeconds;
      dispatchState.progress.percent_complete = Math.max(0, Math.min(100, Math.round(progressRatio * 100)));
      
      if (progressRatio < 1) {
        dispatchState.progress.estimated_remaining_seconds = Math.max(0, 
          Math.round(dispatchState.estimatedSeconds - elapsedSeconds));
      }
    }

    return true;
  }

  /**
   * Updates status for an active dispatch
   * 
   * @param {string} dispatchId - Unique dispatch identifier
   * @param {string} status - Heartbeat status (running, waiting, blocked)
   * @returns {boolean} True if status updated successfully
   */
  updateStatus(dispatchId, status) {
    if (!dispatchId || typeof dispatchId !== 'string') {
      this._log('error', 'Invalid dispatchId provided to updateStatus()');
      return false;
    }

    const validStatuses = Object.values(HeartbeatStatusEnum);
    if (!validStatuses.includes(status)) {
      this._log('error', `Invalid heartbeat status: ${status}. Valid values: ${validStatuses.join(', ')}`);
      return false;
    }

    const dispatchState = this.activeDispatches.get(dispatchId);
    
    if (!dispatchState) {
      this._log('warn', `No active heartbeat for dispatch ${dispatchId}, cannot update status`);
      return false;
    }

    dispatchState.status = status;
    return true;
  }

  /**
   * Sends a heartbeat to OpenClaw
   * 
   * Posts heartbeat payload to /api/v1/heartbeat endpoint.
   * Handles errors gracefully - logs but doesn't throw.
   * 
   * @param {string} dispatchId - Unique dispatch identifier
   * @param {string} [status] - Heartbeat status (defaults to current state)
   * @param {Object} [progress] - Progress info (defaults to current state)
   * @returns {Promise<boolean>} True if heartbeat sent successfully
   */
  async sendHeartbeat(dispatchId, status, progress) {
    if (!dispatchId || typeof dispatchId !== 'string') {
      this._log('error', 'Invalid dispatchId provided to sendHeartbeat()');
      return false;
    }

    if (!this.config.enabled) {
      return false;
    }

    const dispatchState = this.activeDispatches.get(dispatchId);
    const effectiveStatus = status || (dispatchState?.status) || HeartbeatStatusEnum.RUNNING;
    const effectiveProgress = progress || (dispatchState?.progress) || {
      phase: 'unknown',
      percent_complete: 0,
      estimated_remaining_seconds: 0
    };

    const heartbeatPayload = {
      dispatch_id: dispatchId,
      status: effectiveStatus,
      progress: {
        phase: effectiveProgress.phase || 'unknown',
        percent_complete: Math.max(0, Math.min(100, effectiveProgress.percent_complete || 0)),
        estimated_remaining_seconds: Math.max(0, effectiveProgress.estimated_remaining_seconds || 0)
      },
      timestamp: new Date().toISOString()
    };

    const validStatuses = Object.values(HeartbeatStatusEnum);
    if (!validStatuses.includes(heartbeatPayload.status)) {
      this._log('error', `Invalid heartbeat status: ${heartbeatPayload.status}`);
      return false;
    }

    try {
      await this.client.post('/api/v1/heartbeat', heartbeatPayload);
      
      this._log('info', `Heartbeat sent for dispatch ${dispatchId}: status=${effectiveStatus}, progress=${effectiveProgress.percent_complete}%`);
      return true;
    } catch (error) {
      this._log('error', `Heartbeat failed for dispatch ${dispatchId}: ${error.message}`);
      return false;
    }
  }

  /**
   * Internal method to send heartbeat tick for active dispatch
   * 
   * @private
   * @param {string} dispatchId - Unique dispatch identifier
   */
  async _sendHeartbeatTick(dispatchId) {
    const dispatchState = this.activeDispatches.get(dispatchId);
    
    if (!dispatchState) {
      return;
    }

    await this.sendHeartbeat(dispatchId, dispatchState.status, dispatchState.progress);
  }

  /**
   * Internal logging helper
   * 
   * @private
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   */
  _log(level, message) {
    if (this.config.logger) {
      this.config.logger[level](message);
    } else {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [HeartbeatSender] [${level.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Gets the number of active dispatches being tracked
   * 
   * @returns {number} Count of active dispatches
   */
  getActiveCount() {
    return this.activeDispatches.size;
  }

  /**
   * Gets all active dispatch IDs
   * 
   * @returns {string[]} Array of active dispatch IDs
   */
  getActiveDispatchIds() {
    return Array.from(this.activeDispatches.keys());
  }

  /**
   * Gets state for a specific dispatch
   * 
   * @param {string} dispatchId - Unique dispatch identifier
   * @returns {Object|null} Dispatch state or null if not active
   */
  getDispatchState(dispatchId) {
    return this.activeDispatches.get(dispatchId) || null;
  }

  /**
   * Stops all active heartbeats
   * 
   * Useful for cleanup during shutdown
   * 
   * @returns {number} Number of heartbeats stopped
   */
  stopAll() {
    const dispatchIds = this.getActiveDispatchIds();
    let stoppedCount = 0;

    for (const dispatchId of dispatchIds) {
      if (this.stop(dispatchId)) {
        stoppedCount++;
      }
    }

    this._log('info', `Stopped ${stoppedCount} active heartbeats`);
    return stoppedCount;
  }

  /**
   * Checks if heartbeat is enabled
   * 
   * @returns {boolean} True if heartbeat is enabled
   */
  isEnabled() {
    return this.config.enabled;
  }

  /**
   * Enables or disables heartbeat globally
   * 
   * @param {boolean} enabled - Whether to enable heartbeat
   */
  setEnabled(enabled) {
    this.config.enabled = enabled;
    
    if (!enabled) {
      this.stopAll();
    }
    
    this._log('info', `Heartbeat ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = {
  HeartbeatSender,
  default: HeartbeatSender
};