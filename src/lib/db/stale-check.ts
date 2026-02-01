/**
 * Stale item checking for offline sync
 * 
 * Business rule BR-1: Offline expenses must sync within 24 hours or be flagged
 */

import { db, type LocalExpense, type LocalReceipt } from './index'

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Check if an item is stale (older than 24 hours and not synced)
 */
export function isItemStale(createdAt: string): boolean {
  const createdTime = new Date(createdAt).getTime()
  const now = Date.now()
  return now - createdTime > STALE_THRESHOLD_MS
}

/**
 * Get all stale expenses (pending/failed for more than 24 hours)
 */
export async function getStaleExpenses(): Promise<LocalExpense[]> {
  const expenses = await db.expenses
    .where('syncStatus')
    .anyOf(['pending', 'failed'])
    .toArray()
  
  return expenses.filter((expense) => isItemStale(expense.createdAt))
}

/**
 * Get all stale receipts (pending/failed for more than 24 hours)
 */
export async function getStaleReceipts(): Promise<LocalReceipt[]> {
  const receipts = await db.receipts
    .where('syncStatus')
    .anyOf(['pending', 'failed'])
    .toArray()
  
  return receipts.filter((receipt) => isItemStale(receipt.createdAt))
}

/**
 * Get count of stale items
 */
export async function getStaleItemCount(): Promise<{
  expenses: number
  receipts: number
  total: number
}> {
  const [staleExpenses, staleReceipts] = await Promise.all([
    getStaleExpenses(),
    getStaleReceipts(),
  ])
  
  return {
    expenses: staleExpenses.length,
    receipts: staleReceipts.length,
    total: staleExpenses.length + staleReceipts.length,
  }
}

/**
 * Check if there are any stale items that need attention
 */
export async function hasStaleItems(): Promise<boolean> {
  const { total } = await getStaleItemCount()
  return total > 0
}
