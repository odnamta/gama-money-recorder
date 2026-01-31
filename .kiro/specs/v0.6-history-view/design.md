# v0.6 History View - Technical Design

## Overview
Implement expense history view with filtering, search, and detail view, combining local and server data.

## Component Architecture

```
/history
├── HistoryPage (page)
│   ├── HistoryHeader (organism)
│   │   ├── SearchInput (molecule)
│   │   └── FilterButton (atom)
│   ├── FilterSheet (organism)
│   │   ├── DateRangeFilter (molecule)
│   │   ├── CategoryFilter (molecule)
│   │   └── StatusFilter (molecule)
│   ├── SummaryCard (molecule)
│   ├── ExpenseList (organism)
│   │   └── ExpenseListItem (molecule)
│   └── ExpenseDetailSheet (organism)
```

## Data Fetching Strategy

### Hybrid Data Source
```typescript
// hooks/use-expenses.ts
export function useExpenses(filters: ExpenseFilters) {
  const [expenses, setExpenses] = useState<DisplayExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoading(true)
      
      // 1. Get local expenses (pending sync)
      const localExpenses = await getLocalExpenses(filters)
      
      // 2. Get server expenses (if online)
      let serverExpenses: ExpenseDraft[] = []
      if (navigator.onLine) {
        serverExpenses = await fetchServerExpenses(filters)
      }
      
      // 3. Merge and deduplicate
      const merged = mergeExpenses(localExpenses, serverExpenses)
      
      // 4. Sort by date (newest first)
      merged.sort((a, b) => 
        new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
      )
      
      setExpenses(merged)
      setIsLoading(false)
    }
    
    fetchExpenses()
  }, [filters])
  
  return { expenses, isLoading }
}

function mergeExpenses(
  local: LocalExpense[],
  server: ExpenseDraft[]
): DisplayExpense[] {
  const merged: DisplayExpense[] = []
  const serverIds = new Set(server.map(e => e.local_id).filter(Boolean))
  
  // Add local expenses not yet on server
  for (const expense of local) {
    if (!serverIds.has(expense.id)) {
      merged.push({
        ...expense,
        source: 'local'
      })
    }
  }
  
  // Add server expenses
  for (const expense of server) {
    merged.push({
      ...expense,
      source: 'server'
    })
  }
  
  return merged
}
```

### Server Query
```typescript
async function fetchServerExpenses(
  filters: ExpenseFilters
): Promise<ExpenseDraft[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('expense_drafts')
    .select(`
      *,
      receipt:expense_receipts(id, storage_path),
      job_order:job_orders(id, job_number, customer_name)
    `)
    .order('expense_date', { ascending: false })
  
  // Apply filters
  if (filters.dateFrom) {
    query = query.gte('expense_date', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('expense_date', filters.dateTo)
  }
  if (filters.categories?.length) {
    query = query.in('category', filters.categories)
  }
  if (filters.search) {
    query = query.or(
      `vendor_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    )
  }
  
  const { data, error } = await query.limit(100)
  
  if (error) throw error
  return data || []
}
```

## Filter Components

### Filter Sheet
```typescript
// components/history/FilterSheet.tsx
interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ExpenseFilters
  onFiltersChange: (filters: ExpenseFilters) => void
}

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange
}: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState(filters)
  
  const handleApply = () => {
    onFiltersChange(localFilters)
    onOpenChange(false)
  }
  
  const handleClear = () => {
    setLocalFilters({})
    onFiltersChange({})
    onOpenChange(false)
  }
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Filter</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-4">
          {/* Date Range */}
          <DateRangeFilter
            value={localFilters}
            onChange={setLocalFilters}
          />
          
          {/* Categories */}
          <CategoryFilter
            selected={localFilters.categories || []}
            onChange={(categories) => 
              setLocalFilters(f => ({ ...f, categories }))
            }
          />
          
          {/* Status */}
          <StatusFilter
            selected={localFilters.statuses || []}
            onChange={(statuses) =>
              setLocalFilters(f => ({ ...f, statuses }))
            }
          />
        </div>
        
        <SheetFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClear}>
            Hapus Filter
          </Button>
          <Button onClick={handleApply}>
            Terapkan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
```

### Date Range Filter
```typescript
// components/history/DateRangeFilter.tsx
const QUICK_FILTERS = [
  { label: 'Hari Ini', getValue: () => ({ from: startOfDay(new Date()), to: new Date() }) },
  { label: 'Minggu Ini', getValue: () => ({ from: startOfWeek(new Date()), to: new Date() }) },
  { label: 'Bulan Ini', getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) }
]

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="space-y-3">
      <Label>Periode</Label>
      
      {/* Quick filters */}
      <div className="flex gap-2">
        {QUICK_FILTERS.map(({ label, getValue }) => (
          <Button
            key={label}
            variant="outline"
            size="sm"
            onClick={() => {
              const { from, to } = getValue()
              onChange({
                ...value,
                dateFrom: from.toISOString().split('T')[0],
                dateTo: to.toISOString().split('T')[0]
              })
            }}
          >
            {label}
          </Button>
        ))}
      </div>
      
      {/* Custom range */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Dari</Label>
          <Input
            type="date"
            value={value.dateFrom || ''}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Sampai</Label>
          <Input
            type="date"
            value={value.dateTo || ''}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
```

## Expense List

### List Item Component
```typescript
// components/history/ExpenseListItem.tsx
interface ExpenseListItemProps {
  expense: DisplayExpense
  onClick: () => void
}

export function ExpenseListItem({ expense, onClick }: ExpenseListItemProps) {
  const categoryConfig = EXPENSE_CATEGORIES[expense.category]
  const Icon = Icons[categoryConfig.icon]
  
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg"
    >
      {/* Category Icon */}
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center',
        `bg-${categoryConfig.color}-100`
      )}>
        <Icon className={`h-5 w-5 text-${categoryConfig.color}-600`} />
      </div>
      
      {/* Details */}
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {expense.vendorName || categoryConfig.label}
          </span>
          <SyncStatusBadge status={expense.syncStatus} />
        </div>
        <div className="text-sm text-muted-foreground">
          {formatDate(expense.expenseDate, 'medium')}
          {expense.jobOrder && ` • ${expense.jobOrder.job_number}`}
        </div>
      </div>
      
      {/* Amount */}
      <div className="text-right">
        <div className="font-medium">
          {formatCurrency(expense.amount)}
        </div>
        <ApprovalStatusBadge status={expense.approvalStatus} />
      </div>
      
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  )
}
```

## Summary Card

```typescript
// components/history/SummaryCard.tsx
interface SummaryCardProps {
  expenses: DisplayExpense[]
}

export function SummaryCard({ expenses }: SummaryCardProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const byCategory = groupByCategory(expenses)
  
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{formatCurrency(total)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Transaksi</p>
          <p className="text-lg font-medium">{expenses.length}</p>
        </div>
      </div>
      
      {/* Category breakdown */}
      <div className="space-y-2">
        {Object.entries(byCategory)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 4)
          .map(([category, amount]) => (
            <div key={category} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span>{EXPENSE_CATEGORIES[category].label}</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
                <Progress
                  value={(amount / total) * 100}
                  className="h-1.5"
                />
              </div>
            </div>
          ))}
      </div>
    </Card>
  )
}
```

## Expense Detail Sheet

```typescript
// components/history/ExpenseDetailSheet.tsx
interface ExpenseDetailSheetProps {
  expense: DisplayExpense | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExpenseDetailSheet({
  expense,
  open,
  onOpenChange
}: ExpenseDetailSheetProps) {
  if (!expense) return null
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>Detail Pengeluaran</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-full pb-20">
          <div className="space-y-6 py-4">
            {/* Amount & Category */}
            <div className="text-center">
              <p className="text-3xl font-bold">
                {formatCurrency(expense.amount)}
              </p>
              <CategoryBadge category={expense.category} size="lg" />
            </div>
            
            {/* Receipt Image */}
            {expense.receipt && (
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={getReceiptUrl(expense.receipt.storage_path)}
                  alt="Receipt"
                  className="w-full"
                />
              </div>
            )}
            
            {/* Details */}
            <div className="space-y-3">
              <DetailRow label="Tanggal" value={formatDate(expense.expenseDate, 'long')} />
              <DetailRow label="Vendor" value={expense.vendorName || '-'} />
              <DetailRow label="Catatan" value={expense.description || '-'} />
              
              {expense.jobOrder ? (
                <DetailRow
                  label="Job Order"
                  value={`${expense.jobOrder.job_number} - ${expense.jobOrder.customer_name}`}
                />
              ) : expense.isOverhead ? (
                <DetailRow label="Job Order" value="Overhead" />
              ) : null}
              
              <DetailRow
                label="Status Sync"
                value={<SyncStatusBadge status={expense.syncStatus} showLabel />}
              />
              
              <DetailRow
                label="Status Approval"
                value={<ApprovalStatusBadge status={expense.approvalStatus} showLabel />}
              />
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
```

## Testing Strategy

### Unit Tests
- Filter logic
- Data merging
- Summary calculations

### Integration Tests
- Data fetching
- Filter application
- Search functionality

### E2E Tests
- Complete history flow
- Filter combinations
- Detail view
