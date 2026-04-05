const DEFAULT_PATTERNS = [
  {
    name: 'github_token',
    type: 'github-token',
    pattern: /ghp_[a-zA-Z0-9]{36}/g,
    description: 'GitHub Personal Access Token',
    severity: 'critical',
    examples: ['ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx']
  },
  {
    name: 'github_app_token',
    type: 'github-app-token',
    pattern: /ghs_[a-zA-Z0-9]{36}/g,
    description: 'GitHub App Token',
    severity: 'critical',
    examples: ['ghs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx']
  },
  {
    name: 'aws_access_key',
    type: 'aws-access-key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    description: 'AWS Access Key ID',
    severity: 'critical',
    examples: ['AKIAIOSFODNN7EXAMPLE']
  },
  {
    name: 'aws_secret_key',
    type: 'aws-secret-key',
    pattern: /[A-Za-z0-9\/+=]{40}/g,
    description: 'AWS Secret Access Key (context-aware)',
    severity: 'high',
    examples: ['wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY']
  },
  {
    name: 'api_key_generic',
    type: 'api-key',
    pattern: /(api[_-]?key|apikey)['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9_-]{20,}/gi,
    description: 'Generic API Key',
    severity: 'high',
    examples: ['api_key: sk-1234567890abcdefghijklmnop', 'apikey: MYAPIKEY123456789012']
  },
  {
    name: 'password',
    type: 'password',
    pattern: /(password|passwd|pwd)['\"]?\s*[:=]\s*['\"]?[^\s'\"]{8,}/gi,
    description: 'Password in config',
    severity: 'critical',
    examples: ['password: secret123', 'passwd: mypassword123']
  },
  {
    name: 'secret_generic',
    type: 'secret',
    pattern: /(secret|token)['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9_-]{16,}/gi,
    description: 'Generic Secret/Token',
    severity: 'high',
    examples: ['secret: mysecretvalue123456', 'token: mytokenvalue12345678']
  },
  {
    name: 'private_key',
    type: 'private-key',
    pattern: /-----BEGIN\s+(RSA\s+|EC\s+|DSA\s+)?PRIVATE\s+KEY-----/g,
    description: 'PEM Private Key Header',
    severity: 'critical',
    examples: ['-----BEGIN RSA PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----']
  },
  {
    name: 'connection_string',
    type: 'connection-string',
    pattern: /(connection[_-]?string|connstr)['\"]?\s*[:=]\s*['\"]?[^'\"]+/gi,
    description: 'Database Connection String',
    severity: 'high',
    examples: ['connection_string: postgresql://user:pass@host/db']
  },
  {
    name: 'env_var_ref',
    type: 'env-var',
    pattern: /\$\{[A-Z_][A-Z0-9_]*\}/g,
    description: 'Environment Variable Reference',
    severity: 'medium',
    examples: ['${MY_SECRET}', '${DATABASE_PASSWORD}', '${API_KEY}']
  },
  {
    name: 'bearer_token',
    type: 'bearer-token',
    pattern: /Bearer\s+[a-zA-Z0-9._-]+/g,
    description: 'Bearer Token in Authorization Header',
    severity: 'critical',
    examples: ['Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9']
  },
  {
    name: 'jwt',
    type: 'jwt',
    pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
    description: 'JWT Token',
    severity: 'critical',
    examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c']
  }
];

const patternCache = new Map();

function getCachedPattern(patternObj) {
  const cacheKey = `${patternObj.name}:${patternObj.pattern.source}:${patternObj.pattern.flags}`;
  
  if (!patternCache.has(cacheKey)) {
    patternCache.set(cacheKey, {
      ...patternObj,
      compiledPattern: new RegExp(patternObj.pattern.source, patternObj.pattern.flags)
    });
  }
  
  return patternCache.get(cacheKey);
}

function clearPatternCache() {
  patternCache.clear();
}

function getDefaultPatterns() {
  return DEFAULT_PATTERNS.map(p => getCachedPattern(p));
}

function getPatternByName(name) {
  const pattern = DEFAULT_PATTERNS.find(p => p.name === name);
  return pattern ? getCachedPattern(pattern) : undefined;
}

function getEnabledPatterns(config) {
  const defaultPatternsStatus = config.default_patterns || {};
  
  return DEFAULT_PATTERNS.filter(pattern => {
    const status = defaultPatternsStatus[pattern.name];
    return status !== false;
  }).map(p => getCachedPattern(p));
}

module.exports = {
  DEFAULT_PATTERNS,
  getDefaultPatterns,
  getPatternByName,
  getEnabledPatterns,
  getCachedPattern,
  clearPatternCache
};