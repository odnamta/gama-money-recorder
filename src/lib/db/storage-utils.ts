/**
 * Storage utilities for handling IndexedDB quota and errors
 */

import { db } from './index'

/**
 * Storage quota error class
 */
export class StorageQuotaError extends Error {
  constructor(message: string = 'Storage quota exceeded') {
    super(message)
    this.name = 'StorageQuotaError'
  }
}

/**
 * Check if an error is a storage quota error
 */
export function isQuotaError(error: unknown): boolean {
  if (error instanceof Error) {
    // Different browsers report quota errors differently
    const quotaErrorNames = [
      'QuotaExceededError',
      'NS_ERROR_DOM_QUOTA_REACHED',
      'QUOTA_EXCEEDED_ERR',
    ]
    
    if (quotaErrorNames.includes(error.name)) {
      return true
    }
    
    // Check error message for quota-related keywords
    const message = error.message.toLowerCase()
    if (
      message.includes('quota') ||
      message.includes('storage') ||
      message.includes('disk')
    ) {
      return true
    }
  }
  
  return false
}

/**
 * Get estimated storage usage
 * 
 * Returns usage information if the Storage API is available.
 * Falls back to estimating from IndexedDB if not.
 */
export async function getStorageUsage(): Promise<{
  used: number
  quota: number
  percentUsed: number
} | null> {
  // Try the Storage API first (modern browsers)
  if (typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      const used = estimate.usage || 0
      const quota = estimate.quota || 0
      const percentUsed = quota > 0 ? (used / quota) * 100 : 0
      
      return { used, quota, percentUsed }
    } catch {
      // Fall through to estimation
    }
  }
  
  // Estimate from IndexedDB counts (rough estimate)
  try {
    const [expenseCount, receiptCount] = await Promise.all([
      db.expenses.count(),
      db.receipts.count(),
    ])
    
    // Rough estimates: 1KB per expense, 500KB per receipt (compressed images)
    const estimatedUsed = expenseCount * 1024 + receiptCount * 512 * 1024
    
    return {
      used: estimatedUsed,
      quota: 50 * 1024 * 1024, // Assume 50MB limit
      percentUsed: (estimatedUsed / (50 * 1024 * 1024)) * 100,
    }
  } catch {
    return null
  }
}

/**
 * Check if storage is running low
 * 
 * Returns true if storage usage is above the threshold (default 80%)
 */
export async function isStorageLow(threshold: number = 80): Promise<boolean> {
  const usage = await getStorageUsage()
  return usage !== null && usage.percentUsed >= threshold
}

/**
 * Clean up old synced items to free storage
 * 
 * Removes synced items older than the specified age.
 * Only removes items that have been successfully synced.
 */
export async function cleanupSyncedItems(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<{
  expensesDeleted: number
  receiptsDeleted: number
}> {
  const cutoffDate = new Date(Date.now() - maxAgeMs).toISOString()
  
  // Delete old synced expenses
  const oldExpenses = await db.expenses
    .where('syncStatus')
    .equals('synced')
    .filter((expense) => expense.createdAt < cutoffDate)
    .toArray()
  
  const expenseIds = oldExpenses.map((e) => e.id)
  await db.expenses.bulkDelete(expenseIds)
  
  // Delete old synced receipts
  const oldReceipts = await db.receipts
    .where('syncStatus')
    .equals('synced')
    .filter((receipt) => receipt.createdAt < cutoffDate)
    .toArray()
  
  const receiptIds = oldReceipts.map((r) => r.id)
  await db.receipts.bulkDelete(receiptIds)
  
  // Clean up completed sync queue items
  const oldQueueItems = await db.syncQueue
    .where('status')
    .equals('completed')
    .filter((item) => item.createdAt < cutoffDate)
    .toArray()
  
  await db.syncQueue.bulkDelete(oldQueueItems.map((i) => i.id))
  
  return {
    expensesDeleted: expenseIds.length,
    receiptsDeleted: receiptIds.length,
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
