# Example 001: Feature Code Review

## Scenario Context

A developer has completed implementing a user registration feature with email verification. The reviewer (using code-review-checklist skill) needs to perform an independent code review.

### Developer Output Consumed (BR-002 Compliance)

```yaml
implementation-summary:
  goal_alignment:
    goal: "Implement user registration with email verification"
    achieved: true
    deviations:
      - "Email template simplified (HTML instead of rich template)"
  
  changed_files:
    - path: "src/services/UserService.ts"
      change_type: "modified"
      description: "Added register() and verifyEmail() methods"
      lines_changed: { added: 85, deleted: 5 }
    - path: "src/controllers/UserController.ts"
      change_type: "modified"
      description: "Added registration and verification endpoints"
      lines_changed: { added: 45, deleted: 0 }
    - path: "src/models/User.ts"
      change_type: "modified"
      description: "Added emailVerified field and verification token"
      lines_changed: { added: 15, deleted: 0 }
    - path: "src/utils/EmailService.ts"
      change_type: "added"
      description: "New email service for verification emails"
      lines_changed: { added: 60, deleted: 0 }
  
  risks:
    - risk_id: "RISK-001"
      description: "Email deliverability depends on SMTP provider"
      level: "medium"
      mitigation: "Added retry logic and logging"
  
  known_issues:
    - issue_id: "ISSUE-001"
      description: "Verification token expires in 24h, no resend option"
      severity: "low"

  self-check-report:
    overall_status: "PASS"
    checks_performed: 12
    all_passed: true
    claims:
      - "Registration accepts valid email and password"
      - "Verification token is unique and secure"
      - "Email is sent after registration"
      - "Verified users can login"
```

### Design Note (from architect)

```yaml
design-note:
  goal: "User registration with email verification flow"
  
  interface_contract:
    register_user:
      input:
        email: string (valid email format, max 255 chars)
        password: string (min 8 chars, max 128 chars)
      output:
        success: boolean
        user_id: string (if success)
        verification_sent: boolean
      errors:
        - EmailAlreadyExistsError
        - InvalidEmailFormatError
        - WeakPasswordError
    
    verify_email:
      input:
        token: string (UUID format)
      output:
        success: boolean
      errors:
        - InvalidTokenError
        - TokenExpiredError
  
  security_requirements:
    - "Password must be hashed with bcrypt (cost factor 10+)"
    - "Verification token must be cryptographically random"
    - "Token must expire after 24 hours"
    - "Rate limit registration attempts (5 per minute per IP)"
```

---

## Step-by-Step Review Execution

### Step 1: Preparation

```yaml
review_preparation:
  artifacts_read:
    - "specs/003-user-registration/spec.md"
    - "implementation-summary (above)"
    - "design-note (above)"
    - "self-check-report (above)"
  
  review_scope:
    - "src/services/UserService.ts"
    - "src/controllers/UserController.ts"
    - "src/models/User.ts"
    - "src/utils/EmailService.ts"
  
  review_focus:
    primary: "Security (password handling, token generation)"
    secondary: "Error handling and validation"
  
  br_002_acknowledgment:
    self_check_claims: "12/12 checks passed"
    reviewer_stance: "Hints for focus areas, NOT evidence"
```

### Step 2: Overall Browse

```yaml
overall_assessment:
  code_structure: "Well organized, follows existing patterns"
  complexity: "Moderate - registration flow is straightforward"
  key_paths:
    - "POST /register → UserService.register() → EmailService.send()"
    - "POST /verify/:token → UserService.verifyEmail()"
  areas_of_concern:
    - "Password handling in UserService.ts"
    - "Token generation security"
    - "Input validation in UserController.ts"
```

### Step 3: Checklist Execution

#### 3.1 Goal Alignment

```yaml
checklist_category: "目标对齐"
  
checks:
  - item: "实现是否符合 task goal?"
    status: PASS
    evidence: "register() and verifyEmail() methods implemented as specified"
    
  - item: "是否满足 acceptance criteria?"
    status: PASS
    evidence: "All AC items covered: registration, email sending, verification"
    
  - item: "是否有遗漏的需求?"
    status: WARN
    evidence: "Rate limiting mentioned in design but not implemented"
    
  - item: "是否有超出 scope 的功能?"
    status: PASS
    evidence: "No out-of-scope features added"
    
  - item: "是否与 design note 一致?"
    status: WARN
    evidence: "Deviation noted: email template simplified (acceptable)"
```

#### 3.2 Security (BR-002 Independent Verification)

```yaml
checklist_category: "安全性"

checks:
  - item: "密码是否安全存储?"
    status: PASS
    br_002_verification:
      self_check_claim: "Password hashed with bcrypt"
      reviewer_action: "Review UserService.ts:45-50, verify bcrypt usage"
      code_reviewed: |
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await this.userRepository.create({
          email,
          passwordHash: hashedPassword,
          emailVerified: false,
          verificationToken: crypto.randomBytes(32).toString('hex')
        });
      finding: "bcrypt cost factor 12 (exceeds requirement of 10+), secure"
  
  - item: "验证令牌是否安全生成?"
    status: PASS
    br_002_verification:
      self_check_claim: "Verification token is unique and secure"
      reviewer_action: "Review token generation in UserService.ts:48"
      code_reviewed: |
        verificationToken: crypto.randomBytes(32).toString('hex')
      finding: "32 bytes of randomness = 256 bits, cryptographically secure"
  
  - item: "是否有注入风险?"
    status: PASS
    br_002_verification:
      reviewer_action: "Review all database queries"
      finding: "All queries use parameterized ORM methods, no raw SQL"
  
  - item: "输入是否验证?"
    status: FAIL
    severity: major
    br_002_verification:
      self_check_claim: "Registration accepts valid email and password"
      reviewer_action: "Review validation in UserController.ts"
      code_reviewed: |
        async register(req: Request, res: Response) {
          const { email, password } = req.body;
          // Missing: email format validation
          // Missing: password strength validation
          const result = await this.userService.register(email, password);
          ...
        }
      finding: "No input validation before service call - invalid emails and weak passwords pass through"
  
  - item: "是否有速率限制?"
    status: FAIL
    severity: major
    br_002_verification:
      design_requirement: "Rate limit registration attempts (5 per minute per IP)"
      reviewer_action: "Search for rate limiting implementation"
      finding: "No rate limiting middleware found in controller or routes"
```

#### 3.3 Error Handling

```yaml
checklist_category: "错误处理"

checks:
  - item: "错误是否被正确处理?"
    status: WARN
    evidence: "Try-catch blocks present but some errors return generic messages"
    
  - item: "是否有静默失败?"
    status: FAIL
    severity: minor
    code_reviewed: |
      catch (error) {
        // EmailService failure
        console.error('Failed to send email', error);
        // User is still created but no verification email sent
        // No indication to user that email failed
      }
    finding: "Email send failure is logged but user isn't notified"
```

#### 3.4 Test Coverage

```yaml
checklist_category: "测试覆盖"

checks:
  - item: "新增代码是否有测试?"
    status: PASS
    evidence: "UserService.test.ts has 8 test cases"
    
  - item: "边界条件是否测试?"
    status: WARN
    evidence: "Happy path and error path tested, but missing edge cases for email validation"
    
  - item: "安全场景是否测试?"
    status: FAIL
    severity: minor
    evidence: "No tests for SQL injection attempts or malformed inputs"
```

---

## Review Report (BR-004 Severity Classification)

```yaml
review_report:
  dispatch_id: "DISPATCH-2024-001"
  task_id: "TASK-REG-001"
  reviewer: "reviewer-agent"
  timestamp: "2024-01-15T14:30:00Z"
  
  # BR-002 Compliance
  self_check_acknowledged:
    status: "Developer claims 12/12 checks passed"
    use: "Hints for review focus, NOT evidence - independent verification performed"
  
  summary:
    overall_decision: warn
    decision_reason: "Core functionality implemented correctly but missing input validation and rate limiting per security requirements"
    
  checklist_summary:
    total_checks: 30
    passed: 24
    failed: 4
    na: 2
    
    by_category:
      - category: "目标对齐"
        passed: 4
        failed: 1
      - category: "安全性"
        passed: 3
        failed: 2
      - category: "错误处理"
        passed: 1
        failed: 1
      - category: "测试覆盖"
        passed: 2
        failed: 1
        
  # BR-004 Severity Classification
  issues:
    - id: ISS-001
      category: "安全性"
      severity: major  # BR-004
      type: security
      description: "Missing input validation in registration endpoint"
      location: "src/controllers/UserController.ts:15-20"
      code_snippet: |
        async register(req: Request, res: Response) {
          const { email, password } = req.body;
          // No validation here
          const result = await this.userService.register(email, password);
        }
      suggestion: "Add email format validation and password strength check before service call"
      code_example: |
        const { email, password } = req.body;
        if (!isValidEmail(email)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }
        if (!isStrongPassword(password)) {
          return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
      rationale: "Invalid inputs can cause errors downstream and poor user experience"
      br_002_verification: "Reviewer independently identified by code inspection"
      
    - id: ISS-002
      category: "安全性"
      severity: major  # BR-004
      type: security
      description: "Missing rate limiting on registration endpoint"
      location: "src/controllers/UserController.ts"
      code_snippet: |
        // No rate limiting middleware
        router.post('/register', userController.register);
      suggestion: "Add rate limiting middleware (e.g., express-rate-limit)"
      code_example: |
        const rateLimiter = rateLimit({
          windowMs: 60 * 1000,
          max: 5,
          message: 'Too many registration attempts'
        });
        router.post('/register', rateLimiter, userController.register);
      rationale: "Design spec requires rate limiting (5 per minute per IP) to prevent abuse"
      br_002_verification: "Reviewer verified against design-note requirements"
      
    - id: ISS-003
      category: "错误处理"
      severity: minor  # BR-004
      type: quality
      description: "Email send failure is not communicated to user"
      location: "src/services/UserService.ts:55-60"
      code_snippet: |
        catch (error) {
          console.error('Failed to send email', error);
          // Silent failure - user not notified
        }
      suggestion: "Return partial success with warning, or queue email for retry"
      rationale: "User expects verification email; silent failure causes confusion"
      br_002_verification: "Reviewer identified by code inspection"
      
    - id: ISS-004
      category: "测试覆盖"
      severity: minor  # BR-004
      type: test
      description: "Missing security-focused tests"
      location: "tests/unit/UserService.test.ts"
      suggestion: "Add tests for: SQL injection, XSS attempts, malformed emails"
      rationale: "Security testing is important for authentication features"
      br_002_verification: "Reviewer reviewed test file contents"
  
  positives:
    - description: "Password hashing uses bcrypt with appropriate cost factor (12)"
      location: "src/services/UserService.ts:45"
    - description: "Verification token uses cryptographically secure random bytes"
      location: "src/services/UserService.ts:48"
    - description: "Code follows existing patterns and is well-structured"
      location: "All files"
    
  recommendations:
    must_fix: []  # No blockers
    should_fix:
      - "Add input validation for email and password (ISS-001)"
      - "Add rate limiting for registration endpoint (ISS-002)"
    consider:
      - "Handle email send failure gracefully (ISS-003)"
      - "Add security-focused test cases (ISS-004)"
    
  # BR-007: Honest Disclosure
  review_coverage:
    files_reviewed:
      - "src/services/UserService.ts"
      - "src/controllers/UserController.ts"
      - "src/models/User.ts"
      - "src/utils/EmailService.ts"
    files_not_reviewed:
      - "src/middleware/AuthMiddleware.ts"  # Not modified
    not_reviewed_reason: "Files not part of this change"
    assumptions_made:
      - "Database schema changes were reviewed separately"
      - "SMTP configuration is handled at infrastructure level"
    
  risk_assessment:
    risks:
      - risk: "Unvalidated inputs may cause downstream errors"
        level: medium
        mitigation: "Add validation layer (ISS-001)"
        governance_impact: false
      - risk: "Missing rate limiting enables potential abuse"
        level: medium
        mitigation: "Add rate limiting (ISS-002)"
        governance_impact: false
    
  recommendation_to_next:
    action: approve
    next_steps:
      - "Fix ISS-001 and ISS-002 before merging"
      - "Consider ISS-003 and ISS-004 as follow-up tasks"
      - "Create technical debt tickets for minor issues"
```

---

## Key Decisions Notes

### BR-002 Compliance
- Self-check claims were acknowledged but NOT used as evidence
- Reviewer independently verified all security-critical claims
- Each issue includes `br_002_verification` showing how reviewer confirmed the finding

### BR-004 Compliance
- All issues classified with severity: major, minor
- Severity based on impact and quality-gate.md definitions
- `must_fix` empty = no blockers, approval possible

### BR-006 Governance Check
- No governance document changes required
- Code follows established patterns
- No role boundary or workflow changes

### BR-007 Honest Disclosure
- `review_coverage` section explicitly lists what was NOT reviewed
- Assumptions documented for transparency