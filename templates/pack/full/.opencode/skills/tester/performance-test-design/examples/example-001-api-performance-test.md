# Example: API Performance Test Design

## 场景

为用户登录 API 设计性能测试方案。

## 性能需求

```yaml
performance_requirements:
  response_time_p99: 200ms
  throughput: 1000 RPS
  concurrent_users: 500
  error_rate: < 0.1%
```

## 测试设计

### 1. 指标定义

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| P50 响应时间 | < 50ms | 负载工具统计 |
| P95 响应时间 | < 150ms | 负载工具统计 |
| P99 响应时间 | < 200ms | 负载工具统计 |
| 吞吐量 | > 1000 RPS | 负载工具统计 |
| 错误率 | < 0.1% | 日志分析 |

### 2. 测试场景

```yaml
scenarios:
  # 场景1: 正常负载
  - name: normal_load
    description: 验证系统在正常负载下的表现
    concurrency: 200
    duration: 5m
    ramp_up: 30s
    expected:
      p99: < 100ms
      error_rate: < 0.01%
      
  # 场景2: 峰值负载
  - name: peak_load
    description: 验证系统在峰值负载下的表现
    concurrency: 500
    duration: 10m
    ramp_up: 1m
    expected:
      p99: < 200ms
      error_rate: < 0.1%
      
  # 场景3: 压力测试
  - name: stress_test
    description: 探索系统极限
    concurrency: 1000
    duration: 15m
    ramp_up: 2m
    expected:
      identify_limit: true
```

### 3. 测试脚本 (k6)

```javascript
// login-performance-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 200 },  // ramp-up
    { duration: '5m', target: 200 },   // steady
    { duration: '30s', target: 500 },  // ramp-up to peak
    { duration: '10m', target: 500 },  // peak
    { duration: '30s', target: 0 },    // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(99)<200'], // 99% under 200ms
    http_req_failed: ['rate<0.001'],  // error rate < 0.1%
  },
};

export default function () {
  const payload = JSON.stringify({
    username: `user_${__VU}`,
    password: 'test_password',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post('http://api.example.com/api/auth/login', payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== undefined,
  });

  sleep(1);
}
```

### 4. 监控配置

```yaml
monitoring:
  metrics:
    - cpu_usage
    - memory_usage
    - db_connections
    - redis_hit_rate
    
  thresholds:
    cpu_usage: 80%
    memory_usage: 85%
    
  tools:
    - Prometheus + Grafana
    - APM (New Relic/Datadog)
```

## 预期结果

- P99 响应时间 < 200ms
- 吞吐量 > 1000 RPS
- 错误率 < 0.1%
- CPU 使用率 < 80%