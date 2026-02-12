'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DisplayExpense, ApprovalStatus } from '@/types/expense-filters'
import type { ExpenseCategory } from '@/constants/expense-categories'

interface PendingExpense extends DisplayExpense {
  submitterName?: string
  submitterEmail?: string
}

interface UsePendingApprovalsResult {
  expenses: PendingExpense[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  totalCount: number
}

/**
 * Hook to fetch expenses pending approval (for finance roles)
 */
export function usePendingApprovals(): UsePendingApprovalsResult {
  const [expenses, setExpenses] = useState<PendingExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchPendingApprovals = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: fetchError, count } = await supabase
        .from('expense_drafts')
        .select(`
          *,
          receipt:expense_receipts(id, storage_path),
          job_order:job_orders(id, job_number, customer_name),
          submitter:user_profiles!expense_drafts_user_id_fkey(full_name, email)
        `, { count: 'exact' })
        .eq('approval_status', 'pending_approval')
        .order('submitted_at', { ascending: true })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      // Transform to DisplayExpense format
      const transformed: PendingExpense[] = (data || []).map((expense) => ({
        id: expense.id,
        serverId: expense.id,
        amount: expense.amount,
        category: expense.category as ExpenseCategory,
        description: expense.description,
        vendorName: expense.vendor_name,
        vendorId: expense.vendor_id,
        jobOrderId: expense.job_order_id,
        isOverhead: expense.is_overhead || false,
        expenseDate: expense.expense_date,
        expenseTime: expense.expense_time,
        gpsLatitude: expense.gps_latitude,
        gpsLongitude: expense.gps_longitude,
        gpsAccuracy: expense.gps_accuracy,
        receipt: expense.receipt,
        jobOrder: expense.job_order,
        syncStatus: expense.sync_status,
        approvalStatus: expense.approval_status as ApprovalStatus,
        ocrConfidence: expense.ocr_confidence,
        requiresReview: expense.requires_review,
        createdAt: expense.created_at,
        updatedAt: expense.updated_at,
        source: 'server' as const,
        bkkNumber: expense.bkk_number,
        bkkRecordId: expense.bkk_record_id,
        submittedAt: expense.submitted_at,
        submittedBy: expense.submitted_by,
        submitterName: expense.submitter?.full_name,
        submitterEmail: expense.submitter?.email,
      }))

      setExpenses(transformed)
      setTotalCount(count || 0)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch pending approvals'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPendingApprovals()
  }, [fetchPendingApprovals])

  return {
    expenses,
    isLoading,
    error,
    refresh: fetchPendingApprovals,
    totalCount,
  }
}
