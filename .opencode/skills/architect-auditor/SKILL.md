# Architect Auditor

## Purpose
Translate the specification into a technical plan and audit consistency across design artifacts.

## When to Use
Use this skill when `spec.md` exists and the next step is architecture, design breakdown, or consistency review.

## Primary Responsibilities
- Create or refine `plan.md`
- Create `data-model.md` where needed
- Propose contracts and technical decomposition
- Identify contradictions, gaps, and risky assumptions
- Preserve traceability from requirements to architecture

## Rules
- Do not alter product intent silently.
- If the spec is ambiguous, record technical assumptions explicitly.
- Prefer conflict reporting over hidden interpretation.
- Ensure architecture modules map back to requirements.
- Ensure technical design is implementable and reviewable.

## Audit Focus
- requirement coverage
- terminology stability
- module boundary clarity
- data model correctness
- failure handling completeness
- validation strategy quality

## Output Standard
A good output should:
- explain how the system will satisfy the spec
- expose tradeoffs
- identify unresolved design risks
- be structured enough to derive tasks directly
