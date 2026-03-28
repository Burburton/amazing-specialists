# Example: Version Comparison Benchmark

## 场景

对比 v1.2.0 和 v1.3.0 版本性能差异。

## 对比配置

```yaml
comparison:
  baseline:
    version: v1.2.0
    commit: abc123
    
  current:
    version: v1.3.0
    commit: def456
    
  tests:
    - POST /api/auth/login
    - GET /api/users
    - POST /api/orders
    
  iterations: 200
  rounds: 3
```

## 测试结果

### 登录接口

| 指标 | v1.2.0 | v1.3.0 | 变化 |
|------|--------|--------|------|
| P50 | 43ms | 41ms | -4.7% ✅ |
| P95 | 86ms | 82ms | -4.7% ✅ |
| P99 | 123ms | 118ms | -4.1% ✅ |

**结论**: 性能略有提升

### 用户列表接口

| 指标 | v1.2.0 | v1.3.0 | 变化 |
|------|--------|--------|------|
| P50 | 25ms | 28ms | +12% ⚠️ |
| P95 | 65ms | 78ms | +20% ⚠️ |
| P99 | 120ms | 165ms | +37.5% ❌ |

**结论**: 性能退化，需调查

### 订单创建接口

| 指标 | v1.2.0 | v1.3.0 | 变化 |
|------|--------|--------|------|
| P50 | 85ms | 82ms | -3.5% ✅ |
| P95 | 180ms | 175ms | -2.8% ✅ |
| P99 | 320ms | 310ms | -3.1% ✅ |

**结论**: 性能略有提升

## 分析

### 用户列表接口退化分析

```bash
# 对比代码变更
git diff abc123..def456 -- src/controllers/UserController.ts

# 发现新增了权限检查
+ const permissions = await this.permissionService.check(user.id);
```

**根因**: v1.3.0 增加了权限检查，导致额外数据库查询。

## 建议

1. 登录、订单接口性能提升，可接受
2. 用户列表接口需优化权限检查逻辑
3. 建议添加缓存减少权限查询