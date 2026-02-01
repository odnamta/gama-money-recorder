'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { syncManager } from '@/lib/db/sync-manager'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface SyncStats {
  pending: number
  syncing: number
  completed: number
  failed: number
}

/**
 * DashboardSyncStatus - Shows sync status summary on dashboard
 *
 * Displays:
 * - Pending sync count
 * - Failed sync count (if any)
 * - Quick sync button
 * - Current sync status
 *
 * This component subscribes to the SyncManager for real-time updates.
 */
export function DashboardSyncStatus() {
  const [stats, setStats] = useState<SyncStats>({
    pending: 0,
    syncing: 0,
    completed: 0,
    failed: 0,
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load sync queue stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const queueStats = await syncManager.getQueueStats()
        setStats(queueStats)
      } catch (error) {
        console.error('Failed to load sync stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()

    // Poll for updates every 5 seconds
    const interval = setInterval(loadStats, 5000)
    return () => clearInterval(interval)
  }, [])

  // Subscribe to sync manager status
  useEffect(() => {
    const unsubscribe = syncManager.subscribe((status) => {
      if (status.status === 'syncing') {
        setIsSyncing(true)
      } else {
        setIsSyncing(false)
        // Reload stats after sync completes
        syncManager.getQueueStats().then(setStats)
      }
    })

    return unsubscribe
  }, [])

  const handleSync = async () => {
    try {
      await syncManager.triggerSync()
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  // Don't show if nothing to sync and no failures
  if (!isLoading && stats.pending === 0 && stats.failed === 0) {
    return null
  }

  const totalPending = stats.pending + stats.syncing

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Status Sinkronisasi</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing || totalPending === 0}
          className="h-8"
        >
          <RefreshCw
            className={cn('h-4 w-4 mr-1', isSyncing && 'animate-spin')}
          />
          Sinkronkan
        </Button>
      </div>

      <div className="space-y-2">
        {/* Pending count */}
        {totalPending > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-shrink-0 p-1.5 rounded-full bg-yellow-100">
              <Clock className="h-3.5 w-3.5 text-yellow-600" />
            </div>
            <span className="text-gray-700">
              {totalPending} item menunggu sinkronisasi
            </span>
          </div>
        )}

        {/* Failed count */}
        {stats.failed > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-shrink-0 p-1.5 rounded-full bg-red-100">
              <AlertCircle className="h-3.5 w-3.5 text-red-600" />
            </div>
            <span className="text-red-700">
              {stats.failed} item gagal disinkronkan
            </span>
          </div>
        )}

        {/* All synced message */}
        {!isLoading && totalPending === 0 && stats.failed === 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-shrink-0 p-1.5 rounded-full bg-green-100">
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            </div>
            <span className="text-green-700">Semua data tersinkron</span>
          </div>
        )}
      </div>
    </div>
  )
}
