'use client'

import { useState, useEffect, useCallback } from 'react'
import { getLocalExpenses } from '@/lib/db/operations'
import { createClient } from '@/lib/supabase/client'
import type { DisplayExpense } from '@/types/expense-filters'
import type { LocalExpense } from '@/lib/db'
import type { ExpenseCategory } from '@/constants/expense-categories'

/**
 * Statistics for a time period
 */
export interface PeriodStats {
  /** Total amount in IDR */
  total: number
  /** Number of expenses */
  count: number
}

/**
 * Dashboard statistics for different time periods
 */
export interface DashboardStats {
  /** Today's expenses */
  today: PeriodStats
  /** This week's expenses */
  week: PeriodStats
  /** This month's expenses */
  month: PeriodStats
}

/**
 * Server expense structure from Supabase
 */
interface ServerExpense {
  id: string
  amount: number
  category: string
  expense_date: string
  local_id: string | null
  sync_status: string
}

/**
 * Get the start of today (00:00:00)
 */
function getStartOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get the start of the current week (Monday 00:00:00)
 * Following Indonesian convention where week starts on Monday
 */
function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // If Sunday (0), go back 6 days, else go to Monday
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get the start of the current month (1st day 00:00:00)
 */
function getStartOfMonth(date: Date): Date {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Convert local expense to display expense for filtering
 */
function localToDisplayExpense(expense: LocalExpense): DisplayExpense {
  return {
    id: expense.id,
    localId: expense.id,
    serverId: expense.serverId,
    amount: expense.amount,
    category: expense.category,
    description: expense.description,
    vendorName: expense.vendorName,
    vendorId: expense.vendorId,
    jobOrderId: expense.jobOrderId,
    isOverhead: expense.isOverhead,
    expenseDate: expense.expenseDate,
    expenseTime: expense.expenseTime,
    gpsLatitude: expense.gpsLatitude,
    gpsLongitude: expense.gpsLongitude,
    gpsAccuracy: expense.gpsAccuracy,
    receiptLocalId: expense.receiptLocalId,
    syncStatus: expense.syncStatus,
    approvalStatus: 'draft',
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
    source: 'local',
  }
}

/**
 * Convert server expense to display expense for filtering
 */
function serverToDisplayExpense(expense: ServerExpense): DisplayExpense {
  return {
    id: expense.id,
    localId: expense.local_id || undefined,
    serverId: expense.id,
    amount: expense.amount,
    category: expense.category as ExpenseCategory,
    isOverhead: false,
    expenseDate: expense.expense_date,
    syncStatus: expense.sync_status as 'pending' | 'syncing' | 'synced' | 'failed',
    approvalStatus: 'draft',
    createdAt: expense.expense_date,
    source: 'server',
  }
}

/**
 * Merge local and server expenses, deduplicating by local_id
 */
function mergeExpenses(
  localExpenses: LocalExpense[],
  serverExpenses: ServerExpense[]
): DisplayExpense[] {
  const merged: DisplayExpense[] = []

  // Create a set of local IDs that exist on the server
  const serverLocalIds = new Set(
    serverExpenses
      .map((e) => e.local_id)
      .filter((id): id is string => id !== null)
  )

  // Add local expenses that are NOT yet on the server
  for (const expense of localExpenses) {
    if (!serverLocalIds.has(expense.id) && expense.syncStatus !== 'synced') {
      merged.push(localToDisplayExpense(expense))
    }
  }

  // Add all server expenses
  for (const expense of serverExpenses) {
    merged.push(serverToDisplayExpense(expense))
  }

  return merged
}

/**
 * Calculate statistics for a list of expenses
 */
function calculateStats(expenses: DisplayExpense[]): PeriodStats {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  return {
    total,
    count: expenses.length,
  }
}

/**
 * Fetch server expenses from Supabase
 */
async function fetchServerExpenses(dateFrom: string): Promise<ServerExpense[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('expense_drafts')
    .select('id, amount, category, expense_date, local_id, sync_status')
    .gte('expense_date', dateFrom)
    .order('expense_date', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []) as ServerExpense[]
}

/**
 * useDashboardStats - Calculate expense statistics for dashboard
 *
 * This hook fetches and calculates expense statistics for three time periods:
 * - Today: Expenses from 00:00:00 today
 * - This Week: Expenses from Monday 00:00:00 of current week
 * - This Month: Expenses from 1st day 00:00:00 of current month
 *
 * The hook implements a hybrid data fetching strategy:
 * 1. Fetches local expenses from IndexedDB (for offline/pending items)
 * 2. Fetches server expenses from Supabase (if online)
 * 3. Merges and deduplicates the results
 * 4. Calculates totals and counts for each period
 *
 * @returns Object with stats, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * function DashboardPage() {
 *   const { stats, isLoading, error, refresh } = useDashboardStats()
 *
 *   if (isLoading) return <Skeleton />
 *   if (error) return <ErrorMessage error={error} />
 *
 *   return (
 *     <div>
 *       <StatCard title="Hari Ini" {...stats.today} />
 *       <StatCard title="Minggu Ini" {...stats.week} />
 *       <StatCard title="Bulan Ini" {...stats.month} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const now = new Date()
      const todayStart = getStartOfDay(now)
      const weekStart = getStartOfWeek(now)
      const monthStart = getStartOfMonth(now)

      // Convert to YYYY-MM-DD format for filtering
      const monthStartStr = monthStart.toISOString().split('T')[0]

      // 1. Get local expenses (always available)
      const localExpenses = await getLocalExpenses()

      // 2. Get server expenses if online (from start of month to cover all periods)
      let serverExpenses: ServerExpense[] = []
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          serverExpenses = await fetchServerExpenses(monthStartStr)
        } catch (serverError) {
          // Log but don't fail - we still have local data
          console.warn('Failed to fetch server expenses:', serverError)
        }
      }

      // 3. Merge and deduplicate
      const merged = mergeExpenses(localExpenses, serverExpenses)

      // 4. Filter by time periods
      const todayExpenses = merged.filter((e) => {
        const expenseDate = new Date(e.expenseDate)
        return expenseDate >= todayStart
      })

      const weekExpenses = merged.filter((e) => {
        const expenseDate = new Date(e.expenseDate)
        return expenseDate >= weekStart
      })

      const monthExpenses = merged.filter((e) => {
        const expenseDate = new Date(e.expenseDate)
        return expenseDate >= monthStart
      })

      // 5. Calculate statistics
      setStats({
        today: calculateStats(todayExpenses),
        week: calculateStats(weekExpenses),
        month: calculateStats(monthExpenses),
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load dashboard stats'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()

    // Poll for changes every 30 seconds
    const interval = setInterval(fetchStats, 30000)

    return () => clearInterval(interval)
  }, [fetchStats])

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  }
}
