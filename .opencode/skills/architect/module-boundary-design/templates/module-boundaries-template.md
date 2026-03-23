# Module Boundaries Template

**Artifact Type**: `module-boundaries`  
**Contract**: `specs/003-architect-core/contracts/module-boundaries-contract.md`  
**Producer**: `architect`  
**Consumers**: `developer`, `tester`, `reviewer`, `security`

---

## module_list

| Name | Description |
|------|-------------|
| [ModuleA] | [One-sentence description] |
| [ModuleB] | [One-sentence description] |
| [ModuleC] | [One-sentence description] |

---

## module_responsibilities

### [ModuleA]

**Primary Responsibility**: [Single responsibility statement]

**Scope**:
- [Responsibility 1]
- [Responsibility 2]

**Non-Responsibilities**:
- [What it does NOT do]
- [What it does NOT do]

---

### [ModuleB]

**Primary Responsibility**: [Single responsibility statement]

**Scope**:
- [Responsibility 1]
- [Responsibility 2]

**Non-Responsibilities**:
- [What it does NOT do]

---

## inputs_outputs

### [ModuleA]

**Inputs**:
| Name | Type | Source | Description |
|------|------|--------|-------------|
| [input1] | [type] | [source module] | [description] |

**Outputs**:
| Name | Type | Destination | Description |
|------|------|--------------|-------------|
| [output1] | [type] | [dest module] | [description] |

---

## dependency_directions

| From | To | Type | Reason | Direction |
|------|-----|------|--------|-----------|
| [ModuleA] | [ModuleB] | required/optional | [why] | downstream/upstream |

---

## dependency_graph

```
[ModuleA] -> [ModuleB]
[ModuleB] -> [ModuleC]
[ModuleA] -> [ModuleC]
```

---

## integration_seams

| Seam ID | Modules Involved | Integration Type | Description | Stability |
|---------|------------------|------------------|-------------|-----------|
| IS-001 | [ModuleA], [ModuleB] | api/event/data/protocol | [description] | stable/evolving |

---

## future_extension_boundary

| Extension Point | Module | What Can Extend | What Must Remain Stable | Extension Mechanism |
|-----------------|--------|-----------------|------------------------|---------------------|
| [extension] | [module] | [what] | [stable interface] | plugin/inheritance/composition/config |

---

## explicit_non_responsibilities

| Module | Does NOT Do | Rationale |
|--------|-------------|-----------|
| [ModuleA] | [exclusion] | [why] |
| [ModuleB] | [exclusion] | [why] |

---

## cross_cutting_concerns

| Concern | Modules | Solution |
|---------|---------|----------|
| [Logging/Security/etc.] | [list] | [approach] |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | YYYY-MM-DD | Initial creation |