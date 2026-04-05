const {
  DEFAULT_PATTERNS,
  getDefaultPatterns,
  getPatternByName,
  getEnabledPatterns
} = require('../../../lib/secrets-redaction/patterns');

describe('Secret Patterns', () => {
  describe('DEFAULT_PATTERNS constant', () => {
    test('contains exactly 12 patterns', () => {
      expect(DEFAULT_PATTERNS).toHaveLength(12);
    });

    test('each pattern has required fields', () => {
      DEFAULT_PATTERNS.forEach(pattern => {
        expect(pattern).toHaveProperty('name');
        expect(pattern).toHaveProperty('type');
        expect(pattern).toHaveProperty('pattern');
        expect(pattern).toHaveProperty('description');
        expect(pattern).toHaveProperty('severity');
        expect(pattern).toHaveProperty('examples');
        expect(pattern.pattern).toBeInstanceOf(RegExp);
        expect(['critical', 'high', 'medium']).toContain(pattern.severity);
        expect(Array.isArray(pattern.examples)).toBe(true);
      });
    });

    test('pattern names are unique', () => {
      const names = DEFAULT_PATTERNS.map(p => p.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    test('pattern types are unique', () => {
      const types = DEFAULT_PATTERNS.map(p => p.type);
      const uniqueTypes = new Set(types);
      expect(uniqueTypes.size).toBe(types.length);
    });
  });

  describe('getDefaultPatterns', () => {
    test('returns array of 12 patterns', () => {
      const patterns = getDefaultPatterns();
      expect(patterns).toHaveLength(12);
    });
    
    test('returns cached patterns with compiledPattern property', () => {
      const patterns = getDefaultPatterns();
      patterns.forEach(pattern => {
        expect(pattern).toHaveProperty('compiledPattern');
        expect(pattern.compiledPattern).toBeInstanceOf(RegExp);
      });
    });
    
    test('cached patterns match original pattern definitions', () => {
      const patterns = getDefaultPatterns();
      patterns.forEach((cachedPattern, i) => {
        expect(cachedPattern.name).toBe(DEFAULT_PATTERNS[i].name);
        expect(cachedPattern.type).toBe(DEFAULT_PATTERNS[i].type);
        expect(cachedPattern.severity).toBe(DEFAULT_PATTERNS[i].severity);
      });
    });
  });

  describe('getPatternByName', () => {
    test('returns correct pattern for github_token', () => {
      const pattern = getPatternByName('github_token');
      expect(pattern).toBeDefined();
      expect(pattern.name).toBe('github_token');
      expect(pattern.type).toBe('github-token');
      expect(pattern.severity).toBe('critical');
    });

    test('returns correct pattern for aws_access_key', () => {
      const pattern = getPatternByName('aws_access_key');
      expect(pattern).toBeDefined();
      expect(pattern.name).toBe('aws_access_key');
      expect(pattern.type).toBe('aws-access-key');
      expect(pattern.severity).toBe('critical');
    });

    test('returns undefined for non-existent pattern', () => {
      const pattern = getPatternByName('non_existent_pattern');
      expect(pattern).toBeUndefined();
    });

    test('returns correct pattern for all 12 pattern names', () => {
      const expectedNames = [
        'github_token', 'github_app_token', 'aws_access_key', 'aws_secret_key',
        'api_key_generic', 'password', 'secret_generic', 'private_key',
        'connection_string', 'env_var_ref', 'bearer_token', 'jwt'
      ];
      expectedNames.forEach(name => {
        const pattern = getPatternByName(name);
        expect(pattern).toBeDefined();
        expect(pattern.name).toBe(name);
      });
    });
  });

  describe('getEnabledPatterns', () => {
    test('returns all patterns when no config provided', () => {
      const patterns = getEnabledPatterns({});
      expect(patterns).toHaveLength(12);
    });

    test('returns all patterns when all enabled', () => {
      const config = {
        default_patterns: {
          github_token: true,
          github_app_token: true,
          aws_access_key: true,
          aws_secret_key: true,
          api_key_generic: true,
          password: true,
          secret_generic: true,
          private_key: true,
          connection_string: true,
          env_var_ref: true,
          bearer_token: true,
          jwt: true
        }
      };
      const patterns = getEnabledPatterns(config);
      expect(patterns).toHaveLength(12);
    });

    test('filters out disabled patterns', () => {
      const config = {
        default_patterns: {
          github_token: false,
          aws_access_key: true
        }
      };
      const patterns = getEnabledPatterns(config);
      expect(patterns).toHaveLength(11);
      expect(patterns.find(p => p.name === 'github_token')).toBeUndefined();
      expect(patterns.find(p => p.name === 'aws_access_key')).toBeDefined();
    });

    test('returns empty array when all patterns disabled', () => {
      const config = {
        default_patterns: {
          github_token: false,
          github_app_token: false,
          aws_access_key: false,
          aws_secret_key: false,
          api_key_generic: false,
          password: false,
          secret_generic: false,
          private_key: false,
          connection_string: false,
          env_var_ref: false,
          bearer_token: false,
          jwt: false
        }
      };
      const patterns = getEnabledPatterns(config);
      expect(patterns).toHaveLength(0);
    });
  });
});

describe('Pattern Matching Tests', () => {
  describe('github_token pattern', () => {
    const pattern = getPatternByName('github_token');

    test('matches valid GitHub PAT (ghp_)', () => {
      const validToken = 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR';  // 36 chars after ghp_
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(validToken)).toBe(true);
    });

    test('matches in string context', () => {
      const text = `Token: ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR`;  // 36 chars
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('does not match invalid prefix', () => {
      const invalidToken = 'ghi_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR';  // 36 chars
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(invalidToken)).toBe(false);
    });

    test('does not match wrong length', () => {
      const shortToken = 'ghp_shorttoken';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(shortToken)).toBe(false);
    });

    test('does not match ghs_ (app token)', () => {
      const appToken = 'ghs_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR';  // 36 chars
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(appToken)).toBe(false);
    });

    test('matches multiple tokens in string', () => {
      const text = 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR ghp_FAKE1234567890ABCDEFGHIJKLMNOPQRSTUV';  // both 36 chars
      const matches = text.match(new RegExp(pattern.pattern.source, 'g'));
      expect(matches).toHaveLength(2);
    });
  });

  describe('github_app_token pattern', () => {
    const pattern = getPatternByName('github_app_token');

    test('matches valid GitHub App token (ghs_)', () => {
      const validToken = 'ghs_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR';  // 36 chars
      expect(pattern.pattern.test(validToken)).toBe(true);
    });

    test('does not match ghp_ (PAT)', () => {
      const patToken = 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR';  // 36 chars
      expect(pattern.pattern.test(patToken)).toBe(false);
    });

    test('does not match invalid format', () => {
      const invalidToken = 'ghs_short';
      expect(pattern.pattern.test(invalidToken)).toBe(false);
    });
  });

  describe('aws_access_key pattern', () => {
    const pattern = getPatternByName('aws_access_key');

    test('matches valid AWS Access Key ID (AKIA)', () => {
      const validKey = 'AKIATESTFAKE12345678';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(validKey)).toBe(true);
    });

    test('matches in string context', () => {
      const text = 'AWS_KEY=AKIATESTFAKE12345678';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('does not match non-AKIA prefix', () => {
      const invalidKey = 'AKIBTESTFAKE12345678';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(invalidKey)).toBe(false);
    });

    test('does not match wrong length', () => {
      const shortKey = 'AKIASHORTKEY';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(shortKey)).toBe(false);
    });

    test('does not match lowercase', () => {
      const lowerKey = 'akiatestfake12345678';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(lowerKey)).toBe(false);
    });

    test('AKIA followed by alphanumerics matches (pattern allows numbers after prefix)', () => {
      const key = 'AKIA1TESTFAKE1234567';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(key)).toBe(true);
    });
  });

  describe('aws_secret_key pattern', () => {
    const pattern = getPatternByName('aws_secret_key');

    test('matches valid AWS Secret Key (40 chars)', () => {
      const validSecret = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
      expect(validSecret.length).toBe(40);
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(validSecret)).toBe(true);
    });

    test('matches base64-like string', () => {
      const secret = 'ABCDEFGHIJKLMOPQRSTUVWXYZabcdefghij12345';
      expect(secret.length).toBe(40);
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(secret)).toBe(true);
    });

    test('does not match too short string', () => {
      const shortSecret = 'wJalrXUtnFEMI/K7MDENG/';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(shortSecret)).toBe(false);
    });

    test('matches multiple secrets in string', () => {
      const text = 'secret1: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY secret2: ABCDEFGHIJKLMOPQRSTUVWXYZabcdefghij12345';
      const matches = text.match(new RegExp(pattern.pattern.source, 'g'));
      expect(matches).toHaveLength(2);
    });
  });

  describe('api_key_generic pattern', () => {
    const pattern = getPatternByName('api_key_generic');

    test('matches api_key: format', () => {
      const text = 'api_key: sk-1234567890abcdefghijklmnop';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches api-key: format', () => {
      const text = 'api-key: MYAPIKEY12345678901234';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches apikey: format', () => {
      const text = 'apikey: MYAPIKEY12345678901234';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches with quotes', () => {
      const text = 'api_key: "sk-1234567890abcdefghijklmnop"';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches with equals sign', () => {
      const text = 'api_key=MYAPIKEY12345678901234';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches case insensitive', () => {
      const text = 'API_KEY: MYAPIKEY12345678901234';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('does not match too short value', () => {
      const text = 'api_key: shortkey';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });

    test('does not match without key indicator', () => {
      const text = 'MYAPIKEY12345678901234';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });
  });

  describe('password pattern', () => {
    const pattern = getPatternByName('password');

    test('matches password: format', () => {
      const text = 'password: secret123';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches passwd: format', () => {
      const text = 'passwd: mypassword123';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches pwd: format', () => {
      const text = 'pwd: mypwd12345';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches case insensitive', () => {
      const text = 'PASSWORD: SECRET123';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches with quotes', () => {
      const text = 'password: "mysecretpassword"';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches with equals sign', () => {
      const text = 'password=secretpassword123';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('does not match too short password', () => {
      const text = 'password: short';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });

    test('does not match without keyword', () => {
      const text = 'mysecretpassword123';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });
  });

  describe('secret_generic pattern', () => {
    const pattern = getPatternByName('secret_generic');

    test('matches secret: format', () => {
      const text = 'secret: mysecretvalue123456';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches token: format', () => {
      const text = 'token: mytokenvalue12345678';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches case insensitive', () => {
      const text = 'SECRET: MYSECRETVALUE123456';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches with equals sign', () => {
      const text = 'secret=mysecretvalue1234567890';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('does not match too short value', () => {
      const text = 'secret: shortvalue';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });

    test('does not match without keyword', () => {
      const text = 'mysecretvalue12345678';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });
  });

  describe('private_key pattern', () => {
    const pattern = getPatternByName('private_key');

    test('matches RSA private key header', () => {
      const text = '-----BEGIN RSA PRIVATE KEY-----';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches EC private key header', () => {
      const text = '-----BEGIN EC PRIVATE KEY-----';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches DSA private key header', () => {
      const text = '-----BEGIN DSA PRIVATE KEY-----';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches generic private key header', () => {
      const text = '-----BEGIN PRIVATE KEY-----';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches in full PEM context', () => {
      const text = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----`;
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('does not match public key', () => {
      const text = '-----BEGIN PUBLIC KEY-----';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });

    test('does not match certificate', () => {
      const text = '-----BEGIN CERTIFICATE-----';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });
  });

  describe('connection_string pattern', () => {
    const pattern = getPatternByName('connection_string');

    test('matches connection_string: format', () => {
      const text = 'connection_string: postgresql://TESTUSER:TESTPASS@TESTHOST/TESTDB';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches connection-string: format', () => {
      const text = 'connection-string: mysql://TESTUSER:TESTPASS@TESTHOST/TESTDB';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches connstr: format', () => {
      const text = 'connstr: mongodb://TESTUSER:TESTPASS@TESTHOST:27017/TESTDB';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches case insensitive', () => {
      const text = 'CONNECTION_STRING: postgresql://TESTUSER:TESTPASS@TESTHOST/TESTDB';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches with equals sign', () => {
      const text = 'connection_string=postgresql://TESTUSER:TESTPASS@TESTHOST/TESTDB';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches various database types', () => {
      const dbStrings = [
        'connection_string: postgresql://TESTUSER:TESTPASS@TESTHOST/TESTDB',
        'connection_string: mysql://TESTUSER:TESTPASS@TESTHOST/TESTDB',
        'connection_string: mongodb://TESTUSER:TESTPASS@TESTCLUSTER.mongodb.net/TESTDB',
        'connection_string: redis://:TESTPASS@TESTHOST:6379'
      ];
      dbStrings.forEach(str => {
        const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
        expect(regex.test(str)).toBe(true);
      });
    });

    test('does not match without keyword', () => {
      const text = 'postgresql://TESTUSER:TESTPASS@TESTHOST/TESTDB';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });
  });

  describe('env_var_ref pattern', () => {
    const pattern = getPatternByName('env_var_ref');

    test('matches ${VAR} format', () => {
      const text = '${MY_SECRET}';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches ${DATABASE_PASSWORD} format', () => {
      const text = '${DATABASE_PASSWORD}';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches ${API_KEY} format', () => {
      const text = '${API_KEY}';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches multiple env vars in string', () => {
      const text = 'config: ${DB_HOST}:${DB_PORT}/${DB_NAME}';
      const matches = text.match(new RegExp(pattern.pattern.source, 'g'));
      expect(matches).toHaveLength(3);
    });

    test('matches underscores and numbers', () => {
      const text = '${MY_SECRET_123}';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('does not match lowercase variable name', () => {
      const text = '${my_secret}';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });

    test('does not match without braces', () => {
      const text = 'MY_SECRET';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });

    test('does not match invalid starting character', () => {
      const text = '${123_SECRET}';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });
  });

  describe('bearer_token pattern', () => {
    const pattern = getPatternByName('bearer_token');

    test('matches Bearer header', () => {
      const text = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches Bearer with alphanumeric token', () => {
      const text = 'Bearer abc123def456ghi789';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches Bearer with dots and underscores', () => {
      const text = 'Bearer my.token_value_123';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches in Authorization header context', () => {
      const text = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('does not match without Bearer keyword', () => {
      const text = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });

    test('does not match Basic auth', () => {
      const text = 'Basic abc123def456';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });

    test('matches case sensitive Bearer', () => {
      const text = 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });
  });

  describe('jwt pattern', () => {
    const pattern = getPatternByName('jwt');

    test('matches valid JWT format', () => {
      const text = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches JWT header.payload.signature structure', () => {
      const text = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgN6WQs2eG';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches JWT in Authorization header', () => {
      const text = 'Authorization: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.signature';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('matches JWT with underscores and hyphens', () => {
      const text = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJ_SMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('does not match non-JWT base64', () => {
      const text = 'SGVsbG8gV29ybGQ=';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });

    test('does not match without eyJ prefix', () => {
      const text = 'abc123.eyJzdWIiOiIxMjM0In0.signature';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });

    test('does not match missing payload', () => {
      const text = 'eyJhbGciOiJIUzI1NiJ9';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(false);
    });
  });
});

describe('Pattern Metadata Tests', () => {
  test('critical severity patterns', () => {
    const criticalPatterns = DEFAULT_PATTERNS.filter(p => p.severity === 'critical');
    expect(criticalPatterns.length).toBe(7);
    
    const criticalNames = criticalPatterns.map(p => p.name);
    expect(criticalNames).toContain('github_token');
    expect(criticalNames).toContain('github_app_token');
    expect(criticalNames).toContain('aws_access_key');
    expect(criticalNames).toContain('password');
    expect(criticalNames).toContain('private_key');
    expect(criticalNames).toContain('bearer_token');
    expect(criticalNames).toContain('jwt');
  });

  test('high severity patterns', () => {
    const highPatterns = DEFAULT_PATTERNS.filter(p => p.severity === 'high');
    expect(highPatterns.length).toBe(4);
    
    const highNames = highPatterns.map(p => p.name);
    expect(highNames).toContain('aws_secret_key');
    expect(highNames).toContain('api_key_generic');
    expect(highNames).toContain('secret_generic');
    expect(highNames).toContain('connection_string');
  });

  test('medium severity patterns', () => {
    const mediumPatterns = DEFAULT_PATTERNS.filter(p => p.severity === 'medium');
    expect(mediumPatterns.length).toBe(1);
    
    const mediumNames = mediumPatterns.map(p => p.name);
    expect(mediumNames).toContain('env_var_ref');
  });

  test('all patterns have valid examples', () => {
    DEFAULT_PATTERNS.forEach(pattern => {
      expect(pattern.examples.length).toBeGreaterThan(0);
      pattern.examples.forEach(example => {
        expect(typeof example).toBe('string');
        expect(example.length).toBeGreaterThan(0);
      });
    });
  });

  test('pattern examples match their own patterns', () => {
    DEFAULT_PATTERNS.forEach(pattern => {
      pattern.examples.forEach(example => {
        const regex = new RegExp(pattern.pattern.source, 'g');
        expect(regex.test(example)).toBe(true);
      });
    });
  });
});

describe('Pattern Edge Cases', () => {
  describe('empty string handling', () => {
    test('all patterns do not match empty string', () => {
      DEFAULT_PATTERNS.forEach(pattern => {
        const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
        expect(regex.test('')).toBe(false);
      });
    });
  });

  describe('whitespace handling', () => {
    test('api_key pattern handles extra whitespace', () => {
      const pattern = getPatternByName('api_key_generic');
      const text = 'api_key   :   MYAPIKEY12345678901234';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });

    test('password pattern handles extra whitespace', () => {
      const pattern = getPatternByName('password');
      const text = 'password  =  mysecretpassword';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });
  });

  describe('multiline context', () => {
    test('private_key matches in multiline PEM', () => {
      const pattern = getPatternByName('private_key');
      const pem = `Some header text
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----
Some footer text`;
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(pem)).toBe(true);
    });

    test('password matches on single line', () => {
      const pattern = getPatternByName('password');
      const text = 'password: mysecretpassword123';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });
  });

  describe('unicode handling', () => {
    test('patterns handle unicode in context', () => {
      const pattern = getPatternByName('password');
      const text = '密码 password: mysecretpassword';
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      expect(regex.test(text)).toBe(true);
    });
  });
});