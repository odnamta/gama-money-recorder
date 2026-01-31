# GAMA Money Recorder - Kiro Agent Setup

This directory contains Kiro agent configuration for the GAMA Money Recorder PWA.

## Directory Structure

```
.kiro/
├── README.md                 # This file
├── steering/                 # Agent steering files
│   ├── general.md           # Code conventions (always included)
│   ├── project-context.md   # Project overview (always included)
│   ├── database-schema.md   # Database schema (always included)
│   ├── formatting-standards.md  # Formatting rules (always included)
│   └── spec-structure.md    # Spec naming convention (manual)
├── hooks/                    # Agent hooks
│   ├── update-project-context.json  # Auto-update docs
│   └── update-database-schema.json  # Sync schema on type changes
└── specs/                    # Feature specifications
    ├── v0.1-foundation/      # Project setup, auth, navigation
    ├── v0.2-expense-capture/ # Basic expense entry
    ├── v0.3-receipt-photo/   # Receipt photo capture
    ├── v0.3.1-ocr-integration/  # OCR auto-extraction
    ├── v0.4-job-linking/     # Link to job orders
    ├── v0.5-offline-support/ # IndexedDB and sync
    └── v0.6-history-view/    # Expense history
```

## Steering Files

### Always Included
- `general.md` - Code conventions, patterns, DO/DON'T rules
- `project-context.md` - Project overview, tech stack, workflows
- `database-schema.md` - Database tables, RLS policies, queries
- `formatting-standards.md` - Currency, date, number formatting

### Manual Inclusion
- `spec-structure.md` - Reference for spec naming conventions

## Agent Hooks

### update-project-context
Triggers after agent stops to:
- Add detailed entry to **CHANGELOG.md** (source of truth)
- Update **project-context.md** with ONE LINE summary only
- Keep project-context.md minimal, avoid bloat

### update-database-schema
Triggers when `types/supabase.ts` is modified to:
- Sync **database-schema.md** with new types
- Add schema change entry to **CHANGELOG.md**
- Update SQL, TypeScript interfaces, and query patterns

## Specs

Each spec folder follows the `v{X}.{Y}[-feature-name]` pattern:

| Component | Meaning |
|-----------|---------|
| `X` | Backbone feature (major milestone) |
| `Y` | Sub-feature or branch |
| `Y.Z` | Branch off Y (e.g., OCR extends receipt photo) |

### Current Specs
```
v0.1-foundation/        # Setup, auth, PWA, navigation
v0.2-expense-capture/   # Manual expense entry form
v0.3-receipt-photo/     # Camera capture, compression, upload
v0.3.1-ocr-integration/ # OCR (branches from v0.3)
v0.4-job-linking/       # Job order search, GPS validation
v0.5-offline-support/   # Dexie.js, IndexedDB, sync queue
v0.6-history-view/      # Expense list, filters, detail view
```

Each spec contains:
- `requirements.md` - User stories and acceptance criteria
- `design.md` - Technical design and architecture
- `tasks.md` - Implementation task list

## Quick Start

1. **Start with Foundation**
   ```
   Open .kiro/specs/v0.1-foundation/tasks.md
   Execute tasks in order
   ```

2. **Check Project Context**
   ```
   Review .kiro/steering/project-context.md for:
   - Tech stack details
   - Key commands
   - Current sprint status
   ```

3. **Follow Code Conventions**
   ```
   Reference .kiro/steering/general.md for:
   - File structure
   - Naming conventions
   - Supabase patterns
   - Component patterns
   ```

## Integration with GAMA ERP

This app connects to the shared Supabase project:
- **Project ID**: `ljbkjtaowrdddvjhsygj`
- **Auth**: Google OAuth (@gama-group.co)

Referenced tables from GAMA ERP:
- `bkk_records` - Expense drafts (write)
- `job_orders` - Job linking (read)
- `vendors` - Vendor matching (read/write)
- `user_profiles` - Auth/roles (read)
- `employees` - Employee mapping (read)

## Support

For questions about this setup, refer to:
- Steering files for conventions
- Spec files for feature details
- CHANGELOG.md for version history
