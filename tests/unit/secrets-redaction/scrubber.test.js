const {
  scrubObject,
  scrubString,
  scrubStackTrace
} = require('../../../lib/secrets-redaction/scrubber');

const { getDefaultPatterns } = require('../../../lib/secrets-redaction/patterns');

describe('Scrubber', () => {
  const patterns = getDefaultPatterns();

  describe('scrubObject', () => {
    describe('simple object with single secret', () => {
      test('scrubs GitHub token in simple object', () => {
        const obj = {
          token: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
        };
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed.token).toBe('[REDACTED:github-token]');
        expect(result.patterns_matched).toContain('github_token');
        expect(result.fields_redacted).toContain('token');
        expect(result.redaction_count).toBe(1);
      });

      test('scrubs password in simple object', () => {
        const obj = {
          password: 'password: secret123'
        };
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed.password).toContain('[REDACTED:password]');
        expect(result.patterns_matched).toContain('password');
        expect(result.fields_redacted).toContain('password');
        expect(result.redaction_count).toBe(1);
      });

      test('scrubs AWS access key in simple object', () => {
        const obj = {
          aws_key: 'AKIAIOSFODNN7EXAMPLE'
        };
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed.aws_key).toBe('[REDACTED:aws-access-key]');
        expect(result.patterns_matched).toContain('aws_access_key');
        expect(result.fields_redacted).toContain('aws_key');
        expect(result.redaction_count).toBe(1);
      });
    });

    describe('nested object with secrets at different levels', () => {
      test('scrubs secret in nested object', () => {
        const obj = {
          config: {
            database: {
              password: 'password: mydbpassword123'
            }
          }
        };
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed.config.database.password).toContain('[REDACTED:password]');
        expect(result.fields_redacted).toContain('config.database.password');
        expect(result.patterns_matched).toContain('password');
        expect(result.redaction_count).toBe(1);
      });

      test('scrubs secrets at multiple levels', () => {
        const obj = {
          api_key: 'api_key: sk-1234567890abcdefghijklmnop',
          nested: {
            token: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR',
            deeper: {
              secret: 'secret: mysecretvalue123456'
            }
          }
        };
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed.api_key).toContain('[REDACTED:api-key]');
        expect(result.scrubbed.nested.token).toBe('[REDACTED:github-token]');
        expect(result.scrubbed.nested.deeper.secret).toContain('[REDACTED:secret]');
        expect(result.redaction_count).toBe(3);
        expect(result.fields_redacted).toHaveLength(3);
      });

      test('scrubs secrets with deep nesting', () => {
        const obj = {
          level1: {
            level2: {
              level3: {
                level4: {
                  token: 'Bearer eyJhbGciOiJIUzI1NiJ9'
                }
              }
            }
          }
        };
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed.level1.level2.level3.level4.token).toContain('[REDACTED:bearer-token]');
        expect(result.fields_redacted).toContain('level1.level2.level3.level4.token');
        expect(result.redaction_count).toBe(1);
      });
    });

    describe('array containing secrets', () => {
      test('scrubs secrets in array', () => {
        const obj = {
          tokens: [
            'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR',
            'ghs_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
            'normal_value'
          ]
        };
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed.tokens[0]).toBe('[REDACTED:github-token]');
        expect(result.scrubbed.tokens[1]).toBe('[REDACTED:github-app-token]');
        expect(result.scrubbed.tokens[2]).toBe('normal_value');
        expect(result.redaction_count).toBe(2);
      });

      test('scrubs nested arrays', () => {
        const obj = {
          matrix: [
            ['ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR', 'normal'],
            ['AKIAIOSFODNN7EXAMPLE', 'data']
          ]
        };
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed.matrix[0][0]).toBe('[REDACTED:github-token]');
        expect(result.scrubbed.matrix[1][0]).toBe('[REDACTED:aws-access-key]');
        expect(result.redaction_count).toBe(2);
      });

      test('scrubs array in nested object', () => {
        const obj = {
          config: {
            secrets: ['api_key: MYAPIKEY12345678901234', 'api_key: ANOTHERKEY1234567890']
          }
        };
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed.config.secrets[0]).toContain('[REDACTED:api-key]');
        expect(result.scrubbed.config.secrets[1]).toContain('[REDACTED:api-key]');
        expect(result.redaction_count).toBe(2);
      });
    });

    describe('mixed types', () => {
      test('handles mixed types (strings, numbers, booleans)', () => {
        const obj = {
          token: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR',
          count: 42,
          enabled: true,
          ratio: 3.14,
          nullValue: null
        };
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed.token).toBe('[REDACTED:github-token]');
        expect(result.scrubbed.count).toBe(42);
        expect(result.scrubbed.enabled).toBe(true);
        expect(result.scrubbed.ratio).toBe(3.14);
        expect(result.scrubbed.nullValue).toBeNull();
        expect(result.redaction_count).toBe(1);
      });

      test('handles object with nested mixed types', () => {
        const obj = {
          data: {
            api_key: 'api_key: MYAPIKEY12345678901234',
            settings: {
              timeout: 5000,
              retries: 3,
              debug: false
            }
          }
        };
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed.data.api_key).toContain('[REDACTED:api-key]');
        expect(result.scrubbed.data.settings.timeout).toBe(5000);
        expect(result.scrubbed.data.settings.retries).toBe(3);
        expect(result.scrubbed.data.settings.debug).toBe(false);
      });
    });

    describe('empty object and null values', () => {
      test('handles empty object', () => {
        const obj = {};
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed).toEqual({});
        expect(result.patterns_matched).toHaveLength(0);
        expect(result.fields_redacted).toHaveLength(0);
        expect(result.redaction_count).toBe(0);
      });

      test('handles object with null values', () => {
        const obj = {
          value1: null,
          value2: null
        };
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed.value1).toBeNull();
        expect(result.scrubbed.value2).toBeNull();
        expect(result.redaction_count).toBe(0);
      });

      test('handles object with empty strings', () => {
        const obj = {
          empty: '',
          nonEmpty: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
        };
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed.empty).toBe('');
        expect(result.scrubbed.nonEmpty).toBe('[REDACTED:github-token]');
        expect(result.redaction_count).toBe(1);
      });
    });

    describe('no secrets found', () => {
      test('returns unchanged object when no secrets', () => {
        const obj = {
          name: 'test',
          value: 'normal text',
          count: 123
        };
        const result = scrubObject(obj, patterns);

        expect(result.scrubbed.name).toBe('test');
        expect(result.scrubbed.value).toBe('normal text');
        expect(result.scrubbed.count).toBe(123);
        expect(result.patterns_matched).toHaveLength(0);
        expect(result.fields_redacted).toHaveLength(0);
        expect(result.redaction_count).toBe(0);
      });
    });

    describe('original object preservation', () => {
      test('does not mutate original object', () => {
        const original = {
          token: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR',
          nested: {
            secret: 'api_key: MYAPIKEY12345678901234'
          }
        };
        const originalToken = original.token;
        const originalSecret = original.nested.secret;

        const result = scrubObject(original, patterns);

        expect(original.token).toBe(originalToken);
        expect(original.nested.secret).toBe(originalSecret);
        expect(result.scrubbed.token).not.toBe(originalToken);
      });

      test('deep clone preserves structure', () => {
        const original = {
          a: { b: { c: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR' } },
          d: [1, 2, { e: 'api_key: MYAPIKEY12345678901234' }]
        };

        const result = scrubObject(original, patterns);

        expect(original.a.b.c).toBe('ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR');
        expect(result.scrubbed.a.b.c).toBe('[REDACTED:github-token]');
        expect(result.scrubbed.d[2].e).toContain('[REDACTED:api-key]');
      });
    });

    describe('field path recording', () => {
      test('records correct dot notation paths', () => {
        const obj = {
          config: {
            db: {
              password: 'password: secret123'
            }
          }
        };
        const result = scrubObject(obj, patterns);

        expect(result.fields_redacted).toContain('config.db.password');
      });

      test('records array index in paths', () => {
        const obj = {
          items: ['ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR']
        };
        const result = scrubObject(obj, patterns);

        expect(result.fields_redacted).toContain('items[0]');
      });

      test('records nested array paths', () => {
        const obj = {
          matrix: [['ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR']]
        };
        const result = scrubObject(obj, patterns);

        expect(result.fields_redacted).toContain('matrix[0][0]');
      });

      test('records object in array paths', () => {
        const obj = {
          users: [
            { token: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR' }
          ]
        };
        const result = scrubObject(obj, patterns);

        expect(result.fields_redacted).toContain('users[0].token');
      });
    });

    describe('redaction count accuracy', () => {
      test('counts single match correctly', () => {
        const obj = { token: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR' };
        const result = scrubObject(obj, patterns);
        expect(result.redaction_count).toBe(1);
      });

      test('counts matches in different fields', () => {
        const obj = {
          field1: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR',
          field2: 'password: secret123',
          field3: 'api_key: MYAPIKEY12345678901234'
        };
        const result = scrubObject(obj, patterns);
        expect(result.redaction_count).toBe(3);
      });

      test('counts matches in arrays', () => {
        const obj = {
          tokens: [
            'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR',
            'ghs_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy'
          ]
        };
        const result = scrubObject(obj, patterns);
        expect(result.redaction_count).toBe(2);
      });
    });
  });

  describe('scrubString', () => {
    test('scrubs single pattern match', () => {
      const text = 'Token: ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR';
      const result = scrubString(text, patterns);

      expect(result).toContain('[REDACTED:github-token]');
      expect(result).toContain('Token:');
    });

    test('scrubs multiple pattern matches in same string', () => {
      const text = 'AKIAIOSFODNN7EXAMPLE password: secret123 api_key: MYAPIKEY12345678901234';
      const result = scrubString(text, patterns);

      expect(result).toContain('[REDACTED:aws-access-key]');
      expect(result).toContain('[REDACTED:password]');
      expect(result).toContain('[REDACTED:api-key]');
    });

    test('returns original string when no matches', () => {
      const text = 'This is normal text without secrets';
      const result = scrubString(text, patterns);

      expect(result).toBe('This is normal text without secrets');
    });

    test('handles special characters in context', () => {
      const text = 'Token="ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR"';
      const result = scrubString(text, patterns);

      expect(result).toContain('[REDACTED:github-token]');
      expect(result).toContain('Token="');
    });

    test('preserves non-matching parts', () => {
      const text = 'Start ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR End';
      const result = scrubString(text, patterns);

      expect(result).toContain('Start');
      expect(result).toContain('End');
      expect(result).toContain('[REDACTED:github-token]');
    });

    test('scrubs JWT tokens', () => {
      const text = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.signature';
      const result = scrubString(text, patterns);

      expect(result).toContain('[REDACTED:jwt]');
    });

    test('scrubs environment variable references', () => {
      const text = 'Config: ${MY_SECRET} and ${DATABASE_PASSWORD}';
      const result = scrubString(text, patterns);

      expect(result).toContain('[REDACTED:env-var]');
      expect(result).not.toContain('${MY_SECRET}');
      expect(result).not.toContain('${DATABASE_PASSWORD}');
    });
  });

  describe('scrubStackTrace', () => {
    test('scrubs secrets in stacktrace', () => {
      const trace = `
Error: Configuration failed
  at loadConfig (app.js:42)
  with api_key: MYAPIKEY12345678901234
  at init (main.js:10)
`;
      const result = scrubStackTrace(trace, patterns);

      expect(result).toContain('[REDACTED:api-key]');
      expect(result).not.toContain('MYAPIKEY12345678901234');
      expect(result).toContain('Error: Configuration failed');
      expect(result).toContain('at loadConfig (app.js:42)');
    });

    test('scrubs multiple secrets in stacktrace', () => {
      const trace = 'Error: ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR api_key: MYAPIKEY12345678901234567890';
      const result = scrubStackTrace(trace, patterns);

      expect(result).toContain('[REDACTED:github-token]');
      expect(result).toContain('[REDACTED:api-key]');
    });

    test('preserves stacktrace structure', () => {
      const trace = `
Error at line 1
  at function1 (file1.js:10)
  at function2 (file2.js:20)
`;
      const result = scrubStackTrace(trace, patterns);

      expect(result).toBe(trace);
    });
  });

  describe('whitelist functionality', () => {
    test('skips whitelisted fields', () => {
      const obj = {
        error_code: 'AKIAIOSFODNN7EXAMPLE',
        real_token: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
      };
      const result = scrubObject(obj, patterns, { whitelist: ['error_code'] });

      expect(result.scrubbed.error_code).toBe('AKIAIOSFODNN7EXAMPLE');
      expect(result.scrubbed.real_token).toBe('[REDACTED:github-token]');
      expect(result.redaction_count).toBe(1);
    });

    test('whitelist works with nested paths', () => {
      const obj = {
        config: {
          safe_key: 'AKIAIOSFODNN7EXAMPLE',
          unsafe_token: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
        }
      };
      const result = scrubObject(obj, patterns, { whitelist: ['config.safe_key'] });

      expect(result.scrubbed.config.safe_key).toBe('AKIAIOSFODNN7EXAMPLE');
      expect(result.scrubbed.config.unsafe_token).toBe('[REDACTED:github-token]');
    });

    test('whitelist prefix matching', () => {
      const obj = {
        metadata: {
          error_code: 'AKIAIOSFODNN7EXAMPLE',
          trace_id: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
        }
      };
      const result = scrubObject(obj, patterns, { whitelist: ['metadata'] });

      expect(result.scrubbed.metadata.error_code).toBe('AKIAIOSFODNN7EXAMPLE');
      expect(result.scrubbed.metadata.trace_id).toBe('ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR');
      expect(result.redaction_count).toBe(0);
    });

    test('empty whitelist processes all fields', () => {
      const obj = {
        token: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
      };
      const result = scrubObject(obj, patterns, { whitelist: [] });

      expect(result.scrubbed.token).toBe('[REDACTED:github-token]');
    });
  });

  describe('context patterns functionality', () => {
    test('applies context pattern for key-value matching', () => {
      const obj = {
        my_secret_field: 'actual_secret_value'
      };
      const contextPatterns = [
        {
          key_pattern: 'my_secret',
          value_pattern: '.+',
          replacement: '[REDACTED:context]'
        }
      ];
      const result = scrubObject(obj, patterns, { contextPatterns });

      expect(result.scrubbed.my_secret_field).toBe('[REDACTED:context]');
      expect(result.patterns_matched).toContain('context:my_secret');
    });

    test('context pattern takes precedence over default patterns', () => {
      const obj = {
        custom_secret: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
      };
      const contextPatterns = [
        {
          key_pattern: 'custom_secret',
          value_pattern: '.+',
          replacement: '[CUSTOM-REDACTED]'
        }
      ];
      const result = scrubObject(obj, patterns, { contextPatterns });

      expect(result.scrubbed.custom_secret).toBe('[CUSTOM-REDACTED]');
    });

    test('handles multiple context patterns', () => {
      const obj = {
        api_key: 'value1',
        db_password: 'value2'
      };
      const contextPatterns = [
        {
          key_pattern: 'api_key',
          value_pattern: '.+',
          replacement: '[API-REDACTED]'
        },
        {
          key_pattern: 'db_password',
          value_pattern: '.+',
          replacement: '[DB-REDACTED]'
        }
      ];
      const result = scrubObject(obj, patterns, { contextPatterns });

      expect(result.scrubbed.api_key).toBe('[API-REDACTED]');
      expect(result.scrubbed.db_password).toBe('[DB-REDACTED]');
    });

    test('invalid regex in context pattern is skipped', () => {
      const obj = {
        valid_field: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR',
        invalid_context_field: 'value'
      };
      const contextPatterns = [
        {
          key_pattern: '[invalid(regex',
          value_pattern: '.+',
          replacement: '[INVALID]'
        }
      ];
      
      const result = scrubObject(obj, patterns, { contextPatterns });

      expect(result.scrubbed.valid_field).toBe('[REDACTED:github-token]');
      expect(result.scrubbed.invalid_context_field).toBe('value');
    });
  });

  describe('replacement format', () => {
    test('uses correct format for each pattern type', () => {
      const testCases = [
        { input: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR', expected: '[REDACTED:github-token]' },
        { input: 'ghs_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', expected: '[REDACTED:github-app-token]' },
        { input: 'AKIAIOSFODNN7EXAMPLE', expected: '[REDACTED:aws-access-key]' },
        { input: 'Bearer eyJhbGciOiJIUzI1NiJ9', expected: '[REDACTED:bearer-token]' }
      ];

      testCases.forEach(({ input, expected }) => {
        const obj = { value: input };
        const result = scrubObject(obj, patterns);
        expect(result.scrubbed.value).toBe(expected);
      });
    });

    test('preserves context around replacement', () => {
      const obj = {
        message: 'Token was ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR and failed'
      };
      const result = scrubObject(obj, patterns);

      expect(result.scrubbed.message).toContain('Token was');
      expect(result.scrubbed.message).toContain('[REDACTED:github-token]');
      expect(result.scrubbed.message).toContain('and failed');
    });
  });

  describe('performance considerations', () => {
    test('handles large objects efficiently', () => {
      const largeObj = {};
      for (let i = 0; i < 100; i++) {
        largeObj[`field_${i}`] = i % 10 === 0 
          ? 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
          : `normal_value_${i}`;
      }

      const start = Date.now();
      const result = scrubObject(largeObj, patterns);
      const duration = Date.now() - start;

      expect(result.redaction_count).toBe(10);
      expect(duration).toBeLessThan(100);
    });

    test('handles deep nesting efficiently', () => {
      let deepObj = { value: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR' };
      for (let i = 0; i < 50; i++) {
        deepObj = { nested: deepObj };
      }

      const start = Date.now();
      const result = scrubObject(deepObj, patterns);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  describe('edge cases', () => {
    test('handles circular-like structures (same reference)', () => {
      const sharedValue = 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR';
      const obj = {
        a: sharedValue,
        b: sharedValue
      };

      const result = scrubObject(obj, patterns);

      expect(result.scrubbed.a).toBe('[REDACTED:github-token]');
      expect(result.scrubbed.b).toBe('[REDACTED:github-token]');
    });

    test('handles unicode in values', () => {
      const obj = {
        message: '密码 api_key: MYAPIKEY12345678901234'
      };
      const result = scrubObject(obj, patterns);

      expect(result.scrubbed.message).toContain('[REDACTED:api-key]');
      expect(result.scrubbed.message).toContain('密码');
    });

    test('handles very long strings', () => {
      const longSecret = 'ghp_' + 'x'.repeat(36);
      const longContext = 'prefix '.repeat(1000) + longSecret + ' suffix '.repeat(1000);
      const obj = { longValue: longContext };

      const result = scrubObject(obj, patterns);

      expect(result.scrubbed.longValue).toContain('[REDACTED:github-token]');
    });

    test('Date objects are converted to plain objects in clone', () => {
      const date = new Date('2026-04-05');
      const obj = {
        timestamp: date,
        token: 'ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR'
      };
      const result = scrubObject(obj, patterns);

      expect(typeof result.scrubbed.timestamp).toBe('object');
      expect(result.scrubbed.token).toBe('[REDACTED:github-token]');
    });
  });
});

describe('Integration with Error Report Structure', () => {
  const patterns = getDefaultPatterns();
  
  test('scrubs typical error-report artifact', () => {
    const errorReport = {
      artifact_id: 'ERR-20260405123000-abc123',
      artifact_type: 'error-report',
      error_details: {
        title: 'Config Error',
        description: 'Failed with api_key: MYAPIKEY12345678901234',
        stacktrace_or_context: `
Error at config.js:42
  password: mysecretpassword123
  token: ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR
`
      },
      context: {
        config: {
          database_url: 'connection_string: postgresql://user:pass@host/db'
        }
      },
      impact_assessment: {
        downstream_impact: 'blocked'
      }
    };

    const result = scrubObject(errorReport, patterns);

    expect(result.scrubbed.error_details.description).toContain('[REDACTED:api-key]');
    expect(result.scrubbed.error_details.stacktrace_or_context).toContain('[REDACTED:password]');
    expect(result.scrubbed.error_details.stacktrace_or_context).toContain('[REDACTED:github-token]');
    expect(result.scrubbed.context.config.database_url).toContain('[REDACTED:connection-string]');
    expect(result.scrubbed.artifact_id).toBe('ERR-20260405123000-abc123');
    expect(result.scrubbed.impact_assessment.downstream_impact).toBe('blocked');
  });

  test('handles error-report with nested arrays', () => {
    const errorReport = {
      error_details: {
        blocking_points: [
          'Token ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR leaked',
          'AWS key AKIAIOSFODNN7EXAMPLE found'
        ]
      }
    };

    const result = scrubObject(errorReport, patterns);

    expect(result.scrubbed.error_details.blocking_points[0]).toContain('[REDACTED:github-token]');
    expect(result.scrubbed.error_details.blocking_points[1]).toContain('[REDACTED:aws-access-key]');
  });
});