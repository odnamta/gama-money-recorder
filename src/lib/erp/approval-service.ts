import { createClient } from '@/lib/supabase/server'
import { createBKKRecord } from './bkk-service'
import type { ApprovalStatus } from '@/types/expense-filters'

/**
 * Approval Service
 * 
 * Handles expense approval workflow including submission,
 * approval, and rejection operations.
 */

export interface SubmitResult {
  success: boolean
  bkkNumber?: string
  error?: string
}

export interface ApprovalResult {
  success: boolean
  error?: string
}

/**
 * Submit an expense for approval
 * Creates a BKK record if not exists and updates status to pending_approval
 */
export async function submitForApproval(expenseId: string): Promise<SubmitResult> {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'User not authenticated' }
  }

  // Get expense details with receipt
  const { data: expense, error: fetchError } = await supabase
    .from('expense_drafts')
    .select(`
      *,
      receipt:expense_receipts(storage_path)
    `)
    .eq('id', expenseId)
    .single()

  if (fetchError) {
    return { success: false, error: `Failed to fetch expense: ${fetchError.message}` }
  }

  // Validate expense can be submitted
  if (expense.sync_status !== 'synced') {
    return { success: false, error: 'Expense must be synced before submission' }
  }

  if (expense.approval_status !== 'draft') {
    return { success: false, error: 'Only draft expenses can be submitted' }
  }

  try {
    let bkkNumber = expense.bkk_number

    // Create BKK record if not exists
    if (!expense.bkk_record_id) {
      const bkkId = await createBKKRecord({
        expenseId: expense.id,
        amount: expense.amount,
        description: expense.description || '',
        vendorId: expense.vendor_id,
        jobOrderId: expense.job_order_id,
        receiptPath: expense.receipt?.storage_path,
        expenseDate: expense.expense_date,
        category: expense.category,
      })

      // Get the generated BKK number
      const { data: bkkRecord } = await supabase
        .from('bkk_records')
        .select('record_number')
        .eq('id', bkkId)
        .single()

      bkkNumber = bkkRecord?.record_number

      // Link BKK to expense
      await supabase
        .from('expense_drafts')
        .update({ 
          bkk_record_id: bkkId,
          bkk_number: bkkNumber,
        })
        .eq('id', expenseId)
    }

    // Update approval status
    const { error: updateError } = await supabase
      .from('expense_drafts')
      .update({ 
        approval_status: 'pending_approval',
        submitted_at: new Date().toISOString(),
        submitted_by: user.id,
      })
      .eq('id', expenseId)

    if (updateError) {
      return { success: false, error: `Failed to update status: ${updateError.message}` }
    }

    return { success: true, bkkNumber }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

/**
 * Batch submit multiple expenses for approval
 */
export async function batchSubmitForApproval(
  expenseIds: string[]
): Promise<{ successful: string[]; failed: Array<{ id: string; error: string }> }> {
  const successful: string[] = []
  const failed: Array<{ id: string; error: string }> = []

  for (const id of expenseIds) {
    const result = await submitForApproval(id)
    if (result.success) {
      successful.push(id)
    } else {
      failed.push({ id, error: result.error || 'Unknown error' })
    }
  }

  return { successful, failed }
}

/**
 * Approve an expense (finance role only)
 */
export async function approveExpense(expenseId: string): Promise<ApprovalResult> {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'User not authenticated' }
  }

  // Check user role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const allowedRoles = ['owner', 'director', 'finance_manager']
  if (!profile || !allowedRoles.includes(profile.role)) {
    return { success: false, error: 'Insufficient permissions' }
  }

  // Update expense status
  const { error: updateError } = await supabase
    .from('expense_drafts')
    .update({
      approval_status: 'approved' as ApprovalStatus,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq('id', expenseId)
    .eq('approval_status', 'pending_approval')

  if (updateError) {
    return { success: false, error: `Failed to approve: ${updateError.message}` }
  }

  // Update BKK record status
  const { data: expense } = await supabase
    .from('expense_drafts')
    .select('bkk_record_id')
    .eq('id', expenseId)
    .single()

  if (expense?.bkk_record_id) {
    await supabase
      .from('bkk_records')
      .update({ status: 'approved' })
      .eq('id', expense.bkk_record_id)
  }

  return { success: true }
}

/**
 * Reject an expense with reason (finance role only)
 */
export async function rejectExpense(
  expenseId: string, 
  reason: string
): Promise<ApprovalResult> {
  const supabase = await createClient()
  
  if (!reason.trim()) {
    return { success: false, error: 'Rejection reason is required' }
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'User not authenticated' }
  }

  // Check user role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const allowedRoles = ['owner', 'director', 'finance_manager']
  if (!profile || !allowedRoles.includes(profile.role)) {
    return { success: false, error: 'Insufficient permissions' }
  }

  // Update expense status
  const { error: updateError } = await supabase
    .from('expense_drafts')
    .update({
      approval_status: 'rejected' as ApprovalStatus,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      rejection_reason: reason.trim(),
    })
    .eq('id', expenseId)
    .eq('approval_status', 'pending_approval')

  if (updateError) {
    return { success: false, error: `Failed to reject: ${updateError.message}` }
  }

  return { success: true }
}

/**
 * Resubmit a rejected expense after correction
 */
export async function resubmitExpense(expenseId: string): Promise<SubmitResult> {
  const supabase = await createClient()
  
  // Verify expense is rejected
  const { data: expense, error: fetchError } = await supabase
    .from('expense_drafts')
    .select('approval_status')
    .eq('id', expenseId)
    .single()

  if (fetchError) {
    return { success: false, error: `Failed to fetch expense: ${fetchError.message}` }
  }

  if (expense.approval_status !== 'rejected') {
    return { success: false, error: 'Only rejected expenses can be resubmitted' }
  }

  // Reset to draft first
  const { error: resetError } = await supabase
    .from('expense_drafts')
    .update({
      approval_status: 'draft',
      rejection_reason: null,
      approved_by: null,
      approved_at: null,
    })
    .eq('id', expenseId)

  if (resetError) {
    return { success: false, error: `Failed to reset status: ${resetError.message}` }
  }

  // Submit for approval
  return submitForApproval(expenseId)
}
