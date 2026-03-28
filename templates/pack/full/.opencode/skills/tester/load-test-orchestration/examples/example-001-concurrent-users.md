# Example: Concurrent Users Test

## 场景

模拟 500 并发用户访问系统，验证系统承载能力。

## 测试配置

```yaml
load_test:
  name: concurrent_users_test
  target: /api/*
  
  # 并发配置
  concurrency:
    start: 0
    ramp_up: 2m
    target: 500
    hold: 10m
    
  # 用户行为
  user_scenario:
    - action: login
      weight: 10%
    - action: browse_products
      weight: 50%
    - action: view_cart
      weight: 20%
    - action: checkout
      weight: 15%
    - action: logout
      weight: 5%
```

## 测试脚本 (k6)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 500 },   // ramp-up
    { duration: '10m', target: 500 },  // steady
    { duration: '1m', target: 0 },     // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://api.example.com';

export default function () {
  // 登录
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, {
    username: `user_${__VU}`,
    password: 'test_password',
  });
  
  check(loginRes, { 'login success': (r) => r.status === 200 });
  
  const token = loginRes.json('token');
  const params = { headers: { Authorization: `Bearer ${token}` } };
  
  // 浏览商品
  const productsRes = http.get(`${BASE_URL}/api/products`, params);
  check(productsRes, { 'products loaded': (r) => r.status === 200 });
  sleep(Math.random() * 3 + 1); // 1-4s
  
  // 查看购物车
  const cartRes = http.get(`${BASE_URL}/api/cart`, params);
  check(cartRes, { 'cart loaded': (r) => r.status === 200 });
  sleep(Math.random() * 2);
  
  // 模拟退出
  sleep(Math.random() * 5);
}
```

## 监控配置

```yaml
monitoring:
  # 应用层
  app:
    - response_time
    - throughput
    - error_rate
    
  # 系统层
  system:
    - cpu_usage
    - memory_usage
    - disk_io
    - network_io
    
  # 数据库层
  database:
    - connections
    - query_time
    - slow_queries
    
  # 缓存层
  cache:
    - hit_rate
    - memory_usage
```

## 测试结果

```yaml
results:
  # 吞吐量
  throughput:
    average: 2450 RPS
    peak: 3200 RPS
    
  # 响应时间
  response_time:
    p50: 85ms
    p95: 245ms
    p99: 420ms
    
  # 错误率
  error_rate: 0.08%
  
  # 资源使用
  resources:
    cpu_peak: 78%
    memory_peak: 72%
    db_connections_peak: 85
    
  # 结论
  conclusion: 系统可稳定支撑 500 并发用户
```

## 瓶颈分析

在测试过程中发现：
1. 800 并发时 CPU 超过 90%
2. 数据库连接池接近上限
3. 部分慢查询影响 P99

建议：
1. 优化数据库查询
2. 考虑增加连接池大小
3. 添加缓存减少数据库压力