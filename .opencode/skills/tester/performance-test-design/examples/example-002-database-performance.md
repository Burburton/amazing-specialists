# Example: Database Performance Test

## 场景

为订单查询接口设计数据库性能测试方案。

## 性能需求

```yaml
performance_requirements:
  query_time_p99: 100ms
  throughput: 500 QPS
  data_volume: 10M records
```

## 测试设计

### 1. 测试目标

验证数据库在以下场景的性能：
- 单表查询性能
- 复杂 JOIN 查询性能
- 分页查询性能
- 并发读写性能

### 2. 数据准备

```sql
-- 准备测试数据
-- 用户表: 100万条
INSERT INTO users (id, username, created_at)
SELECT 
  gen_random_uuid(),
  'user_' || i,
  NOW() - (random() * 365 * INTERVAL '1 day')
FROM generate_series(1, 1000000) i;

-- 订单表: 1000万条
INSERT INTO orders (id, user_id, status, amount, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM users ORDER BY random() LIMIT 1),
  (ARRAY['pending', 'paid', 'shipped', 'completed'])[floor(random() * 4 + 1)],
  random() * 10000,
  NOW() - (random() * 365 * INTERVAL '1 day')
FROM generate_series(1, 10000000) i;
```

### 3. 测试场景

```yaml
scenarios:
  # 场景1: 单表查询
  - name: simple_query
    query: "SELECT * FROM orders WHERE user_id = $1 LIMIT 20"
    iterations: 10000
    expected_time: < 10ms
    
  # 场景2: 复杂查询
  - name: complex_join
    query: |
      SELECT o.*, u.username, COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'completed'
      GROUP BY o.id, u.username
      ORDER BY o.created_at DESC
      LIMIT 20
    iterations: 1000
    expected_time: < 100ms
    
  # 场景3: 并发写入
  - name: concurrent_write
    operation: "INSERT INTO orders (...) VALUES (...)"
    concurrency: 50
    duration: 5m
    expected_throughput: > 100 TPS
```

### 4. 性能测试脚本

```python
# database_performance_test.py
import asyncio
import asyncpg
import time

async def test_query_performance(pool, query, params):
    start = time.time()
    async with pool.acquire() as conn:
        result = await conn.fetch(query, *params)
    return time.time() - start

async def main():
    pool = await asyncpg.create_pool(
        'postgresql://user:pass@localhost/test_db',
        min_size=10,
        max_size=50
    )
    
    # 测试单表查询
    times = []
    for i in range(10000):
        t = await test_query_performance(
            pool,
            "SELECT * FROM orders WHERE user_id = $1 LIMIT 20",
            [f'user_{i % 1000000}']
        )
        times.append(t)
    
    # 计算统计指标
    times.sort()
    p50 = times[len(times) // 2]
    p95 = times[int(len(times) * 0.95)]
    p99 = times[int(len(times) * 0.99)]
    
    print(f"P50: {p50*1000:.2f}ms")
    print(f"P95: {p95*1000:.2f}ms")
    print(f"P99: {p99*1000:.2f}ms")

asyncio.run(main())
```

### 5. 优化建议

根据测试结果，可能的优化方向：

1. **索引优化**
   - 确保 WHERE 条件字段有索引
   - 考虑复合索引

2. **查询优化**
   - 避免 SELECT *
   - 优化 JOIN 顺序
   - 使用 EXPLAIN ANALYZE 分析

3. **数据库配置**
   - 调整连接池大小
   - 优化内存参数