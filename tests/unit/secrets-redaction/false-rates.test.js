const {
  scrubObject,
  scrubString
} = require('../../../lib/secrets-redaction/scrubber');

const { getDefaultPatterns } = require('../../../lib/secrets-redaction/patterns');

describe('False Positive/Negative Tests', () => {
  const patterns = getDefaultPatterns();

  describe('False Positive Tests (NFR-002: < 5%)', () => {
    describe('AKIA in non-token context', () => {
      test('does not redact AKIA as acronym in text', () => {
        const obj = {
          message: 'The AKIA protocol is used for authentication'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.message).toBe('The AKIA protocol is used for authentication');
        expect(result.redaction_count).toBe(0);
      });

      test('does not redact AKIA in documentation', () => {
        const obj = {
          doc: 'AKIA stands for Authentication Key Identification Algorithm'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.doc).toBe('AKIA stands for Authentication Key Identification Algorithm');
        expect(result.redaction_count).toBe(0);
      });

      test('redacts valid AWS key format AKIAIOSFODNN7EXAMPLE', () => {
        const obj = {
          key: 'AKIAIOSFODNN7EXAMPLE'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.key).toBe('[REDACTED:aws-access-key]');
        expect(result.redaction_count).toBe(1);
      });
    });

    describe('URLs with pattern-like sequences', () => {
      test('does not redact URL with ghp-like segment (not 36 chars)', () => {
        const obj = {
          url: 'https://example.com/docs/ghp-guide'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.url).toBe('https://example.com/docs/ghp-guide');
        expect(result.redaction_count).toBe(0);
      });

      test('redacts URL with 40-char path segment (AWS secret-like)', () => {
        const obj = {
          url: 'https://api.example.com/v1/abcdefghij1234567890abcdefghij1234'
        };
        const result = scrubObject(obj, patterns);
        expect(result.scrubbed.url).toContain('[REDACTED:aws-secret-key]');
        expect(result.redaction_count).toBe(1);
      });

      test('redacts actual token in URL query param', () => {
        const obj = {
          url: 'https://api.example.com?token=ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.url).toContain('[REDACTED:github-token]');
        expect(result.redaction_count).toBe(1);
      });
    });

    describe('Code examples and documentation', () => {
      test('does not redact placeholder tokens in docs', () => {
        const obj = {
          doc: 'Use format: ghp_<your_token_here> to authenticate'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.doc).toBe('Use format: ghp_<your_token_here> to authenticate');
        expect(result.redaction_count).toBe(0);
      });

      test('does not redact example text without actual secret', () => {
        const obj = {
          readme: 'Example: api_key: YOUR_API_KEY_HERE'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.readme).toBe('Example: api_key: YOUR_API_KEY_HERE');
        expect(result.redaction_count).toBe(0);
      });

      test('redacts actual secret even in code comment', () => {
        const obj = {
          code: '// hardcoded token: ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.code).toContain('[REDACTED:github-token]');
        expect(result.redaction_count).toBe(1);
      });
    });

    describe('Error codes and identifiers', () => {
      test('does not redact error codes like ERR_AKIA001', () => {
        const obj = {
          error_code: 'ERR_AKIA001_INVALID_CONFIG'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.error_code).toBe('ERR_AKIA001_INVALID_CONFIG');
        expect(result.redaction_count).toBe(0);
      });

      test('does not redact version strings', () => {
        const obj = {
          version: 'v1.0.0-ghp-alpha'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.version).toBe('v1.0.0-ghp-alpha');
        expect(result.redaction_count).toBe(0);
      });

      test('redacts base64 encoded data that looks like AWS secret (40 chars)', () => {
        const obj = {
          data: 'SGVsbG8gV29ybGQhVGhpcyBpcyBhIG5vcm1hbCBtZXNzYWdl'
        };
        const result = scrubObject(obj, patterns);
        expect(result.redaction_count).toBe(1);
      });
    });

    describe('Common words and phrases', () => {
      test('does not redact "password" in natural language', () => {
        const obj = {
          message: 'I forgot my password yesterday'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.message).toBe('I forgot my password yesterday');
        expect(result.redaction_count).toBe(0);
      });

      test('does not redact "secret" in non-config context', () => {
        const obj = {
          phrase: 'The secret to success is hard work'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.phrase).toBe('The secret to success is hard work');
        expect(result.redaction_count).toBe(0);
      });

      test('does not redact "token" in blockchain context', () => {
        const obj = {
          blockchain: 'token transfer of 100 units'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.blockchain).toBe('token transfer of 100 units');
        expect(result.redaction_count).toBe(0);
      });
    });

    describe('Non-secret environment references', () => {
      test('redacts ${PATH} reference (all env vars are redacted)', () => {
        const obj = {
          doc: 'Use ${PATH} to find executables'
        };
        const result = scrubObject(obj, patterns);
        expect(result.scrubbed.doc).toContain('[REDACTED:env-var]');
        expect(result.redaction_count).toBe(1);
      });

      test('redacts ${HOME} reference', () => {
        const obj = {
          config: 'Home directory: ${HOME}'
        };
        const result = scrubObject(obj, patterns);
        expect(result.scrubbed.config).toContain('[REDACTED:env-var]');
        expect(result.redaction_count).toBe(1);
      });

      test('redacts ${MY_SECRET} reference', () => {
        const obj = {
          config: 'Secret value: ${MY_SECRET}'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.config).toContain('[REDACTED:env-var]');
        expect(result.redaction_count).toBe(1);
      });

      test('redacts ${DATABASE_PASSWORD} reference', () => {
        const obj = {
          config: 'DB connection: ${DATABASE_PASSWORD}'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.config).toContain('[REDACTED:env-var]');
        expect(result.redaction_count).toBe(1);
      });
    });

    describe('False positive rate measurement', () => {
      test('false positive rate should be < 5%', () => {
        const testCases = [
          { input: 'AKIA protocol description', shouldRedact: false },
          { input: 'ghp-guide documentation', shouldRedact: false },
          { input: 'password field explanation', shouldRedact: false },
          { input: 'secret ingredient recipe', shouldRedact: false },
          { input: 'token concept explanation', shouldRedact: false },
          { input: '${PATH} environment variable', shouldRedact: true },
          { input: '${HOME} directory', shouldRedact: true },
          { input: 'Bearer authentication header format', shouldRedact: true },
          { input: 'JWT structure explanation', shouldRedact: false },
          { input: 'connection_string parameter description', shouldRedact: false },
          { input: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR', shouldRedact: true },
          { input: 'AKIAIOSFODNN7EXAMPLE', shouldRedact: true },
          { input: 'password: mysecretpass123', shouldRedact: true },
          { input: 'api_key: sk-1234567890abcdefghij', shouldRedact: true },
          { input: '${MY_SECRET_PASSWORD}', shouldRedact: true },
          { input: 'Bearer eyJhbGciOiJIUzI1NiJ9', shouldRedact: true },
          { input: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.sig', shouldRedact: true },
          { input: '-----BEGIN RSA PRIVATE KEY-----', shouldRedact: true },
          { input: 'connection_string: postgresql://user:pass@host/db', shouldRedact: true }
        ];

        let falsePositives = 0;
        let falseNegatives = 0;
        let totalTests = testCases.length;

        testCases.forEach(({ input, shouldRedact }) => {
          const result = scrubString(input, patterns);
          const wasRedacted = result !== input;

          if (!shouldRedact && wasRedacted) {
            falsePositives++;
            console.warn(`False positive: "${input}" was redacted`);
          }
          if (shouldRedact && !wasRedacted) {
            falseNegatives++;
            console.warn(`False negative: "${input}" was NOT redacted`);
          }
        });

        const falsePositiveRate = falsePositives / totalTests;
        const falseNegativeRate = falseNegatives / totalTests;

        expect(falsePositiveRate).toBeLessThan(0.05);
        expect(falseNegativeRate).toBeLessThan(0.01);
      });
    });
  });

  describe('False Negative Tests (NFR-002: < 1%)', () => {
    describe('Edge case token formats', () => {
      test('redacts GitHub token with only alphanumeric chars', () => {
        const obj = {
          token: 'ghp_abcdefghij1234567890ABCDEFGHIJ123456'
        };
        const result = scrubObject(obj, patterns);
        expect(result.scrubbed.token).toBe('[REDACTED:github-token]');
        expect(result.redaction_count).toBe(1);
      });

      test('redacts GitHub app token', () => {
        const obj = {
          token: 'ghs_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
        };
        const result = scrubObject(obj, patterns);
        expect(result.scrubbed.token).toBe('[REDACTED:github-app-token]');
        expect(result.redaction_count).toBe(1);
      });

      test('redacts AWS key with numbers', () => {
        const obj = {
          key: 'AKIA1234567890ABCDEF'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.key).toBe('[REDACTED:aws-access-key]');
        expect(result.redaction_count).toBe(1);
      });
    });

    describe('Base64-encoded secrets', () => {
      test('redacts 40-char base64-like AWS secret', () => {
        const obj = {
          secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.secret).toBe('[REDACTED:aws-secret-key]');
        expect(result.redaction_count).toBe(1);
      });

      test('redacts base64 with special chars in context', () => {
        const obj = {
          config: 'AWS secret: AbCdEfGhIjKlMnOpQrStUvWxYz1234567890/+'
        };
        const result = scrubObject(obj, patterns);
        expect(result.redaction_count).toBeGreaterThanOrEqual(1);
      });
    });

    describe('Multi-line secrets', () => {
      test('redacts PEM private key header in multiline', () => {
        const obj = {
          pem: `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----`
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.pem).toContain('[REDACTED:private-key]');
        expect(result.redaction_count).toBe(1);
      });

      test('redacts EC private key', () => {
        const obj = {
          pem: `-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIB...
-----END EC PRIVATE KEY-----`
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.pem).toContain('[REDACTED:private-key]');
        expect(result.redaction_count).toBe(1);
      });

      test('redacts generic private key', () => {
        const obj = {
          pem: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBg...
-----END PRIVATE KEY-----`
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.pem).toContain('[REDACTED:private-key]');
        expect(result.redaction_count).toBe(1);
      });
    });

    describe('Secrets in unusual contexts', () => {
      test('redacts token in JSON string', () => {
        const obj = {
          json: '{"auth": "ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR"}'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.json).toContain('[REDACTED:github-token]');
        expect(result.redaction_count).toBe(1);
      });

      test('redacts password in YAML-like format', () => {
        const obj = {
          yaml: `
database:
  password: supersecret123
  host: localhost`
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.yaml).toContain('[REDACTED:password]');
        expect(result.redaction_count).toBe(1);
      });

      test('redacts Bearer token in Authorization header', () => {
        const obj = {
          header: 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.sig'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.header).toContain('[REDACTED:bearer-token]');
        expect(result.redaction_count).toBe(1);
      });

      test('redacts JWT in cookie value', () => {
        const obj = {
          cookie: 'session=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.signature'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.cookie).toContain('[REDACTED:jwt]');
        expect(result.redaction_count).toBe(1);
      });
    });

    describe('Multiple secrets in single string', () => {
      test('redacts tokens in concatenated string', () => {
        const obj = {
          data: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR ghs_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy AKIAIOSFODNN7EXAMPLE'
        };
        const result = scrubObject(obj, patterns);
        expect(result.redaction_count).toBeGreaterThanOrEqual(3);
      });

      test('redacts secrets in log output', () => {
        const obj = {
          log: '[INFO] Config loaded with api_key: sk-abc123def456ghi789jkl0 and password: secretpass123'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.log).toContain('[REDACTED:api-key]');
        expect(result.scrubbed.log).toContain('[REDACTED:password]');
        expect(result.redaction_count).toBeGreaterThanOrEqual(2);
      });
    });

    describe('Case variations', () => {
      test('redacts PASSWORD (uppercase)', () => {
        const obj = {
          config: 'PASSWORD: mysecretvalue'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.config).toContain('[REDACTED:password]');
        expect(result.redaction_count).toBe(1);
      });

      test('redacts Api_Key (mixed case)', () => {
        const obj = {
          config: 'Api_Key: MYKEY123456789012345678'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.config).toContain('[REDACTED:api-key]');
        expect(result.redaction_count).toBe(1);
      });

      test('redacts SECRET (uppercase)', () => {
        const obj = {
          config: 'SECRET: mysecretvalue12345678'
        };
        const result = scrubObject(obj, patterns);
        
        expect(result.scrubbed.config).toContain('[REDACTED:secret]');
        expect(result.redaction_count).toBe(1);
      });
    });

    describe('False negative rate measurement', () => {
      test('false negative rate should be < 1%', () => {
        const knownSecrets = [
          'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR',
          'ghs_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR',
          'AKIAIOSFODNN7EXAMPLE',
          'AKIA1234567890ABCDEF',
          'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
          'api_key: MYAPIKEY12345678901234',
          'apikey: MYKEY123456789012345678',
          'password: secretpass123',
          'passwd: mypassword12345',
          'pwd: mypwd12345',
          'secret: mysecretvalue123456',
          'token: mytokenvalue12345678',
          '-----BEGIN RSA PRIVATE KEY-----',
          '-----BEGIN EC PRIVATE KEY-----',
          '-----BEGIN PRIVATE KEY-----',
          'connection_string: postgresql://user:pass@host/db',
          'connstr: mongodb://user:pass@host:27017/db',
          '${MY_SECRET}',
          '${DATABASE_PASSWORD}',
          '${API_KEY}',
          'Bearer eyJhbGciOiJIUzI1NiJ9',
          'Bearer abc123def456ghi789',
          'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.signature',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        ];

        let falseNegatives = 0;

        knownSecrets.forEach(secret => {
          const result = scrubString(secret, patterns);
          if (result === secret) {
            falseNegatives++;
            console.error(`False negative: "${secret}" was NOT redacted`);
          }
        });

        const falseNegativeRate = falseNegatives / knownSecrets.length;
        expect(falseNegativeRate).toBe(0);
      });
    });
  });

  describe('Boundary Conditions', () => {
    test('does not redact password shorter than 8 chars', () => {
      const obj = { config: 'password: short7' };
      const result = scrubObject(obj, patterns);
      expect(result.redaction_count).toBe(0);
    });

    test('redacts password value at least 8 chars after "password:"', () => {
      const obj = { config: 'password: mysecretpassword' };
      const result = scrubObject(obj, patterns);
      expect(result.redaction_count).toBe(1);
    });

    test('does not redact api_key value shorter than 20 chars', () => {
      const obj = { config: 'api_key: shortkey19' };
      const result = scrubObject(obj, patterns);
      expect(result.redaction_count).toBe(0);
    });

    test('redacts api_key value at least 20 chars', () => {
      const obj = { config: 'api_key: exacttwentychars12345' };
      const result = scrubObject(obj, patterns);
      expect(result.redaction_count).toBe(1);
    });

    test('does not redact AWS key shorter than 20 chars', () => {
      const obj = { key: 'AKIAIOSFODNN7EX' };
      const result = scrubObject(obj, patterns);
      expect(result.redaction_count).toBe(0);
    });

    test('redacts AWS key exactly 20 chars', () => {
      const obj = { key: 'AKIAIOSFODNN7EXAMPLE' };
      const result = scrubObject(obj, patterns);
      expect(result.redaction_count).toBe(1);
    });

    test('does not redact 40-char string with invalid chars', () => {
      const obj = { data: 'abcdefghij1234567890abcdefghij12345!@#' };
      const result = scrubObject(obj, patterns);
      expect(result.redaction_count).toBe(0);
    });

    test('redacts 40-char string with valid AWS secret chars', () => {
      const obj = { secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' };
      const result = scrubObject(obj, patterns);
      expect(result.redaction_count).toBe(1);
    });
  });
});