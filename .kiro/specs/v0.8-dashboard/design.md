# v0.8 Dashboard - Technical Design

## Overview
Implement dashboard with expense summaries, quick actions, recent activity, and role-specific content.

## Component Architecture

```
/dashboard
├── DashboardPage (page)
│   ├── DashboardHeader (organism)
│   │   ├── Greeting (molecule)
│   │   └── SyncStatusBadge (atom)
│   ├── SummaryCards (organism)
│   │   ├── PeriodSummaryCard (molecule) x3
│   │   └── SummaryCardSkeleton (atom)
│   ├── QuickActions (organism)
│   │   ├── CaptureButton (atom)
│   │   └── CategoryShortcuts (molecule)
│   ├── RecentExpenses (organism)
│   │   ├── ExpenseListItem (molecule)
│   │   └── ViewAllLink (atom)
│   ├── SyncStatus (organism)
│   │   ├── PendingCount (atom)
│   │   └── SyncButton (atom)
│   └── ManagerSection (organism) [conditional]
│       ├── PendingApprovals (molecule)
│       └── TeamSummary (molecule)
```

## Data Layer

### Dashboard Stats Hook
```typescript
// hooks/use-dashboard-stats.ts
interface DashboardStats {
  today: { total: number; count: number }
  week: { total: number; count: number }
  month: { total: number; count: number }
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      
      const now = new Date()
      const todayStart = startOfDay(now)
      const weekStart = startOfWeek(now)
      const monthStart = startOfMonth(now)
      
      // Get local expenses
      const localExpenses = await getLocalExpenses()
      
      // Get server expenses if online
      let serverExpenses: ExpenseDraft[] = []
      if (navigator.onLine) {
        serverExpenses = await fetchServerExpenses({
          dateFrom: monthStart.toISOString().split('T')[0]
        })
      }
      
      // Merge and calculate
      const merged = mergeExpenses(localExpenses, serverExpenses)
      
      const today = merged.filter(e => new Date(e.expenseDate) >= todayStart)
      const week = merged.filter(e => new Date(e.expenseDate) >= weekStart)
      const month = merged.filter(e => new Date(e.expenseDate) >= monthStart)
      
      setStats({
        today: { total: sum(today), count: today.length },
        week: { total: sum(week), count: week.length },
        month: { total: sum(month), count: month.length }
      })
      setIsLoading(false)
    }
    
    fetchStats()
  }, [])
  
  return { stats, isLoading, refresh: fetchStats }
}
```

### Recent Expenses Hook
```typescript
// hooks/use-recent-expenses.ts
export function useRecentExpenses(limit = 5) {
  const { expenses, isLoading } = useExpenses({})
  
  const recent = useMemo(
    () => expenses.slice(0, limit),
    [expenses, limit]
  )
  
  return { recent, isLoading }
}
```

## Components

### Summary Cards
```typescript
// components/dashboard/SummaryCards.tsx
interface PeriodSummaryCardProps {
  title: string
  total: number
  count: number
  icon: LucideIcon
  color: string
}

function PeriodSummaryCard({ title, total, count, icon: Icon, color }: PeriodSummaryCardProps) {
  return (
    <div className={cn('rounded-lg p-4', `bg-${color}-50`)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-4 w-4', `text-${color}-600`)} />
        <span className="text-sm font-medium text-slate-600">{title}</span>
      </div>
      <p className={cn('text-xl font-bold', `text-${color}-700`)}>
        {formatCurrency(total, { compact: true })}
      </p>
      <p className="text-xs text-slate-500">{count} transaksi</p>
    </div>
  )
}

export function SummaryCards() {
  const { stats, isLoading } = useDashboardStats()
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-3 gap-3">
      <PeriodSummaryCard
        title="Hari Ini"
        total={stats?.today.total ?? 0}
        count={stats?.today.count ?? 0}
        icon={Calendar}
        color="blue"
      />
      <PeriodSummaryCard
        title="Minggu Ini"
        total={stats?.week.total ?? 0}
        count={stats?.week.count ?? 0}
        icon={CalendarDays}
        color="green"
      />
      <PeriodSummaryCard
        title="Bulan Ini"
        total={stats?.month.total ?? 0}
        count={stats?.month.count ?? 0}
        icon={CalendarRange}
        color="purple"
      />
    </div>
  )
}
```

### Quick Actions
```typescript
// components/dashboard/QuickActions.tsx
const QUICK_CATEGORIES = [
  { category: 'fuel', label: 'BBM', icon: Fuel, color: 'orange' },
  { category: 'toll', label: 'Tol', icon: Route, color: 'blue' },
  { category: 'food', label: 'Makan', icon: UtensilsCrossed, color: 'green' }
]

export function QuickActions() {
  const router = useRouter()
  
  const handleCapture = (category?: ExpenseCategory) => {
    const url = category ? `/capture?category=${category}` : '/capture'
    router.push(url)
  }
  
  return (
    <div className="space-y-3">
      {/* Main Capture Button */}
      <Button
        size="lg"
        className="w-full h-14 text-lg"
        onClick={() => handleCapture()}
      >
        <Camera className="h-6 w-6 mr-2" />
        Catat Pengeluaran
      </Button>
      
      {/* Category Shortcuts */}
      <div className="grid grid-cols-3 gap-2">
        {QUICK_CATEGORIES.map(({ category, label, icon: Icon, color }) => (
          <Button
            key={category}
            variant="outline"
            className={cn('flex-col h-16', `hover:bg-${color}-50`)}
            onClick={() => handleCapture(category as ExpenseCategory)}
          >
            <Icon className={cn('h-5 w-5 mb-1', `text-${color}-600`)} />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
```

### Recent Expenses
```typescript
// components/dashboard/RecentExpenses.tsx
export function RecentExpenses() {
  const { recent, isLoading } = useRecentExpenses(5)
  const router = useRouter()
  
  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Terbaru</h3>
        <Button variant="ghost" size="sm" onClick={() => router.push('/history')}>
          Lihat Semua
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
        </div>
      ) : recent.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Belum ada pengeluaran</p>
        </div>
      ) : (
        <div className="divide-y">
          {recent.map(expense => (
            <ExpenseListItem
              key={expense.id}
              expense={expense}
              onClick={() => router.push(`/history?id=${expense.id}`)}
              compact
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Manager Section
```typescript
// components/dashboard/ManagerSection.tsx
export function ManagerSection() {
  const { profile } = useUser()
  
  // Only show for managers
  if (!profile || !['finance_manager', 'operations_manager', 'owner', 'director'].includes(profile.role)) {
    return null
  }
  
  return (
    <div className="bg-white rounded-lg p-4 space-y-4">
      <h3 className="font-semibold">Tim</h3>
      
      {profile.role === 'finance_manager' && <PendingApprovals />}
      {['operations_manager', 'owner', 'director'].includes(profile.role) && <TeamSummary />}
    </div>
  )
}
```

## Page Layout
```typescript
// app/(auth)/dashboard/page.tsx
export default function DashboardPage() {
  const { user } = useUser()
  const isOnline = useOnlineStatus()
  
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Selamat datang,</p>
            <h1 className="text-xl font-bold">{user?.user_metadata.full_name}</h1>
          </div>
          <SyncStatusBadge />
        </div>
        
        {!isOnline && (
          <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm">
            <WifiOff className="h-4 w-4" />
            <span>Mode Offline</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        <SummaryCards />
        <QuickActions />
        <SyncStatus />
        <RecentExpenses />
        <ManagerSection />
      </div>
    </div>
  )
}
```

## Testing Strategy

### Unit Tests
- Stats calculation
- Period filtering
- Role-based visibility

### Integration Tests
- Data fetching
- Quick action navigation
- Sync status display

### E2E Tests
- Complete dashboard flow
- Quick capture shortcuts
- Manager-specific content
