# Anti-Example: Missing Error Contract

## Problem

This anti-example demonstrates an interface contract without error handling specification.

---

## What NOT to Do

```yaml
# WRONG: Interface without error contract
interface-contract:
  interface_name: "PaymentAPI.process"
  version: "v1.0.0"
  
  input_contract:
    - name: "amount"
      type: "decimal"
      required: true
    - name: "currency"
      type: "string"
      required: true
  
  output_contract:
    success:
      type: "PaymentResult"
      structure:
        transaction_id: "string"
        status: "string"
  
  # Missing: error contract
  # Missing: error code taxonomy
  # Missing: retry guidance
  # Missing: error examples
```

---

## Why It's Wrong

1. **Consumers don't know how to handle failures**: They receive unexpected error formats
2. **No retry guidance**: Some errors are retryable, others aren't - consumers can't distinguish
3. **Inconsistent error responses**: Different implementations may return different formats
4. **Integration tests incomplete**: Error scenarios cannot be tested properly
5. **Production incidents**: When payment fails, debugging is difficult without error taxonomy

---

## Impact Example

```python
# Consumer code without error guidance
def process_payment(amount, currency):
    response = payment_api.process(amount, currency)
    if response.status == "success":
        return response.transaction_id
    else:
        # What errors can occur?
        # Should I retry? How many times?
        # What does "error" mean?
        raise Exception("Payment failed")  # Generic, useless
```

---

## Correct Approach

```yaml
# RIGHT: Interface with complete error contract
interface-contract:
  interface_name: "PaymentAPI.process"
  version: "v1.0.0"
  
  input_contract:
    - name: "amount"
      type: "decimal"
      required: true
      constraints:
        - "min: 0.01"
        - "max: 1000000.00"
      examples:
        valid: "99.99"
        invalid: "-5.00"
    
    - name: "currency"
      type: "string"
      required: true
      constraints:
        - "enum: USD, EUR, GBP"
      examples:
        valid: "USD"
        invalid: "XYZ"
  
  output_contract:
    success:
      type: "PaymentResult"
      structure:
        transaction_id: "string"
        status: "string (confirmed)"
      examples:
        - '{"transaction_id": "txn-123", "status": "confirmed"}'
    
    error:
      code_taxonomy:
        - code: "PAY_001"
          meaning: "Invalid amount (negative or exceeds limit)"
          retry_guidance: "Do not retry; caller must correct amount"
        - code: "PAY_002"
          meaning: "Unsupported currency"
          retry_guidance: "Do not retry; caller must use supported currency"
        - code: "PAY_003"
          meaning: "Payment gateway timeout"
          retry_guidance: "Retry with exponential backoff (max 3 attempts)"
        - code: "PAY_004"
          meaning: "Card declined by bank"
          retry_guidance: "Do not retry; user must contact bank or use different card"
        - code: "PAY_005"
          meaning: "Insufficient funds"
          retry_guidance: "Do not retry; user must add funds"
      format:
        code: "string"
        message: "string"
        retryable: "boolean"
        retry_after: "integer (seconds, optional)"
      examples:
        - '{"code": "PAY_003", "message": "Payment gateway timeout", "retryable": true, "retry_after": 30}'
```

---

## Detection Checklist

- [ ] Does output_contract include error section?
- [ ] Are error codes defined with meanings?
- [ ] Is retry guidance provided for each error code?
- [ ] Are error response examples included?
- [ ] Can consumers distinguish retryable vs. non-retryable errors?

---

## Prevention

1. **Require error taxonomy**: Every interface must have error code definitions
2. **Add retry guidance**: Specify whether each error is retryable
3. **Include error examples**: Show consumers what error responses look like
4. **Validate in tests**: Contract tests must cover error scenarios
5. **Review checklist**: Use checklist to verify error contract completeness