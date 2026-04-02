# Vite + React + TypeScript Plugin

Tech stack adapter for Vite + React + TypeScript projects.

## Features

- **vite-setup** - Vite + Vitest + TypeScript configuration guidance
- **css-module-test** - CSS Module testing patterns
- **run-tests** - Execute tests via `npm test`
- **run-build** - Build for production via `npm run build`

## Installation

```bash
node plugins/loader.js install vite-react-ts --project ./my-project
```

## Templates

| Template | Purpose |
|----------|---------|
| `tsconfig.app.json` | Application code TypeScript config |
| `tsconfig.node.json` | Node/Vite tooling TypeScript config |
| `tsconfig.test.json` | Test environment TypeScript config |
| `vite-env.d.ts` | Vite type declarations |
| `vite.config.ts` | Vite configuration template |

## Platform Mapping

Plugin can extend role-to-skill mappings per platform via `platform_mapping` field in `plugin.json`:

```json
{
  "platform_mapping": {
    "opencode": {
      "tester": {
        "additional_skills": ["run-tests", "run-build"]
      }
    }
  }
}
```

This adds `run-tests` and `run-build` skills to the tester role when running on OpenCode platform.

## Hooks

- **docstring-exclusions** - Exclude triple-slash directives from docstring policy

## See Also

- [plugins/PLUGIN-SPEC.md](../PLUGIN-SPEC.md) - Plugin specification
- [docs/plugin-usage-guide.md](../../docs/plugin-usage-guide.md) - Usage guide