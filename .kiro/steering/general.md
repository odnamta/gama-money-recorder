# GAMA Money Recorder - Code Conventions

## File Structure

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
│   ├── api/               # API routes
│   │   ├── ocr/           # OCR processing
│   │   └── sync/          # Offline sync endpoints
│   ├── layout.tsx         # Root layout with PWA
│   └── manifest.ts        # PWA manifest
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── atoms/             # Basic building blocks
│   ├── molecules/         # Composite components
│   ├── organisms/         # Complex components
│   └── templates/         # Page templates
├── lib/
│   ├── supabase/          # Supabase clients
│   │   ├── server.ts      # Server-side client
│   │   ├── client.ts      # Browser client
│   │   └── middleware.ts  # Auth middleware
│   ├── db/                # Dexie.js IndexedDB
│   │   ├── index.ts       # Database instance
│   │   ├── schema.ts      # Table definitions
│   │   └── sync.ts        # Sync logic
│   ├── ocr/               # OCR utilities
│   │   ├── processor.ts   # OCR processing
│   │   └── parser.ts      # Receipt parsing
│   └── utils/             # Shared utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
├── constants/             # App constants
└── styles/                # Global styles
```

## Naming Conventions

### Files & Folders
- Components: `PascalCase.tsx` (e.g., `ExpenseCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-currency.ts`)
- Hooks: `use-kebab-case.ts` (e.g., `use-offline-sync.ts`)
- Types: `kebab-case.types.ts` (e.g., `expense.types.ts`)
- Constants: `SCREAMING_SNAKE_CASE` in `kebab-case.ts`

### Code
- React components: `PascalCase`
- Functions/variables: `camelCase`
- Types/Interfaces: `PascalCase`
- Database columns: `snake_case`
- Environment variables: `SCREAMING_SNAKE_CASE`

## Supabase Patterns

### Server-Side (Server Components, Route Handlers)
```typescript
import { createClient } from '@/lib/supabase/server'

export async function getExpenses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expense_drafts')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

### Client-Side (Client Components)
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function useExpenses() {
  const [expenses, setExpenses] = useState([])
  const supabase = createClient()
  
  useEffect(() => {
    // Fetch and subscribe logic
  }, [])
  
  return expenses
}
```

### Real-time Subscriptions
```typescript
const channel = supabase
  .channel('expense-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'expense_drafts',
    filter: `user_id=eq.${userId}`
  }, handleChange)
  .subscribe()
```

## Component Patterns (Atomic Design)

### Atoms (Basic UI elements)
```typescript
// components/atoms/AmountDisplay.tsx
interface AmountDisplayProps {
  amount: number
  currency?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AmountDisplay({ amount, currency = 'IDR', size = 'md' }: AmountDisplayProps) {
  return (
    <span className={cn('font-mono', sizeClasses[size])}>
      {formatCurrency(amount, currency)}
    </span>
  )
}
```

### Molecules (Composite components)
```typescript
// components/molecules/ExpenseCard.tsx
interface ExpenseCardProps {
  expense: ExpenseDraft
  onEdit?: () => void
}

export function ExpenseCard({ expense, onEdit }: ExpenseCardProps) {
  return (
    <Card>
      <CategoryIcon category={expense.category} />
      <AmountDisplay amount={expense.amount} />
      <DateDisplay date={expense.expense_date} />
    </Card>
  )
}
```

### Organisms (Complex, self-contained)
```typescript
// components/organisms/ExpenseCaptureForm.tsx
export function ExpenseCaptureForm() {
  // Contains form state, validation, submission logic
  // Composes multiple molecules and atoms
}
```

## OCR Integration Patterns

### Processing Flow
```typescript
// lib/ocr/processor.ts
export async function processReceipt(imageFile: File): Promise<OCRResult> {
  const startTime = Date.now()
  
  // 1. Compress image for upload
  const compressed = await compressImage(imageFile, { maxWidth: 1200 })
  
  // 2. Send to OCR service
  const rawResult = await callOCRService(compressed)
  
  // 3. Parse and extract structured data
  const extractedData = parseReceiptData(rawResult.text)
  
  return {
    rawText: rawResult.text,
    confidence: rawResult.confidence,
    extractedData,
    processingTime: Date.now() - startTime
  }
}
```

### Confidence Handling
```typescript
// Show warning for low confidence
if (ocrResult.confidence < 0.8) {
  return <ManualReviewPrompt ocrResult={ocrResult} />
}
```

## IndexedDB Patterns (Dexie.js)

### Database Schema
```typescript
// lib/db/index.ts
import Dexie, { Table } from 'dexie'

export interface LocalExpense {
  id: string
  amount: number
  category: ExpenseCategory
  syncStatus: 'pending' | 'synced' | 'failed'
  createdAt: string
  // ... other fields
}

export class MoneyRecorderDB extends Dexie {
  expenses!: Table<LocalExpense>
  receipts!: Table<LocalReceipt>
  syncQueue!: Table<SyncQueueItem>

  constructor() {
    super('gama-money-recorder')
    this.version(1).stores({
      expenses: 'id, syncStatus, createdAt',
      receipts: 'id, expenseId, syncStatus',
      syncQueue: 'id, status, createdAt'
    })
  }
}

export const db = new MoneyRecorderDB()
```

### Offline-First Operations
```typescript
// Always save locally first
export async function saveExpense(expense: ExpenseInput) {
  const localExpense = {
    ...expense,
    id: crypto.randomUUID(),
    syncStatus: 'pending',
    createdAt: new Date().toISOString()
  }
  
  // 1. Save to IndexedDB
  await db.expenses.add(localExpense)
  
  // 2. Queue for sync
  await queueForSync('expense_draft', localExpense)
  
  // 3. Attempt immediate sync if online
  if (navigator.onLine) {
    await attemptSync()
  }
  
  return localExpense
}
```

### Sync Queue Management
```typescript
// lib/db/sync.ts
export async function processSyncQueue() {
  const pending = await db.syncQueue
    .where('status')
    .equals('pending')
    .toArray()
  
  for (const item of pending) {
    try {
      await db.syncQueue.update(item.id, { status: 'syncing' })
      await syncItem(item)
      await db.syncQueue.update(item.id, { status: 'completed' })
    } catch (error) {
      await db.syncQueue.update(item.id, {
        status: 'failed',
        retryCount: item.retryCount + 1,
        lastAttempt: new Date().toISOString(),
        error: error.message
      })
    }
  }
}
```

## Error Handling Patterns

### API Routes
```typescript
// app/api/expenses/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = expenseSchema.parse(body)
    
    const result = await createExpense(validated)
    return Response.json(result)
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Expense creation failed:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Client-Side with Toast
```typescript
import { toast } from 'sonner'

async function handleSubmit() {
  try {
    await saveExpense(formData)
    toast.success('Pengeluaran tersimpan')
  } catch (error) {
    toast.error('Gagal menyimpan', {
      description: error.message
    })
  }
}
```

## Security Rules

1. **Always validate on server** - Never trust client data
2. **Use RLS policies** - All tables must have Row Level Security
3. **Sanitize file uploads** - Validate image types and sizes
4. **No secrets in client** - Only `NEXT_PUBLIC_*` env vars in browser
5. **Check user roles** - Verify permissions before operations
6. **Validate GPS data** - Don't trust client-provided coordinates blindly

## DO ✅

- Use TypeScript strict mode everywhere
- Implement offline-first for all data operations
- Compress images before upload (max 1MB)
- Show sync status indicators to users
- Use optimistic UI updates
- Handle network errors gracefully
- Log errors with context for debugging
- Use Zod for runtime validation
- Implement proper loading states
- Test on slow 3G network conditions

## DON'T ❌

- Don't fetch data without error handling
- Don't store sensitive data in IndexedDB unencrypted
- Don't assume network is always available
- Don't skip image compression for receipts
- Don't hardcode Indonesian text (use constants)
- Don't create new Supabase clients unnecessarily
- Don't ignore OCR confidence scores
- Don't allow expenses without category
- Don't skip GPS validation for high-value expenses
- Don't sync immediately on every change (batch when possible)
