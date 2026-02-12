/**
 * Expense filter types for history view
 */

import type { ExpenseCategory } from '@/constants/expense-categories'
import type { SyncStatus } from '@/lib/db'

/**
 * Approval status for expenses
 */
export type ApprovalStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected'

/**
 * Filter options for expense queries
 */
export interface ExpenseFilters {
  /** Start date for date range filter (YYYY-MM-DD) */
  dateFrom?: string
  /** End date for date range filter (YYYY-MM-DD) */
  dateTo?: string
  /** Filter by expense categories */
  categories?: ExpenseCategory[]
  /** Filter by sync statuses */
  syncStatuses?: SyncStatus[]
  /** Filter by approval statuses */
  approvalStatuses?: ApprovalStatus[]
  /** Search query for vendor name or description */
  search?: string
}

/**
 * Source of expense data
 */
export type ExpenseSource = 'local' | 'server'

/**
 * Job order info for display
 */
export interface DisplayJobOrder {
  id: string
  job_number: string
  customer_name: string
}

/**
 * Receipt info for display
 */
export interface DisplayReceipt {
  id: string
  storage_path?: string
  localId?: string
}

/**
 * Unified expense type for display that combines local and server data
 */
export interface DisplayExpense {
  id: string
  localId?: string
  serverId?: string
  amount: number
  category: ExpenseCategory
  description?: string
  vendorName?: string
  vendorId?: string
  jobOrderId?: string
  isOverhead: boolean
  expenseDate: string
  expenseTime?: string
  gpsLatitude?: number
  gpsLongitude?: number
  gpsAccuracy?: number
  receiptLocalId?: string
  receipt?: DisplayReceipt
  jobOrder?: DisplayJobOrder
  syncStatus: SyncStatus
  approvalStatus: ApprovalStatus
  ocrConfidence?: number
  requiresReview?: boolean
  createdAt: string
  updatedAt?: string
  source: ExpenseSource
  // ERP Integration fields
  bkkNumber?: string
  bkkRecordId?: string
  submittedAt?: string
  submittedBy?: string
  approvedAt?: string
  approvedBy?: string
  approvedByName?: string
  rejectionReason?: string
}
