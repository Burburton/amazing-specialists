# Example: Basic Build Execution

## Scenario

Developer completes implementation and needs to verify production build.

## Input

```yaml
dispatch_id: gh-issue-owner-repo-42
task_id: T-015
feature: user-authentication
```

## Command Execution

```bash
$ npm run build

> my-project@1.0.0 build
> vite build

vite v5.2.0 building for production...
✓ 42 modules transformed.
dist/index.html                    0.45 kB │ gzip: 0.30 kB
dist/assets/index-DWJQZQZJ.js    125.34 kB │ gzip: 42.12 kB
dist/assets/index-BXGQZQZJ.css    12.67 kB │ gzip: 3.45 kB
dist/assets/logo-ABC12345.svg      2.34 kB
✓ built in 5.23s
```

## Output

```yaml
build_report:
  status: success
  summary:
    build_time_ms: 5230
    output_dir: dist/
    assets_generated: 4
    total_size_bytes: 140800  # ~137.5 kB
    
  assets:
    - name: index.html
      size_bytes: 450
      type: asset
    - name: assets/index-DWJQZQZJ.js
      size_bytes: 125340
      type: js
    - name: assets/index-BXGQZQZJ.css
      size_bytes: 12670
      type: css
    - name: assets/logo-ABC12345.svg
      size_bytes: 2340
      type: asset
      
  errors: []
  warnings: []
      
  command_used: "npm run build"
  executed_at: "2026-04-02T00:35:00Z"
```

## Next Steps

1. Verify output files exist in dist/
2. Check bundle sizes are acceptable
3. Run tests to ensure build is correct