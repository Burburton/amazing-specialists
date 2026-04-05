const auditLog = [];
const MAX_LOG_ENTRIES = 1000;

function logRedaction(entry) {
  const sanitizedEntry = {
    timestamp: entry.timestamp || new Date().toISOString(),
    action: 'secrets_redaction',
    input_type: entry.input_type || 'unknown',
    patterns_matched: Array.isArray(entry.patterns_matched) ? entry.patterns_matched : [],
    fields_redacted: Array.isArray(entry.fields_redacted) ? entry.fields_redacted : [],
    output_status: entry.output_status || 'unknown',
    redaction_count: typeof entry.redaction_count === 'number' ? entry.redaction_count : 0,
    source: entry.source || 'unknown'
  };
  
  auditLog.push(sanitizedEntry);
  
  if (auditLog.length > MAX_LOG_ENTRIES) {
    auditLog.shift();
  }
  
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_SECRETS_REDACTION) {
    console.log('[secrets-redaction audit]', JSON.stringify(sanitizedEntry));
  }
}

function getAuditLog() {
  return [...auditLog];
}

function clearAuditLog() {
  auditLog.length = 0;
}

function getAuditLogStats() {
  const byStatus = {
    success: 0,
    no_matches: 0,
    error: 0
  };
  
  const byPattern = {};
  
  for (const entry of auditLog) {
    byStatus[entry.output_status] = (byStatus[entry.output_status] || 0) + 1;
    
    for (const pattern of entry.patterns_matched) {
      byPattern[pattern] = (byPattern[pattern] || 0) + 1;
    }
  }
  
  return {
    total: auditLog.length,
    by_status: byStatus,
    by_pattern: byPattern
  };
}

function formatAuditLogJson() {
  return JSON.stringify(auditLog, null, 2);
}

module.exports = {
  logRedaction,
  getAuditLog,
  clearAuditLog,
  getAuditLogStats,
  formatAuditLogJson
};