const fs = require('fs');
const path = require('path');

class E2EReportGenerator {
  constructor(outputDir) {
    this.outputDir = outputDir || path.join(__dirname, '../test-reports');
    this.startTime = null;
    this.endTime = null;
    this.tests = [];
    this.currentScenario = null;
    this.scenarios = [];
  }

  startRun() {
    this.startTime = Date.now();
    this.tests = [];
    this.scenarios = [];
    return this;
  }

  startScenario(name) {
    this.currentScenario = {
      name,
      passed: 0,
      failed: 0,
      skipped: 0
    };
    return this;
  }

  recordTest(test) {
    this.tests.push({
      ...test,
      timestamp: new Date().toISOString()
    });

    if (this.currentScenario) {
      if (test.status === 'passed') {
        this.currentScenario.passed++;
      } else if (test.status === 'failed') {
        this.currentScenario.failed++;
      } else {
        this.currentScenario.skipped++;
      }
    }

    return this;
  }

  endScenario() {
    if (this.currentScenario) {
      this.scenarios.push(this.currentScenario);
      this.currentScenario = null;
    }
    return this;
  }

  endRun() {
    this.endTime = Date.now();
    return this;
  }

  getSummary() {
    return {
      total: this.tests.length,
      passed: this.tests.filter(t => t.status === 'passed').length,
      failed: this.tests.filter(t => t.status === 'failed').length,
      skipped: this.tests.filter(t => t.status === 'skipped').length
    };
  }

  getFailures() {
    return this.tests
      .filter(t => t.status === 'failed')
      .map(t => ({
        test_id: t.id,
        test_name: t.name,
        error: t.error?.message || 'Unknown error',
        stack: t.error?.stack || '',
        file: t.file || ''
      }));
  }

  generate() {
    return {
      timestamp: new Date(this.startTime).toISOString(),
      duration_ms: this.endTime - this.startTime,
      summary: this.getSummary(),
      scenarios: this.scenarios,
      failures: this.getFailures(),
      environment: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
  }

  save(filename) {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const report = this.generate();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = filename || `e2e-report-${timestamp}.json`;
    const reportPath = path.join(this.outputDir, reportFile);

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    const latestPath = path.join(this.outputDir, 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));

    return reportPath;
  }

  static fromJestResult(jestResult, outputDir) {
    const generator = new E2EReportGenerator(outputDir);
    generator.startRun();

    if (jestResult.testResults) {
      jestResult.testResults.forEach(testFile => {
        const scenarioName = path.basename(testFile.name, '.test.js');
        generator.startScenario(scenarioName);

        testFile.testResults.forEach((test, index) => {
          generator.recordTest({
            id: `TC-${String(index + 1).padStart(3, '0')}`,
            name: test.fullName || test.title,
            status: test.status,
            duration: test.duration,
            file: testFile.name,
            error: test.failureMessages?.[0]
          });
        });

        generator.endScenario();
      });
    }

    generator.endRun();
    return generator;
  }
}

function createReportGenerator(outputDir) {
  return new E2EReportGenerator(outputDir);
}

module.exports = {
  E2EReportGenerator,
  createReportGenerator
};