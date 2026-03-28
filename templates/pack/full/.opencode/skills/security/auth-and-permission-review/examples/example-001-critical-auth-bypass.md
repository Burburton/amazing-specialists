# Example 001: Critical Auth Bypass

## Scenario Description

A developer has implemented a new authentication system with JWT tokens. The implementation includes a login endpoint, token generation, and token validation. Security review is triggered because the task involves authentication changes.

## Input Context

### Implementation Summary (from developer)

```yaml
implementation_summary:
  goal_alignment:
    goal: "Implement user authentication with JWT"
    achieved: true
  changed_files:
    - path: "src/services/AuthService.ts"
      change_type: "added"
      description: "Core authentication service"
    - path: "src/controllers/AuthController.ts"
      change_type: "added"
      description: "HTTP endpoints for auth"
    - path: "src/services/JwtTokenService.ts"
      change_type: "added"
      description: "JWT token generation and validation"
```

### Task Risk Level: `high`

Authentication-related changes require mandatory security review.

## Step-by-Step Skill Application

### Step 1: Identify Authentication Code

Reviewed files:
- `AuthService.ts` - Password verification, login logic
- `AuthController.ts` - HTTP endpoints
- `JwtTokenService.ts` - Token generation and validation

### Step 2: Check Credential Storage

Finding: Password uses bcrypt with appropriate cost factor ✅

### Step 3: Check Token Management

Finding: JWT secret is hardcoded ❌

### Step 4: Check Authorization

Finding: Delete user endpoint lacks authorization check ❌

### Step 5: Check Transport Security

Finding: HTTPS assumed (infrastructure level) ⚠️

### Step 6: Generate Report

## Output Artifact

```yaml
security_review_report:
  dispatch_id: "dispatch_008_001"
  task_id: "T-008-001"
  created_at: "2026-03-27T14:00:00Z"
  created_by: "security"
  
  scope:
    components_reviewed:
      - path: "src/services/AuthService.ts"
        type: "authentication"
        description: "Password verification and login logic"
      - path: "src/controllers/AuthController.ts"
        type: "authentication"
        description: "Login and user management endpoints"
      - path: "src/services/JwtTokenService.ts"
        type: "session"
        description: "JWT token generation and validation"
    auth_mechanisms:
      - "JWT-based authentication"
      - "Password-based authentication"
    permission_systems: []
    review_type: "full"
  
  findings:
    - id: "SEC-001"
      severity: "critical"
      category: "authentication"
      title: "JWT Secret Hardcoded in Source Code"
      description: |
        The JWT signing secret is hardcoded directly in the source code at line 12 
        of JwtTokenService.ts. This allows any attacker with code access to forge 
        arbitrary authentication tokens.
      
      location:
        file: "src/services/JwtTokenService.ts"
        line_start: 12
        line_end: 12
        
      vulnerability:
        type: "Hardcoded Credentials"
        cwe: "CWE-798"
        owasp: "A07:2021 - Identification and Authentication Failures"
        
      code_snippet: |
        // JwtTokenService.ts:12
        const JWT_SECRET = 'my-secret-key-12345'
        
      impact:
        description: "Attacker with code access can forge tokens for any user including administrators"
        exploit_scenario: |
          1. Attacker gains read access to code repository (insider threat, compromised CI, public repo)
          2. Extracts hardcoded JWT_SECRET value 'my-secret-key-12345'
          3. Crafts JWT payload: { "sub": "admin", "role": "admin" }
          4. Signs JWT with extracted secret
          5. Accesses system with full administrator privileges
        affected_users: "All users - complete authentication bypass possible"
        
      remediation:
        recommendation: "Move JWT secret to environment variable with validation on startup"
        code_example: |
          const JWT_SECRET = process.env.JWT_SECRET
          if (!JWT_SECRET) {
            throw new Error('FATAL: JWT_SECRET environment variable not set')
          }
          if (JWT_SECRET.length < 32) {
            throw new Error('FATAL: JWT_SECRET must be at least 32 characters')
          }
        effort: "quick"
        priority: "immediate"
        
    - id: "SEC-002"
      severity: "high"
      category: "authorization"
      title: "Missing Authorization Check on Delete User Endpoint"
      description: |
        The DELETE /users/:id endpoint does not verify that the requesting user 
        has administrator privileges. Any authenticated user can delete any other 
        user account.
      
      location:
        file: "src/controllers/AuthController.ts"
        line_start: 67
        line_end: 70
        
      vulnerability:
        type: "Missing Authorization"
        cwe: "CWE-862"
        owasp: "A01:2021 - Broken Access Control"
        
      code_snippet: |
        // AuthController.ts:67-70
        @Delete('/users/:id')
        async deleteUser(@Param('id') id: string) {
          await this.userService.delete(id)
        }
        
      impact:
        description: "Any authenticated user can delete any other user account including administrators"
        exploit_scenario: |
          1. Regular user authenticates to the system
          2. User enumerates user IDs through normal API usage
          3. User sends DELETE request to /users/admin-user-id
          4. Administrator account is deleted
          5. User can then create new admin account or escalate privileges
        affected_users: "All users - privilege escalation possible"
        
      remediation:
        recommendation: "Add role-based authorization guard requiring admin role"
        code_example: |
          @Delete('/users/:id')
          @Roles('admin')
          @UseGuards(RolesGuard)
          async deleteUser(
            @Param('id') id: string,
            @CurrentUser() user: User
          ) {
            // Optional: Prevent self-deletion
            if (user.id === id) {
              throw new BadRequestException('Cannot delete own account')
            }
            await this.userService.delete(id)
          }
        effort: "quick"
        priority: "immediate"
        
    - id: "SEC-003"
      severity: "medium"
      category: "session"
      title: "JWT Token Expiration Not Enforced"
      description: |
        JWT tokens are generated without an expiration time (exp claim), 
        meaning tokens remain valid indefinitely until the secret is rotated.
      
      location:
        file: "src/services/JwtTokenService.ts"
        line_start: 25
        line_end: 27
        
      vulnerability:
        type: "Missing Token Expiration"
        cwe: "CWE-613"
        owasp: "A07:2021 - Identification and Authentication Failures"
        
      code_snippet: |
        // JwtTokenService.ts:25-27
        generateToken(user: User) {
          return jwt.sign({ sub: user.id }, JWT_SECRET)
          // Missing: expiresIn option
        }
        
      impact:
        description: "Stolen tokens remain valid forever, no automatic session expiration"
        exploit_scenario: |
          1. Attacker steals JWT token via XSS or network sniffing
          2. Token has no expiration, remains valid indefinitely
          3. Attacker uses token at any time in the future
          4. Only mitigation is secret rotation which logs out all users
        affected_users: "All users with active sessions"
        
      remediation:
        recommendation: "Add expiration time to JWT token generation"
        code_example: |
          generateToken(user: User) {
            return jwt.sign(
              { sub: user.id, iat: Math.floor(Date.now() / 1000) },
              JWT_SECRET,
              { expiresIn: '24h' }  // 24-hour expiration
            )
          }
        effort: "quick"
        priority: "soon"
        
  risk_assessment:
    overall_risk: "critical"
    risk_factors:
      - factor: "Authentication bypass possible via hardcoded secret"
        level: "high"
      - factor: "Privilege escalation via missing authorization"
        level: "high"
      - factor: "Indefinite session duration"
        level: "medium"
    residual_risk: "None after all three findings are remediated"
    
  gate_decision:
    decision: "block"
    conditions:
      - "SEC-001 must be fixed: Move JWT secret to environment variable"
      - "SEC-002 must be fixed: Add admin role check to delete endpoint"
      - "SEC-003 should be fixed: Add token expiration"
    blocking_findings: ["SEC-001", "SEC-002"]
    
  recommendations:
    must_fix:
      - "Move JWT secret to environment variable (SEC-001)"
      - "Add authorization check to delete endpoint (SEC-002)"
    should_fix:
      - "Add JWT token expiration (SEC-003)"
    consider:
      - "Implement token refresh mechanism"
      - "Add rate limiting to login endpoint"
      - "Implement account lockout after failed attempts"
      
  follow_up:
    - item: "Security re-review required after fixes"
      owner: "security"
      due_date: "2026-03-28"
```

## CWE/OWASP References

| Finding | CWE | OWASP |
|---------|-----|-------|
| SEC-001 | CWE-798: Use of Hard-coded Credentials | A07:2021 - Identification and Authentication Failures |
| SEC-002 | CWE-862: Missing Authorization | A01:2021 - Broken Access Control |
| SEC-003 | CWE-613: Insufficient Session Expiration | A07:2021 - Identification and Authentication Failures |

## Gate Decision Rationale

**Decision: block**

- SEC-001 (critical): Hardcoded secret allows complete authentication bypass
- SEC-002 (high): Missing authorization allows privilege escalation
- Both findings must be fixed before any further work can proceed

## Key Learnings

1. **Always check secret management**: Hardcoded credentials are a critical vulnerability
2. **Verify authorization on sensitive operations**: Every write operation needs authorization
3. **Token expiration is essential**: Indefinite sessions increase attack window