# Example: API Endpoint Interface Contract

## Context

This example demonstrates `interface-contract-design` skill for a REST API endpoint.

---

## Scenario

Design the interface contract for a new "Create Order" API endpoint that will be consumed by multiple clients (web frontend, mobile app, third-party integrations).

---

## Input

```yaml
feature: Order Creation API
purpose: Allow customers to create orders via REST API
consumers:
  - Web Frontend
  - Mobile App
  - Third-party Integrators
requirements:
  - Accept order items with quantity
  - Validate product availability
  - Return order ID and estimated delivery
  - Handle stock-out scenarios
  - Support multiple payment methods
constraints:
  - Response time < 500ms
  - API must be stable for third-party integrators
```

---

## Output Interface Contract

```yaml
interface-contract:
  interface_name: "OrderAPI.createOrder"
  version: "v1.0.0"
  purpose: "Create a new order for authenticated customer"
  
  consumers:
    - name: "Web Frontend"
      type: downstream
      expectations: "Real-time feedback on stock availability"
    - name: "Mobile App"
      type: downstream
      expectations: "Offline-first support with pending order queue"
    - name: "Third-party Integrators"
      type: external
      expectations: "Stable API with clear error codes"
  
  stability_level: stable
  
  input_contract:
    - name: "customer_id"
      type: "string (UUID)"
      required: true
      constraints:
        - "Valid UUID format"
        - "Customer must exist and be active"
      examples:
        valid: "550e8400-e29b-41d4-a716-446655440000"
        invalid: "invalid-uuid"
    
    - name: "items"
      type: "array"
      required: true
      constraints:
        - "min_items: 1"
        - "max_items: 50"
      items:
        - name: "product_id"
          type: "string (UUID)"
          required: true
          constraints:
            - "Product must exist and be available"
        - name: "quantity"
          type: "integer"
          required: true
          constraints:
            - "min: 1"
            - "max: 100"
      examples:
        valid: '[{"product_id": "abc-123", "quantity": 2}]'
        invalid: '[]'  # Empty array
    
    - name: "payment_method"
      type: "string"
      required: true
      constraints:
        - "enum: credit_card, paypal, bank_transfer"
      examples:
        valid: "credit_card"
        invalid: "crypto"  # Unsupported method
    
    - name: "shipping_address_id"
      type: "string (UUID)"
      required: true
      constraints:
        - "Address must belong to customer"
  
  output_contract:
    success:
      type: "OrderCreationResponse"
      structure:
        order_id: "string (UUID)"
        status: "string (pending|confirmed|processing)"
        estimated_delivery: "ISO8601 date"
        total_amount: "decimal"
        items_summary: "array"
      examples:
        - '{"order_id": "ord-123", "status": "pending", "estimated_delivery": "2024-02-15", "total_amount": 99.99}'
    
    error:
      code_taxonomy:
        - code: "ORD_001"
          meaning: "Invalid customer ID"
          retry_guidance: "Do not retry; verify customer authentication"
        - code: "ORD_002"
          meaning: "Product not found"
          retry_guidance: "Do not retry; verify product_id"
        - code: "ORD_003"
          meaning: "Insufficient stock"
          retry_guidance: "Retry with reduced quantity after stock refresh"
        - code: "ORD_004"
          meaning: "Payment method unavailable"
          retry_guidance: "Retry with different payment method"
        - code: "ORD_005"
          meaning: "Service temporarily unavailable"
          retry_guidance: "Retry with exponential backoff (max 5 attempts)"
      format:
        code: "string"
        message: "string"
        details: "object (optional)"
        retry_after: "integer (seconds, optional)"
      examples:
        - '{"code": "ORD_003", "message": "Product SKU-001 has insufficient stock", "details": {"available": 5, "requested": 10}}'
  
  version_strategy:
    scheme: "semver"
    deprecation_policy: "12 months notice for external consumers"
    breaking_change_definition:
      - "Removing required input field"
      - "Changing field type"
      - "Removing error code"
      - "Changing success response structure"
  
  backward_compatibility:
    safe_changes:
      - "Adding optional input field"
      - "Adding new error code"
      - "Adding optional field to success response"
    breaking_changes:
      - "Making optional field required"
      - "Changing field semantics"
      - "Removing field from response"
    migration_guidance: |
      1. Add new fields as optional
      2. Announce deprecation 12 months ahead
      3. Provide migration guide
      4. Remove deprecated fields after notice period
  
  integration_tests:
    required_scenarios:
      - "Valid order returns success with order_id"
      - "Invalid customer returns ORD_001"
      - "Non-existent product returns ORD_002"
      - "Insufficient stock returns ORD_003 with details"
      - "Unsupported payment returns ORD_004"
      - "Service unavailable returns ORD_005"
    mock_expectations: |
      Mock ProductService returns stock levels
      Mock PaymentService returns payment validation
      Mock CustomerService returns customer status
    compatibility_verification: "Run contract tests against all consumer stubs before each release"

---

## Key Design Decisions

1. **Error Taxonomy**: Each error has specific retry guidance, enabling intelligent client behavior
2. **Stability Level**: Marked stable due to third-party integration requirement
3. **Deprecation Policy**: 12 months for external consumers (longer than internal)
4. **Safe Changes**: Only additions are safe; removals require deprecation process
5. **Integration Tests**: Consumer-driven contract tests ensure compatibility