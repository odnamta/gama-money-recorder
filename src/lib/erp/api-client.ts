/**
 * ERP API Client
 * 
 * Client-side functions to call ERP API routes
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
 */
export async function submitExpenseForApproval(expenseId: string): Promise<SubmitResult> {
  const response = await fetch(`/api/expenses/${expenseId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  return response.json()
}

/**
 * Approve an expense (finance role only)
 */
export async function approveExpenseApi(expenseId: string): Promise<ApprovalResult> {
  const response = await fetch(`/api/expenses/${expenseId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  return response.json()
}

/**
 * Reject an expense with reason (finance role only)
 */
export async function rejectExpenseApi(
  expenseId: string, 
  reason: string
): Promise<ApprovalResult> {
  const response = await fetch(`/api/expenses/${expenseId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  })

  return response.json()
}

/**
 * Resubmit a rejected expense
 */
export async function resubmitExpenseApi(expenseId: string): Promise<SubmitResult> {
  const response = await fetch(`/api/expenses/${expenseId}/resubmit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  return response.json()
}

/**
 * Batch submit multiple expenses for approval
 */
export async function batchSubmitExpenses(
  expenseIds: string[]
): Promise<{ successful: string[]; failed: Array<{ id: string; error: string }> }> {
  const successful: string[] = []
  const failed: Array<{ id: string; error: string }> = []

  for (const id of expenseIds) {
    const result = await submitExpenseForApproval(id)
    if (result.success) {
      successful.push(id)
    } else {
      failed.push({ id, error: result.error || 'Unknown error' })
    }
  }

  return { successful, failed }
}
