const { loadConfig, mergePatterns } = require('./config-loader');
const { getDefaultPatterns, getEnabledPatterns } = require('./patterns');
const { scrubObject } = require('./scrubber');
const { logRedaction } = require('./audit-logger');

async function scrubErrorReport(errorReport, options = {}) {
  const { source = 'secrets-redaction' } = options;
  
  try {
    const configResult = loadConfig();
    
    if (!configResult.success || !configResult.config.enabled) {
      return {
        success: false,
        scrubbed: errorReport,
        error: 'disabled',
        patterns_matched: [],
        fields_redacted: [],
        redaction_count: 0
      };
    }
    
    const defaultPatterns = getDefaultPatterns();
    const enabledPatterns = getEnabledPatterns(configResult.config);
    const mergedPatterns = mergePatterns(enabledPatterns, configResult.config.custom_patterns || []);
    
    const scrubResult = scrubObject(errorReport, mergedPatterns, {
      whitelist: configResult.config.whitelist_fields || [],
      contextPatterns: configResult.config.context_patterns || []
    });
    
    logRedaction({
      timestamp: new Date().toISOString(),
      action: 'secrets_redaction',
      input_type: 'error-report',
      patterns_matched: scrubResult.patterns_matched,
      fields_redacted: scrubResult.fields_redacted,
      output_status: scrubResult.redaction_count > 0 ? 'success' : 'no_matches',
      redaction_count: scrubResult.redaction_count,
      source
    });
    
    return {
      success: true,
      scrubbed: scrubResult.scrubbed,
      patterns_matched: scrubResult.patterns_matched,
      fields_redacted: scrubResult.fields_redacted,
      redaction_count: scrubResult.redaction_count
    };
  } catch (error) {
    return {
      success: false,
      scrubbed: errorReport,
      error: error.message,
      patterns_matched: [],
      fields_redacted: [],
      redaction_count: 0
    };
  }
}

async function scrubString(text) {
  try {
    const configResult = loadConfig();
    
    if (!configResult.success || !configResult.config.enabled) {
      return text;
    }
    
    const enabledPatterns = getEnabledPatterns(configResult.config);
    const mergedPatterns = mergePatterns(enabledPatterns, configResult.config.custom_patterns || []);
    let result = text;
    
    for (const pattern of mergedPatterns) {
      if (pattern.pattern.test(result)) {
        result = result.replace(pattern.pattern, `[REDACTED:${pattern.type}]`);
      }
    }
    
    return result;
  } catch (error) {
    return text;
  }
}

async function scrubForLog(text) {
  return scrubString(text);
}

const { clearPatternCache } = require('./patterns');
const { clearCustomPatternCache } = require('./scrubber');

function clearAllCaches() {
  clearPatternCache();
  clearCustomPatternCache();
}

module.exports = {
  scrubErrorReport,
  scrubString,
  scrubForLog,
  loadConfig,
  getDefaultPatterns,
  getEnabledPatterns,
  scrubObject,
  logRedaction,
  clearAllCaches
};