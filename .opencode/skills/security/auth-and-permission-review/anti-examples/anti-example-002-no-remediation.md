# Anti-Example 002: No Remediation

## Document Status
- **Skill**: auth-and-permission-review
- **Anti-Pattern**: AP-004
- **Created**: 2026-03-27

---

## What Went Wrong

A security reviewer identified a valid vulnerability but provided no remediation guidance, leaving developer unable to fix.

### Bad Output

```yaml
security_review_report:
  scope: "Authorization checks on user management endpoints"
  findings:
    - id: SEC-001
      severity: high
      category: authorization
      title: "Missing Authorization on Delete Endpoint"
      description: "DELETE /users/:id endpoint lacks authorization check"
      location:
        file: "src/controllers/UserController.ts"
        line_start: 45
        line_end: 48
      vulnerability:
        type: "Missing Authorization"
        cwe: "CWE-862"
        owasp: "A01:2021 - Broken Access Control"
      impact:
        description: "Any authenticated user can delete any other user"
      # No remediation section
      # Developer doesn't know how to fix
  risk_assessment: high
  gate_decision:
    decision: needs-fix
```

---

## Why It's a Problem

### BR Violation: BR-001 (Security Must Be Actionable)

1. **Developer cannot fix**: Without remediation, developer must research solution
2. **Inconsistent fixes**: Different developers may implement different approaches
3. **Delays resolution**: Developer needs to consult documentation or colleagues
4. **Quality risk**: Fix may be incomplete or introduce new issues

### Real-World Impact

Developer response:
> "I know there's a missing auth check, but what guard should I use? Where do I add it? What role should be required?"

Without guidance, developer might:
- Add wrong guard (not role-based)
- Add check at wrong layer (service vs controller)
- Use wrong role (admin vs moderator)
- Skip edge cases (self-deletion)

---

## Correct Approach

### Good Output

```yaml
security_review_report:
  scope: "Authorization checks on user management endpoints"
  findings:
    - id: SEC-001
      severity: high
      category: authorization
      title: "Missing Authorization on Delete Endpoint"
      description: "DELETE /users/:id endpoint lacks role-based authorization check"
      location:
        file: "src/controllers/UserController.ts"
        line_start: 45
        line_end: 48
      vulnerability:
        type: "Missing Authorization"
        cwe: "CWE-862"
        owasp: "A01:2021 - Broken Access Control"
      impact:
        description: "Any authenticated user can delete any other user"
        exploit_scenario: |
          1. Regular user authenticates with valid credentials
          2. User sends DELETE request to /users/admin-id
          3. Server processes deletion without authorization check
          4. Admin account is deleted
      remediation:
        recommendation: "Add admin-only authorization guard to delete endpoint"
        code_example: |
          // Before (BAD):
          @Delete(':id')
          async deleteUser(@Param('id') id: string) {
            await this.userService.delete(id)
          }
          
          // After (GOOD):
          @Delete(':id')
          @Roles('admin')                    // Require admin role
          @UseGuards(RolesGuard)             // Apply role guard
          async deleteUser(@Param('id') id: string) {
            // Optional: Prevent self-deletion
            const currentUser = this.authService.getCurrentUser()
            if (currentUser.id === id) {
              throw new BadRequestException('Cannot delete self')
            }
            await this.userService.delete(id)
          }
        effort: quick
        priority: immediate
        notes: "Consider adding self-deletion prevention as secondary check"
  risk_assessment: high
  gate_decision:
    decision: needs-fix
    conditions:
      - "SEC-001: Add authorization guard before deployment"
  recommendations:
    must_fix:
      - "SEC-001: Missing authorization on DELETE endpoint"
```

---

## Key Differences

| Aspect | Bad Output | Good Output |
|--------|------------|-------------|
| Remediation | Missing | Complete section |
| Code Example | Missing | Before/After comparison |
| Effort | Missing | quick |
| Priority | Missing | immediate |
| Notes | Missing | Edge case consideration |

---

## Remediation Template

For all high/critical findings, include:

```yaml
remediation:
  recommendation: "Clear description of fix"
  code_example: |
    // Before: vulnerable code
    // After: secure code
  effort: quick | moderate | complex
  priority: immediate | high | normal
  notes: "Optional implementation considerations"
```

---

## Detection Checklist

When reviewing your own output:

- [ ] Every high/critical finding has `remediation.recommendation`
- [ ] Every high/critical finding has `remediation.code_example`
- [ ] Code example shows before/after
- [ ] `remediation.effort` is estimated
- [ ] `remediation.priority` is set

---

## How to Fix This Anti-Pattern

1. **Always include remediation**: Required for all non-info findings
2. **Provide code example**: Show exact fix implementation
3. **Estimate effort**: Help developer plan fix time
4. **Set priority**: Clarify urgency
5. **Add notes**: Include edge cases or alternatives

---

## Related Anti-Patterns

- **AP-001**: Vague warning (no location either)
- **AP-003**: False positive without evidence

This anti-pattern is specifically about missing remediation when other fields are complete.

---

## References

- `specs/008-security-core/spec.md` Section 10 - AP-004 definition
- `specs/008-security-core/spec.md` BR-001 - Security Must Be Actionable
- `specs/008-security-core/validation/anti-pattern-guidance.md` - AP-004 section
- `specs/008-security-core/validation/finding-quality-checklist.md` - F-004 check

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-27 | Initial anti-example |