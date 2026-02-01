'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useSyncStatus } from '@/hooks/use-sync-status'

/**
 * SyncNotificationProvider
 *
 * Shows toast notifications for sync status changes.
 * Should be placed in the app layout to provide notifications globally.
 */
export function SyncNotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const syncStatus = useSyncStatus()
  const previousStatus = useRef(syncStatus.status)
  const syncingToastId = useRef<string | number | null>(null)

  useEffect(() => {
    const prevStatus = previousStatus.current
    const currentStatus = syncStatus.status

    // Status changed
    if (prevStatus !== currentStatus) {
      // Dismiss syncing toast if it exists
      if (syncingToastId.current) {
        toast.dismiss(syncingToastId.current)
        syncingToastId.current = null
      }

      if (currentStatus === 'syncing') {
        // Show syncing toast (persistent until dismissed)
        syncingToastId.current = toast.loading('Menyinkronkan data...', {
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        })
      } else if (currentStatus === 'idle' && prevStatus === 'syncing') {
        // Sync completed successfully
        toast.success('Sinkronisasi selesai', {
          icon: <CheckCircle className="h-4 w-4" />,
          duration: 3000,
        })
      } else if (currentStatus === 'error') {
        // Sync failed
        toast.error('Sinkronisasi gagal', {
          icon: <AlertCircle className="h-4 w-4" />,
          description: 'Akan dicoba lagi secara otomatis',
          duration: 5000,
        })
      }

      previousStatus.current = currentStatus
    }
  }, [syncStatus])

  return <>{children}</>
}
