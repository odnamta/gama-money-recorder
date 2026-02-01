'use client'

import { useState, useEffect, useCallback } from 'react'
import { getLocalExpenses, type GetLocalExpensesOptions } from '@/lib/db/operations'
import type { LocalExpense, SyncStatus } from '@/lib/db'

interface UseLocalExpensesReturn {
  /** Array of local expenses */
  expenses: LocalExpense[]
  /** Whether expenses are being loaded */
  isLoading: boolean
  /** Error from the fetch operation */
  error: Error | null
  /** Refresh the expenses list */
  refresh: () => void
}

/**
 * useLocalExpenses - Fetch local expenses from IndexedDB
 *
 * Returns expenses stored locally with optional filtering.
 * Automatically refreshes every 5 seconds.
 *
 * @param options - Optional filtering options
 * @returns Object with expenses array, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   // Get all local expenses
 *   const { expenses, isLoading } = useLocalExpenses()
 *
 *   // Get only pending expenses
 *   const { expenses: pending } = useLocalExpenses({ syncStatus: 'pending' })
 *
 *   // Get expenses for a specific job
 *   const { expenses: jobExpenses } = useLocalExpenses({ jobOrderId: 'job-123' })
 * }
 * ```
 */
export function useLocalExpenses(options?: GetLocalExpensesOptions): UseLocalExpensesReturn {
  const [expenses, setExpenses] = useState<LocalExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchExpenses = useCallback(async () => {
    try {
      const data = await getLocalExpenses(options)
      setExpenses(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load local expenses'))
    } finally {
      setIsLoading(false)
    }
  }, [options?.syncStatus, options?.jobOrderId, options?.limit])

  useEffect(() => {
    fetchExpenses()

    // Poll for changes every 5 seconds
    const interval = setInterval(fetchExpenses, 5000)

    return () => clearInterval(interval)
  }, [fetchExpenses])

  return {
    expenses,
    isLoading,
    error,
    refresh: fetchExpenses,
  }
}
