/**
 * Database operations for offline-first expense management
 *
 * These functions handle saving data to IndexedDB and queuing for sync.
 * All operations are designed to work offline-first.
 */

import { db, type LocalExpense, type LocalReceipt, type SyncQueueItem, type SyncStatus } from './index'
import { syncManager } from './sync-manager'

import { compressImage } from '@/lib/image/compression'
import type { ExpenseCategory } from '@/lib/schemas/expense'
import type { OCRResult } from '@/types/ocr'

/**
 * Input data for creating a local expense
 * Based on ExpenseFormData but with string date for IndexedDB storage
 */
export interface ExpenseFormDataInput {
  amount: number
  category: ExpenseCategory
  description?: string
  vendorName?: string
  vendorId?: string | null
  jobOrderId?: string | null
  isOverhead?: boolean
  expenseDate: Date | string
  expenseTime?: string
  gpsLatitude?: number | null
  gpsLongitude?: number | null
  gpsAccuracy?: number | null
  locationExplanation?: string
}

/**
 * Saves an expense to IndexedDB and queues it for sync
 *
 * This function:
 * 1. Creates a LocalExpense record with a client-generated UUID
 * 2. Saves it to the expenses table in IndexedDB
 * 3. Adds an entry to the sync queue with priority 1
 * 4. Returns the saved expense for immediate UI use
 *
 * Note: syncManager.triggerSync() should be called by the consumer
 * when the SyncManager is available (added in task 3.1)
 *
 * @param data - The expense form data to save
 * @param receiptLocalId - Optional local ID of an associated receipt
 * @returns The saved LocalExpense record
 *
 * @example
 * ```typescript
 * const expense = await saveExpenseLocally({
 *   amount: 50000,
 *   category: 'fuel',
 *   expenseDate: new Date(),
 *   isOverhead: false,
 *   jobOrderId: 'job-123'
 * }, 'receipt-local-id')
 * ```
 */
export async function saveExpenseLocally(
  data: ExpenseFormDataInput,
  receiptLocalId?: string
): Promise<LocalExpense> {
  const now = new Date().toISOString()

  // Convert Date to ISO string if needed
  const expenseDate =
    data.expenseDate instanceof Date
      ? data.expenseDate.toISOString().split('T')[0]
      : typeof data.expenseDate === 'string'
        ? data.expenseDate.split('T')[0]
        : new Date().toISOString().split('T')[0]

  // Create the local expense record
  const expense: LocalExpense = {
    id: crypto.randomUUID(),
    amount: data.amount,
    category: data.category,
    description: data.description,
    vendorName: data.vendorName,
    vendorId: data.vendorId ?? undefined,
    jobOrderId: data.jobOrderId ?? undefined,
    isOverhead: data.isOverhead ?? false,
    expenseDate,
    expenseTime: data.expenseTime,
    gpsLatitude: data.gpsLatitude ?? undefined,
    gpsLongitude: data.gpsLongitude ?? undefined,
    gpsAccuracy: data.gpsAccuracy ?? undefined,
    locationExplanation: data.locationExplanation,
    receiptLocalId,
    syncStatus: 'pending',
    syncAttempts: 0,
    createdAt: now,
    updatedAt: now,
  }

  // Save to IndexedDB expenses table
  await db.expenses.add(expense)

  // Create sync queue item
  const syncQueueItem: SyncQueueItem = {
    id: crypto.randomUUID(),
    type: 'expense',
    localId: expense.id,
    priority: 1, // Standard priority for expenses (receipts get priority 2)
    status: 'pending',
    retryCount: 0,
    createdAt: now,
  }

  // Add to sync queue
  await db.syncQueue.add(syncQueueItem)

  // Trigger sync if online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    syncManager.triggerSync()
  }

  return expense
}


/**
 * Image dimensions result
 */
interface ImageDimensions {
  width: number
  height: number
}

/**
 * Gets the dimensions of an image from a Blob
 *
 * Creates a temporary image element to read the natural dimensions
 * of the image contained in the blob.
 *
 * @param blob - The image blob to get dimensions from
 * @returns Promise resolving to width and height in pixels
 */
async function getImageDimensions(blob: Blob): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image for dimension calculation'))
    }

    img.src = url
  })
}

/**
 * Saves a receipt image to IndexedDB and queues it for sync
 *
 * This function:
 * 1. Compresses the image to reduce storage size
 * 2. Gets the image dimensions
 * 3. Creates a LocalReceipt record with a client-generated UUID
 * 4. Saves it to the receipts table in IndexedDB
 * 5. Adds an entry to the sync queue with priority 2 (higher than expenses)
 * 6. Returns the saved receipt for immediate UI use
 *
 * Note: syncManager.triggerSync() should be called by the consumer
 * when the SyncManager is available (added in task 3.1)
 *
 * @param file - The receipt image file to save
 * @param ocrResult - Optional OCR processing result with extracted data
 * @returns The saved LocalReceipt record
 *
 * @example
 * ```typescript
 * // Save receipt without OCR data
 * const receipt = await saveReceiptLocally(imageFile)
 *
 * // Save receipt with OCR data
 * const receipt = await saveReceiptLocally(imageFile, {
 *   rawText: 'Receipt text...',
 *   confidence: 0.92,
 *   extractedData: {
 *     amount: 50000,
 *     vendorName: 'Shell',
 *     date: '2024-01-15'
 *   },
 *   processingTime: 1500,
 *   provider: 'google_vision'
 * })
 * ```
 */
export async function saveReceiptLocally(
  file: File,
  ocrResult?: OCRResult
): Promise<LocalReceipt> {
  const now = new Date().toISOString()

  // Compress the image to reduce storage size
  const compressionResult = await compressImage(file)
  const compressed = compressionResult.blob

  // Get image dimensions from the compressed blob
  const dimensions = await getImageDimensions(compressed)

  // Create the local receipt record
  const receipt: LocalReceipt = {
    id: crypto.randomUUID(),
    imageBlob: compressed,
    originalFilename: file.name,
    fileSize: compressed.size,
    mimeType: compressed.type,
    imageWidth: dimensions.width,
    imageHeight: dimensions.height,
    // OCR data (if provided)
    ocrRawText: ocrResult?.rawText,
    ocrConfidence: ocrResult?.confidence,
    extractedAmount: ocrResult?.extractedData.amount,
    extractedVendorName: ocrResult?.extractedData.vendorName,
    extractedDate: ocrResult?.extractedData.date,
    // Sync status
    syncStatus: 'pending',
    syncAttempts: 0,
    // Metadata
    createdAt: now,
  }

  // Save to IndexedDB receipts table
  await db.receipts.add(receipt)

  // Create sync queue item with higher priority (receipts sync before expenses)
  const syncQueueItem: SyncQueueItem = {
    id: crypto.randomUUID(),
    type: 'receipt',
    localId: receipt.id,
    priority: 2, // Higher than expenses (priority 1) - receipts sync first
    status: 'pending',
    retryCount: 0,
    createdAt: now,
  }

  // Add to sync queue
  await db.syncQueue.add(syncQueueItem)

  // Trigger sync if online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    syncManager.triggerSync()
  }

  return receipt
}


/**
 * Options for filtering local expenses
 */
export interface GetLocalExpensesOptions {
  /** Filter by sync status (pending, syncing, synced, failed) */
  syncStatus?: SyncStatus
  /** Filter by job order ID */
  jobOrderId?: string
  /** Maximum number of expenses to return */
  limit?: number
}

/**
 * Retrieves local expenses from IndexedDB with optional filtering
 *
 * This function queries the expenses table in IndexedDB and supports:
 * - Filtering by sync status (pending, syncing, synced, failed)
 * - Filtering by job order ID
 * - Limiting the number of results
 * - Sorting by createdAt descending (newest first)
 *
 * @param options - Optional filtering and pagination options
 * @returns Array of LocalExpense records sorted by createdAt descending
 *
 * @example
 * ```typescript
 * // Get all local expenses
 * const allExpenses = await getLocalExpenses()
 *
 * // Get only pending expenses
 * const pendingExpenses = await getLocalExpenses({ syncStatus: 'pending' })
 *
 * // Get expenses for a specific job order
 * const jobExpenses = await getLocalExpenses({ jobOrderId: 'job-123' })
 *
 * // Get the 10 most recent failed expenses
 * const failedExpenses = await getLocalExpenses({
 *   syncStatus: 'failed',
 *   limit: 10
 * })
 *
 * // Combine filters
 * const filteredExpenses = await getLocalExpenses({
 *   syncStatus: 'synced',
 *   jobOrderId: 'job-456',
 *   limit: 20
 * })
 * ```
 */
export async function getLocalExpenses(
  options?: GetLocalExpensesOptions
): Promise<LocalExpense[]> {
  const { syncStatus, jobOrderId, limit } = options ?? {}

  // Start building the query
  let collection = db.expenses.toCollection()

  // Apply syncStatus filter if provided
  if (syncStatus !== undefined) {
    collection = db.expenses.where('syncStatus').equals(syncStatus)
  }

  // Get all matching records
  let expenses = await collection.toArray()

  // Apply jobOrderId filter if provided (post-query filter since we can only
  // use one index at a time in Dexie without compound indexes)
  if (jobOrderId !== undefined) {
    expenses = expenses.filter((expense) => expense.jobOrderId === jobOrderId)
  }

  // Sort by createdAt descending (newest first)
  expenses.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })

  // Apply limit if provided
  if (limit !== undefined && limit > 0) {
    expenses = expenses.slice(0, limit)
  }

  return expenses
}


/**
 * Retrieves a local receipt from IndexedDB by its ID
 *
 * This function queries the receipts table in IndexedDB to find a receipt
 * by its client-generated local ID. Returns undefined if not found.
 *
 * @param localId - The client-generated UUID of the receipt
 * @returns The LocalReceipt record or undefined if not found
 *
 * @example
 * ```typescript
 * // Get a receipt by its local ID
 * const receipt = await getLocalReceipt('abc-123-def-456')
 *
 * if (receipt) {
 *   console.log('Found receipt:', receipt.originalFilename)
 *   console.log('OCR confidence:', receipt.ocrConfidence)
 * } else {
 *   console.log('Receipt not found')
 * }
 * ```
 */
export async function getLocalReceipt(localId: string): Promise<LocalReceipt | undefined> {
  return db.receipts.get(localId)
}


/**
 * Creates an object URL from a receipt's image blob for display
 *
 * This function creates a temporary URL that can be used as the `src`
 * attribute of an `<img>` element to display the receipt image stored
 * in IndexedDB.
 *
 * IMPORTANT: The caller is responsible for revoking the URL when it's
 * no longer needed to prevent memory leaks. Use `URL.revokeObjectURL(url)`
 * to clean up.
 *
 * @param receipt - The LocalReceipt containing the image blob
 * @returns A blob URL string that can be used as an image source
 *
 * @example
 * ```typescript
 * // In a React component
 * const receipt = await getLocalReceipt('abc-123')
 * if (receipt) {
 *   const imageUrl = createReceiptImageUrl(receipt)
 *
 *   // Use in an img element
 *   // <img src={imageUrl} alt="Receipt" />
 *
 *   // Clean up when done (e.g., in useEffect cleanup)
 *   // URL.revokeObjectURL(imageUrl)
 * }
 *
 * // In a React component with useEffect
 * useEffect(() => {
 *   let imageUrl: string | null = null
 *
 *   async function loadReceipt() {
 *     const receipt = await getLocalReceipt(receiptId)
 *     if (receipt) {
 *       imageUrl = createReceiptImageUrl(receipt)
 *       setImageSrc(imageUrl)
 *     }
 *   }
 *
 *   loadReceipt()
 *
 *   return () => {
 *     if (imageUrl) {
 *       URL.revokeObjectURL(imageUrl)
 *     }
 *   }
 * }, [receiptId])
 * ```
 */
export function createReceiptImageUrl(receipt: LocalReceipt): string {
  return URL.createObjectURL(receipt.imageBlob)
}
