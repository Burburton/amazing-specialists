const { scrubErrorReport, clearAllCaches } = require('../../../lib/secrets-redaction/index');

function generateTypicalErrorReport() {
  return {
    artifact_type: 'error-report',
    artifact_id: 'ERR-001',
    error_details: {
      title: 'Test Error',
      description: 'An error occurred with api_key: sk-1234567890abcdefghijklmnop in the system',
      error_type: 'runtime_error',
      error_code: 'ERR-500',
      stacktrace_or_context: `Error: Connection failed
  at Connection.connect (connection.js:45)
  at Database.init (db.js:12)
  password: secret123456
  github_token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  at main (app.js:100)`
    },
    impact_assessment: {
      severity: 'high',
      blocking_points: ['Database connection failed with password: mypassword123']
    },
    resolution_guidance: {
      fix_suggestions: ['Check connection_string: postgresql://user:pass@host/db']
    },
    context: {
      environment: 'production',
      timestamp: '2026-04-05T10:30:00Z'
    }
  };
}

function generateLargeErrorReport() {
  const largeStackTrace = [];
  for (let i = 0; i < 500; i++) {
    largeStackTrace.push(`  at Function.call${i} (module${i}.js:${i * 10})`);
  }
  
  largeStackTrace.push('  api_key: sk-1234567890abcdefghijklmnopqrstuvwx');
  largeStackTrace.push('  password: verylongpassword123456789012');
  largeStackTrace.push('  github_token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  largeStackTrace.push('  bearer_token: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
  largeStackTrace.push('  secret: mysecretvalue123456789012345');
  
  for (let i = 0; i < 500; i++) {
    largeStackTrace.push(`  at Stack.trace${i} (trace${i}.js:${i * 5})`);
  }
  
  return {
    artifact_type: 'error-report',
    artifact_id: 'ERR-LARGE-001',
    error_details: {
      title: 'Large Stack Trace Error',
      description: 'A complex error with extensive stack trace',
      error_type: 'runtime_error',
      error_code: 'ERR-501',
      stacktrace_or_context: largeStackTrace.join('\n')
    },
    impact_assessment: {
      severity: 'critical',
      blocking_points: Array(50).fill('Database connection issue')
    },
    resolution_guidance: {
      fix_suggestions: Array(20).fill('Check configuration')
    },
    context: {
      environment: 'production',
      config: {
        api_key: 'sk-1234567890abcdefghijklmnopqrstuvwx',
        database_password: 'secret123456789012345',
        internal_token: 'token_1234567890abcdef'
      }
    }
  };
}

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    clearAllCaches();
  });
  
  test('Typical error-report scrubbing should complete in < 50ms', async () => {
    const errorReport = generateTypicalErrorReport();
    
    const start = Date.now();
    const result = await scrubErrorReport(errorReport);
    const elapsed = Date.now() - start;
    
    expect(result.success).toBe(true);
    expect(elapsed).toBeLessThan(50);
    
    console.log(`Typical error-report scrubbing: ${elapsed}ms`);
  });
  
  test('Large stacktrace scrubbing should complete in < 100ms', async () => {
    const errorReport = generateLargeErrorReport();
    
    const start = Date.now();
    const result = await scrubErrorReport(errorReport);
    const elapsed = Date.now() - start;
    
    expect(result.success).toBe(true);
    expect(elapsed).toBeLessThan(100);
    
    console.log(`Large stacktrace scrubbing: ${elapsed}ms`);
  });
  
  test('Multiple sequential scrubbing calls should benefit from caching', async () => {
    const errorReports = Array(10).fill(null).map((_, i) => ({
      artifact_type: 'error-report',
      artifact_id: `ERR-${i}`,
      error_details: {
        title: `Error ${i}`,
        description: 'api_key: sk-1234567890abcdefghijklmnop',
        stacktrace_or_context: 'password: secret123456'
      }
    }));
    
    const start = Date.now();
    
    for (const report of errorReports) {
      await scrubErrorReport(report);
    }
    
    const elapsed = Date.now() - start;
    const avgElapsed = elapsed / errorReports.length;
    
    expect(avgElapsed).toBeLessThan(10);
    
    console.log(`10 sequential scrubbing calls: ${elapsed}ms total, ${avgElapsed}ms average`);
  });
  
  test('Pattern matching performance with all patterns enabled', async () => {
    const errorReport = {
      artifact_type: 'error-report',
      artifact_id: 'ERR-PERF-001',
      error_details: {
        title: 'Performance Test',
        description: `
ghp_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR
           ghs_TESTFAKE1234567890ABCDEFGHIJKLMNOPQR
          AKIAIOSFODNN7EXAMPLE
          wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
          api_key: sk-1234567890abcdefghijklmnopqrstuvwx
          password: verylongpassword123456789012
          secret: mysecretvalue123456789012345
          -----BEGIN RSA PRIVATE KEY-----
          Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
          eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
          \${MY_SECRET_ENV_VAR}
        `,
        stacktrace_or_context: 'connection_string: postgresql://user:pass@host/db'
      }
    };
    
    const start = Date.now();
    const result = await scrubErrorReport(errorReport);
    const elapsed = Date.now() - start;
    
    expect(result.success).toBe(true);
    expect(result.redaction_count).toBeGreaterThan(5);
    expect(elapsed).toBeLessThan(50);
    
    console.log(`All patterns matching performance: ${elapsed}ms, ${result.redaction_count} redactions`);
  });
  
  test('Deep object traversal performance', async () => {
    const deepObject = {
      artifact_type: 'error-report',
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                level6: {
                  level7: {
                    level8: {
                      config: 'secret: deep_secret_value_12345678',
                      key: 'api_key: sk-deep1234567890abcdefghijklmnop'
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    
    const start = Date.now();
    const result = await scrubErrorReport(deepObject);
    const elapsed = Date.now() - start;
    
    expect(result.success).toBe(true);
    expect(result.redaction_count).toBeGreaterThanOrEqual(2);
    expect(elapsed).toBeLessThan(20);
    
    console.log(`Deep object traversal (8 levels): ${elapsed}ms`);
  });
  
  test('Array with many elements performance', async () => {
    const largeArrayReport = {
      items: Array(1000).fill(null).map((_, i) => ({
        id: i,
        data: i % 100 === 0 ? 'api_key: sk-1234567890abcdefghijklmnopqrstuvwx' : `normal_data_${i}`
      }))
    };
    
    const start = Date.now();
    const result = await scrubErrorReport(largeArrayReport);
    const elapsed = Date.now() - start;
    
    expect(result.success).toBe(true);
    expect(elapsed).toBeLessThan(100);
    
    console.log(`Large array (1000 elements) scrubbing: ${elapsed}ms`);
  });
});