'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getLocalExpenses } from '@/lib/db/operations'
import type { LocalExpense, SyncStatus } from '@/lib/db'
import type { ExpenseFilters, DisplayExpense } from '@/types/expense-filters'
import type { ExpenseCategory } from '@/constants/expense-categories'

/**
 * Server expense with joined relations
 */
interface ServerExpenseWithRelations {
  id: string
  user_id: string
  amount: number
  category: string
  description: string | null
  vendor_name: string | null
  vendor_id: string | null
  job_order_id: string | null
  is_overhead: boolean
  expense_date: string
  expense_time: string | null
  gps_latitude: number | null
  gps_longitude: number | null
  gps_accuracy: number | null
  receipt_id: string | null
  ocr_confidence: number | null
  requires_review: boolean
  sync_status: string
  local_id: string | null
  approval_status: string
  created_at: string
  updated_at: string
  receipt: { id: string; storage_path: string } | null
  job_order: { id: string; job_number: string; customer_name: string } | null
}

interface UseExpensesReturn {
  /** Array of expenses (merged local and server) */
  expenses: DisplayExpense[]
  /** Whether expenses are being loaded */
  isLoading: boolean
  /** Error from the fetch operation */
  error: Error | null
  /** Refresh the expenses list */
  refresh: () => void
  /** Total count of expenses */
  totalCount: number
}

/**
 * Fetch expenses from Supabase server
 */
async function fetchServerExpenses(
  filters: ExpenseFilters
): Promise<ServerExpenseWithRelations[]> {
  const supabase = createClient()

  let query = supabase
    .from('expense_drafts')
    .select(`
      *,
      receipt:expense_receipts(id, storage_path),
      job_order:job_orders(id, job_number, customer_name)
    `)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })

  // Apply date filters
  if (filters.dateFrom) {
    query = query.gte('expense_date', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('expense_date', filters.dateTo)
  }

  // Apply category filter
  if (filters.categories && filters.categories.length > 0) {
    query = query.in('category', filters.categories)
  }

  // Apply sync status filter
  if (filters.syncStatuses && filters.syncStatuses.length > 0) {
    query = query.in('sync_status', filters.syncStatuses)
  }

  // Apply approval status filter
  if (filters.approvalStatuses && filters.approvalStatuses.length > 0) {
    query = query.in('approval_status', filters.approvalStatuses)
  }

  // Apply search filter
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim()
    query = query.or(
      `vendor_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
    )
  }

  // Limit results
  query = query.limit(100)

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data || []) as ServerExpenseWithRelations[]
}

/**
 * Convert server expense to display expense
 */
function serverToDisplayExpense(expense: ServerExpenseWithRelations): DisplayExpense {
  return {
    id: expense.id,
    localId: expense.local_id || undefined,
    serverId: expense.id,
    amount: expense.amount,
    category: expense.category as ExpenseCategory,
    description: expense.description || undefined,
    vendorName: expense.vendor_name || undefined,
    vendorId: expense.vendor_id || undefined,
    jobOrderId: expense.job_order_id || undefined,
    isOverhead: expense.is_overhead,
    expenseDate: expense.expense_date,
    expenseTime: expense.expense_time || undefined,
    gpsLatitude: expense.gps_latitude || undefined,
    gpsLongitude: expense.gps_longitude || undefined,
    gpsAccuracy: expense.gps_accuracy || undefined,
    receipt: expense.receipt
      ? { id: expense.receipt.id, storage_path: expense.receipt.storage_path }
      : undefined,
    jobOrder: expense.job_order
      ? {
          id: expense.job_order.id,
          job_number: expense.job_order.job_number,
          customer_name: expense.job_order.customer_name,
        }
      : undefined,
    syncStatus: expense.sync_status as SyncStatus,
    approvalStatus: expense.approval_status as 'draft' | 'pending_approval' | 'approved' | 'rejected',
    ocrConfidence: expense.ocr_confidence || undefined,
    requiresReview: expense.requires_review,
    createdAt: expense.created_at,
    updatedAt: expense.updated_at,
    source: 'server',
  }
}

/**
 * Convert local expense to display expense
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
    approvalStatus: 'draft', // Local expenses are always drafts
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
    source: 'local',
  }
}

/**
 * Apply filters to local expenses
 */
function filterLocalExpenses(
  expenses: LocalExpense[],
  filters: ExpenseFilters
): LocalExpense[] {
  return expenses.filter((expense) => {
    // Date range filter
    if (filters.dateFrom && expense.expenseDate < filters.dateFrom) {
      return false
    }
    if (filters.dateTo && expense.expenseDate > filters.dateTo) {
      return false
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(expense.category)) {
        return false
      }
    }

    // Sync status filter
    if (filters.syncStatuses && filters.syncStatuses.length > 0) {
      if (!filters.syncStatuses.includes(expense.syncStatus)) {
        return false
      }
    }

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase()
      const vendorMatch = expense.vendorName?.toLowerCase().includes(searchLower)
      const descMatch = expense.description?.toLowerCase().includes(searchLower)
      if (!vendorMatch && !descMatch) {
        return false
      }
    }

    return true
  })
}

/**
 * Merge local and server expenses, deduplicating by local_id
 */
function mergeExpenses(
  localExpenses: LocalExpense[],
  serverExpenses: ServerExpenseWithRelations[]
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
 * useExpenses - Fetch and merge local and server expenses
 *
 * This hook implements a hybrid data fetching strategy:
 * 1. Fetches local expenses from IndexedDB (for offline/pending items)
 * 2. Fetches server expenses from Supabase (if online)
 * 3. Merges and deduplicates the results
 * 4. Sorts by expense date (newest first)
 *
 * @param filters - Optional filters to apply
 * @returns Object with expenses array, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * function HistoryPage() {
 *   const [filters, setFilters] = useState<ExpenseFilters>({})
 *   const { expenses, isLoading, error, refresh } = useExpenses(filters)
 *
 *   // Filter by date range
 *   setFilters({ dateFrom: '2024-01-01', dateTo: '2024-01-31' })
 *
 *   // Filter by categories
 *   setFilters({ categories: ['fuel', 'toll'] })
 *
 *   // Search
 *   setFilters({ search: 'Shell' })
 * }
 * ```
 */
export function useExpenses(filters: ExpenseFilters = {}): UseExpensesReturn {
  const [expenses, setExpenses] = useState<DisplayExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Memoize filters to prevent unnecessary re-fetches
  const filterKey = useMemo(
    () => JSON.stringify(filters),
    [filters]
  )

  // Parse filters from key to ensure consistency
  const parsedFilters = useMemo<ExpenseFilters>(
    () => JSON.parse(filterKey),
    [filterKey]
  )

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 1. Get local expenses (always available)
      const allLocalExpenses = await getLocalExpenses()
      const filteredLocalExpenses = filterLocalExpenses(allLocalExpenses, parsedFilters)

      // 2. Get server expenses (if online)
      let serverExpenses: ServerExpenseWithRelations[] = []
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          serverExpenses = await fetchServerExpenses(parsedFilters)
        } catch (serverError) {
          // Log but don't fail - we still have local data
          console.warn('Failed to fetch server expenses:', serverError)
        }
      }

      // 3. Merge and deduplicate
      const merged = mergeExpenses(filteredLocalExpenses, serverExpenses)

      // 4. Sort by expense date (newest first), then by created_at
      merged.sort((a, b) => {
        const dateCompare = b.expenseDate.localeCompare(a.expenseDate)
        if (dateCompare !== 0) return dateCompare
        return b.createdAt.localeCompare(a.createdAt)
      })

      setExpenses(merged)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load expenses'))
    } finally {
      setIsLoading(false)
    }
  }, [parsedFilters])

  useEffect(() => {
    fetchExpenses()

    // Poll for changes every 10 seconds
    const interval = setInterval(fetchExpenses, 10000)

    return () => clearInterval(interval)
  }, [fetchExpenses])

  return {
    expenses,
    isLoading,
    error,
    refresh: fetchExpenses,
    totalCount: expenses.length,
  }
}
