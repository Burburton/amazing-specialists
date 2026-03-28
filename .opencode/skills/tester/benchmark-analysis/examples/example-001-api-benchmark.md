# Example: API Benchmark

## 场景

对用户登录 API 进行基准测试，建立性能基线。

## 基准测试配置

```yaml
benchmark:
  name: login-api-benchmark
  target: POST /api/auth/login
  
  # 测试参数
  iterations: 100    # 每轮迭代次数
  warmup: 20         # 预热次数
  rounds: 5          # 测试轮数
  
  # 测试数据
  test_data:
    username: benchmark_user
    password: test_password_123
    
  # 测量指标
  metrics:
    - response_time_p50
    - response_time_p95
    - response_time_p99
    - throughput
```

## 测试脚本

```javascript
// benchmark.js
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  iterations: 100,
  vus: 1,  // 单用户顺序执行
};

const WARMUP_ITERATIONS = 20;
let iteration = 0;
const results = [];

export default function () {
  iteration++;
  
  // 预热期不记录
  if (iteration <= WARMUP_ITERATIONS) {
    http.post('http://api.example.com/api/auth/login', {
      username: 'benchmark_user',
      password: 'test_password',
    });
    sleep(0.1);
    return;
  }
  
  // 正式测试
  const start = new Date();
  const res = http.post('http://api.example.com/api/auth/login', {
    username: 'benchmark_user',
    password: 'test_password',
  });
  const duration = new Date() - start;
  
  results.push({
    iteration: iteration - WARMUP_ITERATIONS,
    duration: duration,
    status: res.status,
  });
  
  sleep(0.1);
}

export function handleSummary() {
  // 计算统计指标
  const durations = results.map(r => r.duration).sort((a, b) => a - b);
  const n = durations.length;
  
  return {
    stdout: `
=== Benchmark Results ===
P50: ${durations[Math.floor(n * 0.50)]}ms
P95: ${durations[Math.floor(n * 0.95)]}ms
P99: ${durations[Math.floor(n * 0.99)]}ms
Min: ${durations[0]}ms
Max: ${durations[n - 1]}ms
    `,
  };
}
```

## 测试结果

```yaml
benchmark_results:
  round_1:
    p50: 42ms
    p95: 85ms
    p99: 120ms
    
  round_2:
    p50: 45ms
    p95: 88ms
    p99: 125ms
    
  round_3:
    p50: 43ms
    p95: 86ms
    p99: 122ms
    
  round_4:
    p50: 44ms
    p95: 87ms
    p99: 124ms
    
  round_5:
    p50: 43ms
    p95: 86ms
    p99: 123ms
    
  # 平均值
  average:
    p50: 43ms
    p95: 86ms
    p99: 123ms
```

## 基线建立

```yaml
baseline:
  api: POST /api/auth/login
  version: v1.2.0
  date: 2026-03-28
  
  metrics:
    p50: 43ms
    p95: 86ms
    p99: 123ms
    
  conditions:
    environment: perf-test-01
    data_volume: 100k_users
    cache_warm: true
```

## 关键要点

1. **预热充分**: 消除冷启动影响
2. **多轮测试**: 减少随机波动
3. **记录条件**: 便于复现和对比