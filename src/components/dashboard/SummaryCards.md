# SummaryCards Component

## Overview
Container component that displays three period summary cards showing expense statistics for today, this week, and this month.

## Features
- **Data Fetching**: Uses `useDashboardStats` hook to fetch and calculate statistics
- **Loading States**: Shows skeleton loaders while data is being fetched
- **Period Cards**: Displays three `PeriodSummaryCard` components with different time periods
- **Responsive Grid**: Uses 3-column grid layout for card arrangement
- **Compact Currency**: Amounts are formatted with compact option (e.g., "Rp 1.5 jt")

## Usage

```tsx
import { SummaryCards } from '@/components/dashboard/SummaryCards'

export default function DashboardPage() {
  return (
    <div className="p-4">
      <SummaryCards />
    </div>
  )
}
```

## Data Structure

The component fetches data from `useDashboardStats` which returns:

```typescript
interface DashboardStats {
  today: { total: number; count: number }
  week: { total: number; count: number }
  month: { total: number; count: number }
}
```

## Period Definitions

- **Today**: Expenses from 00:00:00 today
- **This Week**: Expenses from Monday 00:00:00 of current week
- **This Month**: Expenses from 1st day 00:00:00 of current month

## Card Configuration

| Period | Title | Icon | Color |
|--------|-------|------|-------|
| Today | "Hari Ini" | Calendar | Blue |
| Week | "Minggu Ini" | CalendarDays | Green |
| Month | "Bulan Ini" | CalendarRange | Purple |

## Loading State

While data is being fetched, the component displays three skeleton loaders:
- Height: 24 (h-24)
- Rounded corners
- Pulsing animation

## Dependencies

- `useDashboardStats` - Hook for fetching dashboard statistics
- `PeriodSummaryCard` - Individual period card component
- `Skeleton` - Loading skeleton component
- `lucide-react` - Icons (Calendar, CalendarDays, CalendarRange)

## Related Components

- `PeriodSummaryCard` - Individual period summary card
- `useDashboardStats` - Data fetching hook
- `formatCurrency` - Currency formatting utility (used in PeriodSummaryCard)

## Offline Support

The component works offline by:
1. Fetching local expenses from IndexedDB
2. Merging with server data when online
3. Calculating statistics from merged data

## Performance

- Data is fetched once on mount
- Auto-refreshes every 30 seconds (handled by hook)
- Minimal re-renders using React hooks
