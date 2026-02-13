# GAMA Money Recorder - Satellite App

> **Sync Note**: Keep this file in sync with `.kiro/steering/project-context.md` for Kiro.
> **Part of**: `gama/` ecosystem (see `gama/CLAUDE.md`)

## Overview

- **Type**: PWA satellite app for GIS-ERP
- **Purpose**: Field expense capture with OCR and offline support
- **Owner**: Dio Atmando
- **GitHub**: `odnamta/gama-money-recorder`

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL) - shared with GAMA ERP
- **Auth**: Supabase Auth (Google OAuth, @gama-group.co domain)
- **Styling**: TailwindCSS + shadcn/ui (new-york theme)
- **Offline**: Dexie.js (IndexedDB wrapper)
- **PWA**: Serwist (next-pwa successor)
- **OCR**: Tesseract.js (client-side)

## Key Commands

```bash
# Development
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build (ALWAYS run before push)
pnpm lint             # ESLint check
pnpm typecheck        # TypeScript check

# Database types (run after schema changes)
pnpm db:types         # Generate Supabase types

# Deployment
git add . && git commit -m "message" && git push   # Triggers Vercel auto-deploy
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-required routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── capture/       # Expense capture flow
│   │   ├── history/       # Expense history
│   │   └── settings/      # User settings
│   ├── (public)/          # Public routes
│   │   └── login/         # Login page
│   └── api/               # API routes
│       └── ocr/           # OCR processing
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── atoms/             # Basic building blocks
│   ├── molecules/         # Composite components
│   ├── organisms/         # Complex components
│   ├── history/           # History view components
│   ├── job/               # Job linking components
│   ├── ocr/               # OCR status components
│   ├── offline/           # Offline/sync components
│   └── location/          # GPS/location components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── supabase/          # Supabase clients (server.ts, client.ts)
│   ├── db/                # Dexie.js IndexedDB (operations, sync-manager)
│   ├── ocr/               # OCR utilities (parser, tesseract-processor)
│   ├── image/             # Image compression/validation
│   ├── receipts/          # Receipt upload utilities
│   └── utils/             # Shared utilities (format-currency, format-date)
├── types/                 # TypeScript types
└── constants/             # App constants (expense-categories)
```

## Roles (8 total)

```
Executive Tier:
- owner           # Full access
- director        # Full operational access

Manager Tier:
- finance_manager # Finance, approvals
- operations_manager # Jobs, team expenses

Staff Tier:
- finance         # Finance tasks
- ops             # Operations (capture only)
- operations      # Operations (capture only)
- engineer        # Engineering (capture only)
```

## Critical Business Rules

1. **Receipt Required**: Expenses > Rp 500.000 must have receipt photo
2. **Job Linking**: All expenses must link to job order OR be marked as overhead
3. **OCR Review**: Confidence < 80% requires manual verification
4. **Sync Deadline**: Offline expenses must sync within 24 hours or flagged
5. **GPS Validation**: Location must be within 50km of job location
6. **Soft Delete**: Use `is_active = false`, never hard delete
7. **Currency**: All amounts in IDR (Indonesian Rupiah)

## Date & Currency Formatting (IMPORTANT)

Always use centralized formatters from `lib/utils/`:

```typescript
import { formatCurrency } from '@/lib/utils/format-currency'
import { formatDate } from '@/lib/utils/format-date'

// Currency
formatCurrency(50000)                    // "Rp 50.000"
formatCurrency(1500000, { compact: true }) // "Rp 1.5 jt"

// Dates
formatDate(date, 'short')    // "15/01/26"
formatDate(date, 'medium')   // "15 Jan 2026"
formatDate(date, 'long')     // "Senin, 15 Januari 2026"
formatDate(date, 'relative') // "Hari ini" / "Kemarin" / "3 hari lalu"
```

**DO NOT use**: `toLocaleDateString()`, `new Intl.DateTimeFormat()` directly

## Database Tables

### New Tables (This App)
| Table | Purpose |
|-------|---------|
| `expense_drafts` | Pending expenses captured in app |
| `expense_receipts` | Receipt images and OCR data |
| `expense_sync_queue` | Offline sync tracking |

### Referenced Tables (GAMA ERP)
| Table | Access | Purpose |
|-------|--------|---------|
| `bkk_records` | Write | Create expense drafts for approval |
| `job_orders` | Read | Link expenses to active jobs |
| `vendors` | Read/Write | Match or create vendor records |
| `user_profiles` | Read | Auth and role checking |

### Storage Buckets
- `expense-receipts` - Receipt images (private, RLS protected)

## Supabase Project

- **Project ID**: `ljbkjtaowrdddvjhsygj`
- **Shared with**: GAMA ERP main system
- **Dashboard**: https://supabase.com/dashboard/project/ljbkjtaowrdddvjhsygj

## Current State (February 2026)

- **TypeScript**: 0 errors
- **ESLint**: 0 errors
- **Build**: Passing
- **Version**: v1.0

## Feature Roadmap

| Version | Feature | Status |
|---------|---------|--------|
| v0.1 | Foundation | ✅ Done |
| v0.2 | Expense Capture | ✅ Done |
| v0.3 | Receipt Photo | ✅ Done |
| v0.3.1 | OCR Integration | ✅ Done |
| v0.4 | Job Linking | ✅ Done |
| v0.5 | Offline Support | ✅ Done |
| v0.6 | History View | ✅ Done |
| v0.7 | Settings Page | ✅ Done |
| v0.8 | Dashboard | ✅ Done |
| v0.9 | ERP Integration | ✅ Done |
| v1.0 | Polish & PWA | ✅ Done |

## Active Sprint Tasks

- [ ] Test approval workflow with real devices
- [ ] QA testing with field staff and finance team
- [ ] Production deployment to Vercel
- [ ] Set up error monitoring (Sentry)

## Tech Debt & Nice-to-Have Features

### v1.0 Polish & PWA (Deferred)
| Feature | Priority | Description | Location |
|---------|----------|-------------|----------|
| Splash screen | Low | Custom splash screen for PWA | `public/` |
| Virtual scrolling | Low | For long expense lists (100+ items) | `src/components/history/ExpenseList.tsx` |
| PNG app icons | Medium | Replace placeholder PNGs with actual icons | `public/icons/` |
| Screenshots | Low | Add actual app screenshots for PWA install | `public/screenshots/` |
| Save push subscriptions | Medium | Store subscriptions in database for server-side push | `src/lib/notifications/` |

### v0.9 ERP Integration (Deferred)
| Feature | Priority | Description | Location |
|---------|----------|-------------|----------|
| Batch submit | Medium | Submit multiple expenses at once from history page | `src/app/(auth)/history/page.tsx` |
| Batch approve | Medium | Approve multiple expenses at once for finance | `src/components/approval/ApprovalList.tsx` |
| Edit rejected | Low | Allow editing rejected expense before resubmit | `src/components/history/ExpenseDetailSheet.tsx` |
| API rate limiting | Low | Add rate limiting to approval API routes | `src/app/api/expenses/[id]/*/route.ts` |
| Optimistic updates | Low | Update UI immediately before server response | All approval components |

### Future Enhancements
| Feature | Priority | Description |
|---------|----------|-------------|
| Email notifications | Low | Email summary of pending approvals |
| Expense reports | Medium | Generate PDF reports for approved expenses |
| Analytics dashboard | Low | Charts and trends for expense data |

## DO NOT

- ❌ Disable TypeScript (no @ts-ignore unless absolutely critical)
- ❌ Add console.log in production code
- ❌ Expose service_role key in client code
- ❌ Store uncompressed images (always compress before save)
- ❌ Skip offline support (all features must work offline)
- ❌ Bypass RLS policies (always use authenticated clients)
- ❌ Hard delete records (use soft delete)
- ❌ Ignore OCR confidence scores in UI

## When Making Changes

1. **Always** run `pnpm build` before committing
2. Check for TypeScript errors in terminal output
3. Test the specific feature you changed
4. Write meaningful commit messages
5. Update CHANGELOG.md for significant changes

## Common Fixes

```typescript
// Fix "type instantiation too deep" on Supabase queries
// BEFORE (causes error):
const { data } = await supabase.from('table').select('*').like('col', '%x%')

// AFTER (fixed):
const result = await supabase.from('table').select('*').like('col', '%x%')
const data = result.data as TableType[] | null
```

## Quick References

- Supabase Dashboard: https://supabase.com/dashboard/project/ljbkjtaowrdddvjhsygj
- GitHub Repo: https://github.com/odnamta/gama-money-recorder

## Recent Changes

- 2026-02-01: v1.0 - Polish & PWA (install prompts, error handling, accessibility)
- 2026-02-01: v0.9 - ERP Integration (BKK records, approval workflow, finance approval page)
- 2026-02-01: v0.8 - Dashboard (summary stats, quick actions, recent expenses, manager section)
- 2026-02-01: v0.7 - Settings Page (profile, sync settings, storage management, logout)
- 2026-02-01: v0.6 - History View (filtering, search, detail view, pull-to-refresh, pagination)
- 2026-01-31: v0.5 - Offline Support (IndexedDB, sync queue, job caching, sync notifications)
- 2026-01-30: v0.4 - Job Linking (job search, recent jobs, GPS validation, location warning)
- 2026-01-29: v0.3.1 - OCR Integration (Tesseract.js, receipt parsing, confidence indicators)
- 2026-01-28: v0.3 - Receipt Photo (camera capture, image compression, storage upload)
- 2026-01-27: v0.2 - Expense Capture (form, amount input, category selector, vendor input)
- 2026-01-26: v0.1 - Foundation (Next.js 15, PWA, Supabase auth, navigation)
