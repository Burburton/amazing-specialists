# Dependency Risk Review Validation Checklist

> **Standalone checklist for quick reference.** For detailed guidance, see `../SKILL.md`.

---

## Pre-Review Checklist

- [ ] Identify dependency manifest files in changed_files
- [ ] Parse package.json/requirements.txt/go.mod/pom.xml
- [ ] Identify new/updated dependencies
- [ ] Prepare vulnerability scanning tools
- [ ] Prepare license scanning tools

---

## Dependency Categories Checklist

### 1. Known Vulnerabilities (已知漏洞)
- [ ] Run npm audit / pip-audit / go list -m -vulnerabilities
- [ ] Query CVE database (NVD, GitHub Advisory)
- [ ] Check Snyk vulnerability database
- [ ] Identify critical/high CVEs
- [ ] Determine exploitability in context

### 2. Maintenance Status (维护状态)
- [ ] Check package last update date
- [ ] Check if package is deprecated
- [ ] Check maintainer activity
- [ ] Check issue response rate
- [ ] Check download statistics

### 3. License Compliance (许可证合规)
- [ ] Identify license type for each package
- [ ] Check SPDX license identifier
- [ ] Check against organization policy
- [ ] Identify GPL/AGPL risks
- [ ] Check license conflicts

### 4. Supply Chain Security (供应链安全)
- [ ] Verify package source (official registry)
- [ ] Check package signature
- [ ] Verify publisher identity
- [ ] Check dependency tree depth
- [ ] Check for typosquatting risk

### 5. Version Status (版本状态)
- [ ] Compare against latest stable version
- [ ] Check for major version gap
- [ ] Check for security-relevant updates
- [ ] Assess upgrade complexity

---

## Finding Quality Checklist

### Required Fields per Vulnerability Finding
- [ ] `id` - Unique identifier (DEP-XXX)
- [ ] `severity` - critical | high | medium | low | info
- [ ] `category` - known_vulnerability | maintenance_status | license_compliance | supply_chain | version_outdated
- [ ] `title` - Specific and actionable
- [ ] `description` - Detailed explanation
- [ ] `dependency.name` - Package name
- [ ] `dependency.version` - Current version
- [ ] `dependency.type` - production | development | peer
- [ ] `vulnerability.cve` - CVE identifier (if applicable)
- [ ] `vulnerability.cvss_score` - CVSS score (if applicable)
- [ ] `vulnerability.affected_versions` - Affected version range
- [ ] `vulnerability.fixed_versions` - Fixed version range
- [ ] `impact.description` - Impact assessment
- [ ] `remediation.recommendation` - Fix guidance
- [ ] `remediation.secure_version` - Recommended version
- [ ] `remediation.migration_effort` - quick | moderate | extensive
- [ ] `remediation.priority` - immediate | soon | scheduled | later

### Required Fields per License Finding
- [ ] `license.type` - License name
- [ ] `license.spdx_id` - SPDX identifier
- [ ] `license.compliant` - true | false
- [ ] `license.risk_level` - high | medium | low

---

## Severity Classification

| Severity | Definition | Action |
|----------|------------|--------|
| **critical** | Critical CVE (CVSS >= 9.0), production dependency | `must_fix`, block |
| **high** | High CVE (CVSS >= 7.0), deprecated package | `must_fix`, block |
| **medium** | Medium CVE, license issue, outdated major | `should_fix`, warn |
| **low** | Low CVE, minor version outdated | `consider`, pass |
| **info** | Recommendation, no current issue | Notes, pass |

### Critical Examples
- CVE with CVSS 9+ in production dependency
- RCE vulnerability in widely used package
- Active exploit in the wild

### High Examples
- CVE with CVSS 7+ in production dependency
- Deprecated package with no alternative
- GPL license in proprietary project

### Medium Examples
- CVE with CVSS 4+ in development dependency
- License requiring attribution
- Major version outdated (security updates missed)

### Low Examples
- Low severity CVE with limited exploitability
- Minor version outdated
- License with minor conditions

---

## Gate Decision Rules

```
┌─────────────────────────────────────────────────────────────┐
│               DEPENDENCY REVIEW DECISION TREE                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Are there critical CVEs (CVSS >= 9)?                       │
│       │                                                      │
│       ├── YES → BLOCK                                        │
│       │          Immediate upgrade required                  │
│       │                                                      │
│       └── NO ──┐                                            │
│                │                                             │
│                ▼                                             │
│  Are there high CVEs or deprecated packages?                │
│       │                                                      │
│       ├── YES → BLOCK                                        │
│       │          Fix before deployment                       │
│       │                                                      │
│       └── NO ──┐                                            │
│                │                                             │
│                ▼                                             │
│  Are there medium findings (CVE/License/Outdated)?          │
│       │                                                      │
│       ├── YES → NEEDS-FIX                                    │
│       │          Recommendations for improvement             │
│       │                                                      │
│       └── NO ──┐                                            │
│                │                                             │
│                ▼                                             │
│  Are there low/info findings?                                │
│       │                                                      │
│       ├── YES → PASS                                         │
│       │          Consider suggestions                        │
│       │                                                      │
│       └── NO ──→ PASS                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Scanning Tools Reference

### npm Ecosystem
```bash
# Vulnerability scan
npm audit

# JSON output
npm audit --json

# License scan
npx license-checker --summary

# Outdated check
npm outdated
```

### Python Ecosystem
```bash
# Vulnerability scan
pip-audit -r requirements.txt

# Safety check
safety check -r requirements.txt

# License scan
pip-licenses --format=json
```

### Go Ecosystem
```bash
# Vulnerability scan
go list -m -vulnerabilities all

# Govulncheck
govulncheck ./...
```

### Java/Maven Ecosystem
```bash
# OWASP Dependency Check
dependency-check-maven

# License scan
license:aggregate-download-licenses
```

---

## License Risk Assessment

### License Types Risk Level
| License | Risk Level | Notes |
|---------|------------|-------|
| MIT | Low | Permissive, minimal conditions |
| Apache-2.0 | Low | Permissive, patent grant |
| BSD-2/3-Clause | Low | Permissive |
| ISC | Low | Permissive |
| LGPL | Medium | Lesser GPL, some conditions |
| GPL-2.0/3.0 | High | Copyleft, derivative works GPL |
| AGPL | High | Network copyleft |
| SSPL | High | MongoDB-style, restrictive |
| Unknown | High | Legal review required |
| Proprietary | Critical | Requires license purchase |

### License Compliance Actions
| Risk Level | Action |
|------------|--------|
| Low | Document in dependency list |
| Medium | Legal review, consider alternative |
| High | Must replace or get legal approval |
| Critical | Cannot use without license |

---

## Dependency Summary Required Fields

- [ ] `total_dependencies` - Count of all dependencies
- [ ] `production_dependencies` - Production dependency count
- [ ] `development_dependencies` - Dev dependency count
- [ ] `vulnerable_count` - Packages with CVEs
- [ ] `deprecated_count` - Deprecated packages
- [ ] `license_issues` - License compliance issues

---

## Post-Review Checklist

- [ ] All dependency categories reviewed
- [ ] All findings have required fields
- [ ] CVEs properly classified by severity
- [ ] Secure versions recommended
- [ ] Alternatives suggested for deprecated packages
- [ ] License compliance checked
- [ ] Gate decision made
- [ ] Follow-up actions specified

---

## Anti-Patterns to Avoid

| Anti-Pattern | Warning Sign | Fix |
|--------------|--------------|-----|
| **Vague vulnerability** | "has security issues" | Add CVE number and CVSS |
| **Missing CVSS** | No severity score | Add cvss_score field |
| **No secure version** | Finding without fix | Add secure_version |
| **Missing license check** | Only vulnerabilities | Add license section |
| **No alternative** | Deprecated without replacement | Add alternatives section |
| **Missing gate decision** | No decision field | Add gate_decision |

---

## Related Resources

- **Full Skill**: `../SKILL.md`
- **Examples**: `../examples/`
- **Anti-Examples**: `../anti-examples/`
- **Quality Gate**: `quality-gate.md` Section 3.5
- **Governance**: `role-definition.md` (security role)
- **CVE Database**: https://nvd.nist.gov/
- **GitHub Advisory**: https://github.com/advisories