/**
 * ERP Integration Module
 * 
 * Exports all ERP-related services for BKK record management
 * and approval workflow.
 */

// Server-side functions (use in API routes and server components only)
export { generateBKKNumber, isValidBKKNumber, parseBKKNumber } from './bkk-generator'
export { createBKKRecord, getBKKRecord, updateBKKStatus } from './bkk-service'
export type { CreateBKKInput, BKKRecord } from './bkk-service'
export {
  submitForApproval,
  batchSubmitForApproval,
  approveExpense,
  rejectExpense,
  resubmitExpense,
} from './approval-service'
export type { SubmitResult, ApprovalResult } from './approval-service'

// Client-side API functions (use in client components)
export {
  submitExpenseForApproval,
  approveExpenseApi,
  rejectExpenseApi,
  resubmitExpenseApi,
  batchSubmitExpenses,
} from './api-client'
