/**
 * SyncManager - Background synchronization manager for offline-first expense tracking
 *
 * This class handles:
 * - Automatic sync when device comes online
 * - Processing the sync queue (receipts first, then expenses)
 * - Notifying listeners of sync status changes
 * - Retry logic with exponential backoff
 * - Periodic retry of failed items
 *
 * Usage:
 * ```typescript
 * import { syncManager } from '@/lib/db/sync-manager'
 *
 * // Subscribe to status changes
 * const unsubscribe = syncManager.subscribe((status) => {
 *   console.log('Sync status:', status)
 * })
 *
 * // Manually trigger sync
 * await syncManager.triggerSync()
 *
 * // Cleanup
 * unsubscribe()
 * ```
 */

import { db, type SyncQueueItem } from './index'
import { createLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/client'
import { uploadReceiptClient } from '@/lib/receipts/upload-client'

// Create a logger for sync operations
const logger = createLogger({ operation: 'sync-manager' })

/**
 * Sync status types for listener notifications
 *
 * - idle: No sync in progress, all items synced or no pending items
 * - syncing: Sync is currently in progress
 * - error: Sync encountered an error (includes error details)
 */
export type SyncManagerStatus =
  | { status: 'idle' }
  | { status: 'syncing'; progress?: { current: number; total: number } }
  | { status: 'error'; error: Error | unknown }

/**
 * Listener function type for sync status updates
 */
export type SyncStatusListener = (status: SyncManagerStatus) => void

/**
 * SyncManager class for handling background synchronization
 *
 * This is a singleton class that manages the sync queue and coordinates
 * uploads to Supabase when the device is online.
 *
 * Key features:
 * - Listens for online/offline events
 * - Prevents concurrent sync operations
 * - Notifies subscribers of status changes
 * - Processes queue in priority order (receipts before expenses)
 * - Exponential backoff with jitter for failed retries
 * - Periodic retry mechanism for failed items
 */
export class SyncManager {
  /** Flag to prevent concurrent sync operations */
  private isSyncing = false

  /** Set of listeners for sync status updates */
  private listeners: Set<SyncStatusListener> = new Set()

  /** Flag to track if event listeners are set up */
  private isInitialized = false

  /** Interval ID for periodic retry mechanism */
  private retryIntervalId: ReturnType<typeof setInterval> | null = null

  /**
   * Base delay for exponential backoff in milliseconds
   * Starting at 1 second
   */
  private static readonly BASE_DELAY_MS = 1000

  /**
   * Maximum delay cap for exponential backoff in milliseconds
   * Capped at 30 seconds to avoid excessively long waits
   */
  private static readonly MAX_DELAY_MS = 30000

  /**
   * Maximum jitter to add to backoff delay in milliseconds
   * Adds 0-1 second of random jitter to prevent thundering herd
   */
  private static readonly MAX_JITTER_MS = 1000

  /**
   * Interval for periodic retry of failed items in milliseconds
   * Checks every 5 minutes for items that can be retried
   */
  private static readonly RETRY_INTERVAL_MS = 5 * 60 * 1000

  /**
   * Creates a new SyncManager instance
   *
   * Sets up online event listener to automatically trigger sync
   * when the device comes back online.
   */
  constructor() {
    this.initialize()
  }

  /**
   * Initialize event listeners
   *
   * This is separated from the constructor to allow for lazy initialization
   * and to handle SSR environments where window is not available.
   */
  private initialize(): void {
    // Only initialize once and only in browser environment
    if (this.isInitialized) return
    if (typeof window === 'undefined') return

    // Listen for online events to trigger sync
    window.addEventListener('online', this.handleOnline)

    // Listen for offline events to update status
    window.addEventListener('offline', this.handleOffline)

    // Start periodic retry mechanism for failed items
    this.startPeriodicRetry()

    this.isInitialized = true
    logger.debug('SyncManager initialized')
  }

  /**
   * Handle online event - triggers sync when device comes online
   */
  private handleOnline = (): void => {
    logger.info('Device came online, triggering sync')
    this.triggerSync()
  }

  /**
   * Handle offline event - notifies listeners
   */
  private handleOffline = (): void => {
    logger.info('Device went offline')
    // Don't change status if we're not syncing - let the UI handle offline state
  }

  /**
   * Calculate exponential backoff delay with jitter
   *
   * Uses the formula: min(baseDelay * 2^retryCount + jitter, maxDelay)
   *
   * This prevents:
   * - Hammering the server on repeated failures
   * - Thundering herd problem when multiple clients retry simultaneously
   *
   * @param retryCount - The current retry attempt number (0-based)
   * @returns Delay in milliseconds before the next retry attempt
   *
   * @example
   * ```typescript
   * // Retry delays (without jitter):
   * // Retry 0: 1s
   * // Retry 1: 2s
   * // Retry 2: 4s
   * // Retry 3: 8s
   * // Retry 4: 16s
   * // Retry 5+: 30s (capped)
   * ```
   */
  private calculateBackoffDelay(retryCount: number): number {
    // Calculate exponential delay: baseDelay * 2^retryCount
    const exponentialDelay = SyncManager.BASE_DELAY_MS * Math.pow(2, retryCount)

    // Add random jitter (0 to MAX_JITTER_MS) to prevent thundering herd
    const jitter = Math.random() * SyncManager.MAX_JITTER_MS

    // Cap at maximum delay
    const delay = Math.min(exponentialDelay + jitter, SyncManager.MAX_DELAY_MS)

    logger.debug('Calculated backoff delay', {
      retryCount,
      exponentialDelay,
      jitter: Math.round(jitter),
      finalDelay: Math.round(delay),
    })

    return delay
  }

  /**
   * Sleep for a specified duration
   *
   * @param ms - Duration to sleep in milliseconds
   * @returns Promise that resolves after the specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Start the periodic retry mechanism
   *
   * This sets up an interval that periodically checks for failed items
   * that can be retried. Items are eligible for retry if:
   * - They have status 'pending' (failed but not exceeded max retries)
   * - Enough time has passed since the last attempt (based on backoff)
   *
   * This ensures failed items eventually get retried even if the user
   * doesn't manually trigger a sync.
   */
  private startPeriodicRetry(): void {
    // Clear any existing interval
    if (this.retryIntervalId) {
      clearInterval(this.retryIntervalId)
    }

    this.retryIntervalId = setInterval(() => {
      this.retryFailedItems()
    }, SyncManager.RETRY_INTERVAL_MS)

    logger.debug('Periodic retry mechanism started', {
      intervalMs: SyncManager.RETRY_INTERVAL_MS,
    })
  }

  /**
   * Stop the periodic retry mechanism
   *
   * Called during cleanup/destroy to prevent memory leaks.
   */
  private stopPeriodicRetry(): void {
    if (this.retryIntervalId) {
      clearInterval(this.retryIntervalId)
      this.retryIntervalId = null
      logger.debug('Periodic retry mechanism stopped')
    }
  }

  /**
   * Retry failed items that are eligible for retry
   *
   * This method:
   * 1. Checks if device is online
   * 2. Gets pending items that have been retried before
   * 3. Checks if enough time has passed based on backoff delay
   * 4. Triggers sync if there are eligible items
   *
   * Called periodically by the retry interval.
   */
  private async retryFailedItems(): Promise<void> {
    // Don't retry if offline or already syncing
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      logger.debug('Skipping periodic retry - device offline')
      return
    }

    if (this.isSyncing) {
      logger.debug('Skipping periodic retry - sync in progress')
      return
    }

    try {
      // Get pending items that have been attempted before
      const pendingItems = await db.syncQueue
        .where('status')
        .equals('pending')
        .filter((item) => item.retryCount > 0 && item.lastAttempt !== undefined)
        .toArray()

      if (pendingItems.length === 0) {
        return
      }

      const now = Date.now()
      let eligibleCount = 0

      // Check which items are eligible for retry based on backoff
      for (const item of pendingItems) {
        if (!item.lastAttempt) continue

        const lastAttemptTime = new Date(item.lastAttempt).getTime()
        const backoffDelay = this.calculateBackoffDelay(item.retryCount - 1)
        const eligibleTime = lastAttemptTime + backoffDelay

        if (now >= eligibleTime) {
          eligibleCount++
        }
      }

      if (eligibleCount > 0) {
        logger.info('Found items eligible for retry', {
          eligibleCount,
          totalPending: pendingItems.length,
        })
        // Trigger sync to process eligible items
        await this.triggerSync()
      }
    } catch (error) {
      logger.error(
        'Error checking for retry-eligible items',
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }

  /**
   * Triggers a sync operation if not already syncing and device is online
   *
   * This method:
   * 1. Checks if already syncing (prevents concurrent syncs)
   * 2. Checks if device is online
   * 3. Sets syncing flag and notifies listeners
   * 4. Processes the sync queue
   * 5. Notifies listeners of completion or error
   *
   * @returns Promise that resolves when sync completes or rejects on error
   *
   * @example
   * ```typescript
   * // Trigger sync after saving an expense
   * await saveExpenseLocally(expenseData)
   * if (navigator.onLine) {
   *   await syncManager.triggerSync()
   * }
   * ```
   */
  async triggerSync(): Promise<void> {
    // Prevent concurrent sync operations
    if (this.isSyncing) {
      logger.debug('Sync already in progress, skipping')
      return
    }

    // Check if device is online
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      logger.debug('Device is offline, skipping sync')
      return
    }

    this.isSyncing = true
    this.notifyListeners({ status: 'syncing' })

    logger.info('Starting sync operation')
    const startTime = Date.now()

    try {
      // Process the sync queue
      // Note: processQueue() will be implemented in task 3.2
      await this.processQueue()

      const durationMs = Date.now() - startTime
      logger.info('Sync completed successfully', { durationMs })

      this.notifyListeners({ status: 'idle' })
    } catch (error) {
      const durationMs = Date.now() - startTime
      logger.error('Sync failed', error instanceof Error ? error : new Error(String(error)), {
        durationMs,
      })

      this.notifyListeners({ status: 'error', error })
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Maximum number of retry attempts before marking an item as failed
   * Business rule BR-2: Maximum 5 retry attempts before marking as failed
   */
  private static readonly MAX_RETRIES = 5

  /**
   * Process the sync queue
   *
   * This method processes all pending items in the sync queue,
   * prioritizing receipts over expenses (receipts have priority 2, expenses have priority 1).
   *
   * Business rule BR-3: Sync priority: receipts first, then expenses
   *
   * The method:
   * 1. Gets all pending items from syncQueue sorted by priority (ascending)
   * 2. Reverses to process higher priority first (receipts before expenses)
   * 3. Processes each item and notifies listeners of progress
   */
  private async processQueue(): Promise<void> {
    // Get all pending items sorted by priority (ascending)
    const pending = await db.syncQueue
      .where('status')
      .equals('pending')
      .sortBy('priority')

    if (pending.length === 0) {
      logger.debug('No pending items in sync queue')
      return
    }

    logger.info('Processing sync queue', { itemCount: pending.length })

    // Process in reverse order (higher priority first - receipts before expenses)
    // Receipts have priority 2, expenses have priority 1
    const itemsToProcess = pending.reverse()
    const total = itemsToProcess.length

    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i]

      // Notify listeners of progress
      this.notifyListeners({
        status: 'syncing',
        progress: { current: i + 1, total },
      })

      logger.debug('Processing sync item', {
        itemId: item.id,
        type: item.type,
        localId: item.localId,
        progress: `${i + 1}/${total}`,
      })

      await this.syncItem(item)
    }

    logger.info('Sync queue processing complete', { processedCount: total })
  }

  /**
   * Sync a single item from the queue
   *
   * This method:
   * 1. Checks if item is eligible for retry based on backoff delay
   * 2. Updates the queue item status to 'syncing'
   * 3. Calls the appropriate sync method based on item type
   * 4. Updates the queue item status to 'completed' on success
   * 5. Handles errors: increments retry count, marks as 'failed' after MAX_RETRIES
   * 6. Updates the local record status on error
   *
   * @param item - The sync queue item to process
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    // Check if we need to wait based on backoff (for retried items)
    if (item.retryCount > 0 && item.lastAttempt) {
      const lastAttemptTime = new Date(item.lastAttempt).getTime()
      const backoffDelay = this.calculateBackoffDelay(item.retryCount - 1)
      const eligibleTime = lastAttemptTime + backoffDelay
      const now = Date.now()

      if (now < eligibleTime) {
        const waitTime = eligibleTime - now
        logger.debug('Waiting for backoff delay before retry', {
          itemId: item.id,
          retryCount: item.retryCount,
          waitTimeMs: Math.round(waitTime),
        })
        await this.sleep(waitTime)
      }
    }

    try {
      // Update queue item status to 'syncing'
      await db.syncQueue.update(item.id, { status: 'syncing' })

      // Call appropriate sync method based on type
      if (item.type === 'receipt') {
        await this.syncReceipt(item.localId)
      } else {
        await this.syncExpense(item.localId)
      }

      // Success - update queue item status to 'completed'
      await db.syncQueue.update(item.id, { status: 'completed' })

      logger.info('Sync item completed successfully', {
        itemId: item.id,
        type: item.type,
        localId: item.localId,
      })
    } catch (error) {
      // Handle sync error
      const errorMessage = error instanceof Error ? error.message : String(error)
      const retryCount = item.retryCount + 1
      const status = retryCount >= SyncManager.MAX_RETRIES ? 'failed' : 'pending'

      // Calculate next retry delay for logging
      const nextBackoffDelay =
        status === 'pending' ? this.calculateBackoffDelay(retryCount - 1) : null

      logger.warn('Sync item failed', {
        itemId: item.id,
        type: item.type,
        localId: item.localId,
        retryCount,
        maxRetries: SyncManager.MAX_RETRIES,
        willRetry: status === 'pending',
        nextRetryDelayMs: nextBackoffDelay ? Math.round(nextBackoffDelay) : null,
        error: errorMessage,
      })

      // Update queue item with error info
      await db.syncQueue.update(item.id, {
        status,
        retryCount,
        lastAttempt: new Date().toISOString(),
        error: errorMessage,
      })

      // Update local record status to reflect the error
      if (item.type === 'receipt') {
        await db.receipts.update(item.localId, {
          syncStatus: status,
          syncError: errorMessage,
          syncAttempts: retryCount,
        })
      } else {
        await db.expenses.update(item.localId, {
          syncStatus: status,
          syncError: errorMessage,
          syncAttempts: retryCount,
          lastSyncAttempt: new Date().toISOString(),
        })
      }
    }
  }

  /**
   * Sync a receipt to Supabase
   *
   * This method:
   * 1. Gets the receipt from local IndexedDB
   * 2. Gets the authenticated user
   * 3. Creates a File from the receipt's imageBlob
   * 4. Uploads to Supabase Storage using uploadReceiptClient
   * 5. Creates expense_receipts database record
   * 6. Updates local receipt with serverId and syncStatus
   *
   * @param localId - The local ID of the receipt to sync
   * @throws Error if receipt not found, not authenticated, or sync fails
   */
  private async syncReceipt(localId: string): Promise<void> {
    // 1. Get the receipt from local IndexedDB
    const receipt = await db.receipts.get(localId)
    if (!receipt) {
      throw new Error('Receipt not found')
    }

    // 2. Get the authenticated user
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    logger.debug('Syncing receipt', {
      localId,
      userId: user.id,
      filename: receipt.originalFilename,
      fileSize: receipt.fileSize,
    })

    // 3. Create a File from the receipt's imageBlob
    const file = new File([receipt.imageBlob], receipt.originalFilename, {
      type: receipt.mimeType,
    })

    // 4. Upload to Supabase Storage
    const { storagePath } = await uploadReceiptClient(file, user.id)

    logger.debug('Receipt uploaded to storage', {
      localId,
      storagePath,
    })

    // 5. Create expense_receipts database record
    const { data, error } = await supabase
      .from('expense_receipts')
      .insert({
        user_id: user.id,
        storage_path: storagePath,
        original_filename: receipt.originalFilename,
        file_size: receipt.fileSize,
        mime_type: receipt.mimeType,
        image_width: receipt.imageWidth,
        image_height: receipt.imageHeight,
        ocr_raw_text: receipt.ocrRawText,
        ocr_confidence: receipt.ocrConfidence,
        extracted_amount: receipt.extractedAmount,
        extracted_vendor_name: receipt.extractedVendorName,
        extracted_date: receipt.extractedDate,
        local_id: localId,
        sync_status: 'synced',
      })
      .select('id')
      .single()

    if (error) {
      // Try to clean up uploaded file on database error
      logger.warn('Database insert failed, cleaning up storage', {
        localId,
        storagePath,
        error: error.message,
      })
      await supabase.storage.from('expense-receipts').remove([storagePath])
      throw new Error(`Failed to create receipt record: ${error.message}`)
    }

    // 6. Update local record with serverId and syncStatus
    await db.receipts.update(localId, {
      serverId: data.id,
      syncStatus: 'synced',
    })

    logger.info('Receipt synced successfully', {
      localId,
      serverId: data.id,
      storagePath,
    })
  }

  /**
   * Sync an expense to Supabase
   *
   * This method:
   * 1. Gets the expense from local IndexedDB
   * 2. Gets the authenticated user
   * 3. Gets the receipt's server ID if expense has a linked receipt
   * 4. Creates expense_drafts database record
   * 5. Updates local expense with serverId and syncStatus
   *
   * @param localId - The local ID of the expense to sync
   * @throws Error if expense not found, not authenticated, or sync fails
   */
  private async syncExpense(localId: string): Promise<void> {
    // 1. Get the expense from local IndexedDB
    const expense = await db.expenses.get(localId)
    if (!expense) {
      throw new Error('Expense not found')
    }

    // 2. Get the authenticated user
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    logger.debug('Syncing expense', {
      localId,
      userId: user.id,
      amount: expense.amount,
      category: expense.category,
      hasReceipt: !!expense.receiptLocalId,
    })

    // 3. Get receipt server ID if expense has a linked receipt
    let receiptId: string | undefined
    if (expense.receiptLocalId) {
      const receipt = await db.receipts.get(expense.receiptLocalId)
      receiptId = receipt?.serverId

      logger.debug('Linked receipt found', {
        receiptLocalId: expense.receiptLocalId,
        receiptServerId: receiptId,
      })
    }

    // 4. Create expense_drafts database record
    const { data, error } = await supabase
      .from('expense_drafts')
      .insert({
        user_id: user.id,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        vendor_name: expense.vendorName,
        vendor_id: expense.vendorId,
        job_order_id: expense.jobOrderId,
        is_overhead: expense.isOverhead,
        expense_date: expense.expenseDate,
        expense_time: expense.expenseTime,
        gps_latitude: expense.gpsLatitude,
        gps_longitude: expense.gpsLongitude,
        gps_accuracy: expense.gpsAccuracy,
        receipt_id: receiptId,
        local_id: localId,
        sync_status: 'synced',
        approval_status: 'draft',
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to create expense record: ${error.message}`)
    }

    // 5. Update local expense with serverId and syncStatus
    await db.expenses.update(localId, {
      serverId: data.id,
      syncStatus: 'synced',
    })

    logger.info('Expense synced successfully', {
      localId,
      serverId: data.id,
      amount: expense.amount,
      category: expense.category,
    })
  }

  /**
   * Subscribe to sync status updates
   *
   * Registers a listener function that will be called whenever the sync
   * status changes (idle, syncing, error).
   *
   * @param listener - Function to call with status updates
   * @returns Unsubscribe function to remove the listener
   *
   * @example
   * ```typescript
   * // In a React component
   * useEffect(() => {
   *   const unsubscribe = syncManager.subscribe((status) => {
   *     if (status.status === 'syncing') {
   *       setIsSyncing(true)
   *     } else if (status.status === 'idle') {
   *       setIsSyncing(false)
   *     } else if (status.status === 'error') {
   *       setError(status.error)
   *     }
   *   })
   *
   *   return unsubscribe
   * }, [])
   * ```
   */
  subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener)
    logger.debug('Listener subscribed', { listenerCount: this.listeners.size })

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
      logger.debug('Listener unsubscribed', { listenerCount: this.listeners.size })
    }
  }

  /**
   * Notify all listeners of a status change
   *
   * @param status - The new sync status to broadcast
   */
  private notifyListeners(status: SyncManagerStatus): void {
    this.listeners.forEach((listener) => {
      try {
        listener(status)
      } catch (error) {
        // Don't let a failing listener break the sync process
        logger.error(
          'Listener threw an error',
          error instanceof Error ? error : new Error(String(error))
        )
      }
    })
  }

  /**
   * Get the current syncing state
   *
   * @returns true if a sync operation is currently in progress
   */
  get syncing(): boolean {
    return this.isSyncing
  }

  /**
   * Get the number of subscribed listeners
   *
   * Useful for debugging and testing.
   *
   * @returns The number of active listeners
   */
  get listenerCount(): number {
    return this.listeners.size
  }

  /**
   * Get the backoff delay for a given retry count
   *
   * Useful for UI to show when the next retry will occur.
   *
   * @param retryCount - The current retry count
   * @returns The backoff delay in milliseconds
   */
  getBackoffDelay(retryCount: number): number {
    return this.calculateBackoffDelay(retryCount)
  }

  /**
   * Manually trigger retry of failed items
   *
   * This allows users to manually retry failed items without waiting
   * for the periodic retry mechanism.
   *
   * @returns Promise that resolves when retry check completes
   */
  async manualRetry(): Promise<void> {
    logger.info('Manual retry triggered')
    await this.retryFailedItems()
  }

  /**
   * Get statistics about the sync queue
   *
   * Useful for UI to display sync status information.
   *
   * @returns Object with counts of items in each status
   */
  async getQueueStats(): Promise<{
    pending: number
    syncing: number
    completed: number
    failed: number
  }> {
    const [pending, syncing, completed, failed] = await Promise.all([
      db.syncQueue.where('status').equals('pending').count(),
      db.syncQueue.where('status').equals('syncing').count(),
      db.syncQueue.where('status').equals('completed').count(),
      db.syncQueue.where('status').equals('failed').count(),
    ])

    return { pending, syncing, completed, failed }
  }

  /**
   * Cleanup method to remove event listeners
   *
   * Should be called when the SyncManager is no longer needed
   * (e.g., in tests or when unmounting the app).
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }
    this.stopPeriodicRetry()
    this.listeners.clear()
    this.isInitialized = false
    logger.debug('SyncManager destroyed')
  }
}

/**
 * Singleton SyncManager instance
 *
 * Use this exported instance throughout the application to ensure
 * consistent sync state and prevent multiple sync operations.
 *
 * @example
 * ```typescript
 * import { syncManager } from '@/lib/db/sync-manager'
 *
 * // Trigger sync
 * await syncManager.triggerSync()
 *
 * // Subscribe to updates
 * const unsubscribe = syncManager.subscribe(handleStatusChange)
 * ```
 */
export const syncManager = new SyncManager()
