# Example: E-commerce Order System

## Context

This example demonstrates `module-boundary-design` skill for an e-commerce order processing system.

---

## Design Note Input

```yaml
design_note:
  feature_goal: "Process customer orders with payment and inventory coordination"
  design_summary: "Event-driven order processing with saga pattern for distributed transactions"
```

---

## Output Module Boundaries

```yaml
module_boundaries:
  module_list:
    - name: OrderController
      description: "Handle order-related HTTP requests"
    - name: OrderService
      description: "Order business logic and workflow orchestration"
    - name: PaymentService
      description: "Payment processing and gateway integration"
    - name: InventoryService
      description: "Inventory management and reservation"
    - name: NotificationService
      description: "Send order notifications to customers"
    - name: OrderRepository
      description: "Order data persistence"

  module_responsibilities:
    - module: OrderController
      primary_responsibility: "Handle HTTP requests for order operations"
      scope:
        - "POST /orders - Create order"
        - "GET /orders/{id} - Get order details"
        - "PUT /orders/{id}/status - Update order status"
      non_responsibilities:
        - "Business logic implementation"
        - "Direct payment processing"
        - "Inventory management"

    - module: OrderService
      primary_responsibility: "Orchestrate order workflow"
      scope:
        - "Coordinate order creation flow"
        - "Manage order status transitions"
        - "Handle compensation for failures"
      non_responsibilities:
        - "HTTP handling"
        - "Direct payment API calls"
        - "Email/SMS sending"

    - module: PaymentService
      primary_responsibility: "Process payments"
      scope:
        - "Payment gateway integration"
        - "Payment status tracking"
        - "Refund processing"
      non_responsibilities:
        - "Order business logic"
        - "Inventory management"

    - module: InventoryService
      primary_responsibility: "Manage inventory"
      scope:
        - "Check stock availability"
        - "Reserve inventory for orders"
        - "Release inventory on cancellation"
      non_responsibilities:
        - "Payment processing"
        - "Order orchestration"

  inputs_outputs:
    - module: OrderService
      inputs:
        - name: CreateOrderCommand
          type: Command object
          source: OrderController
          description: "Order creation request with items and customer info"
      outputs:
        - name: OrderResult
          type: Result object
          destination: OrderController
          description: "Order creation result with order ID and status"

  dependency_directions:
    - from: OrderController
      to: OrderService
      type: required
      reason: "Delegate order operations"
      direction: downstream
    - from: OrderService
      to: PaymentService
      type: required
      reason: "Process payments"
      direction: downstream
    - from: OrderService
      to: InventoryService
      type: required
      reason: "Reserve inventory"
      direction: downstream
    - from: OrderService
      to: NotificationService
      type: optional
      reason: "Send notifications"
      direction: downstream

  dependency_graph: |
    OrderController -> OrderService
    OrderService -> PaymentService
    OrderService -> InventoryService
    OrderService -> NotificationService
    OrderService -> OrderRepository

  integration_seams:
    - seam_id: IS-001
      modules_involved:
        - OrderService
        - PaymentService
      integration_type: event
      description: "PaymentCompleted / PaymentFailed events"
      stability: stable
    - seam_id: IS-002
      modules_involved:
        - OrderService
        - InventoryService
      integration_type: api
      description: "Synchronous inventory reservation"
      stability: stable

  future_extension_boundary:
    - extension_point: "Multiple payment providers"
      module: PaymentService
      what_can_extend: "Add Stripe, PayPal, Alipay providers"
      what_must_remain_stable: "PaymentService interface"
      extension_mechanism: inheritance
    - extension_point: "Notification channels"
      module: NotificationService
      what_can_extend: "Email, SMS, push notifications"
      what_must_remain_stable: "NotificationService interface"
      extension_mechanism: composition

  explicit_non_responsibilities:
    - module: OrderService
      does_not_do:
        - "Direct payment API calls"
        - "Email/SMS sending"
        - "Database queries directly"
      rationale: "Orchestrator pattern - coordinates but delegates implementation"
```

---

## Key Design Decisions

1. **Saga Pattern**: OrderService orchestrates distributed transaction
2. **Event Communication**: Payment events for loose coupling
3. **Sync Inventory**: Synchronous reservation for consistency
4. **Optional Notification**: Non-blocking notification path