# GAMA Money Recorder - Project Context

## App Overview

**GAMA Money Recorder** is a Progressive Web App (PWA) satellite application for the GAMA ERP ecosystem. It enables field staff to quickly capture expenses with receipt photos and automatic OCR extraction, eliminating manual data entry.

### Key Value Propositions
- **Speed**: Capture expense in under 30 seconds
- **Accuracy**: OCR auto-extracts amount, vendor, date
- **Reliability**: Works offline with automatic sync
- **Integration**: Creates drafts directly in GAMA ERP

### Primary Users
| Role | Use Case |
|------|----------|
| Operations Staff | Capture expenses during shipments |
| Drivers | Log fuel, tolls, parking quickly |
| Finance Staff | Review and approve expense drafts |

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | App framework (App Router) |
| TypeScript | 5.x | Type safety (strict mode) |
| Supabase | Latest | Database, Auth, Storage |
| TailwindCSS | 3.x | Styling |
| shadcn/ui | Latest | UI components (new-york theme) |
| Dexie.js | 4.x | IndexedDB wrapper |
| next-pwa | Latest | PWA support |

### Supabase Project
- **Project ID**: `ljbkjtaowrdddvjhsygj`
- **Shared with**: GAMA ERP main system
- **Auth**: Google OAuth (`@gama-group.co` domain)

## Key Commands

```bash
# Development
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server

# Database
pnpm db:types         # Generate Supabase types
pnpm db:migrate       # Run migrations (via Supabase CLI)

# Testing
pnpm test             # Run tests
pnpm test:e2e         # E2E tests with Playwright

# Linting
pnpm lint             # ESLint check
pnpm lint:fix         # Auto-fix lint issues
pnpm typecheck        # TypeScript check
```

## Integration with GAMA ERP

### Referenced Tables (Read/Write)
| Table | Access | Purpose |
|-------|--------|---------|
| `bkk_records` | Write | Create expense drafts for approval |
| `job_orders` | Read | Link expenses to active jobs |
| `vendors` | Read/Write | Match or create vendor records |
| `user_profiles` | Read | Auth and role checking |
| `employees` | Read | Map expenses to employee |

### New Tables (This App)
| Table | Purpose |
|-------|---------|
| `expense_drafts` | Pending expenses captured in app |
| `expense_receipts` | Receipt images and OCR data |
| `expense_sync_queue` | Offline sync tracking |

### Storage Buckets
- `expense-receipts` - Receipt images (private, RLS protected)

## User Roles & Access

| Role | Capture | View Own | View Team | Approve | Admin |
|------|---------|----------|-----------|---------|-------|
| owner | ✅ | ✅ | ✅ | ✅ | ✅ |
| director | ✅ | ✅ | ✅ | ✅ | ✅ |
| finance_manager | ✅ | ✅ | ✅ | ✅ | ❌ |
| finance | ✅ | ✅ | ✅ | ❌ | ❌ |
| operations_manager | ✅ | ✅ | ✅ | ❌ | ❌ |
| ops | ✅ | ✅ | ❌ | ❌ | ❌ |
| operations | ✅ | ✅ | ❌ | ❌ | ❌ |
| engineer | ✅ | ✅ | ❌ | ❌ | ❌ |

## Key Workflows

### 1. Expense Capture Flow
```
[Open App] → [Tap "Capture"] → [Take Photo] → [OCR Processing]
    ↓
[Review Extracted Data] → [Select Category] → [Link Job Order]
    ↓
[Save Locally] → [Queue for Sync] → [Sync to Supabase]
    ↓
[Create bkk_records draft] → [Notify Finance]
```

### 2. Offline Sync Flow
```
[User Captures Expense] → [Save to IndexedDB] → [Add to Sync Queue]
    ↓
[Network Available?]
    ├─ Yes → [Process Queue] → [Upload to Supabase] → [Mark Synced]
    └─ No  → [Keep in Queue] → [Retry on Reconnect]
    ↓
[Sync Failed?] → [Increment Retry] → [Flag if > 24 hours]
```

### 3. Receipt OCR Flow
```
[Capture Image] → [Compress to <1MB] → [Send to OCR Service]
    ↓
[Parse Response] → [Extract: Amount, Vendor, Date]
    ↓
[Confidence Check]
    ├─ ≥80% → [Auto-fill Form]
    └─ <80% → [Show Manual Review Prompt]
```

## Business Rules

1. **Receipt Required**: Expenses > Rp 500.000 must have receipt photo
2. **Job Linking**: All expenses must link to job order OR be marked as overhead
3. **OCR Review**: Confidence < 80% requires manual verification
4. **Sync Deadline**: Offline expenses must sync within 24 hours or flagged
5. **GPS Validation**: Location must be within 50km of job location (configurable)

## Current State

### Active Sprint
> Update this section when starting new work

- **Sprint**: Foundation Setup
- **Goal**: Project scaffolding, auth, basic navigation
- **Status**: Not started
- **Current Spec**: v0.1-foundation

### Recent Changes
> See [CHANGELOG.md](../../CHANGELOG.md) for full history

_No changes yet. Development starting soon._

<!-- 
Format: [YYYY-MM-DD] Brief one-line description
Example:
- [2024-01-15] v0.1 Foundation setup complete
- [2024-01-14] Initial project scaffolding
-->

## DO NOT Rules

1. **DO NOT** modify GAMA ERP tables directly (except `bkk_records` drafts)
2. **DO NOT** bypass RLS policies - always use authenticated clients
3. **DO NOT** store uncompressed images - always compress before save
4. **DO NOT** skip offline support - all features must work offline
5. **DO NOT** hardcode user IDs or roles - always fetch from auth
6. **DO NOT** create expenses without category selection
7. **DO NOT** allow sync without network validation
8. **DO NOT** ignore OCR confidence scores in UI

## Quick References

### Expense Categories
```typescript
type ExpenseCategory = 
  | 'fuel'      // BBM
  | 'toll'      // Tol
  | 'parking'   // Parkir
  | 'food'      // Makan
  | 'lodging'   // Penginapan
  | 'transport' // Transport lokal
  | 'supplies'  // Perlengkapan
  | 'other'     // Lainnya
```

### Sync Status
```typescript
type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed'
```

### Environment Variables
```bash
# Public (client-safe)
NEXT_PUBLIC_SUPABASE_URL=https://ljbkjtaowrdddvjhsygj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Server-only
SUPABASE_SERVICE_ROLE_KEY=<service-key>
GOOGLE_CLOUD_VISION_API_KEY=<api-key>  # If using Cloud Vision
```

### Key File Locations
| Purpose | Path |
|---------|------|
| Supabase server client | `src/lib/supabase/server.ts` |
| Supabase browser client | `src/lib/supabase/client.ts` |
| IndexedDB schema | `src/lib/db/schema.ts` |
| OCR processor | `src/lib/ocr/processor.ts` |
| Type definitions | `src/types/` |
| UI components | `src/components/ui/` |
