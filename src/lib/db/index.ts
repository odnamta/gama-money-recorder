import Dexie, { type Table } from 'dexie'

import type { ExpenseCategory } from '@/lib/schemas/expense'

// Sync status type used across local records
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed'

// Local expense record stored in IndexedDB
export interface LocalExpense {
  id: string // Client-generated UUID
  serverId?: string // Server ID after sync

  // Expense data
  amount: number
  category: ExpenseCategory
  description?: string
  vendorName?: string
  vendorId?: string
  jobOrderId?: string
  isOverhead: boolean
  expenseDate: string // ISO date string
  expenseTime?: string

  // GPS
  gpsLatitude?: number
  gpsLongitude?: number
  gpsAccuracy?: number
  locationExplanation?: string

  // Receipt reference
  receiptLocalId?: string

  // Sync status
  syncStatus: SyncStatus
  syncError?: string
  syncAttempts: number
  lastSyncAttempt?: string

  // Metadata
  createdAt: string
  updatedAt: string
}

// Local receipt record stored in IndexedDB
export interface LocalReceipt {
  id: string // Client-generated UUID
  serverId?: string // Server ID after sync

  // Image data
  imageBlob: Blob // Compressed image
  originalFilename: string
  fileSize: number
  mimeType: string
  imageWidth: number
  imageHeight: number

  // OCR data (if processed)
  ocrRawText?: string
  ocrConfidence?: number
  extractedAmount?: number
  extractedVendorName?: string
  extractedDate?: string

  // Sync status
  syncStatus: SyncStatus
  syncError?: string
  syncAttempts: number

  // Metadata
  createdAt: string
}

// Sync queue item for tracking pending operations
export interface SyncQueueItem {
  id: string
  type: 'expense' | 'receipt'
  localId: string
  priority: number // Higher = more urgent
  status: 'pending' | 'syncing' | 'completed' | 'failed'
  retryCount: number
  createdAt: string
  lastAttempt?: string
  error?: string
}

// Cached job orders for offline selection
export interface CachedJobOrder {
  id: string
  jobNumber: string
  customerName: string
  origin: string
  destination: string
  originLat?: number
  originLng?: number
  destLat?: number
  destLng?: number
  cachedAt: string
}

/**
 * MoneyRecorderDB - Dexie.js database for offline-first expense tracking
 *
 * Tables:
 * - expenses: Local expense records with sync status
 * - receipts: Local receipt images with OCR data
 * - syncQueue: Queue of pending sync operations
 * - jobOrders: Cached job orders for offline selection
 */
export class MoneyRecorderDB extends Dexie {
  expenses!: Table<LocalExpense>
  receipts!: Table<LocalReceipt>
  syncQueue!: Table<SyncQueueItem>
  jobOrders!: Table<CachedJobOrder>

  constructor() {
    super('gama-money-recorder')

    this.version(1).stores({
      // Primary key: id, indexed fields for queries
      expenses: 'id, serverId, syncStatus, createdAt, jobOrderId',
      receipts: 'id, serverId, syncStatus, createdAt',
      syncQueue: 'id, type, localId, status, priority, createdAt',
      jobOrders: 'id, jobNumber, cachedAt',
    })
  }
}

// Singleton database instance
export const db = new MoneyRecorderDB()
