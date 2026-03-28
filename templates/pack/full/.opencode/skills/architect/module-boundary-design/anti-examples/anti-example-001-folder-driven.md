# Anti-Example: Folder-Driven Architecture

## Problem

This anti-example demonstrates **AP-002: Folder-Driven Architecture** - defining modules based only on directory structure.

---

## What NOT to Do

```yaml
# WRONG: Just listing folders without responsibilities
module_boundaries:
  module_list:
    - name: src/api
      description: "API folder"
    - name: src/core
      description: "Core folder"
    - name: src/utils
      description: "Utils folder"
    - name: src/models
      description: "Models folder"
      
  # Missing: module_responsibilities
  # Missing: inputs_outputs
  # Missing: dependency_directions
  # Missing: integration_seams
  # Missing: future_extension_boundary
  # Missing: explicit_non_responsibilities
```

---

## Why It's Wrong

1. **Directory structure ≠ Architecture**: Folders are physical organization, not logical design
2. **No responsibility clarity**: What does "core" actually do?
3. **No dependency rules**: Can utils depend on api? Can models call core?
4. **No integration points**: How do modules communicate?
5. **No extension guidance**: Where can new features be added?

---

## Correct Approach

```yaml
# RIGHT: Responsibility-driven design
module_boundaries:
  module_list:
    - name: OrderController
      description: "Handle order HTTP requests"
    - name: OrderService
      description: "Order business logic orchestration"
    - name: PaymentGateway
      description: "Payment processing"
    - name: InventoryManager
      description: "Inventory tracking and reservation"

  module_responsibilities:
    - module: OrderController
      primary_responsibility: "Handle HTTP request/response for orders"
      scope:
        - "POST /orders - Create order"
        - "GET /orders/{id} - Get order"
      non_responsibilities:
        - "Business logic"
        - "Direct database access"

    - module: OrderService
      primary_responsibility: "Orchestrate order workflow"
      scope:
        - "Coordinate payment and inventory"
        - "Manage order state transitions"
      non_responsibilities:
        - "HTTP handling"
        - "Direct payment API calls"

  dependency_directions:
    - from: OrderController
      to: OrderService
      type: required
      reason: "Delegate business logic"
      direction: downstream

  integration_seams:
    - seam_id: IS-001
      modules_involved: [OrderService, PaymentGateway]
      integration_type: api
      description: "Payment processing interface"
      stability: stable

  future_extension_boundary:
    - extension_point: "Multiple payment providers"
      module: PaymentGateway
      what_can_extend: "Add new payment providers"
      what_must_remain_stable: "PaymentGateway interface"
      extension_mechanism: inheritance
```

---

## Detection Checklist

- [ ] Is there a responsibility table with "Does NOT Do" column?
- [ ] Is there an explicit dependency map?
- [ ] Are module input/output boundaries defined?
- [ ] Are integration seams identified?

---

## Prevention

1. Start with responsibilities, not directories
2. Define what each module does AND doesn't do
3. Map dependencies before implementation
4. Identify integration points explicitly