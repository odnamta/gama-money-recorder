'use client'

import { usePendingSync } from '@/hooks/use-pending-sync'
import { PendingSyncList } from '@/components/offline/PendingSyncList'
import { ManualSyncButton } from '@/components/offline/ManualSyncButton'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle } from 'lucide-react'

/**
 * Pending sync section showing sync queue status
 */
export function PendingSyncSection() {
  const { pendingCount, failedCount } = usePendingSync()

  const totalPending = pendingCount + failedCount

  return (
    <div className="bg-white rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Data Pending</h3>
        <ManualSyncButton />
      </div>
      
      {/* Pending Counts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <RefreshCw className="h-4 w-4 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">
              {pendingCount}
            </span>
          </div>
          <p className="text-sm text-blue-700">Menunggu Sinkron</p>
        </div>
        
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-2xl font-bold text-red-600">
              {failedCount}
            </span>
          </div>
          <p className="text-sm text-red-700">Gagal Sinkron</p>
        </div>
      </div>
      
      {/* Status Message */}
      {totalPending === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Semua data sudah tersinkron
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {totalPending} item menunggu sinkronisasi
          </p>
          
          {/* Pending Sync List */}
          <PendingSyncList />
          
          {/* Retry Failed Button */}
          {failedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                // TODO: Implement retry failed items
                console.log('Retry failed items')
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Ulang yang Gagal
            </Button>
          )}
        </div>
      )}
    </div>
  )
}