# Anti-Example: Load Test Without Monitoring

## 错误做法

执行负载测试但不监控系统资源。

## 问题示例

```yaml
# 错误: 只关注响应时间
load_test:
  target: /api/auth/login
  concurrency: 1000
  duration: 10m
  
metrics_collected:
  - response_time
  - error_rate
  
# 缺少:
# - cpu_usage
# - memory_usage  
# - disk_io
# - network_io
```

## 为什么这是错的

1. **无法定位瓶颈**: 不知道是 CPU、内存还是 I/O 瓶颈
2. **无法解释异常**: 响应时间长但不知道原因
3. **无法容量规划**: 不知道资源使用情况
4. **错过预警**: 无法发现资源接近饱和

## 正确做法

```yaml
# 正确: 全面监控
load_test:
  target: /api/auth/login
  concurrency: 1000
  duration: 10m
  
monitoring:
  # 应用监控
  app:
    - response_time
    - throughput
    - error_rate
    - active_requests
    
  # 系统监控
  system:
    - cpu_usage (user, system, iowait)
    - memory_usage (used, cached, free)
    - disk_io (read, write, iops)
    - network_io (in, out)
    
  # 服务监控
  services:
    - database:
        - connections
        - queries_per_second
        - slow_query_count
    - cache:
        - hit_rate
        - memory_usage
        - evictions
        
  # JVM 监控 (Java 应用)
  jvm:
    - heap_usage
    - gc_count
    - gc_pause_time
```

## 监控配置示例

```yaml
# Prometheus 配置示例
scrape_configs:
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']
        
  - job_name: 'app_metrics'
    static_configs:
      - targets: ['localhost:8080']
        
  - job_name: 'mysql_exporter'
    static_configs:
      - targets: ['localhost:9104']
```

## 关键要点

1. **监控先行**: 测试前配置好监控
2. **多维度监控**: 应用、系统、服务
3. **实时观察**: 测试过程中实时查看
4. **数据保留**: 便于事后分析