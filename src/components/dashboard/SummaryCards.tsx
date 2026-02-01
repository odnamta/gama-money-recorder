'use client'

import { Calendar, CalendarDays, CalendarRange } from 'lucide-react'
import { PeriodSummaryCard } from './PeriodSummaryCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'

/**
 * SummaryCards - Dashboard summary statistics container
 *
 * Displays three period summary cards:
 * - Today's expenses (blue)
 * - This week's expenses (green)
 * - This month's expenses (purple)
 *
 * Features:
 * - Fetches data using useDashboardStats hook
 * - Shows loading skeletons while fetching
 * - Displays total amount (compact format) and transaction count
 * - Responsive grid layout
 *
 * Used in: Dashboard page
 */
export function SummaryCards() {
  const { stats, isLoading } = useDashboardStats()

  // Show loading skeletons while fetching data
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Today's expenses */}
      <PeriodSummaryCard
        title="Hari Ini"
        total={stats?.today.total ?? 0}
        count={stats?.today.count ?? 0}
        icon={Calendar}
        color="blue"
      />

      {/* This week's expenses */}
      <PeriodSummaryCard
        title="Minggu Ini"
        total={stats?.week.total ?? 0}
        count={stats?.week.count ?? 0}
        icon={CalendarDays}
        color="green"
      />

      {/* This month's expenses */}
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
