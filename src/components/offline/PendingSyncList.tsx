'use client'

import { useEffect, useState } from 'react'
import { Receipt, DollarSign, AlertCircle, RefreshCw } from 'lucide-react'
import { db, type SyncQueueItem } from '@/lib/db'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/format-currency'
import { SyncStatusBadge } from './SyncStatusBadge'

interface PendingItem {
  queueItem: SyncQueueItem
  details?: {
    amount?: number
    category?: string
    vendorName?: string
  }
}

/**
 * PendingSyncList - Shows list of items pending sync
 *
 * Displays all items in the sync queue with their status and details.
 * Useful for users to see what's waiting to be synced.
 */
export function PendingSyncList() {
  const [items, setItems] = useState<PendingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPendingItems = async () => {
      try {
        // Get all non-completed queue items
        const queueItems = await db.syncQueue
          .where('status')
          .anyOf(['pending', 'syncing', 'failed'])
          .toArray()

        // Enrich with details from local records
        const enrichedItems: PendingItem[] = await Promise.all(
          queueItems.map(async (queueItem) => {
            if (queueItem.type === 'expense') {
              const expense = await db.expenses.get(queueItem.localId)
              return {
                queueItem,
                details: expense
                  ? {
                      amount: expense.amount,
                      category: expense.category,
                      vendorName: expense.vendorName,
                    }
                  : undefined,
              }
            }
            return { queueItem }
          })
        )

        setItems(enrichedItems)
      } catch (error) {
        console.error('Failed to load pending items:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPendingItems()

    // Poll for updates
    const interval = setInterval(loadPendingItems, 3000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Tidak ada item menunggu sinkronisasi</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.queueItem.id}
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border',
            item.queueItem.status === 'failed'
              ? 'border-red-200 bg-red-50'
              : 'border-gray-200 bg-white'
          )}
        >
          {/* Icon */}
          <div
            className={cn(
              'flex-shrink-0 p-2 rounded-full',
              item.queueItem.type === 'receipt'
                ? 'bg-purple-100 text-purple-600'
                : 'bg-blue-100 text-blue-600'
            )}
          >
            {item.queueItem.type === 'receipt' ? (
              <Receipt className="h-4 w-4" />
            ) : (
              <DollarSign className="h-4 w-4" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 capitalize">
                {item.queueItem.type === 'receipt' ? 'Struk' : 'Pengeluaran'}
              </span>
              <SyncStatusBadge
                status={
                  item.queueItem.status === 'completed'
                    ? 'synced'
                    : item.queueItem.status
                }
                compact
              />
            </div>
            {item.details && (
              <p className="text-sm text-gray-600 truncate">
                {item.details.amount
                  ? formatCurrency(item.details.amount)
                  : ''}
                {item.details.vendorName
                  ? ` - ${item.details.vendorName}`
                  : ''}
              </p>
            )}
            {item.queueItem.error && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {item.queueItem.error}
              </p>
            )}
          </div>

          {/* Retry count */}
          {item.queueItem.retryCount > 0 && (
            <span className="text-xs text-gray-500">
              Percobaan {item.queueItem.retryCount}/5
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
