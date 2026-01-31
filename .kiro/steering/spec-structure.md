---
inclusion: manual
---

# Spec Structure & Naming Convention

## Folder Naming Pattern

```
.kiro/specs/v{X}.{Y}[-{feature-name}]/
```

### Version Components

| Component | Meaning | Example |
|-----------|---------|---------|
| `X` | Major backbone feature | `0`, `1`, `2` |
| `Y` | Sub-feature or branch | `1`, `2`, `3` |
| `feature-name` | Descriptive kebab-case (optional) | `foundation`, `expense-capture` |

### Numbering Rules

1. **X (Backbone)**: Major feature milestones
   - `v0.x` = Pre-MVP development
   - `v1.x` = MVP release features
   - `v2.x` = Post-MVP enhancements

2. **Y (Branch)**: Sub-features within a backbone
   - `.1` = First feature in backbone
   - `.2` = Second feature, etc.
   - `.1.1`, `.1.2` = Branches off `.1` (use sparingly)

### Examples

```
.kiro/specs/
├── v0.1-foundation/           # Backbone 0, Feature 1: Setup
├── v0.2-expense-capture/      # Backbone 0, Feature 2: Core capture
├── v0.3-receipt-photo/        # Backbone 0, Feature 3: Photos
├── v0.3.1-ocr-integration/    # Branch of v0.3: OCR addition
├── v0.4-job-linking/          # Backbone 0, Feature 4: Jobs
├── v0.5-offline-support/      # Backbone 0, Feature 5: Offline
├── v0.6-history-view/         # Backbone 0, Feature 6: History
├── v1.0-mvp-release/          # Backbone 1: MVP milestone
├── v1.1-bulk-upload/          # Backbone 1, Feature 1: Enhancement
└── v1.2-export-reports/       # Backbone 1, Feature 2: Enhancement
```

## When to Branch (Y.Z)

Use `.Y.Z` pattern when:
- Adding to an existing feature (e.g., OCR to receipt photo)
- Fixing/enhancing a specific feature
- Feature depends directly on parent

**Good branching:**
```
v0.3-receipt-photo/
v0.3.1-ocr-integration/     ✅ OCR extends receipt photo
v0.3.2-image-editing/       ✅ Editing extends receipt photo
```

**Avoid deep nesting:**
```
v0.3.1.1-something/         ❌ Too deep, hard to track
```

## Spec File Structure

Each spec folder contains exactly 3 files:

```
v0.X-feature-name/
├── requirements.md    # WHAT: User stories, acceptance criteria
├── design.md          # HOW: Technical design, architecture
└── tasks.md           # DO: Implementation checklist
```

### requirements.md Template

```markdown
# v0.X Feature Name - Requirements

## Overview
One paragraph describing the feature purpose.

## User Stories

### US-1: [Story Title]
As a [role], I want to [action] so that [benefit].

#### Acceptance Criteria
- [ ] AC-1.1: [Specific, testable criterion]
- [ ] AC-1.2: [Specific, testable criterion]

## Business Rules
- BR-1: [Rule description]

## Out of Scope
- [What this does NOT include]

## Dependencies
- [Other specs or systems required]
```

### design.md Template

```markdown
# v0.X Feature Name - Technical Design

## Overview
Technical approach summary.

## Architecture
- Components, data flow, integrations

## Data Model
- New tables, schema changes

## API Design
- Endpoints, request/response

## Security
- Auth, RLS, validation

## Testing Strategy
- Unit, integration, E2E approach
```

### tasks.md Template

```markdown
# v0.X Feature Name - Tasks

## Prerequisites
- [ ] Required before starting

## Tasks

### Phase 1: [Phase Name]
- [ ] 1.1 [Specific task]
- [ ] 1.2 [Specific task]

### Phase 2: [Phase Name]
- [ ] 2.1 [Specific task]

## Verification
- [ ] All acceptance criteria met
- [ ] Tests passing
```

## Task Status Markers

| Marker | Status | Meaning |
|--------|--------|---------|
| `[ ]` | Not started | Ready to work on |
| `[-]` | In progress | Currently being worked on |
| `[x]` | Completed | Done and verified |
| `[~]` | Blocked | Waiting on dependency |
| `[!]` | Needs review | Done but needs verification |

## Best Practices

### DO ✅
- Keep spec names short but descriptive
- One feature per spec folder
- Update tasks.md as you progress
- Link related specs in dependencies
- Use consistent numbering

### DON'T ❌
- Create deeply nested versions (v0.1.1.1)
- Put multiple features in one spec
- Skip the requirements phase
- Leave stale specs without updating
- Mix unrelated features in branches

## Cross-Referencing

Reference other specs using relative paths:

```markdown
## Dependencies
- [v0.1 Foundation](../v0.1-foundation/requirements.md) - Auth required
- [v0.3 Receipt Photo](../v0.3-receipt-photo/design.md) - Image handling
```

## Changelog Integration

When completing a spec:

1. Update `tasks.md` with `[x]` markers
2. Add entry to root `CHANGELOG.md`:
   ```markdown
   ## [Unreleased]
   
   ### Added
   - v0.2 Expense Capture: Basic expense entry form (#spec-v0.2)
   ```
3. Update `.kiro/steering/project-context.md` Recent Changes (one line only)

## Recommended Workflow

```
1. Create spec folder: v0.X-feature-name/
2. Write requirements.md first (get approval)
3. Write design.md (technical planning)
4. Write tasks.md (implementation plan)
5. Execute tasks, updating status
6. Update CHANGELOG.md on completion
7. Archive or mark spec as complete
```
