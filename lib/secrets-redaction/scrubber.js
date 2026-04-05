function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (const key of Object.keys(obj)) {
    cloned[key] = deepClone(obj[key]);
  }
  return cloned;
}

const customPatternCache = new Map();

function getCompiledPattern(pattern) {
  if (pattern.compiledPattern) {
    return pattern.compiledPattern;
  }
  
  const cacheKey = `${pattern.name}:${pattern.pattern.source}:${pattern.pattern.flags}`;
  
  if (!customPatternCache.has(cacheKey)) {
    customPatternCache.set(cacheKey, new RegExp(pattern.pattern.source, pattern.pattern.flags));
  }
  
  return customPatternCache.get(cacheKey);
}

function clearCustomPatternCache() {
  customPatternCache.clear();
}

function scrubStringWithPatterns(text, patterns) {
  let result = text;
  const matches = [];
  
  for (const pattern of patterns) {
    const regex = getCompiledPattern(pattern);
    if (regex.test(result)) {
      matches.push(pattern.name);
      regex.lastIndex = 0;
      result = result.replace(regex, `[REDACTED:${pattern.type}]`);
    }
  }
  
  return { result, matches };
}

function traverse(obj, visitor, path = '') {
  if (obj === null || typeof obj !== 'object') {
    return;
  }
  
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const currentPath = path ? `${path}[${i}]` : `[${i}]`;
      if (typeof obj[i] === 'string') {
        visitor(obj[i], currentPath, i, obj);
      } else if (typeof obj[i] === 'object' && obj[i] !== null) {
        traverse(obj[i], visitor, currentPath);
      }
    }
  } else {
    for (const key of Object.keys(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (typeof obj[key] === 'string') {
        visitor(obj[key], currentPath, key, obj);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        traverse(obj[key], visitor, currentPath);
      }
    }
  }
}

function isWhitelisted(path, whitelist) {
  return whitelist.some(whitelistPath => {
    return path === whitelistPath || path.startsWith(whitelistPath + '.');
  });
}

function compileContextPatterns(contextPatterns) {
  return contextPatterns.map(cp => {
    try {
      return {
        keyRegex: new RegExp(cp.key_pattern, 'i'),
        valueRegex: new RegExp(cp.value_pattern, 'g'),
        replacement: cp.replacement || '[REDACTED:context]',
        name: cp.key_pattern
      };
    } catch (error) {
      console.warn(`[secrets-redaction] Invalid context pattern "${cp.key_pattern}": ${error.message}`);
      return null;
    }
  }).filter(cp => cp !== null);
}

function matchContextPatterns(key, value, contextPatterns) {
  for (const cp of contextPatterns) {
    if (cp.keyRegex.test(key) && cp.valueRegex.test(value)) {
      return {
        matched: true,
        replacement: cp.replacement,
        patternName: cp.name
      };
    }
  }
  return { matched: false };
}

function scrubObject(obj, patterns, options = {}) {
  const { whitelist = [], contextPatterns = [] } = options;
  const compiledContextPatterns = compileContextPatterns(contextPatterns);
  
  const scrubbed = deepClone(obj);
  const patterns_matched = [];
  const fields_redacted = [];
  let redaction_count = 0;
  
  traverse(scrubbed, (value, path, keyOrIndex, parent) => {
    if (whitelist.length > 0 && isWhitelisted(path, whitelist)) {
      return;
    }
    
    const contextMatch = matchContextPatterns(String(keyOrIndex), value, compiledContextPatterns);
    
    if (contextMatch.matched) {
      parent[keyOrIndex] = contextMatch.replacement;
      patterns_matched.push(`context:${contextMatch.patternName}`);
      fields_redacted.push(path);
      redaction_count += 1;
      return;
    }
    
    const scrubbedValue = scrubStringWithPatterns(value, patterns);
    
    if (scrubbedValue.matches.length > 0) {
      parent[keyOrIndex] = scrubbedValue.result;
      patterns_matched.push(...scrubbedValue.matches);
      fields_redacted.push(path);
      redaction_count += scrubbedValue.matches.length;
    }
  });
  
  return {
    scrubbed,
    patterns_matched,
    fields_redacted,
    redaction_count
  };
}

function scrubString(text, patterns) {
  let result = text;
  
  for (const pattern of patterns) {
    const regex = getCompiledPattern(pattern);
    if (regex.test(result)) {
      regex.lastIndex = 0;
      result = result.replace(regex, `[REDACTED:${pattern.type}]`);
    }
  }
  
  return result;
}

function scrubStackTrace(trace, patterns) {
  return scrubString(trace, patterns);
}

module.exports = {
  scrubObject,
  scrubString,
  scrubStackTrace,
  clearCustomPatternCache
};