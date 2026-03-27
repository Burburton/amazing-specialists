# Example 001: Order Processing Integration Test Design

## Scenario Context

**Developer Output Consumed:**
```yaml
implementation-summary:
  goal_alignment:
    goal: "Implement order processing flow with payment integration"
    achieved: true
    deviations: []
  
  changed_files:
    - path: "src/controllers/OrderController.ts"
      change_type: "added"
      description: "REST API endpoints for order operations"
      lines_changed: { added: 85, deleted: 0 }
    - path: "src/services/OrderService.ts"
      change_type: "added"
      description: "Order business logic and orchestration"
      lines_changed: { added: 150, deleted: 0 }
    - path: "src/repositories/OrderRepository.ts"
      change_type: "added"
      description: "Order database operations"
      lines_changed: { added: 60, deleted: 0 }
    - path: "src/clients/PaymentClient.ts"
      change_type: "added"
      description: "External payment gateway integration"
      lines_changed: { added: 45, deleted: 0 }
  
  risks:
    - risk_id: "RISK-001"
      description: "Payment gateway timeout may leave order in inconsistent state"
      level: "high"
      mitigation: "Implemented timeout handling and retry logic"
    
    - risk_id: "RISK-002"
      description: "Database transaction not atomic across order + inventory"
      level: "medium"
      mitigation: "Using saga pattern for distributed transaction"
  
  known_issues:
    - issue_id: "ISSUE-001"
      description: "Order status update notification not implemented yet"
      severity: "low"
```

## Integration Test Design

### Integration Scope Analysis

```yaml
integration_scope:
  modules:
    - name: OrderController
      role: caller
      description: "HTTP request handling"
    
    - name: OrderService
      role: both
      description: "Business orchestration, calls multiple services"
    
    - name: OrderRepository
      role: callee
      description: "Database operations"
    
    - name: InventoryService
      role: callee
      description: "Inventory check and update"
    
    - name: PaymentClient
      role: callee
      description: "External payment gateway"
  
  integration_points:
    - from: OrderController
      to: OrderService
      contract_type: API
      description: "REST → Service method calls"
      
    - from: OrderService
      to: OrderRepository
      contract_type: database
      description: "Order CRUD operations"
      
    - from: OrderService
      to: InventoryService
      contract_type: API
      description: "Inventory availability check"
      
    - from: OrderService
      to: PaymentClient
      contract_type: API
      description: "Payment processing"
```

### Mock vs Real Strategy

```yaml
mock_vs_real:
  strategy_matrix:
    - dependency: OrderRepository
      type: database
      strategy: real (fake)
      reason: "Use in-memory SQLite to test real DB behavior without external DB"
      config:
        driver: "sqlite:memory"
        seed_data: "order_test_seeds.sql"
    
    - dependency: InventoryService
      type: internal
      strategy: real
      reason: "Internal service, test real integration"
      config:
        instance: "test_inventory_service"
    
    - dependency: PaymentClient
      type: external
      strategy: mock
      reason: "External payment gateway, must mock to control responses and avoid real transactions"
      config:
        mock_type: "behavior_mock"
        scenarios:
          - name: "success"
            response: { status: "approved", transaction_id: "txn-mock-001" }
          - name: "timeout"
            response: { error: "TimeoutError", after_ms: 30000 }
          - name: "declined"
            response: { status: "declined", reason: "insufficient_funds" }
    
    - dependency: NotificationService
      type: internal
      strategy: mock
      reason: "Known issue - not fully implemented, mock for now"
      config:
        mock_type: "contract_mock"
        expected_calls: 0
```

### Test Suite

```yaml
test_suite:
  name: "Order Processing Integration Tests"
  description: "Test full order flow from API request to payment completion"
  
  test_cases:
    # Happy Path - Complete Order Flow
    - id: IT-ORD-001
      name: "complete order flow succeeds with valid payment"
      category: happy_path
      
      integration_flow:
        - step: "POST /api/orders"
          module: OrderController
          input: { user_id: "user-123", items: [{ product_id: "prod-1", quantity: 2 }] }
          expected_output: "HTTP 201 Created"
        
        - step: "OrderService.createOrder()"
          module: OrderService
          expected_output: "Order entity created with status='pending'"
        
        - step: "InventoryService.checkAvailability()"
          module: InventoryService
          expected_output: "Available: true for prod-1"
        
        - step: "PaymentClient.processPayment()"
          module: PaymentClient
          expected_output: "Mock returns approved"
        
        - step: "OrderRepository.updateStatus()"
          module: OrderRepository
          expected_output: "Order status='confirmed'"
      
      scenario:
        given: "User exists, inventory has stock, payment mock set to success"
        when: "Complete order creation request submitted"
        then: "Order persisted with confirmed status, inventory decremented, payment recorded"
      
      test_data:
        fixtures:
          - "fixtures/user_user-123.json"
          - "fixtures/inventory_prod-1.json"
        factories:
          - "OrderFactory.validOrderRequest()"
      
      assertions:
        - assertion_type: contract
          description: "HTTP response contains order ID and status"
          expected: "201, { id: 'order-xxx', status: 'confirmed' }"
        
        - assertion_type: data
          description: "Order persisted in database"
          expected: "SELECT * FROM orders WHERE id='order-xxx' returns row"
        
        - assertion_type: data
          description: "Inventory decremented"
          expected: "SELECT quantity FROM inventory WHERE product_id='prod-1' returns original-2"
        
        - assertion_type: contract
          description: "Payment mock called correctly"
          expected: "PaymentClient.processPayment called 1 time with correct amount"
    
    # Error Path - Payment Declined
    - id: IT-ORD-002
      name: "order fails when payment declined"
      category: error_path
      
      integration_flow:
        - step: "POST /api/orders"
          module: OrderController
          expected_output: "HTTP 402 Payment Required"
        
        - step: "OrderService.createOrder()"
          module: OrderService
          expected_output: "Order created with status='payment_failed'"
      
      scenario:
        given: "Payment mock set to declined"
        when: "Order creation request submitted"
        then: "Order persisted with payment_failed status, inventory not decremented"
      
      test_data:
        fixtures: ["fixtures/user_user-123.json", "fixtures/inventory_prod-1.json"]
        mock_config:
          PaymentClient: { status: "declined", reason: "insufficient_funds" }
      
      assertions:
        - assertion_type: contract
          description: "HTTP response indicates payment failure"
          expected: "402, { error: 'payment_declined', reason: 'insufficient_funds' }"
        
        - assertion_type: data
          description: "Order persisted with failed status"
          expected: "SELECT status FROM orders WHERE id='order-xxx' returns 'payment_failed'"
        
        - assertion_type: data
          description: "Inventory unchanged"
          expected: "SELECT quantity FROM inventory WHERE product_id='prod-1' returns original value"
    
    # Error Path - Inventory Insufficient
    - id: IT-ORD-003
      name: "order fails when inventory insufficient"
      category: error_path
      
      scenario:
        given: "Inventory stock < requested quantity"
        when: "Order request submitted"
        then: "HTTP 400, order not created, no payment attempted"
      
      test_data:
        fixtures:
          - "fixtures/user_user-123.json"
          - "fixtures/inventory_prod-1_low_stock.json"  # quantity: 1
      
      assertions:
        - assertion_type: contract
          description: "HTTP response indicates insufficient stock"
          expected: "400, { error: 'insufficient_inventory', product_id: 'prod-1' }"
        
        - assertion_type: contract
          description: "Payment mock NOT called"
          expected: "PaymentClient.processPayment called 0 times"
        
        - assertion_type: data
          description: "No order created"
          expected: "SELECT COUNT(*) FROM orders returns 0"
    
    # Boundary - Payment Timeout (High Risk RISK-001)
    - id: IT-ORD-004
      name: "payment timeout handled without data corruption"
      category: boundary
      
      scenario:
        given: "Payment mock configured for timeout"
        when: "Payment takes > 30 seconds"
        then: "Order marked as timeout, retry logic engaged"
      
      test_data:
        mock_config:
          PaymentClient:
            behavior: "timeout"
            delay_ms: 31000
      
      assertions:
        - assertion_type: data
          description: "Order persisted with timeout status"
          expected: "SELECT status FROM orders returns 'payment_timeout'"
        
        - assertion_type: data
          description: "Retry count incremented"
          expected: "SELECT retry_count FROM orders returns 1"
        
        - assertion_type: contract
          description: "Saga compensation not triggered (first timeout)"
          expected: "Inventory unchanged, compensation pending"
    
    # Boundary - Concurrent Order Requests
    - id: IT-ORD-005
      name: "concurrent orders for same product handled correctly"
      category: boundary
      
      scenario:
        given: "Inventory has 5 units of prod-1"
        when: "Two concurrent orders request 3 units each"
        then: "One succeeds, one fails with insufficient inventory"
      
      test_data:
        fixtures: ["fixtures/inventory_prod-1_five_units.json"]
        concurrent_requests:
          - request_id: "req-1"
            quantity: 3
          - request_id: "req-2"
            quantity: 3
      
      assertions:
        - assertion_type: data
          description: "Exactly one order confirmed"
          expected: "SELECT COUNT(*) FROM orders WHERE status='confirmed' returns 1"
        
        - assertion_type: data
          description: "Exactly one order failed"
          expected: "SELECT COUNT(*) FROM orders WHERE status='insufficient_inventory' returns 1"
        
        - assertion_type: data
          description: "Final inventory = 2"
          expected: "SELECT quantity FROM inventory WHERE product_id='prod-1' returns 2"
```

### Environment Setup

```yaml
environment_setup:
  isolation_level: "transaction_rollback"
  
  services_needed:
    - "SQLite in-memory (OrderRepository)"
    - "InventoryService test instance"
    - "PaymentClient mock"
  
  setup_sequence:
    - step: 1
      action: "Initialize SQLite with schema"
      timeout_ms: 100
    
    - step: 2
      action: "Seed test data from fixtures"
      timeout_ms: 50
    
    - step: 3
      action: "Configure PaymentClient mock scenarios"
      timeout_ms: 10
    
    - step: 4
      action: "Start InventoryService test instance"
      timeout_ms: 500
  
  cleanup_strategy:
    primary: "Transaction rollback (fast, no residual data)"
    fallback: "DELETE FROM orders; DELETE FROM inventory_log;"
  
  cleanup_sequence:
    - step: 1
      action: "Rollback transaction"
    - step: 2
      action: "Reset mock state"
    - step: 3
      action: "Clear test instance state"
```

### Coverage Summary

```yaml
coverage_summary:
  total_test_cases: 5
  
  by_category:
    happy_path: 1
    error_path: 2
    boundary: 2
  
  integration_points_covered:
    - "OrderController → OrderService"
    - "OrderService → OrderRepository"
    - "OrderService → InventoryService"
    - "OrderService → PaymentClient"
  
  integration_points_not_covered:
    - "OrderService → NotificationService (ISSUE-001 acknowledged)"
  
  risk_based_coverage:
    RISK-001: "IT-ORD-004 (payment timeout scenario)"
    RISK-002: "IT-ORD-005 (concurrent orders, partial saga coverage)"
  
  estimated_execution_time_ms: 3500
```

### Test Execution Order

```yaml
execution_order:
  1: "IT-ORD-003 (inventory check first - fast failure if broken)"
  2: "IT-ORD-001 (happy path - validates complete flow)"
  3: "IT-ORD-002 (payment declined - error handling)"
  4: "IT-ORD-004 (timeout - high risk, needs more time)"
  5: "IT-ORD-005 (concurrent - complex setup)"
```

## Key Decisions Notes

1. **Payment Gateway Mocking**: PaymentClient must be mocked because:
   - External dependency not under test control
   - Real transactions cost money
   - Timeout scenarios impossible to test reliably with real gateway

2. **Database Fake**: Using SQLite in-memory instead of real PostgreSQL because:
   - Same SQL semantics for basic operations
   - Much faster startup and teardown
   - Transaction rollback works reliably

3. **Inventory Real Service**: Using real InventoryService test instance because:
   - Internal service under our control
   - Need to test real integration behavior
   - Mock would duplicate unit test coverage

4. **Notification Mock**: NotificationService mocked because:
   - ISSUE-001 acknowledges incomplete implementation
   - Contract mock verifies signature without expecting calls

5. **Risk-Based Testing**: High-risk scenarios (RISK-001 timeout, RISK-002 concurrency) get dedicated boundary tests.