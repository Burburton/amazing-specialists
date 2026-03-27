# Example 003: Path Traversal

## Scenario Description

A developer has implemented a file download feature that allows users to download files by specifying a filename. The feature reads files from a directory and returns them to the user. Security review is triggered because the task involves file path handling.

## Input Context

### Implementation Summary (from developer)

```yaml
implementation_summary:
  goal_alignment:
    goal: "Implement file download feature"
    achieved: true
  changed_files:
    - path: "src/controllers/FileController.ts"
      change_type: "added"
      description: "File download endpoint"
    - path: "src/services/FileService.ts"
      change_type: "added"
      description: "File reading service"
```

### Task Risk Level: `high`

File path handling with user input requires mandatory security review.

## Step-by-Step Skill Application

### Step 1: Identify Input Sources

Inputs identified:
- `GET /api/files?filename=` - Filename query parameter

### Step 2: Trace Data Flow

```
query_param.filename → FileController.download() → FileService.readFile() → fs.readFileSync()
```

### Step 3: Check Input Validation

Finding: No validation on filename parameter ❌

### Step 4: Check Path Handling

Finding: No path traversal prevention ❌

### Step 5: Check File Access Control

Finding: No file whitelist ❌

### Step 6: Generate Report

## Output Artifact

```yaml
input_validation_review_report:
  dispatch_id: "dispatch_008_005"
  task_id: "T-008-005"
  created_at: "2026-03-27T17:00:00Z"
  created_by: "security"
  
  scope:
    inputs_reviewed:
      - source: "GET /api/files"
        type: "query_param"
        parameters: ["filename"]
        description: "File download endpoint - filename parameter"
    
    data_flows_traced:
      - from: "query_param.filename"
        to: "filesystem"
        description: "Filename parameter used directly to construct file path"
    
    review_type: "full"
  
  findings:
    - id: "VAL-003"
      severity: "high"
      category: "path_traversal"
      
      title: "Path Traversal in File Download"
      description: |
        The filename query parameter is used directly to construct file paths 
        without validation, allowing attackers to access files outside the 
        intended directory using path traversal sequences.
      
      input:
        source: "GET /api/files?filename="
        parameter: "filename"
        data_type: "string"
        
      vulnerability:
        type: "Path Traversal"
        cwe: "CWE-22"
        owasp: "A01:2021 - Broken Access Control"
        description: "User input used to construct file path without validation"
        
      vulnerable_code:
        location: "src/services/FileService.ts:12"
        snippet: |
          // FileService.ts:12-14
          async readFile(filename: string) {
            const filePath = `./uploads/${filename}`
            return fs.readFileSync(filePath)
          }
          
      exploit_scenario:
        payload: "../../../etc/passwd"
        steps:
          - "Attacker sends GET /api/files?filename=../../../etc/passwd"
          - "Path becomes: ./uploads/../../../etc/passwd"
          - "Path traversal resolves to: /etc/passwd"
          - "Server returns contents of /etc/passwd"
          - "Attacker can read any file the server process can access"
        impact: |
          Attacker can:
          - Read sensitive configuration files
          - Read application source code
          - Read environment files (.env)
          - Read system files (/etc/passwd, /etc/shadow)
          - Potentially read database credentials
          
      remediation:
        recommendation: "Validate filename against whitelist and use path.resolve with boundary check"
        secure_code_example: |
          import path from 'path'
          
          // Allowed files whitelist
          const ALLOWED_FILES = new Set([
            'report.pdf',
            'template.docx',
            'data.csv',
            'image.png'
          ])
          
          async readFile(filename: string) {
            // 1. Validate against whitelist
            if (!ALLOWED_FILES.has(filename)) {
              throw new ForbiddenError('File not allowed')
            }
            
            // 2. Resolve and check path boundaries
            const uploadsDir = path.resolve('./uploads')
            const filePath = path.resolve('./uploads', filename)
            
            // 3. Ensure resolved path is within uploads directory
            if (!filePath.startsWith(uploadsDir + path.sep)) {
              throw new ForbiddenError('Path traversal detected')
            }
            
            // 4. Check file exists
            if (!fs.existsSync(filePath)) {
              throw new NotFoundError('File not found')
            }
            
            return fs.readFileSync(filePath)
          }
        validation_rules:
          - rule: "Filename whitelist"
            pattern: "Only pre-approved filenames allowed"
          - rule: "Path boundary check"
            pattern: "Resolved path must start with uploads directory"
          - rule: "No path separators in filename"
            pattern: "Reject if filename contains / or \\"
        effort: "moderate"
        
  validation_coverage:
    total_inputs: 1
    validated_inputs: 0
    validation_rate: 0
    missing_validation:
      - "filename: No whitelist validation"
      - "filename: No path traversal check"
      - "filename: No path separator check"
    
  risk_assessment:
    overall_risk: "high"
    risk_factors:
      - factor: "Arbitrary file read possible"
        level: "high"
      - factor: "Potential credential exposure"
        level: "high"
    residual_risk: "Low after whitelist and boundary check implemented"
    
  gate_decision:
    decision: "block"
    conditions:
      - "VAL-003 must be fixed: Add whitelist and path boundary validation"
    blocking_findings: ["VAL-003"]
    
  recommendations:
    must_fix:
      - "Implement filename whitelist and path boundary check (VAL-003)"
    should_fix: []
    consider:
      - "Use file IDs instead of filenames in API"
      - "Store files outside web root"
      - "Implement file access logging"
```

## CWE/OWASP References

| Finding | CWE | OWASP |
|---------|-----|-------|
| VAL-003 | CWE-22: Path Traversal | A01:2021 - Broken Access Control |

## Gate Decision Rationale

**Decision: block**

- VAL-003 (high): Path traversal allows arbitrary file read
- Could expose sensitive configuration and credentials
- Must be fixed before any further work can proceed

## Key Learnings

1. **Never trust user input for file paths**: Always validate against whitelist
2. **Path.resolve + boundary check**: Essential for path traversal prevention
3. **Use file IDs, not filenames**: Abstracts storage from user input