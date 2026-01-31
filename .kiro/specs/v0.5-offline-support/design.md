# v0.5 Offline Support - Technical Design

## Overview
Implement offline-first architecture using Dexie.js for IndexedDB with background sync to Supabase.

## Architecture

### Data Flow
```
[User Action] → [Save to IndexedDB] → [Queue for Sync]
                      ↓
              [Update UI (optimistic)]
                      ↓
              [Online?]
                ├─ Yes → [Process Sync Queue] → [Update Supabase]
                └─ No  → [Wait for connectivity]
                      ↓
              [Sync Complete] → [Update local status]
```

## Dexie.js Database Schema

```typescript
// lib/db/index.ts
import Dexie, { Table } from 'dexie'

// Local expense record
export interface LocalExpense {
  id: string                    // Client-generated UUID
  serverId?: string             // Server ID after sync
  
  // Expense data
  amount: number
  category: ExpenseCategory
  description?: string
  vendorName?: string
  vendorId?: string
  jobOrderId?: string
  isOverhead: boolean
  expenseDate: string
  expenseTime?: string
  
  // GPS
  gpsLatitude?: number
  gpsLongitude?: number
  gpsAccuracy?: number
  locationExplanation?: string
  
  // Receipt reference
  receiptLocalId?: string
  
  // Sync status
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed'
  syncError?: string
  syncAttempts: number
  lastSyncAttempt?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
}

// Local receipt record
export interface LocalReceipt {
  id: string                    // Client-generated UUID
  serverId?: string             // Server ID after sync
  
  // Image data
  imageBlob: Blob               // Compressed image
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
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed'
  syncError?: string
  syncAttempts: number
  
  // Metadata
  createdAt: string
}

// Sync queue item
export interface SyncQueueItem {
  id: string
  type: 'expense' | 'receipt'
  localId: string
  priority: number              // Higher = more urgent
  status: 'pending' | 'syncing' | 'completed' | 'failed'
  retryCount: number
  createdAt: string
  lastAttempt?: string
  error?: string
}

// Cached job orders
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

export class MoneyRecorderDB extends Dexie {
  expenses!: Table<LocalExpense>
  receipts!: Table<LocalReceipt>
  syncQueue!: Table<SyncQueueItem>
  jobOrders!: Table<CachedJobOrder>

  constructor() {
    super('gama-money-recorder')
    
    this.version(1).stores({
      expenses: 'id, serverId, syncStatus, createdAt, jobOrderId',
      receipts: 'id, serverId, syncStatus, createdAt',
      syncQueue: 'id, type, localId, status, priority, createdAt',
      jobOrders: 'id, jobNumber, cachedAt'
    })
  }
}

export const db = new MoneyRecorderDB()
```

## Offline Operations

### Save Expense Offline
```typescript
// lib/db/operations.ts
export async function saveExpenseLocally(
  data: ExpenseFormData,
  receiptLocalId?: string
): Promise<LocalExpense> {
  const expense: LocalExpense = {
    id: crypto.randomUUID(),
    ...data,
    receiptLocalId,
    syncStatus: 'pending',
    syncAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  await db.expenses.add(expense)
  
  // Add to sync queue
  await db.syncQueue.add({
    id: crypto.randomUUID(),
    type: 'expense',
    localId: expense.id,
    priority: 1,
    status: 'pending',
    retryCount: 0,
    createdAt: new Date().toISOString()
  })
  
  // Trigger sync if online
  if (navigator.onLine) {
    syncManager.triggerSync()
  }
  
  return expense
}
```

### Save Receipt Offline
```typescript
export async function saveReceiptLocally(
  file: File,
  ocrResult?: OCRResult
): Promise<LocalReceipt> {
  // Compress image
  const compressed = await compressImage(file)
  const dimensions = await getImageDimensions(compressed)
  
  const receipt: LocalReceipt = {
    id: crypto.randomUUID(),
    imageBlob: compressed,
    originalFilename: file.name,
    fileSize: compressed.size,
    mimeType: compressed.type,
    imageWidth: dimensions.width,
    imageHeight: dimensions.height,
    ocrRawText: ocrResult?.rawText,
    ocrConfidence: ocrResult?.confidence,
    extractedAmount: ocrResult?.extractedData.amount,
    extractedVendorName: ocrResult?.extractedData.vendorName,
    extractedDate: ocrResult?.extractedData.date,
    syncStatus: 'pending',
    syncAttempts: 0,
    createdAt: new Date().toISOString()
  }
  
  await db.receipts.add(receipt)
  
  // Add to sync queue with higher priority (receipts first)
  await db.syncQueue.add({
    id: crypto.randomUUID(),
    type: 'receipt',
    localId: receipt.id,
    priority: 2, // Higher than expenses
    status: 'pending',
    retryCount: 0,
    createdAt: new Date().toISOString()
  })
  
  return receipt
}
```

## Sync Manager

```typescript
// lib/db/sync-manager.ts
class SyncManager {
  private isSyncing = false
  private listeners: Set<(status: SyncStatus) => void> = new Set()
  
  constructor() {
    // Listen for online events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.triggerSync())
    }
  }
  
  async triggerSync() {
    if (this.isSyncing || !navigator.onLine) return
    
    this.isSyncing = true
    this.notifyListeners({ status: 'syncing' })
    
    try {
      await this.processQueue()
      this.notifyListeners({ status: 'idle' })
    } catch (error) {
      console.error('Sync failed:', error)
      this.notifyListeners({ status: 'error', error })
    } finally {
      this.isSyncing = false
    }
  }
  
  private async processQueue() {
    const pending = await db.syncQueue
      .where('status')
      .equals('pending')
      .sortBy('priority')
    
    // Process in reverse (higher priority first)
    for (const item of pending.reverse()) {
      await this.syncItem(item)
    }
  }
  
  private async syncItem(item: SyncQueueItem) {
    try {
      await db.syncQueue.update(item.id, { status: 'syncing' })
      
      if (item.type === 'receipt') {
        await this.syncReceipt(item.localId)
      } else {
        await this.syncExpense(item.localId)
      }
      
      await db.syncQueue.update(item.id, { status: 'completed' })
      
    } catch (error) {
      const retryCount = item.retryCount + 1
      const status = retryCount >= 5 ? 'failed' : 'pending'
      
      await db.syncQueue.update(item.id, {
        status,
        retryCount,
        lastAttempt: new Date().toISOString(),
        error: error.message
      })
      
      // Update local record status
      if (item.type === 'receipt') {
        await db.receipts.update(item.localId, {
          syncStatus: status,
          syncError: error.message,
          syncAttempts: retryCount
        })
      } else {
        await db.expenses.update(item.localId, {
          syncStatus: status,
          syncError: error.message,
          syncAttempts: retryCount
        })
      }
    }
  }
  
  private async syncReceipt(localId: string) {
    const receipt = await db.receipts.get(localId)
    if (!receipt) throw new Error('Receipt not found')
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // Upload image
    const file = new File([receipt.imageBlob], receipt.originalFilename, {
      type: receipt.mimeType
    })
    const { storagePath } = await uploadReceipt(file, user.id)
    
    // Create database record
    const { data } = await supabase
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
        sync_status: 'synced'
      })
      .select('id')
      .single()
    
    // Update local record
    await db.receipts.update(localId, {
      serverId: data.id,
      syncStatus: 'synced'
    })
  }
  
  private async syncExpense(localId: string) {
    const expense = await db.expenses.get(localId)
    if (!expense) throw new Error('Expense not found')
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get receipt server ID if exists
    let receiptId: string | undefined
    if (expense.receiptLocalId) {
      const receipt = await db.receipts.get(expense.receiptLocalId)
      receiptId = receipt?.serverId
    }
    
    // Create database record
    const { data } = await supabase
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
        approval_status: 'draft'
      })
      .select('id')
      .single()
    
    // Update local record
    await db.expenses.update(localId, {
      serverId: data.id,
      syncStatus: 'synced'
    })
  }
  
  subscribe(listener: (status: SyncStatus) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  
  private notifyListeners(status: SyncStatus) {
    this.listeners.forEach(l => l(status))
  }
}

export const syncManager = new SyncManager()
```

## UI Components

### Offline Indicator
```typescript
// components/offline/OfflineIndicator.tsx
export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const { pendingCount } = usePendingSync()
  
  if (isOnline && pendingCount === 0) return null
  
  return (
    <div className={cn(
      'fixed top-0 left-0 right-0 z-50 py-1 px-4 text-center text-sm',
      isOnline ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
    )}>
      {isOnline ? (
        <span className="flex items-center justify-center gap-2">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Menyinkronkan {pendingCount} item...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <WifiOff className="h-3 w-3" />
          Mode Offline - Data tersimpan lokal
        </span>
      )}
    </div>
  )
}
```

### Sync Status Hook
```typescript
// hooks/use-sync-status.ts
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>({ status: 'idle' })
  
  useEffect(() => {
    return syncManager.subscribe(setStatus)
  }, [])
  
  return status
}

export function usePendingSync() {
  const [pendingCount, setPendingCount] = useState(0)
  
  useEffect(() => {
    const updateCount = async () => {
      const count = await db.syncQueue
        .where('status')
        .anyOf(['pending', 'syncing'])
        .count()
      setPendingCount(count)
    }
    
    updateCount()
    
    // Subscribe to changes
    const subscription = db.syncQueue.hook('creating', updateCount)
    db.syncQueue.hook('updating', updateCount)
    
    return () => {
      // Cleanup
    }
  }, [])
  
  return { pendingCount }
}
```

## Job Order Caching

```typescript
// lib/db/job-cache.ts
export async function cacheJobOrders(jobs: JobOrder[]) {
  const cached = jobs.map(job => ({
    ...job,
    cachedAt: new Date().toISOString()
  }))
  
  await db.jobOrders.bulkPut(cached)
}

export async function getCachedJobOrders(): Promise<CachedJobOrder[]> {
  return db.jobOrders.toArray()
}

export async function refreshJobCache() {
  if (!navigator.onLine) return
  
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  // Fetch active jobs
  const { data: jobs } = await supabase
    .from('job_orders')
    .select('*')
    .eq('status', 'active')
    .limit(100)
  
  if (jobs) {
    await cacheJobOrders(jobs)
  }
}
```

## Testing Strategy

### Unit Tests
- IndexedDB operations
- Sync queue management
- Offline detection

### Integration Tests
- Save and sync flow
- Retry logic
- Job caching

### E2E Tests
- Complete offline flow
- Sync on reconnect
- Error recovery
