# Example 001: Hardcoded API Key and Logging Leak

## Scenario Description

A developer has integrated a third-party payment service. The implementation includes a payment client initialization with API key, payment processing, and error handling. Security review is triggered because the task involves external service integration and authentication.

## Input Context

### Implementation Summary (from developer)

```yaml
implementation_summary:
  goal_alignment:
    goal: "Integrate Stripe payment gateway"
    achieved: true
  changed_files:
    - path: "src/services/PaymentService.ts"
      change_type: "added"
      description: "Payment processing service with Stripe integration"
    - path: "src/config/payment.ts"
      change_type: "added"
      description: "Payment configuration file"
    - path: "src/controllers/PaymentController.ts"
      change_type: "added"
      description: "Payment API endpoints"
```

### Task Risk Level: `high`

External payment service integration requires mandatory security review.

## Step-by-Step Skill Application

### Step 1: Identify Secret-Related Code

Reviewed files:
- `PaymentService.ts` - API key usage, payment processing
- `payment.ts` - Configuration file
- `PaymentController.ts` - HTTP endpoints

### Step 2: Check Hardcoded Secrets

Finding: API key is hardcoded ❌

### Step 3: Check Secret Storage

Finding: No environment variable usage ❌

### Step 4: Check Secret Logging

Finding: API key logged in error handler ❌

### Step 5: Check Secret Rotation

Finding: No rotation mechanism ⚠️

### Step 6: Generate Report

## Output Artifact

```yaml
secret_handling_review:
  dispatch_id: "dispatch_security_001"
  task_id: "T-PAYMENT-001"
  created_at: "2026-03-28T10:00:00Z"
  created_by: "security"
  
  scope:
    secrets_reviewed:
      - type: "api_key"
        location: "src/services/PaymentService.ts"
        description: "Stripe payment API key"
        usage: "Payment gateway authentication"
      - type: "api_key"
        location: "src/config/payment.ts"
        description: "Payment configuration containing API key"
        usage: "Configuration reference"
        
    files_reviewed:
      - path: "src/services/PaymentService.ts"
        type: "service"
        description: "Payment processing logic"
      - path: "src/config/payment.ts"
        type: "config"
        description: "Payment configuration"
      - path: "src/controllers/PaymentController.ts"
        type: "controller"
        description: "Payment endpoints"
        
    review_type: "full"
    
  findings:
    - id: "SEC-001"
      severity: "critical"
      category: "hardcoded_secret"
      title: "Stripe API Key Hardcoded in Source Code"
      description: |
        The Stripe payment API key is hardcoded directly in the source code at 
        line 15 of PaymentService.ts. This is a live production API key that 
        can be used to make real payment transactions.
      
      location:
        file: "src/services/PaymentService.ts"
        line_start: 15
        line_end: 15
        
      secret_type: "api_key"
      secret_value_pattern: "sk_live_*"
      
      code_snippet: |
        // PaymentService.ts:15
        const STRIPE_API_KEY = 'sk_live_EXAMPLE_PLACEHOLDER_NOT_REAL_KEY'
        const stripeClient = new Stripe(STRIPE_API_KEY)
        
      vulnerability:
        type: "Hardcoded Credentials"
        cwe: "CWE-798"
        owasp: "A07:2021 - Identification and Authentication Failures"
        
      impact:
        description: |
          Attacker with code access can use the Stripe API key to:
          - Make unauthorized charges
          - Access customer payment data
          - Create fraudulent refunds
          - Potentially cause significant financial loss
        exploit_scenario: |
          1. Attacker gains access to code repository (public repo, compromised CI, insider)
          2. Extracts hardcoded STRIPE_API_KEY from PaymentService.ts:15
          3. Uses Stripe API to create charges against any customer
          4. Creates refunds to attacker-controlled accounts
          5. Organization faces financial loss and Stripe account termination
        affected_systems: "Payment processing, Customer billing, Financial records"
        
      remediation:
        recommendation: "Move API key to environment variable with validation and rotation support"
        code_example: |
          // BAD - Hardcoded (current):
          const STRIPE_API_KEY = 'sk_live_EXAMPLE_PLACEHOLDER_NOT_REAL_KEY'
          
          // GOOD - Environment variable:
          const STRIPE_API_KEY = process.env.STRIPE_API_KEY
          if (!STRIPE_API_KEY) {
            throw new Error('FATAL: STRIPE_API_KEY environment variable not configured')
          }
          // Validate key format
          if (!STRIPE_API_KEY.startsWith('sk_live_') && !STRIPE_API_KEY.startsWith('sk_test_')) {
            throw new Error('FATAL: Invalid Stripe API key format')
          }
          
          const stripeClient = new Stripe(STRIPE_API_KEY)
        effort: "quick"
        priority: "immediate"
        actions:
          - "Add STRIPE_API_KEY to environment configuration"
          - "Update deployment scripts to inject key"
          - "Add startup validation for key presence"
          - "Remove hardcoded key from source code"
          
    - id: "SEC-002"
      severity: "critical"
      category: "hardcoded_secret"
      title: "API Key in Configuration File"
      description: |
        The configuration file payment.ts contains a hardcoded API key that 
        will be committed to the repository. Even if this is intended as a 
        template, real keys should never be in config files.
      
      location:
        file: "src/config/payment.ts"
        line_start: 3
        line_end: 3
        
      secret_type: "api_key"
      
      code_snippet: |
        // payment.ts:3
        export const paymentConfig = {
          stripeApiKey: 'sk_live_EXAMPLE_PLACEHOLDER_NOT_REAL_KEY',
          // ...
        }
        
      vulnerability:
        type: "Hardcoded Credentials in Configuration"
        cwe: "CWE-798"
        owasp: "A07:2021 - Identification and Authentication Failures"
        
      remediation:
        recommendation: "Remove hardcoded key, use environment variable reference"
        code_example: |
          // BAD (current):
          export const paymentConfig = {
            stripeApiKey: 'sk_live_EXAMPLE_PLACEHOLDER_NOT_REAL_KEY',
          }
          
          // GOOD:
          export const paymentConfig = {
            stripeApiKey: process.env.STRIPE_API_KEY,
          }
          
          // Or use a separate config loader:
          export const getPaymentConfig = () => ({
            stripeApiKey: process.env.STRIPE_API_KEY || '',
          })
        effort: "quick"
        priority: "immediate"
        
    - id: "SEC-003"
      severity: "high"
      category: "secret_logging"
      title: "API Key Exposed in Error Logs"
      description: |
        When payment processing fails, the error handler logs the full error 
        including the API key. This exposes the secret in log files which may 
        be accessible to unauthorized personnel or stored insecurely.
      
      location:
        file: "src/services/PaymentService.ts"
        line_start: 42
        line_end: 45
        
      secret_type: "api_key"
      
      code_snippet: |
        // PaymentService.ts:42-45
        async processPayment(amount: number) {
          try {
            // payment logic
          } catch (error) {
            console.error(`Payment failed with key ${STRIPE_API_KEY}:`, error)
            // API key is logged!
          }
        }
        
      vulnerability:
        type: "Information Exposure Through Log Files"
        cwe: "CWE-532"
        owasp: "A09:2021 - Security Logging and Monitoring Failures"
        
      impact:
        description: |
          API key is written to log files which may be:
          - Accessible to developers without payment access
          - Stored in cloud logging services
          - Retained in log archives for years
          - Potentially leaked through log aggregation tools
        exploit_scenario: |
          1. Payment fails for some reason
          2. Error is logged with API key
          3. Developer or ops team reviews logs
          4. API key is visible in logs
          5. Key can be extracted from log storage
        affected_systems: "Logging infrastructure, Payment system"
        
      remediation:
        recommendation: "Remove API key from error logs, use error message only"
        code_example: |
          // BAD (current):
          console.error(`Payment failed with key ${STRIPE_API_KEY}:`, error)
          
          // GOOD:
          console.error('Payment processing failed:', {
            error: error.message,
            amount: amount,
            timestamp: new Date().toISOString()
            // No API key!
          })
          
          // Even better - use structured logging with sensitive data filter:
          logger.error('Payment failed', { 
            error: sanitizeError(error),
            amount 
          })
        effort: "quick"
        priority: "immediate"
        
    - id: "SEC-004"
      severity: "medium"
      category: "secret_rotation"
      title: "No API Key Rotation Mechanism"
      description: |
        There is no mechanism to rotate the Stripe API key. If the key is 
        compromised, there's no way to quickly invalidate it and deploy a 
        new key without code changes.
      
      location:
        file: "src/services/PaymentService.ts"
        scope: "entire file"
        
      secret_type: "api_key"
      
      vulnerability:
        type: "Missing Key Rotation"
        cwe: "CWE-261"
        owasp: "A02:2021 - Cryptographic Failures"
        
      impact:
        description: "Key compromise requires manual intervention and code deployment"
        
      remediation:
        recommendation: "Implement environment-based key rotation"
        code_example: |
          // Add key versioning support:
          const STRIPE_API_KEY = process.env.STRIPE_API_KEY_V1 || process.env.STRIPE_API_KEY
          
          // Add rotation documentation:
          // Key Rotation Procedure:
          // 1. Generate new key in Stripe dashboard
          // 2. Update STRIPE_API_KEY_V1 in environment
          // 3. Deploy with new key
          // 4. Verify transactions working
          // 5. Invalidate old key in Stripe dashboard
        effort: "moderate"
        priority: "soon"
        
  secret_management:
    current_state:
      storage_method: "hardcoded_source"
      storage_method_rating: "critical_risk"
      rotation_enabled: false
      rotation_rating: "medium_risk"
      audit_enabled: false
      audit_rating: "medium_risk"
      
    recommended_state:
      storage_method: "environment_variable"
      rotation_enabled: true
      audit_enabled: true
      
    environment_usage:
      detected: false
      pattern: null
      recommendation: "Add process.env.STRIPE_API_KEY"
      
    secret_vault:
      detected: false
      recommendation: "Consider HashiCorp Vault, AWS Secrets Manager, or similar"
      
  risk_assessment:
    overall_risk: "critical"
    risk_factors:
      - factor: "Live production API key in source code"
        level: "critical"
        description: "Key can be used to make real financial transactions"
      - factor: "API key exposed in logs"
        level: "high"
        description: "Key written to potentially accessible log storage"
      - factor: "No rotation mechanism"
        level: "medium"
        description: "Cannot quickly respond to key compromise"
      - factor: "Configuration file contains key"
        level: "critical"
        description: "Config will be committed to repository"
        
    residual_risk: "None after SEC-001, SEC-002, SEC-003 are remediated"
    
  gate_decision:
    decision: "block"
    conditions:
      - "SEC-001 must be fixed: Remove hardcoded API key from PaymentService.ts"
      - "SEC-002 must be fixed: Remove hardcoded API key from payment.ts config"
      - "SEC-003 must be fixed: Remove API key from error logging"
      - "SEC-004 should be addressed: Add key rotation mechanism"
    blocking_findings: ["SEC-001", "SEC-002", "SEC-003"]
    
  recommendations:
    must_fix:
      - "Move Stripe API key to environment variable (SEC-001)"
      - "Remove hardcoded key from configuration file (SEC-002)"
      - "Remove API key from error logs (SEC-003)"
    should_fix:
      - "Implement API key rotation mechanism (SEC-004)"
    consider:
      - "Use secret management service (HashiCorp Vault, AWS Secrets Manager)"
      - "Add startup validation for all required secrets"
      - "Implement secret audit logging"
      - "Add secret leak detection in CI pipeline"
      
  immediate_actions:
    - action: "Contact Stripe support"
      reason: "Notify about potential key exposure, may need to invalidate"
      urgency: "immediate"
    - action: "Audit repository history"
      reason: "Check if key was ever in public branches"
      urgency: "immediate"
    - action: "Review log storage"
      reason: "Identify where logs containing key are stored"
      urgency: "within_24_hours"
      
  follow_up:
    - item: "Security re-review after fixes"
      owner: "security"
      due_date: "2026-03-29"
    - item: "Verify Stripe key is invalidated if compromised"
      owner: "developer"
      due_date: "2026-03-28"
```

## CWE/OWASP References

| Finding | CWE | OWASP |
|---------|-----|-------|
| SEC-001 | CWE-798: Use of Hard-coded Credentials | A07:2021 - Identification and Authentication Failures |
| SEC-002 | CWE-798: Use of Hard-coded Credentials | A07:2021 - Identification and Authentication Failures |
| SEC-003 | CWE-532: Information Exposure Through Log Files | A09:2021 - Security Logging and Monitoring Failures |
| SEC-004 | CWE-261: Weak Cryptography | A02:2021 - Cryptographic Failures |

## Gate Decision Rationale

**Decision: block**

- SEC-001 (critical): Live Stripe API key in source code allows unauthorized transactions
- SEC-002 (critical): Key also in config file, will be committed to repository
- SEC-003 (high): Key exposed in logs, accessible to unauthorized personnel
- All three must be fixed before any deployment

## Key Learnings

1. **Never hardcode payment API keys**: Financial keys enable real transactions
2. **Check error handlers for secret leakage**: Logging is a common leak vector
3. **Config files are part of the repository**: Even "template" configs can leak
4. **Rotation is essential for response**: Without rotation, compromise is catastrophic