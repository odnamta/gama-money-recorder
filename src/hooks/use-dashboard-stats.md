# useDashboardStats Hook

## Overview

The `useDashboardStats` hook calculates expense statistics for the dashboard, providing totals and counts for three time periods: today, this week, and this month.

## Features

- ✅ **Offline-First**: Works with local IndexedDB data when offline
- ✅ **Hybrid Data**: Merges local and server data when online
- ✅ **Deduplication**: Prevents counting the same expense twice
- ✅ **Auto-Refresh**: Polls for updates every 30 seconds
- ✅ **Manual Refresh**: Provides a refresh function for pull-to-refresh
- ✅ **Error Handling**: Gracefully handles network and database errors

## Usage

```typescript
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { formatCurrency } from '@/lib/utils/format-currency'

function DashboardPage() {
  const { stats, isLoading, error, refresh } = useDashboardStats()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={refresh} />
  }

  return (
    <div>
      <StatCard
        title="Hari Ini"
        total={stats.today.total}
        count={stats.today.count}
      />
      <StatCard
        title="Minggu Ini"
        total={stats.week.total}
        count={stats.week.count}
      />
      <StatCard
        title="Bulan Ini"
        total={stats.month.total}
        count={stats.month.count}
      />
    </div>
  )
}
```

## Return Value

```typescript
{
  stats: DashboardStats | null
  isLoading: boolean
  error: Error | null
  refresh: () => void
}
```

### DashboardStats

```typescript
interface DashboardStats {
  today: PeriodStats
  week: PeriodStats
  month: PeriodStats
}

interface PeriodStats {
  total: number  // Total amount in IDR
  count: number  // Number of expenses
}
```

## Time Period Definitions

### Today
- **Start**: 00:00:00 of current day
- **End**: Current time
- **Example**: If today is Feb 1, 2024 at 14:30, includes all expenses from Feb 1, 2024 00:00:00 onwards

### This Week
- **Start**: Monday 00:00:00 of current week
- **End**: Current time
- **Note**: Follows Indonesian convention where week starts on Monday
- **Example**: If today is Wednesday Feb 3, 2024, includes all expenses from Monday Feb 1, 2024 00:00:00 onwards

### This Month
- **Start**: 1st day 00:00:00 of current month
- **End**: Current time
- **Example**: If today is Feb 15, 2024, includes all expenses from Feb 1, 2024 00:00:00 onwards

## Data Flow

```
┌─────────────────┐
│  useDashboardStats  │
└────────┬────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         v                                 v
┌────────────────┐              ┌──────────────────┐
│  IndexedDB     │              │  Supabase        │
│  (Local Data)  │              │  (Server Data)   │
└────────┬───────┘              └────────┬─────────┘
         │                               │
         │                               │ (if online)
         v                               v
┌────────────────────────────────────────────────┐
│  Merge & Deduplicate                           │
│  - Remove duplicates by local_id               │
│  - Prefer server data for synced expenses      │
└────────┬───────────────────────────────────────┘
         │
         v
┌────────────────────────────────────────────────┐
│  Filter by Time Period                         │
│  - Today: >= start of day                      │
│  - Week: >= start of week (Monday)             │
│  - Month: >= start of month (1st)              │
└────────┬───────────────────────────────────────┘
         │
         v
┌────────────────────────────────────────────────┐
│  Calculate Statistics                          │
│  - Sum amounts                                 │
│  - Count expenses                              │
└────────┬───────────────────────────────────────┘
         │
         v
┌────────────────────────────────────────────────┐
│  Return Stats                                  │
│  { today, week, month }                        │
└────────────────────────────────────────────────┘
```

## Deduplication Logic

The hook prevents counting the same expense twice when it exists in both local and server storage:

1. **Server expenses** with a `local_id` are tracked
2. **Local expenses** with matching `id` and `syncStatus !== 'synced'` are excluded
3. This ensures:
   - Pending local expenses are counted
   - Synced expenses are only counted from server
   - No double-counting occurs

## Performance Considerations

### Polling Interval
- **Default**: 30 seconds
- **Rationale**: Balance between freshness and performance
- **Cleanup**: Automatically cleared on unmount

### Data Fetching
- **Local**: Always fetched (fast, from IndexedDB)
- **Server**: Only when online (network request)
- **Failure Handling**: Server errors don't prevent local data display

### Optimization Tips

```typescript
// Use with pull-to-refresh
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh'

function DashboardPage() {
  const { stats, isLoading, refresh } = useDashboardStats()
  
  usePullToRefresh({
    onRefresh: refresh,
    enabled: !isLoading
  })
  
  // ...
}
```

## Error Handling

The hook handles errors gracefully:

```typescript
const { stats, error, refresh } = useDashboardStats()

if (error) {
  // Error occurred - show user-friendly message
  return (
    <div className="p-4 bg-red-50 text-red-800 rounded-lg">
      <p>Gagal memuat statistik</p>
      <button onClick={refresh}>Coba Lagi</button>
    </div>
  )
}
```

### Common Errors

1. **IndexedDB Error**: Database access failed
   - **Cause**: Browser storage quota exceeded or disabled
   - **Solution**: Clear storage or enable IndexedDB

2. **Network Error**: Server fetch failed
   - **Cause**: No internet connection or server down
   - **Solution**: Hook continues with local data only

3. **Permission Error**: Supabase RLS policy denied access
   - **Cause**: User not authenticated or insufficient permissions
   - **Solution**: Re-authenticate user

## Testing

### Manual Testing Checklist

- [ ] Stats show correct totals for today
- [ ] Stats show correct totals for this week
- [ ] Stats show correct totals for this month
- [ ] Works offline with local data only
- [ ] Merges local and server data when online
- [ ] Deduplicates synced expenses correctly
- [ ] Refresh function updates stats
- [ ] Auto-refresh works (wait 30 seconds)
- [ ] Error handling displays correctly
- [ ] Loading state shows during fetch

### Test Scenarios

#### Scenario 1: Offline Mode
1. Disable network
2. Create local expenses
3. Check stats reflect local data only

#### Scenario 2: Online Mode
1. Enable network
2. Create expenses (will sync)
3. Check stats include both local and server data

#### Scenario 3: Deduplication
1. Create expense offline (local)
2. Go online (syncs to server)
3. Check expense counted only once

## Related Hooks

- `useExpenses`: Full expense list with filtering
- `useRecentExpenses`: Last N expenses for display
- `usePendingSync`: Pending sync queue status
- `useOnlineStatus`: Network connectivity status

## Implementation Notes

### Date Calculations

The hook uses custom date calculation functions instead of external libraries:

```typescript
// Start of day: 00:00:00
function getStartOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Start of week: Monday 00:00:00
function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Start of month: 1st day 00:00:00
function getStartOfMonth(date: Date): Date {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}
```

### Why No External Date Library?

- **Bundle Size**: Keeps app lightweight
- **Simplicity**: Only need basic date operations
- **Performance**: Native Date API is fast
- **Dependencies**: Fewer dependencies to maintain

## Future Enhancements

Potential improvements for future versions:

1. **Comparison with Previous Period**
   - Show percentage change vs last week/month
   - Trend indicators (up/down arrows)

2. **Category Breakdown**
   - Top spending categories
   - Category-wise totals

3. **Budget Tracking**
   - Compare against budget limits
   - Alert when approaching limits

4. **Caching**
   - Cache stats in localStorage
   - Reduce recalculation frequency

5. **Customizable Periods**
   - Allow custom date ranges
   - Last 7 days, last 30 days, etc.
