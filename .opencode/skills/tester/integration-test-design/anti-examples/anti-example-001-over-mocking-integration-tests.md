# Anti-Example 001: Over-Mocking Integration Tests

## What This Anti-Example Looks Like

### ❌ Incorrect Integration Test Design (Over-Mocked)

```yaml
test_suite:
  name: "Order Processing Integration Tests"
  
  mock_vs_real:
    dependencies:
      # EVERYTHING is mocked - this is NOT integration testing
      - name: OrderRepository
        strategy: mock
        reason: "To avoid database complexity"
      
      - name: InventoryService
        strategy: mock
        reason: "To avoid service startup"
      
      - name: PaymentClient
        strategy: mock
        reason: "Already tested separately"
      
      # Even the OrderService itself is partially mocked!
      - name: OrderService
        strategy: mock
        reason: "Testing controller only"
  
  test_cases:
    - id: IT-OVER-001
      name: "controller returns correct response"
      category: happy_path
      
      mocks:
        - dependency: OrderService.createOrder
          return_value: { id: "order-123", status: "confirmed" }
        
        - dependency: OrderRepository.save
          return_value: { success: true }
        
        - dependency: InventoryService.check
          return_value: { available: true }
        
        - dependency: PaymentClient.process
          return_value: { status: "approved" }
      
      input:
        request: { user_id: "user-1", items: [{ product_id: "p1", quantity: 1 }] }
      
      expected:
        response: { status: 201, body: { id: "order-123" } }
```

## Why This Is Wrong

### BR-002 Violation: Not Actually Integration Testing

This test design **mocks all dependencies**, which means:

| What's Wrong | Why It Matters |
|-------------|----------------|
| OrderRepository mocked | Not testing database integration |
| InventoryService mocked | Not testing service-to-service communication |
| PaymentClient mocked | Not testing external API integration |
| No real integration | This is just a controller unit test disguised as integration |

### Integration Test Purpose Lost

The purpose of integration testing is to verify **module interaction**:

```
Unit Test:      Controller alone (mocked dependencies) ✓
Integration Test: Controller → Service → Repository (real flow) ← This anti-pattern skips this
E2E Test:       Full system from UI to database
```

This anti-pattern creates a test that:
- Is slower than unit tests (more setup)
- But provides no integration verification
- Is essentially a duplicate unit test

### False Integration Coverage

The test report would claim "integration tests passed" but:
- Database operations never actually executed
- Service-to-service calls never actually made
- Only mock return values were verified
- Real bugs in integration layer won't be caught

### Example of Bugs This Test Won't Catch

```typescript
// Bug in OrderRepository
async save(order: Order) {
  // WRONG: Missing transaction commit
  await this.db.insert('orders', order);
  // Forgot to commit transaction!
}

// Bug in InventoryService
async checkAvailability(productId: string) {
  // WRONG: Wrong SQL query
  const result = await this.db.query(
    'SELECT quantity FROM products WHERE id = ?', // Wrong table!
    [productId]
  );
}

// Bug in integration
// Wrong error propagation between OrderService and PaymentClient
```

All of these bugs would pass the over-mocked test because:
- Mocks return predefined values
- Mocks don't execute real code
- Mocks don't have real bugs

## How to Detect This Anti-Pattern

### Detection Checklist

- [ ] **Mock Count Check**: Are more than 50% of dependencies mocked?
- [ ] **Internal Service Check**: Are internal services (under your control) mocked?
- [ ] **Database Check**: Is the database mocked instead of using a real/fake instance?
- [ ] **Test Purpose Check**: Does the test actually verify data flow between modules?
- [ ] **Bug Catching Check**: Would this test catch integration bugs?

### Warning Signs

```text
🚩 All dependencies are mocked
🚩 Internal services are mocked (should use real instances)
🚩 Database is mocked (should use real/fake)
🚩 Test setup is complex but assertions are simple
🚩 Test name says "integration" but looks like unit test
🚩 No test data fixtures (mocks provide all data)
🚩 No cleanup needed (mocks don't persist anything)
```

## How to Fix This

### Step 1: Identify What Should Be Real

Apply the Mock vs Real decision table:

| Dependency Type | Correct Strategy |
|-----------------|-----------------|
| Internal services (OrderService) | ✅ Real - test actual behavior |
| Internal services (InventoryService) | ✅ Real - test actual integration |
| Database (OrderRepository) | ✅ Real/Fake - test actual DB operations |
| External API (PaymentClient) | ✅ Mock - control responses, avoid external calls |
| Infrastructure (Logger, Config) | ✅ Mock/Fake - not critical for integration |

### Step 2: Use Real Internal Dependencies

```yaml
mock_vs_real:
  dependencies:
    - name: OrderService
      strategy: real
      reason: "Core business logic, need real orchestration"
    
    - name: OrderRepository
      strategy: real (fake)
      reason: "Test real database operations with in-memory SQLite"
      config:
        driver: "sqlite:memory"
    
    - name: InventoryService
      strategy: real
      reason: "Internal service, test real service-to-service"
      config:
        instance: "test_inventory_service"
    
    - name: PaymentClient
      strategy: mock  # ✅ Correct - external API
      reason: "External gateway, must mock to control"
```

### Step 3: Verify Integration Flow

```yaml
test_case:
  assertions:
    # Not just mock return values
    - assertion_type: data
      description: "Order persisted in database"
      expected: "SELECT * FROM orders WHERE id='xxx' returns row"
    
    - assertion_type: data
      description: "Inventory decremented"
      expected: "SELECT quantity FROM inventory WHERE product_id='p1' returns original-1"
    
    - assertion_type: contract
      description: "PaymentClient called with correct parameters"
      expected: "Mock.verify(processPayment called with amount=order.total)"
```

### Step 4: Add Cleanup

Since we're using real dependencies, cleanup is needed:

```yaml
cleanup:
  - action: "Rollback transaction"
  - action: "Clear test database"
  - action: "Reset service instances"
```

## Corrected Example

See `example-001-order-processing-integration-test.md` for a complete integration test design that:
- ✅ Uses real internal services
- ✅ Uses fake database (in-memory SQLite)
- ✅ Mocks only external API (PaymentClient)
- ✅ Verifies actual data flow
- ✅ Has proper cleanup strategy

## Comparison: Over-Mocked vs Correct

| Aspect | Over-Mocked (❌) | Correct (✅) |
|--------|-----------------|--------------|
| Internal services | All mocked | Real instances |
| Database | Mocked | Fake (in-memory) |
| External API | Mocked | Mocked (correct) |
| Data flow verification | Mock values | Real DB queries |
| Bug catching | Integration bugs missed | Integration bugs caught |
| Cleanup | None needed | Transaction rollback |
| Test type | Unit test disguised | True integration test |

## Lesson

**Integration tests must test integration.** Mocking everything transforms an integration test into a slower, less useful unit test. The goal is to verify that modules actually work together, not that mock return values are correct.

> Rule of thumb: If you're testing Controller → Service → Repository, at least Service → Repository should be real.

---

## References

- `specs/005-tester-core/spec.md` Section 6: BR-002 (Integration Tests Complement Unit Tests)
- `specs/005-tester-core/spec.md` Section 6: BR-003 (Integration Scope Must Be Explicit)
- `.opencode/skills/tester/unit-test-design/SKILL.md` - For isolated unit testing