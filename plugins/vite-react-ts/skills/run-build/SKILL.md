# Skill: run-build

## Metadata
```yaml
plugin_id: vite-react-ts
plugin_version: 1.0.0
core_compatibility: >=1.0.0
```

## Purpose

Execute Vite production build and verify build success, enabling automated build verification in the expert pack workflow.

Core problems solved:
- Developer cannot verify build automatically
- Build errors not captured in structured format
- No integration between Plugin commands and Core skills

## When to Use

Must use when:
- developer role completes implementation
- Pre-deployment verification required
- CI/CD pipeline needs build step

Recommended when:
- After significant code changes
- Before creating PRs
- Verifying production readiness

## When Not to Use

Not applicable:
- Projects without build script configured
- Non-Vite projects (use appropriate plugin)
- Development mode testing (use run-tests)

## Implementation Process

### Step 1: Detect Build Command

Check for build command availability:

```javascript
// Read plugin.json commands config
const commands = require('../../../plugins/vite-react-ts/plugin.json').commands;

if (!commands.build) {
  throw new Error('Build command not configured in plugin.json');
}

const buildCmd = commands.build.cmd;     // "npm run build"
const buildEnv = commands.build.env;     // {}
```

Alternative: Check package.json directly:
```javascript
const pkg = require('./package.json');
const buildScript = pkg.scripts?.build;  // "vite build"
```

### Step 2: Execute Build

Run build command and capture output:

```bash
# Standard Vite build
npm run build

# With environment variables
NODE_ENV=production npm run build
```

**Execution handling**:
- Set timeout appropriately (default: 120000ms for large projects)
- Capture stdout and stderr
- Handle process exit codes
- Check for output directory

### Step 3: Check Build Result

Verify build success:

**Success indicators**:
- Exit code 0
- Output directory exists (dist/)
- No error messages in output
- Asset manifest generated

**Failure indicators**:
- Exit code non-zero
- Build errors in output
- Missing output directory
- TypeScript compilation errors

### Step 4: Generate Report

Output structured build report:

```yaml
build_report:
  status: success | failure | error
  
  summary:
    build_time_ms: number
    output_dir: string
    assets_generated: number
    total_size_bytes: number
    
  assets:
    - name: string
      size_bytes: number
      type: js | css | asset
      
  errors:
    - file: string
      line: number
      message: string
      
  warnings:
    - message: string
      
  command_used: string
  executed_at: timestamp
```

### Step 5: Error Handling

Handle common errors:

| Error | Cause | Resolution |
|-------|-------|------------|
| Build command not found | No build script | Add build script to package.json |
| TypeScript errors | Type mismatches | Fix type errors in source |
| Import errors | Missing dependencies | Install dependencies |
| Out of memory | Large bundle | Increase Node memory limit |

## Output Requirements

After execution, provide:

```yaml
execution_result:
  status: SUCCESS | FAILED | ERROR
  
  build_report:
    summary:
      build_time_ms: 5234
      output_dir: dist/
      assets_generated: 12
      total_size_bytes: 245780
      
  assets:
    - name: index.js
      size_bytes: 125000
      type: js
    - name: index.css
      size_bytes: 45000
      type: css
      
  raw_output: |
    (truncated build output)
    
  recommendations:
    - "Consider code splitting for large bundles"
    - "Enable gzip compression for assets"
```

## Examples

### Example 1: Successful Build

```bash
$ npm run build

> vite build

vite v5.0.0 building for production...
✓ 42 modules transformed.
dist/index.html                  0.45 kB
dist/assets/index-DWJQZQZJ.js  125.34 kB │ gzip: 42.12 kB
dist/assets/index-BXGQZQZJ.css   45.67 kB │ gzip: 12.34 kB
✓ built in 5.23s
```

**Result**:
```yaml
build_report:
  status: success
  summary:
    build_time_ms: 5230
    output_dir: dist/
    assets_generated: 3
```

### Example 2: Build with Errors

```bash
$ npm run build

> vite build

vite v5.0.0 building for production...
✓ 40 modules transformed.
✗ Build failed in 2.34s
error during build:
src/components/Button.tsx(15,10): error TS2322: Type 'string' is not assignable to type 'number'.
```

**Result**:
```yaml
build_report:
  status: failure
  errors:
    - file: src/components/Button.tsx
      line: 15
      message: Type 'string' is not assignable to type 'number'
```

### Example 3: Bundle Size Warning

```bash
$ npm run build

> vite build

vite v5.0.0 building for production...
(!) Some chunks are larger than 500 kB after minification.
  - dist/assets/vendor-DKJQZQZJ.js: 612.34 kB
  Consider:
  - Using dynamic imports for code splitting
  - Configure manual chunking
```

**Result**:
```yaml
build_report:
  status: success
  warnings:
    - "Chunk dist/assets/vendor-DKJQZQZJ.js exceeds 500 kB, consider code splitting"
```

## Checklists

### Pre-build
- [ ] Build command available in plugin.json or package.json
- [ ] Dependencies installed
- [ ] No TypeScript errors in IDE

### Build execution
- [ ] Command executed successfully
- [ ] Output captured
- [ ] Exit code recorded

### Post-build
- [ ] Output directory exists
- [ ] Assets generated
- [ ] No errors in output

## Common Failure Modes

| Failure Mode | Symptoms | Resolution |
|--------------|----------|------------|
| TypeScript error | Type mismatch | Fix type annotations |
| Module not found | Missing import | Check import paths, install deps |
| Build timeout | Process hangs | Increase timeout, check for infinite loops |
| Out of memory | JS heap out of memory | Increase Node memory: `NODE_OPTIONS="--max-old-space-size=4096"` |

## Notes

### Integration with developer workflow
This skill is typically called:
- After developer completes implementation
- Before tester runs verification
- As part of CI/CD pipeline

### Environment Variables
Common build environment variables:

| Variable | Purpose |
|----------|---------|
| `NODE_ENV=production` | Enable production mode |
| `NODE_OPTIONS=--max-old-space-size=4096` | Increase memory limit |
| `VITE_BUILD_VERSION=1.0.0` | Inject version number |

### Build Output Analysis
Check build output for:
- Bundle size optimization opportunities
- Unused code (tree-shaking effectiveness)
- Asset compression potential
- Chunk splitting improvements

### Related Skills
- `run-tests`: Execute test suite
- `vite-setup`: Configure Vite project
- `css-module-test`: CSS Module testing patterns