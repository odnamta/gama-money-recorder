'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/db'

interface UsePendingSyncReturn {
  /** Number of items pending sync */
  pendingCount: number
  /** Number of items currently syncing */
  syncingCount: number
  /** Number of failed items */
  failedCount: number
  /** Total items not yet synced (pending + syncing + failed) */
  totalPending: number
  /** Refresh the counts */
  refresh: () => void
}

/**
 * usePendingSync - Track pending sync item counts
 *
 * Returns counts of items in various sync states.
 * Automatically updates every 2 seconds.
 *
 * @returns Object with pending, syncing, failed, and total counts
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { pendingCount, failedCount, totalPending } = usePendingSync()
 *
 *   if (totalPending === 0) return null
 *
 *   return (
 *     <div>
 *       {pendingCount} pending, {failedCount} failed
 *     </div>
 *   )
 * }
 * ```
 */
export function usePendingSync(): UsePendingSyncReturn {
  const [pendingCount, setPendingCount] = useState(0)
  const [syncingCount, setSyncingCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)

  const updateCounts = useCallback(async () => {
    try {
      const [pending, syncing, failed] = await Promise.all([
        db.syncQueue.where('status').equals('pending').count(),
        db.syncQueue.where('status').equals('syncing').count(),
        db.syncQueue.where('status').equals('failed').count(),
      ])

      setPendingCount(pending)
      setSyncingCount(syncing)
      setFailedCount(failed)
    } catch (error) {
      // IndexedDB might not be available (SSR or private browsing)
      console.warn('Failed to get sync counts:', error)
    }
  }, [])

  useEffect(() => {
    // Initial count
    updateCounts()

    // Poll for changes every 2 seconds
    const interval = setInterval(updateCounts, 2000)

    return () => clearInterval(interval)
  }, [updateCounts])

  return {
    pendingCount,
    syncingCount,
    failedCount,
    totalPending: pendingCount + syncingCount + failedCount,
    refresh: updateCounts,
  }
}
