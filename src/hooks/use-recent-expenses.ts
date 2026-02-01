'use client'

import { useMemo } from 'react'
import { useExpenses } from './use-expenses'
import type { DisplayExpense } from '@/types/expense-filters'

interface UseRecentExpensesReturn {
  /** Array of recent expenses (limited to N most recent) */
  recent: DisplayExpense[]
  /** Whether expenses are being loaded */
  isLoading: boolean
  /** Error from the fetch operation */
  error: Error | null
  /** Refresh the expenses list */
  refresh: () => void
}

/**
 * useRecentExpenses - Get the most recent N expenses
 *
 * This hook leverages the existing useExpenses hook to fetch all expenses
 * and returns only the most recent N items. The expenses are already sorted
 * by date (newest first) from useExpenses.
 *
 * @param limit - Number of recent expenses to return (default: 5)
 * @returns Object with recent expenses array, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * function RecentExpenses() {
 *   const { recent, isLoading } = useRecentExpenses(5)
 *
 *   if (isLoading) return <Skeleton />
 *
 *   return (
 *     <div>
 *       {recent.map(expense => (
 *         <ExpenseListItem key={expense.id} expense={expense} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useRecentExpenses(limit = 5): UseRecentExpensesReturn {
  // Fetch all expenses (already sorted by date, newest first)
  const { expenses, isLoading, error, refresh } = useExpenses({})

  // Slice to get only the most recent N expenses
  const recent = useMemo(
    () => expenses.slice(0, limit),
    [expenses, limit]
  )

  return {
    recent,
    isLoading,
    error,
    refresh,
  }
}
