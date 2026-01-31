# v0.2 Expense Capture - Technical Design

## Overview
Implement the manual expense capture form with validation, category selection, and Supabase integration.

## Component Architecture

### Page Structure
```
/capture
├── ExpenseCaptureForm (organism)
│   ├── AmountInput (molecule)
│   │   └── CurrencyDisplay (atom)
│   ├── CategorySelector (molecule)
│   │   └── CategoryButton (atom)
│   ├── VendorInput (molecule)
│   │   └── VendorSuggestions (atom)
│   ├── DatePicker (molecule)
│   ├── DescriptionInput (atom)
│   └── SubmitButton (atom)
```

### Component Specifications

#### AmountInput
```typescript
interface AmountInputProps {
  value: number
  onChange: (value: number) => void
  error?: string
}

// Features:
// - Large numeric keypad-friendly input
// - Auto-format with thousand separators
// - Clear button
// - Shows "Rp" prefix
```

#### CategorySelector
```typescript
interface CategorySelectorProps {
  value: ExpenseCategory | null
  onChange: (category: ExpenseCategory) => void
  error?: string
}

// Features:
// - 2x4 grid of category buttons
// - Icon + label for each
// - Selected state highlight
// - Scrollable if needed
```

#### VendorInput
```typescript
interface VendorInputProps {
  value: string
  onChange: (value: string) => void
  suggestions: Vendor[]
  onSuggestionSelect: (vendor: Vendor) => void
}

// Features:
// - Text input with autocomplete
// - Recent vendors (last 10 used)
// - Search vendors table
// - Create new if not found
```

## Form State Management

```typescript
// hooks/use-expense-form.ts
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const expenseSchema = z.object({
  amount: z.number().positive('Jumlah harus lebih dari 0'),
  category: z.enum([
    'fuel', 'toll', 'parking', 'food',
    'lodging', 'transport', 'supplies', 'other'
  ], { required_error: 'Pilih kategori' }),
  vendorName: z.string().optional(),
  vendorId: z.string().uuid().optional(),
  description: z.string().optional(),
  expenseDate: z.date().max(new Date(), 'Tanggal tidak boleh di masa depan')
})

type ExpenseFormData = z.infer<typeof expenseSchema>

export function useExpenseForm() {
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      category: undefined,
      vendorName: '',
      description: '',
      expenseDate: new Date()
    }
  })
  
  return form
}
```

## Data Flow

### Save Expense Flow
```
[User fills form] → [Validate with Zod]
    ↓
[Valid?]
    ├─ No  → [Show validation errors]
    └─ Yes → [Call saveExpense()]
    ↓
[Insert to expense_drafts] → [Success?]
    ├─ No  → [Show error toast]
    └─ Yes → [Show success toast] → [Reset form or navigate]
```

### Server Action
```typescript
// app/(auth)/capture/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveExpense(data: ExpenseFormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data: expense, error } = await supabase
    .from('expense_drafts')
    .insert({
      user_id: user.id,
      amount: data.amount,
      category: data.category,
      vendor_name: data.vendorName || null,
      vendor_id: data.vendorId || null,
      description: data.description || null,
      expense_date: data.expenseDate.toISOString().split('T')[0],
      sync_status: 'synced', // Direct save, not offline
      approval_status: 'draft'
    })
    .select()
    .single()
  
  if (error) throw error
  
  revalidatePath('/history')
  return expense
}
```

## Vendor Suggestions

### Recent Vendors Query
```typescript
// Get user's recent vendors (last 10 unique)
const { data: recentVendors } = await supabase
  .from('expense_drafts')
  .select('vendor_name, vendor_id')
  .eq('user_id', userId)
  .not('vendor_name', 'is', null)
  .order('created_at', { ascending: false })
  .limit(50)

// Deduplicate and take first 10
const unique = [...new Map(
  recentVendors.map(v => [v.vendor_name, v])
).values()].slice(0, 10)
```

### Vendor Search Query
```typescript
// Search vendors table
const { data: vendors } = await supabase
  .from('vendors')
  .select('id, name')
  .ilike('name', `%${searchTerm}%`)
  .limit(5)
```

## UI/UX Specifications

### Mobile-First Layout
```
┌─────────────────────────┐
│  ← Catat Pengeluaran    │  Header
├─────────────────────────┤
│                         │
│    Rp 0                 │  Amount (large)
│    [_______________]    │
│                         │
├─────────────────────────┤
│  Kategori               │
│  ┌────┐ ┌────┐ ┌────┐  │
│  │BBM │ │Tol │ │Park│  │  Category grid
│  └────┘ └────┘ └────┘  │
│  ┌────┐ ┌────┐ ┌────┐  │
│  │Mkn │ │Inp │ │Trns│  │
│  └────┘ └────┘ └────┘  │
├─────────────────────────┤
│  Vendor (opsional)      │
│  [_______________]      │
├─────────────────────────┤
│  Tanggal                │
│  [15 Jan 2024    📅]    │
├─────────────────────────┤
│  Catatan (opsional)     │
│  [_______________]      │
│                         │
├─────────────────────────┤
│  [    Simpan    ]       │  Submit button
└─────────────────────────┘
│  🏠   📷   📋   ⚙️     │  Bottom nav
└─────────────────────────┘
```

### Touch Targets
- Minimum 44x44px for all interactive elements
- Category buttons: 80x80px
- Amount input: Full width, 56px height
- Submit button: Full width, 48px height

## Validation Messages

```typescript
const VALIDATION_MESSAGES = {
  amount: {
    required: 'Masukkan jumlah pengeluaran',
    positive: 'Jumlah harus lebih dari 0'
  },
  category: {
    required: 'Pilih kategori pengeluaran'
  },
  expenseDate: {
    future: 'Tanggal tidak boleh di masa depan'
  }
}
```

## Testing Strategy

### Unit Tests
- Amount formatting and parsing
- Form validation logic
- Category selection state

### Integration Tests
- Form submission flow
- Vendor suggestions loading
- Error handling

### E2E Tests
- Complete expense entry flow
- Validation error display
- Success confirmation
